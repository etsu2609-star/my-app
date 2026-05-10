import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ChatWindow from './_components/ChatWindow'

type Props = { params: Promise<{ threadId: string }> }
export const metadata = {
  body: { className: 'overflow-hidden' },
}
export default async function ChatPage({ params }: Props) {
  const { threadId } = await params
  const supabase = await createClient()

  // ログイン確認
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // スレッドの取得（自分が関係者かRLSで自動チェック）
  const { data: thread } = await supabase
    .from('threads')
    .select('id, employee_id, user_id')
    .eq('id', threadId)
    .single()

  if (!thread) notFound()

  // 過去メッセージを取得
  const { data: initialMessages } = await supabase
    .from('messages')
    .select('id, sender_id, body, created_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(100)

  // 相手のプロフィールを取得
  const otherId = thread.employee_id === user.id
    ? thread.user_id
    : thread.employee_id

  const { data: otherProfile } = await supabase
  .from('profiles')
  .select('id, display_name, avatar_url, job_title, role') // ← role を追加
  .eq('id', otherId)
  .single()

return (
  <ChatWindow
    threadId={threadId}
    currentUserId={user.id}
    initialMessages={initialMessages ?? []}
    otherProfile={otherProfile ?? {
      id: '',
      role: 'user',
      display_name: '不明',
      avatar_url: '',
      job_title: '',
    }}
  />
)
}