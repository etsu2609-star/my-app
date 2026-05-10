import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppointmentForm from './_components/AppointmentForm'

type Props = { searchParams: Promise<{ employee: string }> }

export default async function NewAppointmentPage({ searchParams }: Props) {
  const { employee: employeeId } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 予約先の従業員情報を取得
  const { data: employee } = await supabase
    .from('profiles')
    .select('id, display_name, job_title')
    .eq('id', employeeId)
    .eq('role', 'employee')
    .single()

  if (!employee) redirect('/employees')

  // 既存の予約を取得（カレンダーで埋まっている枠を表示するため）
  const { data: existing } = await supabase
    .from('appointments')
    .select('starts_at, ends_at')
    .eq('employee_id', employeeId)
    .in('status', ['pending', 'confirmed'])
    .gte('starts_at', new Date().toISOString())

  return (
    <main className="max-w-xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-medium mb-1">予約する</h1>
      <p className="text-gray-500 mb-10">{employee.display_name}さんへの予約</p>
      <AppointmentForm
        employeeId={employee.id}
        currentUserId={user.id}
        existingSlots={existing ?? []}
      />
    </main>
  )
}