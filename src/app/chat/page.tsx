import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function ChatListPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // 自分が関係するスレッドを取得
  const column = profile?.role === 'employee' ? 'employee_id' : 'user_id'
  const { data: threads } = await supabase
  .from('threads')
  .select(`
    id,
    employee_id,
    user_id,
    employee:employee_id(id, display_name, avatar_url, job_title),
    user:user_id(id, display_name, avatar_url),
    messages(body, created_at)
  `)
  .eq(column, user.id)
  
  // 各スレッドの最新メッセージだけ取り出す
  const threadsWithLatest = (threads ?? []).map((t: any) => ({
    ...t,
    latestMessage: t.messages?.at(-1) ?? null,
  }))

  // 最新メッセージの日時でソート
  threadsWithLatest.sort((a: any, b: any) => {
    if (!a.latestMessage) return 1
    if (!b.latestMessage) return -1
    return new Date(b.latestMessage.created_at).getTime() -
           new Date(a.latestMessage.created_at).getTime()
  })

  return (
    <main className="max-w-xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-medium mb-10">メッセージ</h1>

      {threadsWithLatest.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">まだメッセージはありません</p>
          <Link href="/employees" className="text-sm underline text-gray-500 mt-3 inline-block">
            スタッフ一覧へ
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y">
          {threadsWithLatest.map((thread: any) => {
            const other = profile?.role === 'employee' ? thread.user : thread.employee
            if (!other) return null

            return (
              <Link
                key={thread.id}
                href={`/chat/${thread.id}`}
                className="flex items-center gap-4 py-4 hover:bg-gray-50 -mx-3 px-3 rounded-xl transition"
              >
                {/* アバター */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  {other.avatar_url ? (
                    <Image
                      src={other.avatar_url}
                      alt={other.display_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                      {other.display_name?.[0] ?? '?'}
                    </div>
                  )}
                </div>

                {/* 名前と最新メッセージ */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{other.display_name}</p>
                    {thread.latestMessage && (
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(thread.latestMessage.created_at).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                  {other.job_title && profile?.role !== 'employee' && (
                    <p className="text-xs text-gray-400 truncate">{other.job_title}</p>
                  )}
                  {thread.latestMessage && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {thread.latestMessage.body}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}