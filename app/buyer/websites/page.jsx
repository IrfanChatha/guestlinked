'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { supabase } from '@/lib/supabaseClient';

export default function WebsitesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [currentItems, setCurrentItems] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    categories: [], // Changed from single category to array
    minDA: '',
    maxPrice: ''
  });
  const router = useRouter();

  const clearFilters = () => {
    setFilters({
      search: '',
      categories: [],
      minDA: '',
      maxPrice: ''
    });
  };

  const handleCategoryToggle = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Pagination helper functions
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Main effect for authentication and data fetching
  useEffect(() => {
    let isMounted = true;

    const checkUserAndFetchWebsites = async () => {
      try {
        // Simple authentication check - middleware already verified user exists
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !currentUser) {
          console.error('Authentication failed:', authError?.message)
          router.push('/')
          return
        }

        if (!isMounted) return;

        setUser(currentUser)
        console.log('User authenticated:', currentUser.id)

        // Fetch websites data
        const fetchAllWebsites = async () => {
          try {
            console.log('Fetching websites data...')
            
            // Fetch all websites with pagination bypass
            let allWebsites = []
            let from = 0
            const batchSize = 1000
            let hasMore = true

            while (hasMore) {
              const { data: batch, error } = await supabase
        .from('web_sites')
        .select('*')
                .range(from, from + batchSize - 1)
                .order('created_at', { ascending: false })

              if (error) {
                console.error('Error fetching websites batch:', error)
                break
              }

              if (batch && batch.length > 0) {
                allWebsites = [...allWebsites, ...batch]
                from += batchSize
                hasMore = batch.length === batchSize
              } else {
                hasMore = false
              }
            }

            console.log(`Fetched ${allWebsites.length} websites`)

            // Remove duplicates based on ID
            const uniqueWebsites = allWebsites.reduce((acc, current) => {
              const existing = acc.find(item => item.id === current.id)
              if (!existing) {
                acc.push(current)
              }
              return acc
            }, [])

            console.log(`After deduplication: ${uniqueWebsites.length} websites`)

            if (!isMounted) return;

            setWebsites(uniqueWebsites)
            setFiltered(uniqueWebsites)
            
            // Extract unique categories from websites data
            const allCategories = new Set()
            uniqueWebsites.forEach(website => {
              let categories = website.category
              
              // If category is a string, try to parse it as JSON
              if (typeof categories === 'string') {
                try {
                  categories = JSON.parse(categories)
                } catch (e) {
                  console.warn('Failed to parse category JSON for website:', website.link, categories)
                  categories = []
                }
              }
              
              // Ensure categories is an array
              if (Array.isArray(categories)) {
                categories.forEach(cat => {
                  if (cat && typeof cat === 'string' && cat.trim()) {
                    allCategories.add(cat.trim())
            }
                })
              }
            })
            
            // Convert set to sorted array
            const sortedCategories = Array.from(allCategories).sort()
            setCategories(sortedCategories)
            console.log(`Extracted ${sortedCategories.length} unique categories`)
            
            setLoading(false)
            
          } catch (error) {
            console.error('Error in fetchAllWebsites:', error)
            if (isMounted) {
              setLoading(false)
            }
          }
        }

        await fetchAllWebsites()
        
      } catch (error) {
        console.error('Error in checkUserAndFetchWebsites:', error)
        if (isMounted) {
          setLoading(false)
          router.push('/')
        }
      }
    }

    checkUserAndFetchWebsites()

    return () => {
      isMounted = false
    }
  }, [router])

  // Filter effect - searches through all data
  useEffect(() => {
    const { search, categories, minDA, maxPrice } = filters;
    const results = websites.filter((site) => {
      // Parse categories for this site
      let siteCategories = site.category
      if (typeof siteCategories === 'string') {
        try {
          siteCategories = JSON.parse(siteCategories)
        } catch (e) {
          siteCategories = []
        }
      }
      if (!Array.isArray(siteCategories)) {
        siteCategories = []
      }
      
      const matchSearch =
        site.link?.toLowerCase().includes(search.toLowerCase()) ||
        siteCategories.some(cat => cat?.toLowerCase().includes(search.toLowerCase()));
      const matchCategories =
        categories.length === 0 ||
        categories.every(selectedCat => 
          siteCategories.some(cat => cat?.toLowerCase() === selectedCat.toLowerCase())
        );
      const matchDA = !minDA || (site.moz_da || 0) >= parseInt(minDA);
      const matchPrice = !maxPrice || (site.price_to || 0) <= parseInt(maxPrice);

      return matchSearch && matchCategories && matchDA && matchPrice;
    });
    setFiltered(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, websites]);

  // Pagination effect - paginates filtered data
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentItems(filtered.slice(startIndex, endIndex));
  }, [filtered, currentPage, itemsPerPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navbar />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90 pointer-events-none"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 pt-24">
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 pt-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Guest Posting Websites</h1>
            <p className="text-gray-400">Discover high-quality websites for your guest posting campaigns</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
            type="text"
            placeholder="Search by link or niche"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white text-left flex items-center justify-between"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {filters.categories.length === 0 
                  ? 'All Categories' 
                  : `${filters.categories.length} selected`}
              </span>
              <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2">
            {categories.map((category) => (
                    <label key={category} className="flex items-center p-2 hover:bg-gray-600 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="mr-3 w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-white text-sm">{category}</span>
                    </label>
            ))}
                </div>
              </div>
            )}
          </div>
          <input
            className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
            type="number"
            placeholder="Min DA"
            value={filters.minDA}
            onChange={(e) => setFilters({ ...filters, minDA: e.target.value })}
          />
          <input
            className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
          </div>
          
          {/* Clear Filters Button */}
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-400">
            Showing {filtered.length > 0 ? startIndex + 1 : 0} to {endIndex} of {filtered.length} websites
            {filtered.length !== websites.length && (
              <span className="text-gray-500"> (filtered from {websites.length} total)</span>
            )}
          </p>
          {totalPages > 1 && (
            <p className="text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-700 shadow-xl bg-gray-800">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-300 border-b border-gray-600">Link</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300 border-b border-gray-600">Categories</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300 border-b border-gray-600">Price</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300 border-b border-gray-600">Traffic</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300 border-b border-gray-600">DA / AS / DR</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300 border-b border-gray-600">TAT</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300 border-b border-gray-600">Link Type</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((site) => (
                <tr key={site.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <a 
                      href={site.link?.startsWith('http') ? site.link : `https://${site.link}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline font-medium"
                    >
                      {site.link}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        let categories = site.category
                        if (typeof categories === 'string') {
                          try {
                            categories = JSON.parse(categories)
                          } catch (e) {
                            categories = []
                          }
                        }
                        if (!Array.isArray(categories)) {
                          categories = []
                        }
                        return categories
                        .filter(Boolean)
                        .map((category, index) => (
                          <span 
                            key={index}
                            className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded-md text-xs font-medium"
                          >
                            {category}
                          </span>
                          ))
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">
                      ${site.price_from} - ${site.price_to}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">
                      {site.similarweb_traffic}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-300">DA: {site.moz_da}</span>
                      <span className="text-gray-300">AS: {site.semrush_as}</span>
                      <span className="text-gray-300">DR: {site.ahrefs_dr_range}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">
                      {site.tat}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">
                      {site.link_attribution_type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-2">
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                currentPage === 1
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex space-x-1">
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => goToPage(1)}
                      className="px-3 py-2 rounded-lg font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all duration-300"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span key="start-ellipsis" className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => goToPage(i)}
                      className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                        i === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="end-ellipsis" className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => goToPage(totalPages)}
                      className="px-3 py-2 rounded-lg font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all duration-300"
                    >
                      {totalPages}
                    </button>
                  );
                }

                return pages;
              })()}
            </div>

            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                currentPage === totalPages
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 