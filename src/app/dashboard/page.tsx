import { createClient } from '@/lib/supabase/server'
import ProfileForm from './_components/ProfileForm'
import SubscriptionCard from './_components/SubscriptionCard'
import PublicToggle from './_components/PublicToggle'
import MenuEditor from './_components/MenuEditor'
import TagEditor from './_components/TagEditor'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: email } = await supabase.rpc('get_my_email')

  const { data: menus } = await supabase
    .from('menus')
    .select('*')
    .eq('employee_id', user!.id)
    .order('sort_order')

  // 自分のタグ
  const { data: profileTags } = await supabase
    .from('profile_tags')
    .select('tag_id, tags(id, name)')
    .eq('profile_id', user!.id)

  // 全タグ（サジェスト用）
  const { data: allTags } = await supabase
    .from('tags')
    .select('id, name')
    .order('name')

  const myTags = (profileTags ?? [])
    .map((pt: any) => pt.tags)
    .filter(Boolean)

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-medium mb-1">プロフィール編集</h1>
        <p className="text-gray-500 text-sm">公開ページに表示される情報を編集できます</p>
      </div>
      <SubscriptionCard profileId={profile!.id} initialIsSubscribed={profile!.is_subscribed} />
      {profile!.is_subscribed && (
        <PublicToggle profileId={profile!.id} initialIsPublic={profile!.is_public} />
      )}
      <ProfileForm profile={profile!} email={email ?? ''} />
      <hr />
      <TagEditor
        profileId={user!.id}
        initialTags={myTags}
        allTags={allTags ?? []}
      />
      <hr />
      <MenuEditor employeeId={user!.id} initialMenus={menus ?? []} />
    </div>
  )
}