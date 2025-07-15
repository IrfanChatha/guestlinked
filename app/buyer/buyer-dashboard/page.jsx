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
    totalSpent: 0,
    totalWebsites: 0
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
          .select('name, role, user_id')
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
        loadStatsInBackground(settings.user_id);

      } catch (error) {
        console.error('Error in buyer dashboard:', error);
        router.push('/');
      }
    };

    // Separate function to load stats without blocking initial render
    const loadStatsInBackground = async (userId) => {
      try {
        const supabase = getSupabase();
        
        // Fetch all orders for this buyer (need order_id for updates)
        const { data: orders, error: ordersError } = await supabase
          .from('buyer_orders')
          .select('order_id, status, budget, posting_from_date, posting_to_date, created_at')
          .eq('buyer_id', userId);

        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          return;
        }

        // Check for orders that should be marked as completed
        const currentDate = new Date();
        const ordersToComplete = orders ? orders.filter(order => {
          // Only update orders that are not already completed or rejected
          if (['completed', 'rejected'].includes(order.status?.toLowerCase())) {
            return false;
          }
          
          // Check if posting_to_date has passed
          if (order.posting_to_date) {
            const toDate = new Date(order.posting_to_date);
            return currentDate > toDate;
          }
          
          return false;
        }) : [];

        // Update orders that have passed their posting_to_date
        if (ordersToComplete.length > 0) {
          console.log(`Updating ${ordersToComplete.length} orders to completed status`);
          
          const orderIdsToUpdate = ordersToComplete.map(order => order.order_id);
          
          const { error: updateError } = await supabase
            .from('buyer_orders')
            .update({ 
              status: 'completed',
              updated_at: new Date().toISOString()
            })
            .in('order_id', orderIdsToUpdate);

          if (updateError) {
            console.error('Error updating order statuses:', updateError);
          } else {
            console.log(`Successfully updated ${orderIdsToUpdate.length} orders to completed`);
            
            // Update the local orders data to reflect the changes
            orders.forEach(order => {
              if (orderIdsToUpdate.includes(order.order_id)) {
                order.status = 'completed';
              }
            });
          }
        }

        // Fetch websites count
        const { data: websites, error: websitesError } = await supabase
          .from('buyer_websites_tb')
          .select('id')
          .eq('buyer_id', userId);

        if (websitesError) {
          console.error('Error fetching websites:', websitesError);
        }

        // Calculate stats from updated orders data
        const totalOrders = orders ? orders.length : 0;
        const totalSpent = orders ? orders.reduce((sum, order) => sum + (parseFloat(order.budget) || 0), 0) : 0;
        
        // Calculate active orders (orders within posting date range)
        const activeOrders = orders ? orders.filter(order => {
          if (!order.posting_from_date || !order.posting_to_date) return false;
          
          const fromDate = new Date(order.posting_from_date);
          const toDate = new Date(order.posting_to_date);
          
          // Active if current date is between posting dates and status is not completed/rejected
          return currentDate >= fromDate && 
                 currentDate <= toDate && 
                 !['completed', 'rejected'].includes(order.status?.toLowerCase());
        }).length : 0;
        
        // Calculate completed orders (status = completed)
        const completedOrders = orders ? orders.filter(order => {
          return order.status?.toLowerCase() === 'completed';
        }).length : 0;

        // Update stats
        setStats({
          totalOrders,
          activeOrders,
          completedOrders,
          totalSpent: Math.round(totalSpent * 100) / 100, // Round to 2 decimal places
          totalWebsites: websites ? websites.length : 0
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
        {/* Dashboard Grid - Reduced Size Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Orders */}
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Total Orders</h3>
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-blue-400">{stats.totalOrders}</p>
            <p className="text-xs text-gray-400">All time orders</p>
          </div>

          {/* Active Orders */}
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Active Orders</h3>
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{stats.activeOrders}</p>
            <p className="text-xs text-gray-400">In progress</p>
          </div>

          {/* Completed Orders */}
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Completed</h3>
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.completedOrders}</p>
            <p className="text-xs text-gray-400">Successfully completed</p>
          </div>

          {/* Total Spent */}
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Total Spent</h3>
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-purple-400">${stats.totalSpent}</p>
            <p className="text-xs text-gray-400">Total investment</p>
          </div>

          {/* Your Websites */}
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Your Websites</h3>
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-orange-400">{stats.totalWebsites}</p>
            <p className="text-xs text-gray-400">Websites added</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              Browse Websites
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
              href="/buyer/buyer-orders"
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-center font-medium transition-all duration-300 block"
            >
              View My Orders
            </Link>
          </div>

          {/* Add Agents - Only for Buyers */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Add Agents</h3>
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-4">
              Create agent accounts to help manage your orders
            </p>
            <Link 
              href="/buyer/add-agent"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-center font-medium transition-all duration-300 block"
            >
              Add New Agent
            </Link>
        </div>

          {/* Your Websites - Only for Buyers */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 transform transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Your Websites</h3>
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
            </svg>
            </div>
            <p className="text-gray-400 mb-4">
              View and manage your owned website properties
            </p>
            <Link 
              href="/buyer/add-website"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg text-center font-medium transition-all duration-300 block"
            >
              Manage Your Websites
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 