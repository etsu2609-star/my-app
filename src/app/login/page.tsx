'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'user' | 'employee'>('user')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (mode === 'signup' && !agreed) {
      setError('利用規約に同意してください')
      return
    }

    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setDone(true)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('メールアドレスまたはパスワードが正しくありません')
      } else {
        router.push('/')
        router.refresh()
      }
    }

    setLoading(false)
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 p-10 border rounded-xl max-w-sm w-full text-center">
          <p className="text-lg font-medium">確認メールを送信しました</p>
          <p className="text-sm text-gray-500">
            {email} に届いたリンクをクリックして登録を完了してください。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col gap-6 p-10 border rounded-xl max-w-sm w-full">

        {/* タブ */}
        <div className="flex rounded-lg border overflow-hidden text-sm">
          {(['login', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setAgreed(false) }}
              className={`flex-1 py-2 transition ${
                mode === m ? 'bg-black text-white' : 'hover:bg-gray-50'
              }`}
            >
              {m === 'login' ? 'ログイン' : '新規登録'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* メールアドレス */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">メールアドレス</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
              placeholder="you@example.com"
            />
          </div>

          {/* パスワード */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">パスワード</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
              placeholder="8文字以上"
            />
          </div>

          {/* 新規登録時のみ */}
          {mode === 'signup' && (
            <>
              {/* アカウント種別 */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">アカウント種別</label>
                <div className="flex gap-3">
                  {(['user', 'employee'] as const).map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value={r}
                        checked={role === r}
                        onChange={() => setRole(r)}
                      />
                      {r === 'user' ? '利用者' : '従業員'}
                    </label>
                  ))}
                </div>
              </div>

              {/* 利用規約同意 */}
              <div className="p-4 bg-gray-50 rounded-xl flex flex-col gap-3">
                <div className="text-xs text-gray-600 leading-relaxed max-h-28 overflow-y-auto pr-1">
                  <p className="font-medium mb-1">利用規約の主なポイント</p>
                  <ul className="flex flex-col gap-1">
                    {[
                      '本サービスは完全会員制です',
                      '18歳未満の方はご利用いただけません',
                      '医療行為は一切提供しておりません',
                      '撮影・盗撮は厳禁です',
                      '無断キャンセルは全額請求の対象となります',
                      '社会秩序を守れない方のご利用はお断りします',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">・</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 shrink-0"
                  />
                  <span className="text-sm text-gray-700">
                    <Link
                      href="/terms"
                      target="_blank"
                      className="underline hover:text-black"
                    >
                      利用規約
                    </Link>
                    を読み、内容に同意します
                  </span>
                </label>
              </div>
            </>
          )}

          {/* エラー */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={loading || (mode === 'signup' && !agreed)}
            className="py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition"
          >
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '登録する'}
          </button>
        </form>
      </div>
    </div>
  )
}