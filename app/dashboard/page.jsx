'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { getSupabase } from '@/lib/supabaseClient';

const supabase = getSupabase();

const getWebSites = async () => {
  const { data, error } = await supabase.from('web_sites').select('*');
  if (error) {
    console.error('Error fetching websites:', error);
    return [];
  }
  return data;
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [websitesCount, setWebsitesCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      // Wait for the auth session to be restored
      await supabase.auth.getSession();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to home page if not authenticated
        router.push('/');
      } else {
        setUser(user);
        const websites = await getWebSites();
        setWebsitesCount(websites.length);
        setLoading(false);
      }
    };

    checkUserAndFetchData();

    // Listen for auth changes
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
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">
                {user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome, {user?.email?.split('@')[0]}
              </h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Guest Posting Stats */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 transform transition-all hover:scale-105">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Guest Posting Stats</h3>
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Websites</span>
                <span className="text-xl font-bold text-blue-400">{websitesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Published Posts</span>
                <span className="text-xl font-bold text-green-400">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Pending Submissions</span>
                <span className="text-xl font-bold text-yellow-400">3</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 transform transition-all hover:scale-105">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="space-y-4">
              <Link 
                href="/add-website"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-all duration-300 block"
              >
                Add New Website
              </Link>
              <Link 
                href="/websites"
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-all duration-300 block"
              >
                Browse Websites
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
