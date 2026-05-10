'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Message } from '@/types'

type Props = {
  message: Message
  isMine: boolean
}

function isImageUrl(text: string) {
  return text.startsWith('https://') && /\.(jpg|jpeg|png|gif|webp)$/i.test(text)
}

export default function MessageBubble({ message, isMine }: Props) {
  const [time, setTime] = useState('')
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    setTime(
      new Date(message.created_at).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      })
    )
  }, [message.created_at])

  // ESCキーで閉じる
  useEffect(() => {
    if (!lightbox) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox])

  const isImage = isImageUrl(message.body)

  return (
    <>
      <div className={`flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
        {isImage ? (
          <button
            onClick={() => setLightbox(true)}
            className="relative w-48 h-48 rounded-2xl overflow-hidden hover:opacity-90 transition"
          >
            <Image
              src={message.body}
              alt="送信画像"
              fill
              className="object-cover"
            />
          </button>
        ) : (
          <div
            className={`max-w-xs px-4 py-2 rounded-2xl text-sm leading-relaxed ${
              isMine
                ? 'bg-black text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
            }`}
          >
            {message.body}
          </div>
        )}
        <span className="text-xs text-gray-400">{time}</span>
      </div>

      {/* ライトボックス */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightbox(false)}
        >
          {/* 閉じるボタン */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* 画像 */}
          <div
            className="relative max-w-3xl max-h-[80vh] w-full mx-6"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={message.body}
              alt="拡大画像"
              className="w-full h-full object-contain rounded-xl max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </>
  )
}