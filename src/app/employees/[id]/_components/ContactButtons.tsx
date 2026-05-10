'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

type Props = {
  employee: Profile
  currentUserId: string | null
}

export default function ContactButtons({ employee, currentUserId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function startChat() {
  if (!currentUserId) {
    router.push('/login')
    return
  }

  // まず既存スレッドを検索
  const { data: existing, error: fetchError } = await supabase
    .from('threads')
    .select('id')
    .eq('employee_id', employee.id)
    .eq('user_id', currentUserId)
    .maybeSingle() // ← .single()から変更（0件でもエラーにならない）

  if (fetchError) {
    console.error('スレッド取得エラー:', fetchError)
    return
  }

  if (existing) {
    router.push(`/chat/${existing.id}`)
    return
  }

  // 存在しない場合のみ作成
  const { data: created, error: insertError } = await supabase
    .from('threads')
    .insert({ employee_id: employee.id, user_id: currentUserId })
    .select('id')
    .single()

  if (insertError) {
    // 409 = 競合（別タブ等で同時作成された場合）→ 再取得して遷移
    if (insertError.code === '23505') {
      const { data: retry } = await supabase
        .from('threads')
        .select('id')
        .eq('employee_id', employee.id)
        .eq('user_id', currentUserId)
        .maybeSingle()

      if (retry) {
        router.push(`/chat/${retry.id}`)
      }
    } else {
      console.error('スレッド作成エラー:', insertError)
    }
    return
  }

  if (created) {
    router.push(`/chat/${created.id}`)
  }
}

  function goToAppointment() {
    if (!currentUserId) {
      router.push('/login')
      return
    }
    router.push(`/appointments/new?employee=${employee.id}`)
  }
// 自分自身のプロフィールではコンタクトボタンを出さない
if (currentUserId === employee.id) {
  return null
}
  return (
  <div className="flex flex-col sm:flex-row gap-3">
    <button
      onClick={startChat}
      className="flex-1 py-3 px-6 rounded-xl font-medium border-2 border-black bg-black text-white hover:bg-gray-800 transition"
    >
      メッセージを送る
    </button>
    <button
      onClick={goToAppointment}
      className="flex-1 py-3 px-6 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition"
    >
      予約する
    </button>
  </div>
)
}