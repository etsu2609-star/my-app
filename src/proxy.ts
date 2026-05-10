import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // セッション更新（必須）
  const { data: { user } } = await supabase.auth.getUser()

  // 未ログインのまま保護ページへのアクセスをブロック
  const protectedPaths = ['/chat', '/appointments', '/dashboard']
  const isProtected = protectedPaths.some(p =>
    request.nextUrl.pathname.startsWith(p)
  )
  // 名前未設定の場合は設定ページへ誘導（設定ページ自体はスルー）
  if (user && !request.nextUrl.pathname.startsWith('/settings')) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  if (profile && !profile.display_name) {
    const url = request.nextUrl.clone()
    url.pathname = '/settings'
    return NextResponse.redirect(url)
  }
}
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
const protectedPaths = ['/chat', '/appointments', '/dashboard']
