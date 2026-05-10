import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import UnreadBadge from './UnreadBadge'
import { getUnreadCount } from '@/lib/unread'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('role, display_name')
        .eq('id', user.id)
        .single()
    : { data: null }

  const unreadCount = user && profile
    ? await getUnreadCount(user.id, profile.role)
    : 0

  return (
    <header className="border-b px-6 py-4 h-[57px] flex items-center">
      <nav className="max-w-5xl mx-auto flex items-center justify-between w-full">
        <Link href="/" className="font-medium">
          Therapist Link
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/employees" className="text-gray-600 hover:text-black transition">
            セラピスト一覧
          </Link>

          {user ? (
            <>
              {/* メッセージリンク（バッジつき） */}
              <Link href="/chat" className="relative text-gray-600 hover:text-black transition">
                メッセージ
                <UnreadBadge
                  initialCount={unreadCount}
                  userId={user.id}
                  role={profile?.role ?? 'user'}
                />
              </Link>

              <Link href="/appointments" className="text-gray-600 hover:text-black transition">
                予約
              </Link>
              <Link href="/settings" className="text-gray-600 hover:text-black transition">
                設定
              </Link>
              {profile?.role === 'employee' && (
                <Link href="/dashboard" className="text-gray-600 hover:text-black transition">
                  管理画面
                </Link>
              )}
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs">
                  {profile?.display_name || '名前未設定'}
                </span>
                <LogoutButton />
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              ログイン
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}