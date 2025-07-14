'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserAndSettings = async () => {
      const supabase = getSupabase();
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUser(user);
          
          // Fetch user settings with minimal data needed for navbar
          const { data: settings, error: settingsError } = await supabase
            .from('users_settings_tb')
            .select('name, role')
            .eq('user_id', user.id)
            .single();

          if (!settingsError && settings) {
            setUserSettings(settings);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndSettings();

    const supabase = getSupabase();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserSettings(null);
        router.push('/');
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        
        // Fetch user settings for the newly signed in user with minimal data
        const { data: settings, error: settingsError } = await supabase
          .from('users_settings_tb')
          .select('name, role')
          .eq('user_id', session.user.id)
          .single();

        if (!settingsError && settings) {
          setUserSettings(settings);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out process...');
      const supabase = getSupabase();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
      } else {
        console.log('Successfully signed out from Supabase');
      }
      
      // Clear local state immediately
      setUser(null);
      setUserSettings(null);
      
      // Small delay to ensure cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force redirect to home page using window.location for a hard refresh
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error in handleSignOut:', error);
      // Force redirect even on error
      window.location.href = '/';
    }
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    if (!user || !userSettings) return [];

    const commonItems = [
      { href: '/buyer/websites', label: 'Browse Websites', requireAuth: false },
    ];

    if (userSettings.role === 'Buyer') {
      return [
        { href: '/buyer/buyer-dashboard', label: 'Dashboard', requireAuth: true },
        ...commonItems,
        { href: '/buyer/buyer-orders', label: 'My Orders', requireAuth: true },
      ];
    } else if (userSettings.role === 'Seller') {
      return [
        { href: '/seller/seller-dashboard', label: 'Dashboard', requireAuth: true },
        ...commonItems,
        { href: '/add-website', label: 'Add Website', requireAuth: true },
        { href: '/manage-orders', label: 'Manage Orders', requireAuth: true },
      ];
    } else {
      // Fallback for users without specific roles
      return [
        { href: '/dashboard', label: 'Dashboard', requireAuth: true },
        ...commonItems,
        { href: '/add-website', label: 'Submit Site', requireAuth: true },
      ];
    }
  };

  const navItems = getNavItems();

  if (loading) {
    return (
      <nav className="bg-gray-900 bg-opacity-90 backdrop-blur-md text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex-shrink-0 font-bold text-xl tracking-wider text-white">
              GuestLinked
            </Link>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-24"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900 bg-opacity-90 backdrop-blur-md text-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 font-bold text-xl tracking-wider text-white">
              GuestLinked
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                (!item.requireAuth || user) && (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                      pathname === item.href 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-100 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>
          </div>
          <div className="flex items-center">
            {user && userSettings ? (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {userSettings.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-300">
                    {user.email}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {userSettings.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                href="/" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 