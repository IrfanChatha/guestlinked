'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabaseClient';

export default function AgentDashboard() {
  const [user, setUser] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('websites');
  const [websites, setWebsites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [websitesLoading, setWebsitesLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/');
        return;
      }

      // Fetch user settings to verify role and get parent buyer
      const { data: settings, error: settingsError } = await supabase
        .from('users_settings_tb')
        .select('*, parent_buyer_id')
        .eq('user_id', user.id)
        .single();

      if (settingsError || !settings) {
        console.error('Error fetching user settings:', settingsError);
        router.push('/');
        return;
      }

      // Only agents can access this dashboard
      if (settings.role !== 'Agent') {
        if (settings.role === 'Buyer') {
          router.push('/buyer/buyer-dashboard');
        } else if (settings.role === 'Seller') {
          router.push('/seller/seller-dashboard');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      // Agents must have a parent buyer
      if (!settings.parent_buyer_id) {
        console.error('Agent has no parent buyer');
        router.push('/');
        return;
      }

      setUser(user);
      setUserSettings(settings);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    if (userSettings && userSettings.parent_buyer_id) {
      if (activeTab === 'websites') {
        fetchWebsites();
      } else if (activeTab === 'orders') {
        fetchOrders();
      }
    }
  }, [activeTab, userSettings]);

  const fetchWebsites = async () => {
    setWebsitesLoading(true);
    try {
      const supabase = getSupabase();
      const { data: websitesData, error } = await supabase
        .from('web_sites')
        .select('*')
        .eq('owner_id', userSettings.parent_buyer_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching websites:', error);
      } else {
        setWebsites(websitesData || []);
      }
    } catch (error) {
      console.error('Error in fetchWebsites:', error);
    } finally {
      setWebsitesLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const supabase = getSupabase();
      const { data: ordersData, error } = await supabase
        .from('buyer_orders')
        .select(`
          *,
          web_sites (
            link,
            badge
          )
        `)
        .eq('buyer_id', userSettings.parent_buyer_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(ordersData || []);
      }
    } catch (error) {
      console.error('Error in fetchOrders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-900 text-yellow-300';
      case 'approved':
        return 'bg-green-900 text-green-300';
      case 'rejected':
        return 'bg-red-900 text-red-300';
      case 'completed':
        return 'bg-blue-900 text-blue-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Agent Dashboard</h1>
              <p className="text-gray-400">Welcome, {userSettings?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Agent for: {userSettings?.parent_buyer_id}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('websites')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'websites'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Buyer's Websites
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Buyer's Orders
          </button>
          <button
            onClick={() => router.push('/buyer/buyer-orders')}
            className="px-6 py-3 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
          >
            Place New Order
          </button>
        </div>

        {/* Websites Tab */}
        {activeTab === 'websites' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Buyer's Websites</h2>
              <span className="text-gray-400">
                {websites.length} website{websites.length !== 1 ? 's' : ''}
              </span>
            </div>

            {websitesLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading websites...</div>
              </div>
            ) : websites.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400">No websites found for this buyer.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {websites.map((website) => (
                  <div key={website.id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold truncate">{website.link}</h3>
                      {website.badge && (
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                          {website.badge}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Price Range:</span>
                        <span>${website.price_from} - ${website.price_to}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">DA:</span>
                        <span>{website.moz_da || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Traffic:</span>
                        <span>{website.similarweb_traffic || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">TAT:</span>
                        <span>{website.tat || 'N/A'} days</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Buyer's Orders</h2>
              <span className="text-gray-400">
                {orders.length} order{orders.length !== 1 ? 's' : ''}
              </span>
            </div>

            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading orders...</div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400">No orders found for this buyer.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.order_id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{order.article_title}</h3>
                        <p className="text-gray-400">
                          Website: {order.web_sites?.link || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <p className="text-gray-400 text-sm mt-1">
                          ${order.budget}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Target URL:</span>
                        <p className="truncate">{order.target_url}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Anchor Text:</span>
                        <p>{order.anchor_text || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Created:</span>
                        <p>{formatDate(order.created_at)}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Posting Date:</span>
                        <p>
                          {order.posting_from_date && order.posting_to_date
                            ? `${formatDate(order.posting_from_date)} - ${formatDate(order.posting_to_date)}`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {order.special_requirements && (
                      <div className="mt-4">
                        <span className="text-gray-400">Special Requirements:</span>
                        <p className="text-sm mt-1">{order.special_requirements}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 