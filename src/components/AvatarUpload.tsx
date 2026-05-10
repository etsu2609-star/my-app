'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

type Props = {
  profileId: string
  currentUrl: string
  onUpload: (url: string) => void
}

export default function AvatarUpload({ profileId, currentUrl, onUpload }: Props) {
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // プレビュー表示
    setPreview(URL.createObjectURL(file))
    setUploading(true)

    const ext = file.name.split('.').pop()
    const path = `${profileId}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      console.error('アップロードエラー:', uploadError)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    onUpload(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 shrink-0">
        {preview ? (
          <Image src={preview} alt="avatar" fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
            ?
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
        >
          {uploading ? 'アップロード中...' : '画像を変更'}
        </button>
        <p className="text-xs text-gray-400">JPG・PNG・GIF（最大2MB）</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
}