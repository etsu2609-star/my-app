'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  profileId: string
  initialIsPublic: boolean
}

export default function PublicToggle({ profileId, initialIsPublic }: Props) {
  const supabase = createClient()
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const next = !isPublic

    const { error } = await supabase
      .from('profiles')
      .update({ is_public: next })
      .eq('id', profileId)

    if (!error) setIsPublic(next)
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-xl">
      <div>
        <p className="text-sm font-medium">プロフィールを公開する</p>
        <p className="text-xs text-gray-400 mt-0.5">
          オフにすると一覧ページに表示されなくなります
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          isPublic ? 'bg-black' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            isPublic ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}