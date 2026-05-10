import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NameForm from './_components/NameForm'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // メールアドレスを取得
  const { data: email } = await supabase.rpc('get_my_email')

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-medium mb-1">プロフィール設定</h1>
      <p className="text-gray-500 text-sm mb-10">プロフィールを設定してください</p>
      <NameForm profile={profile!} email={email ?? ''} />
    </main>
  )
}