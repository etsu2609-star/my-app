import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppointmentList from './_components/AppointmentList'

export default async function AppointmentsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const column = profile?.role === 'employee' ? 'employee_id' : 'user_id'
  const now = new Date().toISOString()

  // 現在の予約（終了日時が未来 or pending/confirmed）
  const { data: upcoming } = await supabase
    .from('appointments')
    .select(`
      id, starts_at, ends_at, status, note,
      employee:employee_id(display_name, job_title),
      user:user_id(display_name)
    `)
    .eq(column, user.id)
    .gte('ends_at', now)
    .in('status', ['pending', 'confirmed'])
    .order('starts_at', { ascending: true })

  // アーカイブ（終了日時が過去 or キャンセル済み）
  const { data: archived } = await supabase
    .from('appointments')
    .select(`
      id, starts_at, ends_at, status, note,
      employee:employee_id(display_name, job_title),
      user:user_id(display_name)
    `)
    .eq(column, user.id)
    .or(`ends_at.lt.${now},status.eq.cancelled`)
    .order('starts_at', { ascending: false })

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-medium mb-10">予約</h1>
      <AppointmentList
        upcoming={upcoming ?? []}
        archived={archived ?? []}
        role={profile?.role ?? 'user'}
      />
    </main>
  )
}