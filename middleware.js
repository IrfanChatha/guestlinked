import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Simple in-memory cache for user settings (you can replace with Redis in production)
const userSettingsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

  const { data: { user } } = await supabase.auth.getUser()
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/buyer/buyer-dashboard', 
    '/seller/seller-dashboard',
    '/add-website',
    '/my-orders',
    '/manage-orders',
    '/my-websites'
  ]

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // If user is not authenticated and trying to access protected route
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user is authenticated, check role-based access
  if (user && isProtectedRoute) {
    try {
      // Check cache first
      const cacheKey = user.id;
      const cached = userSettingsCache.get(cacheKey);
      let userSettings;

      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        userSettings = cached.data;
      } else {
        // Fetch user settings to determine role (only if not cached)
        const { data: settings, error } = await supabase
          .from('users_settings_tb')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (error || !settings) {
          console.error('Middleware - Error fetching user settings:', error)
          return NextResponse.redirect(new URL('/', request.url))
        }

        userSettings = settings;
        
        // Cache the result
        userSettingsCache.set(cacheKey, {
          data: userSettings,
          timestamp: Date.now()
        });
      }

      const { role } = userSettings
      const pathname = request.nextUrl.pathname

      // Role-based routing logic
      if (role === 'Buyer') {
        // Buyer-specific routes
        if (pathname.startsWith('/seller/seller-dashboard') || 
            pathname.startsWith('/add-website') ||
            pathname.startsWith('/manage-orders') ||
            pathname.startsWith('/my-websites')) {
          return NextResponse.redirect(new URL('/buyer/buyer-dashboard', request.url))
        }
        // Redirect old dashboard to buyer dashboard
        if (pathname === '/dashboard') {
          return NextResponse.redirect(new URL('/buyer/buyer-dashboard', request.url))
        }
      } else if (role === 'Seller') {
        // Seller-specific routes
        if (pathname.startsWith('/buyer/buyer-dashboard') || 
            pathname.startsWith('/my-orders')) {
          return NextResponse.redirect(new URL('/seller/seller-dashboard', request.url))
        }
        // Redirect old dashboard to seller dashboard
        if (pathname === '/dashboard') {
          return NextResponse.redirect(new URL('/seller/seller-dashboard', request.url))
        }
      } else {
        // For users without specific roles, redirect to general dashboard
        if (pathname.startsWith('/buyer/buyer-dashboard') || 
            pathname.startsWith('/seller/seller-dashboard')) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
  