import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect dashboard routes
  const isDashboardRoute = 
    request.nextUrl.pathname.startsWith('/overview') ||
    request.nextUrl.pathname.startsWith('/leads') ||
    request.nextUrl.pathname.startsWith('/pipeline') ||
    request.nextUrl.pathname.startsWith('/automation-runs') ||
    request.nextUrl.pathname.startsWith('/review-queue') ||
    request.nextUrl.pathname.startsWith('/tasks') ||
    request.nextUrl.pathname.startsWith('/workflow') ||
    request.nextUrl.pathname.startsWith('/integrations') ||
    request.nextUrl.pathname.startsWith('/settings');

  if (isDashboardRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged in users away from auth pages
  const isAuthRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup'
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/overview'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
