import { createClient } from '@/lib/supabase/server'
import { sendAppointmentConfirmedMail } from '@/lib/mail'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { appointmentId } = await request.json()
  const supabase = await createClient()

  // 認証確認
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 予約情報を取得
  const { data: apt } = await supabase
    .from('appointments')
    .select(`
      starts_at, ends_at, note,
      employee:employee_id(display_name),
      user:user_id(display_name)
    `)
    .eq('id', appointmentId)
    .single()

  if (!apt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // 利用者のメールアドレスを取得（auth.usersはサービスロールが必要なのでSQL経由）
  const { data: userData } = await supabase
    .rpc('get_user_email_by_appointment', { appointment_id: appointmentId })

  if (userData) {
    await sendAppointmentConfirmedMail({
      to: userData,
      employeeName: (apt.employee as any)?.display_name ?? '',
      userName: (apt.user as any)?.display_name ?? '',
      startsAt: apt.starts_at,
      endsAt: apt.ends_at,
      note: apt.note,
    })
  }

  return NextResponse.json({ ok: true })
}