'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  initialCount: number
  userId: string
  role: string
}

export default function UnreadBadge({ initialCount, userId, role }: Props) {
  const [count, setCount] = useState(initialCount)
  const supabase = createClient()
  const viewingThreadId = useRef<string | null>(null)

  // Realtimeで新着メッセージを購読（現在表示中のスレッドは除外）
  useEffect(() => {
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new as { sender_id: string; thread_id: string }
          if (msg.sender_id !== userId && msg.thread_id !== viewingThreadId.current) {
            setCount((prev) => prev + 1)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // chat-read イベントで既読後の残未読数を受け取ってバッジを更新
  useEffect(() => {
    function handleRead(e: Event) {
      const { unreadCount, threadId } = (e as CustomEvent<{ unreadCount: number; threadId: string }>).detail
      viewingThreadId.current = threadId
      setCount(unreadCount)
    }
    window.addEventListener('chat-read', handleRead)
    return () => {
      window.removeEventListener('chat-read', handleRead)
      viewingThreadId.current = null
    }
  }, [])

  if (count === 0) return null

  return (
    <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  )
}