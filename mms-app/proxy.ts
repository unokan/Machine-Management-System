import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ตรวจสอบข้อมูลผู้ใช้จาก Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // 1. ถ้ายังไม่ได้ Login แล้วพยายามเข้าหน้าอื่นที่ไม่ใช่ /login หรือ /register -> Redirect ไป /login
  if (!user && pathname !== '/login' && pathname !== '/register') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. ถ้า Login แล้ว แต่พยายามเข้าหน้า /login หรือ /register -> Redirect ไปหน้าหลัก (/)
  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * ดักจับทุก Route ยกเว้น:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - รูปภาพนามสกุล svg, png, jpg, jpeg, gif, webp
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}