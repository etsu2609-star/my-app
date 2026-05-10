import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 従業員以外はトップにリダイレクト
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'employee') redirect('/')

  return (
    <div className="min-h-screen">
      <header className="border-b px-6 py-4">
        <p className="text-sm font-medium">管理画面</p>
      </header>
      <div className="max-w-2xl mx-auto px-6 py-12">
        {children}
      </div>
    </div>
  )
}