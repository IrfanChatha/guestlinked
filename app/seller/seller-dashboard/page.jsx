'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { getSupabase } from '@/lib/supabaseClient';

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWebsites: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalEarnings: 0
  });
  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const supabase = getSupabase();
      
      try {
        // Wait for the auth session to be restored
        await supabase.auth.getSession();
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/');
          return;
        }

        // Fetch user settings to verify role
        const { data: settings, error: settingsError } = await supabase
          .from('users_settings_tb')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (settingsError || !settings) {
          console.error('Error fetching user settings:', settingsError);
          router.push('/');
          return;
        }

        // Redirect if not a seller
        if (settings.role !== 'Seller') {
          if (settings.role === 'Buyer') {
            router.push('/buyer-dashboard');
          } else {
            router.push('/dashboard');
          }
          return;
        }

        setUser(user);
        setUserSettings(settings);
        
        // Fetch seller-specific stats
        // Get websites count for this seller
        const { data: websites, error: websitesError } = await supabase
          .from('web_sites')
          .select('*')
          .eq('seller_id', user.id);

        if (!websitesError) {
          setStats(prevStats => ({
            ...prevStats,
            totalWebsites: websites?.length || 0
          }));
        }

        // For now, using placeholder data for orders and earnings
        setStats(prevStats => ({
          ...prevStats,
          activeOrders: 0,
          completedOrders: 0,
          totalEarnings: 0
        }));

        setLoading(false);
      } catch (error) {
        console.error('Error in seller dashboard:', error);
        router.push('/');
      }
    };

    checkUserAndFetchData();

    // Listen for auth changes
    const supabase = getSupabase();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90 pointer-events-none"></div>
      
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* User Header */}
        <div className="mb-10">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">
                {userSettings?.name?.[0]?.toUpperCase() || 'S'}
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome, {userSettings?.name || 'Seller'}
              </h2>
              <p className="text-gray-400">{user?.email}</p>
              <span className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold mt-2">
                Seller Account
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Websites */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">My Websites</h3>
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.totalWebsites}</p>
            <p className="text-sm text-gray-400">Listed websites</p>
          </div>

          {/* Active Orders */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Active Orders</h3>
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.activeOrders}</p>
            <p className="text-sm text-gray-400">In progress</p>
          </div>

          {/* Completed Orders */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Completed</h3>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.completedOrders}</p>
            <p className="text-sm text-gray-400">Successfully completed</p>
          </div>

          {/* Total Earnings */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Total Earnings</h3>
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-purple-400">${stats.totalEarnings}</p>
            <p className="text-sm text-gray-400">Total revenue</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add Website */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Add New Website</h3>
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-gray-400 mb-4">
              List your high-quality website for guest posting opportunities
            </p>
            <Link 
              href="/add-website"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-center font-medium transition-all duration-300 block"
            >
              Add Website
            </Link>
          </div>

          {/* Manage Orders */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Manage Orders</h3>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-400 mb-4">
              View and manage incoming guest posting orders
            </p>
            <Link 
              href="/manage-orders"
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-center font-medium transition-all duration-300 block"
            >
              Manage Orders
            </Link>
          </div>
        </div>

        {/* My Websites */}
        <div className="mt-8 bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">My Listed Websites</h3>
            <Link 
              href="/my-websites"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              View All
            </Link>
          </div>
          
          {stats.totalWebsites > 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-400">You have {stats.totalWebsites} website(s) listed</p>
              <Link 
                href="/my-websites"
                className="text-blue-400 hover:text-blue-300 font-medium mt-2 inline-block"
              >
                Manage your websites →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
              <p className="text-gray-400">No websites listed yet</p>
              <p className="text-sm text-gray-500 mt-2">Start by adding your first website to the marketplace</p>
              <Link 
                href="/add-website"
                className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
              >
                Add Your First Website
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 