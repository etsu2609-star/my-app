import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-gray-500">スタッフが見つかりませんでした</p>
      <Link href="/employees" className="text-sm underline">
        一覧に戻る
      </Link>
    </div>
  )
}