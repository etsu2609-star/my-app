import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

  const column = profile?.role === 'employee'
    ? 'employee_last_read_at'
    : 'user_last_read_at'

  await supabase
    .from('threads')
    .update({ [column]: new Date().toISOString() })
    .eq('id', threadId)

  return NextResponse.json({ ok: true })
}