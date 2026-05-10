'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  onSend: (body: string) => void
  currentUserId: string
}

export default function ChatInput({ onSend, currentUserId }: Props) {
  const supabase = createClient()
  const [value, setValue] = useState('')
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleSend() {
    if (!value.trim()) return
    onSend(value.trim())
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const ext = file.name.split('.').pop()
    const path = `${currentUserId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(path, file)

    if (uploadError) {
      console.error('アップロードエラー:', uploadError)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('chat-images').getPublicUrl(path)
    onSend(data.publicUrl)
    setUploading(false)

    // ファイル入力をリセット
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="shrink-0 px-4 py-3 border-t flex items-end gap-2">
      {/* 画像添付ボタン */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="shrink-0 w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition"
      >
        {uploading ? (
          <span className="text-xs text-gray-400">...</span>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
            <circle cx="5.5" cy="6.5" r="1" fill="currentColor"/>
            <path d="M1 10L5 7L8 10L11 7.5L15 11" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* テキスト入力 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="メッセージを入力... (Enterで送信)"
        rows={1}
        className="flex-1 resize-none rounded-xl border px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300 max-h-36 overflow-y-auto"
      />

      {/* 送信ボタン */}
      <button
        onClick={handleSend}
        disabled={!value.trim()}
        className="shrink-0 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-30 hover:bg-gray-800 transition"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 14L8 2L14 14L8 11L2 14Z" fill="white"/>
        </svg>
      </button>
    </div>
  )
}