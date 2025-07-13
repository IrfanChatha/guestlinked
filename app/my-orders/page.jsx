'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { getSupabase } from '@/lib/supabaseClient';

export default function MyOrders() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState([]);
  const [filteredWebsites, setFilteredWebsites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [websitesLoading, setWebsitesLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [orderData, setOrderData] = useState({
    article_title: '',
    article_content: '',
    target_url: '',
    anchor_text: '',
    special_requirements: '',
    budget: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('my-orders'); // Start with orders for faster perceived loading
  
  // Website filtering state
  const [websiteFilters, setWebsiteFilters] = useState({
    search: '',
    minDA: '',
    maxPrice: '',
    category: ''
  });
  
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/');
          return;
        }

        // Fetch user settings to verify role - only get essential fields
        const { data: settings, error: settingsError } = await supabase
          .from('users_settings_tb')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (settingsError || !settings) {
          console.error('Error fetching user settings:', settingsError);
          router.push('/');
          return;
        }

        // Only buyers can access this page
        if (settings.role !== 'Buyer') {
          if (settings.role === 'Seller') {
            router.push('/seller/seller-dashboard');
          } else {
            router.push('/dashboard');
          }
          return;
        }

        setUser(user);
        setLoading(false);
        
        // Load orders immediately (most common use case)
        loadMyOrders(user.id);
      } catch (error) {
        console.error('Error in checkUser:', error);
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const loadWebsites = async () => {
    if (websites.length > 0) return; // Don't reload if already loaded
    
    setWebsitesLoading(true);
    const supabase = getSupabase();
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Website loading timeout - setting empty state');
      setWebsites([]);
      setFilteredWebsites([]);
      setWebsitesLoading(false);
    }, 10000); // 10 second timeout
    
    try {
      // Get top 50 websites based on quality metrics (DA, traffic, etc.)
      const { data: websitesData, error: websitesError } = await supabase
        .from('web_sites')
        .select('*')
        .not('moz_da', 'is', null)
        .not('similarweb_traffic', 'is', null)
        .order('moz_da', { ascending: false })
        .order('similarweb_traffic', { ascending: false })
        .limit(50);

      if (websitesError) {
        console.error('Error loading websites:', websitesError);
        setWebsitesLoading(false);
        return;
      }

      if (!websitesData || websitesData.length === 0) {
        console.log('No websites found in database');
        setWebsites([]);
        setFilteredWebsites([]);
        setWebsitesLoading(false);
        return;
      }

      console.log(`Loaded ${websitesData.length} top websites from database`);

      // Get seller names for the websites (only if seller_id exists)
      const websitesWithSellerIds = websitesData.filter(w => w.seller_id);
      
      if (websitesWithSellerIds.length === 0) {
        // No seller IDs, just use websites as-is
        const websitesWithSellers = websitesData.map(website => ({
          ...website,
          seller_name: 'Unknown'
        }));
        setWebsites(websitesWithSellers);
        setFilteredWebsites(websitesWithSellers);
        setWebsitesLoading(false);
        return;
      }

      const sellerIds = [...new Set(websitesWithSellerIds.map(w => w.seller_id))];
      const { data: sellersData, error: sellersError } = await supabase
        .from('users_settings_tb')
        .select('user_id, name')
        .in('user_id', sellerIds);

      if (sellersError) {
        console.error('Error loading sellers:', sellersError);
        // Continue without seller names
      }

      // Combine the data
      const websitesWithSellers = websitesData.map(website => ({
        ...website,
        seller_name: sellersData?.find(s => s.user_id === website.seller_id)?.name || 'Unknown'
      }));

      setWebsites(websitesWithSellers || []);
      setFilteredWebsites(websitesWithSellers || []);
    } catch (error) {
      console.error('Unexpected error loading websites:', error);
    } finally {
      clearTimeout(timeoutId);
      setWebsitesLoading(false);
    }
  };

  // Filter websites based on search and filter criteria
  const filterWebsites = async () => {
    const { search, minDA, maxPrice, category } = websiteFilters;
    
    // If no filters are applied, show the loaded top 50 websites
    if (!search && !minDA && !maxPrice && !category) {
      setFilteredWebsites(websites);
      return;
    }
    
    // If filters are applied, search the entire database
    setWebsitesLoading(true);
    const supabase = getSupabase();
    
    try {
      let query = supabase
        .from('web_sites')
        .select('*');
      
      // Apply DA filter
      if (minDA) {
        query = query.gte('moz_da', parseInt(minDA));
      }
      
      // Apply price filter
      if (maxPrice) {
        query = query.lte('price_to', parseInt(maxPrice));
      }
      
      // Order by quality metrics and limit to reasonable number
      query = query
        .not('moz_da', 'is', null)
        .order('moz_da', { ascending: false })
        .order('similarweb_traffic', { ascending: false })
        .limit(search ? 200 : 100); // Get more results when searching to allow for category filtering
      
      const { data: searchResults, error } = await query;
      
      if (error) {
        console.error('Error searching websites:', error);
        setFilteredWebsites([]);
        setWebsitesLoading(false);
        return;
      }
      
      let filteredResults = searchResults || [];
      
      // Apply search and category filters client-side
      if (search || category) {
        filteredResults = filteredResults.filter(website => {
          let categories = website.category;
          if (typeof categories === 'string') {
            try {
              categories = JSON.parse(categories);
            } catch (e) {
              categories = [];
            }
          }
          if (!Array.isArray(categories)) {
            categories = [];
          }
          
          // Check search filter (link or category)
          const matchesSearch = !search || 
            website.link?.toLowerCase().includes(search.toLowerCase()) ||
            categories.some(cat => cat?.toLowerCase().includes(search.toLowerCase()));
          
          // Check category filter
          const matchesCategory = !category || 
            categories.some(cat => cat?.toLowerCase().includes(category.toLowerCase()));
          
          return matchesSearch && matchesCategory;
        });
      }
      
      // Get seller names for the filtered results
      const websitesWithSellerIds = filteredResults.filter(w => w.seller_id);
      
      if (websitesWithSellerIds.length === 0) {
        const websitesWithSellers = filteredResults.map(website => ({
          ...website,
          seller_name: 'Unknown'
        }));
        setFilteredWebsites(websitesWithSellers);
        setWebsitesLoading(false);
        return;
      }
      
      const sellerIds = [...new Set(websitesWithSellerIds.map(w => w.seller_id))];
      const { data: sellersData, error: sellersError } = await supabase
        .from('users_settings_tb')
        .select('user_id, name')
        .in('user_id', sellerIds);
      
      if (sellersError) {
        console.error('Error loading sellers for search results:', sellersError);
      }
      
      // Combine the data
      const websitesWithSellers = filteredResults.map(website => ({
        ...website,
        seller_name: sellersData?.find(s => s.user_id === website.seller_id)?.name || 'Unknown'
      }));
      
      setFilteredWebsites(websitesWithSellers);
      
    } catch (error) {
      console.error('Error in filterWebsites:', error);
      setFilteredWebsites([]);
    } finally {
      setWebsitesLoading(false);
    }
  };

  // Clear all filters
  const clearWebsiteFilters = () => {
    setWebsiteFilters({
      search: '',
      minDA: '',
      maxPrice: '',
      category: ''
    });
  };

  // Effect to filter websites when filters change
  useEffect(() => {
    filterWebsites();
  }, [websiteFilters, websites]);

  const loadMyOrders = async (userId) => {
    setOrdersLoading(true);
    const supabase = getSupabase();
    
    try {
      // First get orders - handle case where table might not exist
      const { data: ordersData, error: ordersError } = await supabase
        .from('buyer_orders')
        .select(`
          id,
          article_title,
          budget,
          status,
          created_at,
          website_id,
          seller_id
        `)
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false })
        .limit(100); // Limit to recent orders

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
        // If table doesn't exist, just set empty orders
        if (ordersError.code === 'PGRST106' || ordersError.message.includes('does not exist')) {
          console.log('buyer_orders table does not exist yet - showing empty state');
          setOrders([]);
        }
        setOrdersLoading(false);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setOrdersLoading(false);
        return;
      }

      // Get website info for the orders
      const websiteIds = [...new Set(ordersData.map(o => o.website_id))];
      const { data: websitesData, error: websitesError } = await supabase
        .from('web_sites')
        .select('id, link, badge, category_1')
        .in('id', websiteIds);

      // Get seller names for the orders
      const sellerIds = [...new Set(ordersData.map(o => o.seller_id))];
      const { data: sellersData, error: sellersError } = await supabase
        .from('users_settings_tb')
        .select('user_id, name')
        .in('user_id', sellerIds);

      if (websitesError) {
        console.error('Error loading websites for orders:', websitesError);
      }
      if (sellersError) {
        console.error('Error loading sellers for orders:', sellersError);
      }

      // Combine the data
      const ordersWithDetails = ordersData.map(order => ({
        ...order,
        web_sites: websitesData?.find(w => w.id === order.website_id) || null,
        seller_name: sellersData?.find(s => s.user_id === order.seller_id)?.name || 'Unknown'
      }));

      setOrders(ordersWithDetails || []);
    } catch (error) {
      console.error('Unexpected error loading orders:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleOrderClick = (website) => {
    setSelectedWebsite(website);
    setOrderData({
      article_title: '',
      article_content: '',
      target_url: '',
      anchor_text: '',
      special_requirements: '',
      budget: website.price_from || ''
    });
    setShowOrderModal(true);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!orderData.article_title.trim() || !orderData.article_content.trim() || !orderData.target_url.trim()) {
      setMessage('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const supabase = getSupabase();
      
      // Debug: Check current user and website data
      console.log('Current user:', user);
      console.log('Selected website:', selectedWebsite);
      console.log('Order data:', orderData);
      
      // Handle missing seller_id for legacy websites
      let sellerId = selectedWebsite.seller_id || selectedWebsite.added_by_user;
      
      if (!sellerId) {
        console.warn('Website missing seller_id, using buyer as seller for now:', selectedWebsite);
        sellerId = user.id; // Temporary fallback - use buyer as seller
      }
      
      const orderPayload = {
        buyer_id: user.id,
        seller_id: sellerId,
        website_id: selectedWebsite.id,
        article_title: orderData.article_title,
        article_content: orderData.article_content,
        target_url: orderData.target_url,
        anchor_text: orderData.anchor_text || null,
        special_requirements: orderData.special_requirements || null,
        budget: parseFloat(orderData.budget) || 0,
        status: 'pending'
        // Remove created_at - let database handle it
      };

      console.log('Submitting order payload:', orderPayload);
      console.log('Payload types:', {
        buyer_id: typeof orderPayload.buyer_id,
        seller_id: typeof orderPayload.seller_id,
        website_id: typeof orderPayload.website_id,
        budget: typeof orderPayload.budget
      });
      
      // Test table access first
      console.log('Testing table access...');
      const { data: testData, error: testError } = await supabase
        .from('buyer_orders')
        .select('id')
        .limit(1);
      
      console.log('Table access test:', { testData, testError });
      
      const { data, error } = await supabase
        .from('buyer_orders')
        .insert([orderPayload])
        .select();

      if (error) {
        console.error('Error creating order:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        setMessage(`Error creating order: ${error.message}`);
      } else {
        console.log('Order created successfully:', data);
        setMessage('Order placed successfully!');
        setShowOrderModal(false);
        setOrderData({
          article_title: '',
          article_content: '',
          target_url: '',
          anchor_text: '',
          special_requirements: '',
          budget: ''
        });
        // Optimistically update the orders list
        const newOrder = {
          id: Date.now(), // Temporary ID
          article_title: orderData.article_title,
          budget: parseFloat(orderData.budget) || 0,
          status: 'pending',
          created_at: new Date().toISOString(),
          web_sites: {
            link: selectedWebsite.link,
            badge: selectedWebsite.badge,
            category_1: selectedWebsite.category_1
          },
          seller_name: selectedWebsite.seller_name
        };
        setOrders(prev => [newOrder, ...prev]);
        
        // Refresh orders in background
        setTimeout(() => loadMyOrders(user.id), 1000);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900/50 text-yellow-300';
      case 'accepted': return 'bg-blue-900/50 text-blue-300';
      case 'in_progress': return 'bg-purple-900/50 text-purple-300';
      case 'completed': return 'bg-green-900/50 text-green-300';
      case 'rejected': return 'bg-red-900/50 text-red-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navbar />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90 pointer-events-none"></div>
        <div className="relative z-10 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-24">
          <div className="mb-8">
            <div className="h-8 bg-gray-700 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-96 mt-2 animate-pulse"></div>
          </div>
          <div className="border-b border-gray-600 mb-6">
            <div className="flex space-x-8">
              <div className="h-8 bg-gray-700 rounded w-32 animate-pulse"></div>
              <div className="h-8 bg-gray-700 rounded w-24 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90 pointer-events-none"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Guest Posting Orders</h1>
          <p className="mt-2 text-gray-400">Browse available websites and place your guest posting orders</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-900/50 text-red-300 border border-red-700' : 'bg-green-900/50 text-green-300 border border-green-700'}`}>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-600">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('browse');
                  loadWebsites(); // Lazy load websites when tab is clicked
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'browse'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                }`}
              >
                Browse Websites ({filteredWebsites.length})
              </button>
              <button
                onClick={() => setActiveTab('my-orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-orders'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                }`}
              >
                My Orders ({orders.length})
              </button>
              {activeTab === 'my-orders' && (
                <button
                  onClick={() => user && loadMyOrders(user.id)}
                  disabled={ordersLoading}
                  className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {ordersLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Browse Websites Tab */}
        {activeTab === 'browse' && (
          <>
            {/* Search and Filter Bar */}
            <div className="mb-6 bg-gray-800 p-6 rounded-2xl border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search websites or categories..."
                  value={websiteFilters.search}
                  onChange={(e) => setWebsiteFilters({...websiteFilters, search: e.target.value})}
                  className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
                />
                <input
                  type="number"
                  placeholder="Min DA"
                  value={websiteFilters.minDA}
                  onChange={(e) => setWebsiteFilters({...websiteFilters, minDA: e.target.value})}
                  className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={websiteFilters.maxPrice}
                  onChange={(e) => setWebsiteFilters({...websiteFilters, maxPrice: e.target.value})}
                  className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={websiteFilters.category}
                  onChange={(e) => setWebsiteFilters({...websiteFilters, category: e.target.value})}
                  className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
                />
              </div>
              
              {/* Filter Actions */}
              <div className="flex justify-between items-center">
                <p className="text-gray-400 text-sm">
                  {(() => {
                    const hasFilters = websiteFilters.search || websiteFilters.minDA || websiteFilters.maxPrice || websiteFilters.category;
                    if (hasFilters) {
                      return `Found ${filteredWebsites.length} websites matching your filters`;
                    } else {
                      return `Showing top ${filteredWebsites.length} websites`;
                    }
                  })()}
                </p>
                <button
                  onClick={clearWebsiteFilters}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              </div>
            </div>

            {websitesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-gray-400">
                  {websiteFilters.search || websiteFilters.minDA || websiteFilters.maxPrice || websiteFilters.category 
                    ? 'Searching database...' 
                    : 'Loading top websites...'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWebsites.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-gray-400 text-lg">
                      {(() => {
                        const hasFilters = websiteFilters.search || websiteFilters.minDA || websiteFilters.maxPrice || websiteFilters.category;
                        if (websites.length === 0) {
                          return 'No websites available yet';
                        } else if (hasFilters) {
                          return 'No websites match your search criteria';
                        } else {
                          return 'No top websites found';
                        }
                      })()}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      {(() => {
                        const hasFilters = websiteFilters.search || websiteFilters.minDA || websiteFilters.maxPrice || websiteFilters.category;
                        if (websites.length === 0) {
                          return 'Sellers haven\'t added any websites yet. Check back later or contact sellers directly.';
                        } else if (hasFilters) {
                          return 'Try adjusting your search criteria or clear filters to see more results.';
                        } else {
                          return 'No high-quality websites found. Try refreshing or check back later.';
                        }
                      })()}
                    </p>
                    <div className="mt-4">
                      {websites.length === 0 ? (
                        <button 
                          onClick={() => {
                            setWebsites([]);
                            setFilteredWebsites([]);
                            loadWebsites();
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                        >
                          Refresh
                        </button>
                      ) : (
                        <button 
                          onClick={clearWebsiteFilters}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  filteredWebsites.map((website) => (
              <div key={website.id} className="bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white truncate">{website.link}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {website.badge && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300">
                            {website.badge}
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-300">
                          DA: {website.moz_da || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Categories */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        let categories = website.category;
                        if (typeof categories === 'string') {
                          try {
                            categories = JSON.parse(categories);
                          } catch (e) {
                            categories = [];
                          }
                        }
                        if (!Array.isArray(categories)) {
                          categories = [];
                        }
                        return categories.slice(0, 3).map((category, index) => (
                          <span 
                            key={index}
                            className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded-md text-xs font-medium"
                          >
                            {category}
                          </span>
                        ));
                      })()}
                      {(() => {
                        let categories = website.category;
                        if (typeof categories === 'string') {
                          try {
                            categories = JSON.parse(categories);
                          } catch (e) {
                            categories = [];
                          }
                        }
                        if (!Array.isArray(categories)) {
                          categories = [];
                        }
                        return categories.length > 3 && (
                          <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs font-medium">
                            +{categories.length - 3} more
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Price:</span>
                        <span className="text-gray-300 font-medium">${website.price_from} - ${website.price_to}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Traffic:</span>
                        <span className="text-gray-300 font-medium">
                          {website.similarweb_traffic ? Number(website.similarweb_traffic).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">TAT:</span>
                        <span className="text-gray-300 font-medium">{website.tat || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">AS:</span>
                        <span className="text-gray-300 font-medium">{website.semrush_as || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">DR:</span>
                        <span className="text-gray-300 font-medium">{website.ahrefs_dr_range || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Link Type:</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          website.link_attribution_type === 'Dofollow' 
                            ? 'bg-green-900/50 text-green-300' 
                            : 'bg-yellow-900/50 text-yellow-300'
                        }`}>
                          {website.link_attribution_type || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Seller:</span>
                      <span className="text-gray-300 font-medium text-sm">{website.seller_name || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleOrderClick(website)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Place Order
                  </button>
                </div>
              </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* My Orders Tab */}
        {activeTab === 'my-orders' && (
          <>
            {ordersLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Website
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Article Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-100">{order.web_sites?.link}</div>
                        <div className="text-sm text-gray-400">{order.web_sites?.category_1}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-100 max-w-xs truncate">{order.article_title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                        ${order.budget}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                        {order.seller_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No orders found. Start by browsing websites and placing your first order!
                </div>
              )}
            </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedWebsite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-gray-600 w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  Place Order for {selectedWebsite.link}
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={orderData.article_title}
                    onChange={(e) => setOrderData({...orderData, article_title: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Article Content *
                  </label>
                  <textarea
                    value={orderData.article_content}
                    onChange={(e) => setOrderData({...orderData, article_content: e.target.value})}
                    rows={6}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Write your article content here..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Target URL *
                  </label>
                  <input
                    type="url"
                    value={orderData.target_url}
                    onChange={(e) => setOrderData({...orderData, target_url: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="https://example.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Anchor Text
                  </label>
                  <input
                    type="text"
                    value={orderData.anchor_text}
                    onChange={(e) => setOrderData({...orderData, anchor_text: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Link anchor text"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={orderData.budget}
                    onChange={(e) => setOrderData({...orderData, budget: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    min={selectedWebsite.price_from}
                    max={selectedWebsite.price_to}
                    step="0.01"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Price range: ${selectedWebsite.price_from} - ${selectedWebsite.price_to}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Special Requirements
                  </label>
                  <textarea
                    value={orderData.special_requirements}
                    onChange={(e) => setOrderData({...orderData, special_requirements: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Any special requirements or notes..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 border border-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 