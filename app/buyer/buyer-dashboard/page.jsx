'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { getSupabase } from '@/lib/supabaseClient';

export default function BuyerDashboard() {
  const [user, setUser] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  });
  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const supabase = getSupabase();
      
      try {
        // Get user from auth - this is fast as it's cached
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/');
          return;
        }

        // Set user immediately to show partial UI
        setUser(user);

        // Fetch user settings in parallel with minimal data
        const { data: settings, error: settingsError } = await supabase
          .from('users_settings_tb')
          .select('name, role')
          .eq('user_id', user.id)
          .single();

        if (settingsError || !settings) {
          console.error('Error fetching user settings:', settingsError);
          router.push('/');
          return;
        }

        // Redirect if not a buyer
        if (settings.role !== 'Buyer') {
          if (settings.role === 'Seller') {
            router.push('/seller/seller-dashboard');
          } else {
            router.push('/dashboard');
          }
          return;
        }

        // Set user settings immediately
        setUserSettings(settings);
        setLoading(false);

        // Load stats in background (non-blocking)
        loadStatsInBackground(user.id);

      } catch (error) {
        console.error('Error in buyer dashboard:', error);
        router.push('/');
      }
    };

    // Separate function to load stats without blocking initial render
    const loadStatsInBackground = async (userId) => {
      try {
        const supabase = getSupabase();
        
        // For now, using placeholder data since we don't have orders table yet
        // In the future, you can uncomment and modify this query:
        /*
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, status, total_amount')
          .eq('buyer_id', userId);

        if (!ordersError && orders) {
          const totalOrders = orders.length;
          const activeOrders = orders.filter(o => o.status === 'active').length;
          const completedOrders = orders.filter(o => o.status === 'completed').length;
          const totalSpent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
          
          setStats({
            totalOrders,
            activeOrders,
            completedOrders,
            totalSpent
          });
        }
        */
        
        // Placeholder stats for now
        setStats({
          totalOrders: 0,
          activeOrders: 0,
          completedOrders: 0,
          totalSpent: 0
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    checkUserAndFetchData();

    // Simplified auth listener
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

  // Show loading only for critical data
  if (loading || !user || !userSettings) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading your dashboard...</p>
        </div>
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
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">
                {userSettings?.name?.[0]?.toUpperCase() || 'B'}
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome, {userSettings?.name || 'Buyer'}
              </h2>
              <p className="text-gray-400">{user?.email}</p>
              <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold mt-2">
                Buyer Account
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Total Orders</h3>
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.totalOrders}</p>
            <p className="text-sm text-gray-400">All time orders</p>
          </div>

          {/* Active Orders */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 transform transition-all hover:scale-105">
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
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Completed</h3>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.completedOrders}</p>
            <p className="text-sm text-gray-400">Successfully completed</p>
          </div>

          {/* Total Spent */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Total Spent</h3>
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-purple-400">${stats.totalSpent}</p>
            <p className="text-sm text-gray-400">Total investment</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Browse Websites */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Browse Websites</h3>
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-4">
              Find high-quality websites for your guest posting campaigns
            </p>
            <Link 
              href="/buyer/websites"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-center font-medium transition-all duration-300 block"
            >
              Browse Available Websites
            </Link>
          </div>

          {/* My Orders */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">My Orders</h3>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-400 mb-4">
              Track your guest posting orders and submissions
            </p>
            <Link 
              href="/my-orders"
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-center font-medium transition-all duration-300 block"
            >
              View My Orders
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-400">No recent activity</p>
            <p className="text-sm text-gray-500 mt-2">Start by browsing websites and placing your first order</p>
          </div>
        </div>
      </main>
    </div>
  );
} 