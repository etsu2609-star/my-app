import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUnreadCount } from '@/lib/unread'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const count = await getUnreadCount(user.id, profile?.role ?? 'user')
  return NextResponse.json({ count })
}
