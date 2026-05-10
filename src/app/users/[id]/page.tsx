import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Profile } from '@/types'

type Props = { params: Promise<{ id: string }> }

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // ログイン確認
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  // 自分が従業員かチェック
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // 従業員以外はアクセス不可
  if (myProfile?.role !== 'employee') notFound()

  // 対象ユーザーのプロフィール取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'user')
    .single()

  if (!profile) notFound()

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">

      {/* ヘッダー */}
      <div className="flex items-center gap-6 mb-10">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 shrink-0">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">
              {profile.display_name?.[0] ?? '?'}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-medium">{profile.display_name}</h1>
          {profile.region && (
            <p className="text-sm text-gray-400 mt-1">{profile.region}</p>
          )}
        </div>
      </div>

      {/* 基本情報 */}
      <section className="mb-10">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          基本情報
        </h2>
        <div className="flex flex-col gap-2">
          {profile.age && (
            <InfoRow label="年齢" value={`${profile.age}歳`} />
          )}
          {profile.region && (
            <InfoRow label="対応地域" value={profile.region} />
          )}
          {profile.phone && (
            <InfoRow label="電話番号" value={profile.phone} />
          )}
        </div>
      </section>
    </main>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 text-sm">
      <span className="text-gray-400 w-20 shrink-0">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
  )
}