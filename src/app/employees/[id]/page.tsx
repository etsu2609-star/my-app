import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ContactButtons from './_components/ContactButtons'
import MenuTabs from './_components/MenuTabs'
import type { Profile } from '@/types'

type Props = { params: Promise<{ id: string }> }

const genderLabel: Record<string, string> = {
  male: '男性',
  female: '女性',
  other: 'その他',
}

export default async function EmployeeDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: employee } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'employee')
    .eq('is_public', true)
    .single()

  if (!employee) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: menus } = await supabase
    .from('menus')
    .select('*')
    .eq('employee_id', id)
    .order('sort_order')

    const { data: profileTags } = await supabase
  .from('profile_tags')
  .select('tag_id, tags(id, name)')
  .eq('profile_id', id)

const tags = (profileTags ?? [])
  .map((pt: any) => pt.tags)
  .filter(Boolean)

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">

      {/* ヘッダー */}
      <div className="flex items-center gap-6 mb-10">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 shrink-0">
          {employee.avatar_url ? (
            <Image
              src={employee.avatar_url}
              alt={employee.display_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">
              {employee.display_name[0]}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-medium">{employee.display_name}</h1>
          {employee.job_title && (
            <p className="text-gray-500 mt-1">{employee.job_title}</p>
          )}
          {employee.region && (
            <p className="text-sm text-gray-400 mt-1">{employee.region}</p>
          )}
        </div>
      </div>

      {/* 基本情報 */}
      <section className="mb-8">
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          基本情報
        </h2>
        <div className="flex flex-col gap-2">
          {employee.age && (
            <InfoRow label="年齢" value={`${employee.age}歳`} />
          )}
          {employee.gender && (
            <InfoRow label="性別" value={genderLabel[employee.gender] ?? ''} />
          )}
          {employee.therapist_years != null && (
            <InfoRow label="セラピスト歴" value={`${employee.therapist_years}年`} />
          )}
          {employee.region && (
            <InfoRow label="対応地域" value={employee.region} />
          )}
        </div>
      </section>
      {/* タグ */}
{tags.length > 0 && (
  <section className="mb-8">
    <div className="flex flex-wrap gap-2">
      {tags.map((tag: any) => (
        <span
          key={tag.id}
          className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
        >
          {tag.name}
        </span>
      ))}
    </div>
  </section>
)}
      {/* 自己紹介 */}
      {employee.bio && (
        <section className="mb-8">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            自己紹介
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {employee.bio}
          </p>
        </section>
      )}

      {/* メニュー */}
      {menus && menus.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
            メニュー
          </h2>
          <MenuTabs menus={menus} />
        </section>
      )}

      {/* コンタクトボタン */}
      <ContactButtons
        employee={employee as Profile}
        currentUserId={user?.id ?? null}
      />
    </main>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 text-sm">
      <span className="text-gray-400 w-24 shrink-0">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
  )
}