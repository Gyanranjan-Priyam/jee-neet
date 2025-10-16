import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

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
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'Content-Type': 'application/json',
        },
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000), // 10 second timeout
          })
        },
      }
    }
  )

  try {
    // Add timeout wrapper for auth calls
    const authPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Auth timeout')), 8000)
    )
    
    const {
      data: { user },
    } = await Promise.race([authPromise, timeoutPromise]) as any

    const url = request.nextUrl.clone()
    const pathname = request.nextUrl.pathname
    
    // Debug logging
    if (user) {
      console.log('Middleware - User authenticated:', {
        email: user.email,
        userType: user.user_metadata?.user_type,
        pathname: pathname
      })
    }

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
      if (!user) {
        // No user - redirect to admin login
        if (pathname !== '/admin/login') {
          return NextResponse.redirect(new URL('/admin/login', request.url))
        }
      } else {
        // User is authenticated, check if they're admin
        const userType = user.user_metadata?.user_type
        
        if (pathname === '/admin/login') {
          if (userType === 'admin') {
            // Admin already logged in, redirect to dashboard
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
          } else {
            // Student trying to access admin login, redirect to student dashboard
            url.pathname = '/student/dashboard'
            url.searchParams.set('error', 'Access denied. Please use student portal.')
            return NextResponse.redirect(url)
          }
        } else {
          // Accessing admin dashboard or other admin pages
          if (userType !== 'admin') {
            // Non-admin trying to access admin routes
            url.pathname = '/student/dashboard'
            url.searchParams.set('error', 'Access denied. Admin access required.')
            return NextResponse.redirect(url)
          }
        }
      }
    }

    // Protect student routes
    if (pathname.startsWith('/student')) {
      if (!user) {
        // No user - allow access to login, register, and verify-email pages
        if (!pathname.startsWith('/student/login') && 
            !pathname.startsWith('/student/register') && 
            !pathname.startsWith('/student/verify-email')) {
          return NextResponse.redirect(new URL('/student/login', request.url))
        }
      } else {
        // User is authenticated
        const userType = user.user_metadata?.user_type
        
        if (pathname === '/student/login' || pathname === '/student/register') {
          if (userType === 'admin') {
            // Admin trying to access student login/register, redirect to admin dashboard
            console.log('Middleware - Admin accessing student login, redirecting')
            url.pathname = '/admin/dashboard'
            url.searchParams.set('error', 'Please use admin portal.')
            return NextResponse.redirect(url)
          } else {
            // Student is already logged in, redirect to dashboard
            console.log('Middleware - Student already logged in, redirecting to dashboard')
            return NextResponse.redirect(new URL('/student/dashboard', request.url))
          }
        } else {
          // Accessing student dashboard or other student pages
          console.log('Middleware - Student route access check:', {
            pathname,
            userType,
            userEmail: user.email,
            userMetadata: user.user_metadata
          })
          
          if (userType === 'admin') {
            // Admin trying to access student routes
            console.log('Middleware - Admin trying to access student route, redirecting to admin dashboard')
            url.pathname = '/admin/dashboard'
            url.searchParams.set('error', 'Please use admin portal.')
            return NextResponse.redirect(url)
          }
          // For students (userType === 'student' or undefined/null for legacy users), allow access
          console.log('Middleware - Allowing student access to:', pathname, 'userType:', userType)
        }
      }
    }

  } catch (error) {
    console.error('Middleware auth error:', error)
    // If there's an auth error, allow access to login pages
    if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    if (request.nextUrl.pathname.startsWith('/student') && 
        !request.nextUrl.pathname.startsWith('/student/login') && 
        !request.nextUrl.pathname.startsWith('/student/register') && 
        !request.nextUrl.pathname.startsWith('/student/verify-email')) {
      return NextResponse.redirect(new URL('/student/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes that don't need protection
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth/check-user-type|api/auth/send-otp|api/auth/verify-otp|api/test-email|api/debug).*)',
  ],
}