'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  initialCount: number
  userId: string
  role: string
}

export default function UnreadBadge({ initialCount, userId, role }: Props) {
  const [count, setCount] = useState(initialCount)
  const supabase = createClient()

  // Realtimeで新着メッセージを購読
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
          const msg = payload.new as { sender_id: string }
          if (msg.sender_id !== userId) {
            setCount((prev) => prev + 1)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // チャットを開いたらバッジをリセット
  useEffect(() => {
    function handleRead() {
      setCount(0)
    }
    window.addEventListener('chat-read', handleRead)
    return () => window.removeEventListener('chat-read', handleRead)
  }, [])

  if (count === 0) return null

  return (
    <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  )
}