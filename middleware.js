import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/buyer/buyer-dashboard', 
    '/buyer/websites',
    '/seller/seller-dashboard',
    '/add-website',
    '/buyer/my-orders',
    '/buyer/manage-orders',
    '/seller/my-websites'
  ]

  // Define routes that authenticated users should not access
  const publicOnlyRoutes = ['/']

  const pathname = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicOnlyRoute = publicOnlyRoutes.includes(pathname)

  try {
    // Quick auth check with timeout
    const authPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Auth timeout')), 3000)
    )
    
    const { data: { user } } = await Promise.race([authPromise, timeoutPromise])
    
    // If user is authenticated and trying to access public-only routes (like home page)
    if (user && isPublicOnlyRoute) {
      try {
        // Fetch user role to redirect to appropriate dashboard
        const { data: userSettings, error: settingsError } = await supabase
          .from('users_settings_tb')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (!settingsError && userSettings?.role) {
          if (userSettings.role === 'Buyer') {
            return NextResponse.redirect(new URL('/buyer/buyer-dashboard', request.url))
          } else if (userSettings.role === 'Seller') {
            return NextResponse.redirect(new URL('/seller/seller-dashboard', request.url))
          } else {
            return NextResponse.redirect(new URL('/dashboard', request.url))
          }
        } else {
          // If role fetch fails, redirect to general dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch (roleError) {
        console.error('Error fetching user role:', roleError)
        // Fallback to general dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    
    // If user is not authenticated and trying to access protected routes
    if (!user && isProtectedRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
  } catch (error) {
    console.error('Middleware auth error:', error.message)
    
    // If auth check fails and trying to access protected route, redirect to home
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // If auth check fails on public routes, allow access
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
  