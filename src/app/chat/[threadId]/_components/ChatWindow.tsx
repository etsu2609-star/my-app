'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/types'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  threadId: string
  currentUserId: string
  initialMessages: Message[]
  otherProfile: {
    id: string           // ← 追加
    role: string 
    display_name: string
    avatar_url: string
    job_title: string
  }
}

export default function ChatWindow({
  threadId,
  currentUserId,
  initialMessages,
  otherProfile,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

// チャットを開いたら既読にし、更新後の未読数をバッジへ通知
useEffect(() => {
  fetch('/api/threads/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ threadId }),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`read API ${res.status}`)
      return res.json()
    })
    .then(({ unreadCount }: { unreadCount: number }) => {
      window.dispatchEvent(
        new CustomEvent('chat-read', { detail: { unreadCount, threadId } })
      )
    })
    .catch(console.error)
}, [threadId])

  // Realtimeで新着メッセージを購読
useEffect(() => {
  const channel = supabase
    .channel(`thread:${threadId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${threadId}`,
      },
      (payload) => {
        const newMsg = payload.new as Message
        setMessages((prev) => {
          // 本物のIDで重複チェック
          if (prev.some((m) => m.id === newMsg.id)) return prev
          // 仮IDの楽観的メッセージを本物に置き換える
          const hasOptimistic = prev.some(
            (m) => m.sender_id === newMsg.sender_id &&
                   m.body === newMsg.body &&
                   m.id.length !== 36 // crypto.randomUUID は36文字
          )
          if (hasOptimistic) {
            return prev.map((m) =>
              m.sender_id === newMsg.sender_id &&
              m.body === newMsg.body &&
              m.id.length !== 36
                ? newMsg
                : m
            )
          }
          return [...prev, newMsg]
        })
      }
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [threadId])
// 新着メッセージが来たら最下部にスクロール
  useEffect(() => {
  const el = bottomRef.current
  if (!el) return

  // 画像の読み込み完了後にスクロール
  const images = el.closest('.overflow-y-auto')?.querySelectorAll('img') ?? []
  if (images.length === 0) {
    el.scrollIntoView({ behavior: 'smooth' })
    return
  }

  let loaded = 0
  const total = images.length

  function onLoad() {
    loaded++
    if (loaded >= total) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  images.forEach((img) => {
    if (img.complete) {
      onLoad()
    } else {
      img.addEventListener('load', onLoad, { once: true })
      img.addEventListener('error', onLoad, { once: true })
    }
  })
}, [messages])

async function sendMessage(body: string) {
  if (!body.trim()) return

  // 楽観的更新（仮IDはプレフィックスで区別）
  const tempId = `temp-${crypto.randomUUID()}`
  const optimistic: Message = {
    id: tempId,
    sender_id: currentUserId,
    body,
    created_at: new Date().toISOString(),
  }
  setMessages((prev) => [...prev, optimistic])

  const { error } = await supabase.from('messages').insert({
    thread_id: threadId,
    sender_id: currentUserId,
    body,
  })

  // 失敗したら楽観的メッセージを削除
  if (error) {
    setMessages((prev) => prev.filter((m) => m.id !== tempId))
  }
}

// 初回表示時は即座に最下部へ
useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'instant' })
}, [])

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] max-w-2xl mx-auto">
      {/* ヘッダー */}
<header className="flex items-center gap-3 px-6 py-4 border-b shrink-0">
  <Link
    href={
      otherProfile.role === 'employee'
        ? `/employees/${otherProfile.id}`
        : `/users/${otherProfile.id}`
    }
    className="flex items-center gap-3 hover:opacity-70 transition"
  >
    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
      {otherProfile.avatar_url ? (
        <Image
          src={otherProfile.avatar_url}
          alt={otherProfile.display_name}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          {otherProfile.display_name[0]}
        </div>
      )}
    </div>
    <div>
      <p className="font-medium text-sm">{otherProfile.display_name}</p>
      {otherProfile.job_title && (
        <p className="text-xs text-gray-500">{otherProfile.job_title}</p>
      )}
    </div>
  </Link>
</header>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMine={msg.sender_id === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 入力欄 */}
      <ChatInput onSend={sendMessage} currentUserId={currentUserId} />
    </div>
  )
}