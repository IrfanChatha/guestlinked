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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/buyer',
    '/seller', 
    '/agent'
  ]
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Skip auth check for public routes
  if (!isProtectedRoute) {
    return response
  }

  try {
    // Add timeout to auth check with AbortController
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // Increase timeout to 8 seconds
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    clearTimeout(timeoutId)

    if (authError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Middleware auth error:', authError.message)
      }
      // Redirect to home if auth fails
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (user) {
      // Add timeout for role fetch as well
      const roleController = new AbortController()
      const roleTimeoutId = setTimeout(() => roleController.abort(), 5000)
      
      try {
        const { data: settings, error: roleError } = await supabase
          .from('users_settings_tb')
          .select('role, parent_buyer_id')
          .eq('user_id', user.id)
          .single()
        
        clearTimeout(roleTimeoutId)

        if (roleError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching user role in middleware:', roleError)
          }
          // If we can't get role, allow access but log error
          return response
        }

        if (settings && settings.role) {
          const userRole = settings.role
          const pathname = request.nextUrl.pathname

          // Role-based redirects with improved logic
          if (userRole === 'Agent') {
            if (!pathname.startsWith('/agent')) {
              return NextResponse.redirect(new URL('/agent/dashboard', request.url))
            }
          } else if (userRole === 'Buyer') {
            if (!pathname.startsWith('/buyer')) {
              return NextResponse.redirect(new URL('/buyer/buyer-dashboard', request.url))
            }
          } else if (userRole === 'Seller') {
            if (!pathname.startsWith('/seller')) {
              return NextResponse.redirect(new URL('/seller/seller-dashboard', request.url))
            }
          } else {
            // Unknown role, redirect to general dashboard
            if (pathname !== '/dashboard') {
              return NextResponse.redirect(new URL('/dashboard', request.url))
            }
          }
        }
      } catch (roleError) {
        if (roleError.name === 'AbortError') {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Role fetch timeout, allowing access')
          }
          return response
        }
        throw roleError
      }
    } else {
      // No user, redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Auth timeout, allowing access')
      }
      // On timeout, allow access for better UX
      return response
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Middleware auth error:', error.message)
    }
    
    // If auth check fails and trying to access protected route, redirect to home
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/', request.url))
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
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
  