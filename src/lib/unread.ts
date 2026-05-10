import { createClient } from '@/lib/supabase/server'

export async function getUnreadCount(userId: string, role: string) {
  const supabase = await createClient()

  const column = role === 'employee' ? 'employee_id' : 'user_id'
  const lastReadColumn = role === 'employee'
    ? 'employee_last_read_at'
    : 'user_last_read_at'

  // 自分が参加しているスレッドを取得
  const { data: threads } = await supabase
    .from('threads')
    .select(`id, ${lastReadColumn}`)
    .eq(column, userId)

  if (!threads || threads.length === 0) return 0

  // 各スレッドで自分の last_read_at 以降の相手のメッセージ数を合計
  let total = 0
  for (const thread of threads) {
    const lastRead = thread[lastReadColumn] ?? new Date(0).toISOString()
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('thread_id', thread.id)
      .neq('sender_id', userId)
      .gt('created_at', lastRead)

    total += count ?? 0
  }

  return total
}