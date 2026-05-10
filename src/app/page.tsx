import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <main className="flex flex-col">

      {/* ===== バナー ===== */}
      <section className="relative w-full h-[70vh] min-h-[480px] bg-gray-900 overflow-hidden">
        {/* バナー画像（用意できたら src を差し替え） */}
        <Image
          src="/images/banner.jpg"  // public/images/ に置いたファイル名
         alt="バナー"
         fill
         className="object-cover"
          priority
        />

        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-black/40" />

        {/* キャッチコピー */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 gap-6">
          <p className="text-white/70 text-sm tracking-[0.3em] uppercase">
            Therapist Link
          </p>
          <h1 className="text-white text-2xl sm:text-4xl font-bold leading-tight max-w-2xl">
            新感覚の、<br className="sm:hidden" />これからの当たり前。
          </h1>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-xl">
            まだ誰も知らない、その心地良さ——<br />
            「こういうのが欲しかった」を、形にしました。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              href="/employees"
              className="px-8 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition"
            >
              セラピストを探す
            </Link>
            <Link
              href={user ? '/employees' : '/login'}
              className="px-8 py-3 border border-white bg-black/20 text-white rounded-xl font-medium hover:bg-white/10 transition"
            >
              {user ? 'セラピスト一覧へ' : '無料で登録する'}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== サイト概要 ===== */}
      <section className="max-w-4xl mx-auto px-6 py-20 w-full">
        <div className="flex flex-col items-center text-center gap-4 mb-14">
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase">About</p>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Therapist Linkとは？
          </h2>
          <p className="text-gray-500 leading-relaxed max-w-xl">
            契約セラピストをWebで検索し、気になるセラピストへ直接コンタクト。
            実店舗での即リアルマッチングも可能で、施術の交渉もセラピストと直接行えます。
            安心・安全・自由な出会いをサポートする、エリア密着型のマッチングプラットフォームです。
          </p>
        </div>

        {/* 3つの特徴 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              ),
              title: 'Web で簡単検索',
              desc: '契約セラピストをエリア・タグ・名前で絞り込み、自分に合った一人を見つけられます。',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              ),
              title: '直接コンタクト',
              desc: 'チャットや予約機能を使って、セラピストと直接やり取り。施術内容の交渉もスムーズに。',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              ),
              title: '安心・安全・自由',
              desc: '当社契約のセラピストのみ掲載。エリア密着だから、近くの信頼できる一人に出会えます。',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center gap-4 p-8 border rounded-2xl hover:shadow-md transition"
            >
              <div className="text-gray-700">{item.icon}</div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTAバナー ===== */}
      <section className="bg-black text-white py-16 px-6">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-6">
          <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
            まずはセラピストを<br />探してみましょう
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            札幌市・近郊エリアのセラピストが登録中。<br />
            あなたにぴったりの一人がきっと見つかります。
          </p>
          <Link
            href="/employees"
            className="px-10 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition"
          >
            セラピストを探す
          </Link>
        </div>
      </section>

    </main>
  )
}