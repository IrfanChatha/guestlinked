'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { getSupabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function BuyerOrders() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState([]);
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
    budget: '',
    posting_from_date: '',
    posting_to_date: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('my-orders');
  
  // Category filter state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredWebsites, setFilteredWebsites] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [allWebsites, setAllWebsites] = useState([]); // Store all websites for filtering
  
  // New state for buyer websites tab
  const [buyerWebsites, setBuyerWebsites] = useState([]);
  const [selectedBuyerWebsite, setSelectedBuyerWebsite] = useState(null);
  const [buyerWebsitesLoading, setBuyerWebsitesLoading] = useState(false);
  const [filteredWebsitesForBuyer, setFilteredWebsitesForBuyer] = useState([]);
  const [loadingWebsitesForBuyer, setLoadingWebsitesForBuyer] = useState(false);
  
  // Available categories
  const availableCategories = [
    'Agriculture',
    'Animals and Pets',
    'Art',
    'Automobiles',
    'B2B',
    'Beauty',
    'Business',
    'Career',
    'Education',
    'Electronics',
    'Energy',
    'Environment',
    'Events',
    'Finance',
    'Food and Drink',
    'Health and Fitness',
    'Entertainment',
    'Home and Garden',
    'Insurance',
    'Jobs',
    'Law and Government',
    'Lifestyle',
    'News and Media',
    'Real Estate',
    'Pets',
    'Science',
    'Shopping',
    'Society',
    'Sports',
    'Technology',
    'Travel',
    'Other'
  ];
  
  const router = useRouter();

  // Filter websites based on selected categories
  useEffect(() => {
    if (selectedCategories.length === 0) {
      setFilteredWebsites(allWebsites);
    } else {
      const filtered = allWebsites.filter(website => {
        // Parse categories - handle both string and array formats
        let websiteCategories = [];
        
        // Add individual category fields
        if (website.category_1) websiteCategories.push(website.category_1);
        if (website.category_2) websiteCategories.push(website.category_2);
        if (website.category_3) websiteCategories.push(website.category_3);
        
        // Also check if there's a 'category' field that might be JSON
        if (website.category) {
          try {
            const parsedCategories = typeof website.category === 'string' 
              ? JSON.parse(website.category) 
              : website.category;
            if (Array.isArray(parsedCategories)) {
              websiteCategories = [...websiteCategories, ...parsedCategories];
            } else if (typeof parsedCategories === 'string') {
              websiteCategories.push(parsedCategories);
            }
          } catch (e) {
            // If parsing fails, treat as string
            websiteCategories.push(website.category);
          }
        }
        
        // Remove duplicates and filter out null/undefined
        websiteCategories = [...new Set(websiteCategories.filter(Boolean))];
        
        console.log(`Website ${website.link} categories:`, websiteCategories);
        
        // Check if any selected category matches any website category
        return selectedCategories.some(selectedCategory =>
          websiteCategories.some(websiteCategory =>
            websiteCategory?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            selectedCategory.toLowerCase().includes(websiteCategory?.toLowerCase())
          )
        );
      });
      
      console.log(`Filtered ${filtered.length} websites from ${allWebsites.length} total for categories:`, selectedCategories);
      setFilteredWebsites(filtered);
    }
  }, [allWebsites, selectedCategories]);

  // Handle category selection
  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Clear all category filters
  const clearCategoryFilters = () => {
    setSelectedCategories([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCategoryDropdown && !event.target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = getSupabase();
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

        // Only buyers and agents can access this page
        if (settings.role !== 'Buyer' && settings.role !== 'Agent') {
          if (settings.role === 'Seller') {
            router.push('/seller/seller-dashboard');
          } else {
            router.push('/dashboard');
          }
          return;
        }

        // For agents, ensure they have a parent buyer
        if (settings.role === 'Agent' && !settings.parent_buyer_id) {
          console.error('Agent has no parent buyer');
          router.push('/');
          return;
        }

        setUser(settings);
        setLoading(false);
        
        // Load orders using the appropriate buyer ID
        const buyerId = settings.role === 'Agent' ? settings.parent_buyer_id : settings.user_id;
        loadMyOrders(buyerId);
      } catch (error) {
        console.error('Error in checkUser:', error);
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  // Reset form data when modal is closed
  useEffect(() => {
    if (!showOrderModal) {
      setOrderData({
        article_title: '',
        article_content: '',
        target_url: '',
        anchor_text: '',
        special_requirements: '',
        budget: '',
        posting_from_date: '',
        posting_to_date: ''
      });
      setSelectedWebsite(null);
      setMessage('');
    }
  }, [showOrderModal]);

  const loadWebsites = async () => {
    if (allWebsites.length > 0) return;
    
    setWebsitesLoading(true);
    const supabase = getSupabase();
    
    try {
      console.log('Fetching top 50 websites by traffic...');
      
      const { data: websitesData, error: websitesError } = await supabase
        .from('web_sites')
        .select('*') // Select all fields including all category fields
        .not('similarweb_traffic', 'is', null)
        .order('similarweb_traffic', { ascending: false })
        .limit(50);

      if (websitesError) {
        console.error('Error loading websites:', websitesError);
        return;
      }

      console.log(`Fetched ${websitesData?.length || 0} websites`);
      console.log('Sample website data:', websitesData?.[0]);

      setAllWebsites(websitesData || []);
      setWebsites(websitesData || []); // Keep for backward compatibility
      setFilteredWebsites(websitesData || []); // Initialize filtered websites
    } catch (error) {
      console.error('Error loading websites:', error);
    } finally {
      setWebsitesLoading(false);
    }
  };

  const loadMyOrders = async (userId) => {
    if (!userId) {
      console.error('No user ID provided to loadMyOrders');
      return;
    }

    setOrdersLoading(true);
    const supabase = getSupabase();

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('buyer_orders')
        .select(`
          *,
          web_sites:website_id (*),
          creator:created_by (name, email)
        `)
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
        return;
      }

      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error in loadMyOrders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load buyer's websites
  const loadBuyerWebsites = async () => {
    if (!user) return;
    
    setBuyerWebsitesLoading(true);
    const supabase = getSupabase();
    
    try {
      const buyerId = user.role === 'Agent' ? user.parent_buyer_id : user.user_id;
      
      const { data: websites, error } = await supabase
        .from('buyer_websites_tb')
        .select('*')
        .eq('buyer_id', buyerId)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error loading buyer websites:', error);
        return;
      }

      setBuyerWebsites(websites || []);
    } catch (error) {
      console.error('Error in loadBuyerWebsites:', error);
    } finally {
      setBuyerWebsitesLoading(false);
    }
  };

  // Load websites filtered by buyer website categories
  const loadWebsitesForBuyerWebsite = async (buyerWebsite) => {
    if (!buyerWebsite || !buyerWebsite.category) return;
    
    setLoadingWebsitesForBuyer(true);
    setSelectedBuyerWebsite(buyerWebsite);
    
    const supabase = getSupabase();
    
    try {
      // Get buyer website categories
      const buyerCategories = Array.isArray(buyerWebsite.category) 
        ? buyerWebsite.category 
        : [buyerWebsite.category];
      
      console.log('Filtering web_sites for buyer website categories:', buyerCategories);
      
      // Fetch ALL websites from the database (remove limit to get full records)
      const { data: allWebsitesData, error: websitesError } = await supabase
        .from('web_sites')
        .select('*')
        .order('similarweb_traffic', { ascending: false, nullsLast: true });

      if (websitesError) {
        console.error('Error loading websites:', websitesError);
        return;
      }

      console.log(`Fetched ${allWebsitesData?.length || 0} total websites from database`);

      // Filter websites based on buyer website categories with more flexible matching
      const filtered = allWebsitesData.filter(website => {
        let websiteCategories = [];
        
        // Add individual category fields
        if (website.category_1) websiteCategories.push(website.category_1);
        if (website.category_2) websiteCategories.push(website.category_2);
        if (website.category_3) websiteCategories.push(website.category_3);
        
        // Also check if there's a 'category' field that might be JSON
        if (website.category) {
          try {
            const parsedCategories = typeof website.category === 'string' 
              ? JSON.parse(website.category) 
              : website.category;
            if (Array.isArray(parsedCategories)) {
              websiteCategories = [...websiteCategories, ...parsedCategories];
            } else if (typeof parsedCategories === 'string') {
              websiteCategories.push(parsedCategories);
            }
          } catch (e) {
            websiteCategories.push(website.category);
          }
        }
        
        // Remove duplicates and filter out null/undefined
        websiteCategories = [...new Set(websiteCategories.filter(Boolean))];
        
        // More flexible matching - exact match, partial match, or broad category match
        return buyerCategories.some(buyerCategory => {
          const buyerCat = buyerCategory.toLowerCase().trim();
          return websiteCategories.some(websiteCategory => {
            const webCat = websiteCategory?.toLowerCase().trim();
            
            // Exact match
            if (webCat === buyerCat) return true;
            
            // Partial match (contains)
            if (webCat?.includes(buyerCat) || buyerCat.includes(webCat)) return true;
            
            // Broad category matching for common terms
            const broadMatches = {
              'ecommerce': ['shopping', 'retail', 'business', 'commerce'],
              'shopping': ['ecommerce', 'retail', 'business', 'commerce'],
              'business': ['ecommerce', 'shopping', 'b2b', 'finance', 'corporate'],
              'technology': ['tech', 'software', 'computers', 'electronics'],
              'health': ['fitness', 'wellness', 'medical', 'healthcare'],
              'lifestyle': ['fashion', 'beauty', 'home', 'travel'],
              'finance': ['business', 'investment', 'money', 'banking']
            };
            
            if (broadMatches[buyerCat]) {
              return broadMatches[buyerCat].some(match => webCat?.includes(match));
            }
            
            if (broadMatches[webCat]) {
              return broadMatches[webCat].some(match => buyerCat.includes(match));
            }
            
            return false;
          });
        });
      });
      
      console.log(`Found ${filtered.length} websites matching categories:`, buyerCategories);
      setFilteredWebsitesForBuyer(filtered);
      
    } catch (error) {
      console.error('Error loading websites for buyer website:', error);
    } finally {
      setLoadingWebsitesForBuyer(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrderClick = (website) => {
    setSelectedWebsite(website);
    setShowOrderModal(true);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    console.log('Order submission started...');
    
    if (!user || !selectedWebsite) {
      console.error('Missing user or selected website');
      setMessage('Missing required information. Please try again.');
      return;
    }
    
    setSubmitting(true);
    setMessage('');
    
    try {
      const supabase = getSupabase();
      console.log('Supabase client initialized');
      
      // Validate required fields
      if (!orderData.article_title || !orderData.article_content || !orderData.target_url || !orderData.budget) {
        console.error('Missing required order fields');
        setMessage('Please fill in all required fields.');
        setSubmitting(false);
        return;
      }

      // Validate required IDs
      if (!user.user_id) {
        console.error('Missing user_id from users_settings_tb');
        setMessage('User settings not properly loaded. Please refresh the page.');
        setSubmitting(false);
        return;
      }

      if (!selectedWebsite?.id) {
        console.error('Missing website_id');
        setMessage('Website information not properly loaded. Please try again.');
        setSubmitting(false);
        return;
      }

      // Create the order using user_id from users_settings_tb
      const orderToInsert = {
        order_id: uuidv4(), // Primary key
          buyer_id: user.role === 'Agent' ? user.parent_buyer_id : user.user_id, // UUID from users_settings_tb
        website_id: selectedWebsite.id, // UUID from web_sites
        article_title: orderData.article_title.trim(),
        article_content: orderData.article_content.trim(),
        target_url: orderData.target_url.trim(),
        anchor_text: orderData.anchor_text?.trim() || null,
        special_requirements: orderData.special_requirements?.trim() || null,
        budget: Number(parseFloat(orderData.budget || '0').toFixed(2)),
        status: 'submitted',
        posting_from_date: orderData.posting_from_date ? new Date(orderData.posting_from_date).toISOString() : null,
        posting_to_date: orderData.posting_to_date ? new Date(orderData.posting_to_date).toISOString() : null,
        created_by: user.user_id, // Current logged-in user ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Order data to insert:', orderToInsert);

      // Validate required fields match schema constraints
      if (!orderToInsert.buyer_id || !orderToInsert.website_id) {
        setMessage('Missing required buyer_id or website_id');
        setSubmitting(false);
        return;
      }

      if (!orderToInsert.article_title || !orderToInsert.article_content || !orderToInsert.target_url) {
        setMessage('Article title, content, and target URL are required');
        setSubmitting(false);
        return;
      }

      console.log('Inserting order with data:', orderToInsert);
      
      // Insert the order
      const { error: insertError } = await supabase
        .from('buyer_orders')
        .insert([orderToInsert]);

      if (insertError) {
        console.error('Error inserting order:', insertError);
        let errorMessage = 'Failed to submit order: ';

        if (insertError.message?.includes('violates foreign key constraint')) {
          if (insertError.message?.includes('buyer_orders_buyer_id_fkey')) {
            errorMessage += 'Invalid buyer ID';
          } else if (insertError.message?.includes('buyer_orders_website_id_fkey')) {
            errorMessage += 'Invalid website ID';
          } else {
            errorMessage += 'Database constraint violation';
          }
        } else if (insertError.message?.includes('relation') && insertError.message?.includes('does not exist')) {
          errorMessage += 'Database table "buyer_orders" does not exist';
        } else if (insertError.message?.includes('duplicate key')) {
          errorMessage += 'Order ID already exists, please try again';
        } else {
          errorMessage += insertError.message || 'Unknown database error';
        }

        setMessage(errorMessage);
        setSubmitting(false);
        return;
      }

      // If insert successful, fetch the inserted record
      const { data: insertedOrder, error: fetchError } = await supabase
        .from('buyer_orders')
        .select('*')
        .eq('order_id', orderToInsert.order_id)
        .single();

      if (fetchError) {
        console.error('Error fetching inserted order:', fetchError);
        setMessage('Order submitted but could not be confirmed. Please check your orders list.');
        setSubmitting(false);
        return;
      }

      if (!insertedOrder) {
        console.error('No data returned after insertion');
        setMessage('Order submission failed - no data returned.');
        setSubmitting(false);
        return;
      }

      console.log('Order successfully created:', insertedOrder);
      setMessage('Order submitted successfully!');
      
      // Refresh orders list
      try {
        const buyerId = user.role === 'Agent' ? user.parent_buyer_id : user.user_id;
        await loadMyOrders(buyerId);
        console.log('Orders list refreshed');
      } catch (refreshError) {
        console.error('Error refreshing orders list:', refreshError);
        // Don't fail the whole process if refresh fails
      }
      
      // Close modal after a short delay
      setTimeout(() => {
        setShowOrderModal(false);
        setMessage('');
        setSelectedWebsite(null);
        setOrderData({
          article_title: '',
          article_content: '',
          target_url: '',
          anchor_text: '',
          special_requirements: '',
          budget: '',
          posting_from_date: '',
          posting_to_date: ''
        });
      }, 2000);

    } catch (error) {
      console.error('Unexpected error submitting order:', error);
      setMessage(`An unexpected error occurred: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'in_progress':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'completed':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'rejected':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return '✓';
      case 'pending':
        return '⏳';
      case 'in_progress':
        return '🔄';
      case 'completed':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 mt-16">
          <h1 className="text-3xl font-bold text-white mb-2">Buyer Orders</h1>
          <p className="text-gray-400">Manage your guest posting orders</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('my-orders')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'my-orders'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            My Orders
          </button>
          <button
            onClick={() => {
              setActiveTab('browse-websites');
              loadWebsites();
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'browse-websites'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Browse Websites
          </button>
          <button
            onClick={() => {
              setActiveTab('order-for-website');
              loadBuyerWebsites();
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'order-for-website'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Order for Your Website
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'my-orders' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Your Orders</h2>
            
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No orders found</p>
                <button
                  onClick={() => {
                    setActiveTab('browse-websites');
                    loadWebsites();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Browse Websites to Place Order
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.order_id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                    {/* Row 1: Header with title, status, and key info */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white">{order.article_title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} flex items-center gap-1`}>
                            {getStatusIcon(order.status)} {order.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-xs text-gray-400">
                          <span>Created: {formatDate(order.created_at)}</span>
                          {order.creator && (
                            <span>By: {order.creator.name || order.creator.email || 'Unknown'}</span>
                          )}
                          <span className="text-green-400 font-bold">${order.budget}</span>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Website info and posting details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                      {/* My Website */}
                      <div className="bg-gray-700 rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                          </svg>
                          <span className="font-medium text-blue-400">My Website</span>
                        </div>
                        <div className="space-y-1">
                          <div>
                            <span className="text-gray-400 text-xs">Website:</span>
                            <p className="text-white text-xs truncate">
                              {(() => {
                                try {
                                  return new URL(order.target_url).origin;
                                } catch {
                                  return order.target_url.split('/')[0] + '//' + order.target_url.split('/')[2] || order.target_url;
                                }
                              })()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-xs">Target URL:</span>
                            <p className="text-blue-300 text-xs truncate">{order.target_url}</p>
                          </div>
                          {order.anchor_text && (
                            <p className="text-green-400 text-xs">Anchor: {order.anchor_text}</p>
                          )}
                        </div>
                      </div>

                      {/* Guest Posting Website */}
                      <div className="bg-gray-700 rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span className="font-medium text-purple-400">Guest Posting</span>
                        </div>
                        <p className="text-white text-xs mb-1">{order.web_sites?.link || 'N/A'}</p>
                        <div className="flex gap-1">
                          {order.web_sites?.category_1 && (
                            <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs">
                              {order.web_sites.category_1}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Posting Schedule */}
                      <div className="bg-gray-700 rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-orange-400">Posting Period</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">From:</span>
                            <p className="text-white">{order.posting_from_date ? new Date(order.posting_from_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">To:</span>
                            <p className="text-white">{order.posting_to_date ? new Date(order.posting_to_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</p>
                          </div>
                        </div>
                        {order.posting_from_date && order.posting_to_date && (
                          <p className="text-yellow-400 text-xs mt-1">
                            {Math.ceil((new Date(order.posting_to_date) - new Date(order.posting_from_date)) / (1000 * 60 * 60 * 24))} days
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Special Requirements (if any) - collapsed by default */}
                    {order.special_requirements && (
                      <div className="mt-3 bg-gray-750 rounded p-2">
                        <p className="text-gray-400 text-xs">
                          <span className="font-medium">Requirements:</span> {order.special_requirements}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'browse-websites' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Top 50 Websites by Traffic</h2>
              <div className="flex items-center space-x-4">
                {/* Category Filter */}
                <div className="relative category-dropdown">
                  <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg border border-gray-600 flex items-center space-x-2"
                  >
                    <span>Categories</span>
                    {selectedCategories.length > 0 && (
                      <span className="bg-green-600 text-white rounded-full px-2 py-1 text-xs">
                        {selectedCategories.length}
                      </span>
                    )}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showCategoryDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      <div className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-300">Select Categories</span>
                          {selectedCategories.length > 0 && (
                            <button
                              onClick={clearCategoryFilters}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {availableCategories.map((category) => (
                            <label key={category} className="flex items-center space-x-2 hover:bg-gray-600 p-1 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(category)}
                                onChange={() => handleCategoryToggle(category)}
                                className="text-green-600 bg-gray-600 border-gray-500 rounded focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-300">{category}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Categories Display */}
            {selectedCategories.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-400">Filtered by:</span>
                  {selectedCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center bg-green-600 text-white px-3 py-1 rounded-full text-xs"
                    >
                      {category}
                      <button
                        onClick={() => handleCategoryToggle(category)}
                        className="ml-2 hover:text-gray-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {websitesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : filteredWebsites.length === 0 && allWebsites.length > 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No websites found matching the selected categories</p>
                <p className="text-sm text-gray-500 mb-4">
                  Try selecting different categories or clear all filters to see all websites.
                </p>
                <button
                  onClick={clearCategoryFilters}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : filteredWebsites.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No websites available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWebsites.map((website) => (
                  <div key={website.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-white mb-1 truncate">{website.link}</h3>
                      {website.badge && (
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                          {website.badge}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1 mb-3 text-xs">
                      <div className="bg-gray-800 rounded p-1 text-center">
                        <p className="text-blue-400 font-bold text-lg">{website.moz_da || 'N/A'}</p>
                        <p className="text-gray-400">Moz DA</p>
                      </div>
                      <div className="bg-gray-800 rounded p-1 text-center">
                        <p className="text-red-400 font-bold text-lg">{website.semrush_as || 'N/A'}</p>
                        <p className="text-gray-400">Semrush AS</p>
                      </div>
                      <div className="bg-gray-800 rounded p-1 text-center">
                        <p className="text-orange-400 font-bold text-lg">{website.ahrefs_dr_range || 'N/A'}</p>
                        <p className="text-gray-400">Ahrefs DR</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="bg-gray-800 rounded p-1 text-center">
                        <p className="text-purple-400 font-bold text-lg">{website.similarweb_traffic || 'N/A'}</p>
                        <p className="text-gray-400">Traffic</p>
                      </div>
                      <div className="bg-gray-800 rounded p-1 text-center">
                        <p className="text-green-400 font-bold text-lg">${website.price_from || 'N/A'}</p>
                        <p className="text-gray-400">Price</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap mb-3 text-xs">
                      {website.category_1 && (
                        <span className="inline-block bg-gray-600 text-gray-200 rounded-full px-2 py-1 mr-1 mb-1">
                          {website.category_1}
                        </span>
                      )}
                      {website.category_2 && (
                        <span className="inline-block bg-gray-600 text-gray-200 rounded-full px-2 py-1 mr-1 mb-1">
                          {website.category_2}
                        </span>
                      )}
                      {website.category_3 && (
                        <span className="inline-block bg-gray-600 text-gray-200 rounded-full px-2 py-1 mb-1">
                          {website.category_3}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span>TAT: {website.tat || 'N/A'}</span>
                      <span>Link: {website.link_attribution_type || 'N/A'}</span>
                    </div>
                    
                    <button
                      onClick={() => handleOrderClick(website)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Place Order
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'order-for-website' && (
          <div className="space-y-6">
            {/* Buyer Websites Selection */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Your Websites</h2>
              
              {buyerWebsitesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : buyerWebsites.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No websites found</p>
                  <p className="text-sm text-gray-500 mb-4">
                    You need to add your websites first to find matching guest posting opportunities.
                  </p>
                  <button
                    onClick={() => router.push('/buyer/add-website')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Add Your Websites
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {buyerWebsites.map((website) => (
                    <div 
                      key={website.id} 
                      className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all border-2 ${
                        selectedBuyerWebsite?.id === website.id 
                          ? 'border-green-500 bg-gray-600' 
                          : 'border-transparent hover:border-gray-500'
                      }`}
                      onClick={() => loadWebsitesForBuyerWebsite(website)}
                    >
                      <h3 className="text-lg font-semibold text-white mb-2">{website.website_name}</h3>
                      <p className="text-blue-400 text-sm mb-3 truncate">{website.website_url}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(Array.isArray(website.category) ? website.category : [website.category])
                          .filter(Boolean)
                          .map((cat, index) => (
                            <span 
                              key={index} 
                              className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs"
                            >
                              {cat}
                            </span>
                          ))}
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        Added {new Date(website.added_at).toLocaleDateString()}
                      </div>
                      
                      {selectedBuyerWebsite?.id === website.id && (
                        <div className="mt-2 text-green-400 text-sm font-medium">
                          ✓ Selected - Finding matching websites...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filtered Websites for Selected Buyer Website */}
            {selectedBuyerWebsite && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Guest Posting Opportunities for "{selectedBuyerWebsite.website_name}"
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Websites matching your categories: {(Array.isArray(selectedBuyerWebsite.category) 
                        ? selectedBuyerWebsite.category 
                        : [selectedBuyerWebsite.category]).filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBuyerWebsite(null);
                      setFilteredWebsitesForBuyer([]);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕ Clear Selection
                  </button>
                </div>
                
                {loadingWebsitesForBuyer ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  </div>
                ) : filteredWebsitesForBuyer.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-2">No matching websites found</p>
                    <p className="text-sm text-gray-500">
                      Try adding more categories to your website or browse all websites instead.
                    </p>
                    <button
                      onClick={() => setActiveTab('browse-websites')}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Browse All Websites
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 text-sm text-gray-400">
                      Found {filteredWebsitesForBuyer.length} matching websites
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredWebsitesForBuyer.map((website) => (
                        <div key={website.id} className="bg-gray-700 rounded-lg p-4">
                          <div className="mb-3">
                            <h3 className="text-lg font-semibold text-white mb-1 truncate">{website.link}</h3>
                            {website.badge && (
                              <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                                {website.badge}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-1 mb-3 text-xs">
                            <div className="bg-gray-800 rounded p-1 text-center">
                              <p className="text-blue-400 font-bold text-lg">{website.moz_da || 'N/A'}</p>
                              <p className="text-gray-400">Moz DA</p>
                            </div>
                            <div className="bg-gray-800 rounded p-1 text-center">
                              <p className="text-red-400 font-bold text-lg">{website.semrush_as || 'N/A'}</p>
                              <p className="text-gray-400">Semrush AS</p>
                            </div>
                            <div className="bg-gray-800 rounded p-1 text-center">
                              <p className="text-orange-400 font-bold text-lg">{website.ahrefs_dr_range || 'N/A'}</p>
                              <p className="text-gray-400">Ahrefs DR</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                            <div className="bg-gray-800 rounded p-1 text-center">
                              <p className="text-purple-400 font-bold text-lg">{website.similarweb_traffic || 'N/A'}</p>
                              <p className="text-gray-400">Traffic</p>
                            </div>
                            <div className="bg-gray-800 rounded p-1 text-center">
                              <p className="text-green-400 font-bold text-lg">${website.price_from || 'N/A'}</p>
                              <p className="text-gray-400">Price</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap mb-3 text-xs">
                            {website.category_1 && (
                              <span className="inline-block bg-green-600 text-white rounded-full px-2 py-1 mr-1 mb-1">
                                {website.category_1}
                              </span>
                            )}
                            {website.category_2 && (
                              <span className="inline-block bg-green-600 text-white rounded-full px-2 py-1 mr-1 mb-1">
                                {website.category_2}
                              </span>
                            )}
                            {website.category_3 && (
                              <span className="inline-block bg-green-600 text-white rounded-full px-2 py-1 mb-1">
                                {website.category_3}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                            <span>TAT: {website.tat || 'N/A'}</span>
                            <span>Link: {website.link_attribution_type || 'N/A'}</span>
                          </div>
                          
                          <button
                            onClick={() => handleOrderClick(website)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                          >
                            Place Order for {selectedBuyerWebsite.website_name}
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

      {/* Order Modal */}
      {showOrderModal && selectedWebsite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Place Order for {selectedWebsite.link}
              </h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg ${
                message.includes('success') 
                  ? 'bg-green-900 text-green-300 border border-green-700'
                  : 'bg-red-900 text-red-300 border border-red-700'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Article Title *</label>
                <input
                  type="text"
                  name="article_title"
                  value={orderData.article_title}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your article title"
                  required
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Article Content *</label>
                <textarea
                  name="article_content"
                  value={orderData.article_content}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your article content"
                  required
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target URL *</label>
                <input
                  type="url"
                  name="target_url"
                  value={orderData.target_url}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://example.com"
                  required
                  maxLength={1000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Anchor Text</label>
                <input
                  type="text"
                  name="anchor_text"
                  value={orderData.anchor_text}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter anchor text for the link"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Budget *
                  {selectedWebsite.price_from && (
                    <span className="text-green-400 ml-2 text-sm">
                      (Website price: ${selectedWebsite.price_from}{selectedWebsite.price_to ? ` - $${selectedWebsite.price_to}` : '+'})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="budget"
                  value={orderData.budget}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={selectedWebsite.price_from ? `Minimum: $${selectedWebsite.price_from}` : "Enter your budget"}
                  required
                  min={selectedWebsite.price_from || "0"}
                  step="0.01"
                />
                {selectedWebsite.price_from && orderData.budget && parseFloat(orderData.budget) < parseFloat(selectedWebsite.price_from) && (
                  <p className="text-red-400 text-sm mt-1">
                    Budget should be at least ${selectedWebsite.price_from}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Posting From Date</label>
                  <input
                    type="date"
                    name="posting_from_date"
                    value={orderData.posting_from_date}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Posting To Date</label>
                  <input
                    type="date"
                    name="posting_to_date"
                    value={orderData.posting_to_date}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Special Requirements</label>
                <textarea
                  name="special_requirements"
                  value={orderData.special_requirements}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Any special requirements or notes (optional)"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 