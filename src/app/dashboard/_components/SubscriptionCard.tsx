'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  profileId: string
  initialIsSubscribed: boolean
}

export default function SubscriptionCard({ profileId, initialIsSubscribed }: Props) {
  const supabase = createClient()
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed)
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    setLoading(true)
    const next = !isSubscribed
    const { error } = await supabase
      .from('profiles')
      .update({ is_subscribed: next })
      .eq('id', profileId)
    if (!error) setIsSubscribed(next)
    setLoading(false)
  }

  return (
    <div className="p-6 border rounded-xl space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">掲載プラン</p>
          <p className="text-sm text-gray-500 mt-0.5">
            加入するとセラピスト一覧ページにプロフィールが掲載されます
          </p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
            isSubscribed
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {isSubscribed ? '掲載中' : '未加入'}
        </span>
      </div>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isSubscribed
            ? 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {loading
          ? '処理中...'
          : isSubscribed
          ? '掲載を停止する'
          : 'サブスクリプションに加入する'}
      </button>
    </div>
  )
}
