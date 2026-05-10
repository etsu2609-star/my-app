import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import SearchBar from './_components/SearchBar'
import type { Profile } from '@/types'

export const revalidate = 60

type Props = {
  searchParams: Promise<{ q?: string; tags?: string }>
}

export default async function EmployeesPage({ searchParams }: Props) {
  const { q, tags: tagsParam } = await searchParams
  const supabase = await createClient()

  // カンマ区切りで複数タグを取得
  const selectedTags = tagsParam
    ? tagsParam.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  // タグで絞り込む場合（AND条件：すべてのタグを持つ従業員）
  let filteredIds: string[] | null = null
  if (selectedTags.length > 0) {
    // タグ名からIDを取得
    const { data: tagData } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', selectedTags)

    if (!tagData || tagData.length !== selectedTags.length) {
      // 存在しないタグが含まれている場合は結果なし
      filteredIds = []
    } else {
      // 各タグに該当するprofile_idを取得してAND絞り込み
      const tagIds = tagData.map((t) => t.id)
      let candidateIds: string[] | null = null

      for (const tagId of tagIds) {
        const { data: pts } = await supabase
          .from('profile_tags')
          .select('profile_id')
          .eq('tag_id', tagId)

        const ids = (pts ?? []).map((pt: any) => pt.profile_id)

        if (candidateIds === null) {
          candidateIds = ids
        } else {
          // AND: 両方に含まれるIDのみ残す
          candidateIds = candidateIds.filter((id) => ids.includes(id))
        }

        if (candidateIds.length === 0) break
      }

      filteredIds = candidateIds ?? []
    }
  }

  // 従業員一覧を取得
  let employees: Profile[] = []

  if (filteredIds === null || filteredIds.length > 0) {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'employee')
      .eq('is_public', true)
      .order('display_name')

    if (q) {
      query = query.or(
  `display_name.ilike.%${q}%,job_title.ilike.%${q}%,bio.ilike.%${q}%,region.ilike.%${q}%`
)
    }

    if (filteredIds !== null) {
      query = query.in('id', filteredIds)
    }

    const { data } = await query
    employees = data ?? []
  }

  // 全タグ一覧
  const { data: allTags } = await supabase
    .from('tags')
    .select('id, name')
    .order('name')

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-medium mb-2">セラピスト一覧</h1>
      <p className="text-gray-500 mb-8">お気軽にご連絡ください</p>

      <SearchBar
        initialQ={q ?? ''}
        initialTags={selectedTags}
        allTags={allTags ?? []}
      />

      {employees.length === 0 ? (
        <div className="mt-10 py-16 text-center border border-dashed rounded-xl">
          <p className="text-gray-400 text-sm">該当するスタッフが見つかりませんでした</p>
          {(q || selectedTags.length > 0) && (
            <p className="text-gray-400 text-xs mt-2">
              検索条件を変えてお試しください
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
          {employees.map((emp: Profile) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>
      )}
    </main>
  )
}

function EmployeeCard({ employee }: { employee: Profile }) {
  return (
    <Link
      href={`/employees/${employee.id}`}
      className="group flex flex-col items-center gap-3 p-6 border rounded-xl hover:shadow-md transition"
    >
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
        {employee.avatar_url ? (
          <Image
            src={employee.avatar_url}
            alt={employee.display_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
            {employee.display_name[0]}
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="font-medium group-hover:underline">{employee.display_name}</p>
        {employee.job_title && (
          <p className="text-sm text-gray-500 mt-1">{employee.job_title}</p>
        )}
      </div>
    </Link>
  )
}