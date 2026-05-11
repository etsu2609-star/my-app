import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUnreadCount } from '@/lib/unread'

export async function POST(request: Request) {
  const { threadId } = await request.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'user'
  const column = role === 'employee'
    ? 'employee_last_read_at'
    : 'user_last_read_at'

  await supabase
    .from('threads')
    .update({ [column]: new Date().toISOString() })
    .eq('id', threadId)

  // 更新後の残未読数を同一リクエスト内で取得して返す（競合を防ぐ）
  const unreadCount = await getUnreadCount(user.id, role)
  return NextResponse.json({ ok: true, unreadCount })
}