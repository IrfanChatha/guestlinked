'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function WebsitesPage() {
  const [websites, setWebsites] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minDA: '',
    maxPrice: ''
  });

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minDA: '',
      maxPrice: ''
    });
  };

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        // First, get the total count
        const { count } = await supabase
          .from('web_sites')
          .select('*', { count: 'exact', head: true });

        console.log(`Total records in database: ${count}`);

        // Fetch all records using pagination if more than 1000
        let allData = [];
        const pageSize = 1000;
        let currentPage = 0;

        while (currentPage * pageSize < count) {
          const { data, error } = await supabase
            .from('web_sites')
            .select('*')
            .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1);

          if (error) {
            console.error('Error fetching page:', error);
            break;
          }

          allData = [...allData, ...data];
          currentPage++;
          console.log(`Fetched page ${currentPage}, total records so far: ${allData.length}`);
        }

        console.log(`Final total fetched: ${allData.length} websites from database`);
        
        setWebsites(allData);
        setFiltered(allData);
        
        // Extract unique categories from category column
        const allCategories = [];
        allData.forEach(site => {
          if (site.category && !allCategories.includes(site.category)) {
            allCategories.push(site.category);
          }
        });
        setCategories(allCategories.sort());
      } catch (error) {
        console.error('Error in fetchWebsites:', error);
      }
    };
    
    fetchWebsites();
  }, []);

  useEffect(() => {
    const { search, category, minDA, maxPrice } = filters;
    const results = websites.filter((site) => {
      const matchSearch =
        site.link?.toLowerCase().includes(search.toLowerCase()) ||
        site.category?.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        !category ||
        site.category?.toLowerCase().includes(category.toLowerCase());
      const matchDA = !minDA || (site.moz_da || 0) >= parseInt(minDA);
      const matchPrice = !maxPrice || (site.price_to || 0) <= parseInt(maxPrice);

      return matchSearch && matchCategory && matchDA && matchPrice;
    });
    setFiltered(results);
  }, [filters, websites]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Guest Posting Websites</h1>
          <p className="text-gray-600">Discover high-quality websites for your guest posting campaigns</p>
        </div>
        <Link 
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          type="text"
          placeholder="Search by link or niche"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          type="number"
          placeholder="Min DA"
          value={filters.minDA}
          onChange={(e) => setFilters({ ...filters, minDA: e.target.value })}
        />
        <input
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filtered.length} of {websites.length} websites
        </p>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b">Link</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b">Categories</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b">Price</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b">Traffic</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b">DA / AS / DR</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b">TAT</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b">Link Type</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((site) => (
              <tr key={site.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <a 
                    href={site.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    {site.link}
                  </a>
                </td>
                <td className="px-6 py-4">
                  {site.category && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                      {site.category}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-green-600">
                    ${site.price_from} - ${site.price_to}
                  </span>
                </td>
                <td className="px-6 py-4">{site.similarweb_traffic}</td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div>DA: <span className="font-medium">{site.moz_da}</span></div>
                    <div>AS: <span className="font-medium">{site.semrush_as}</span></div>
                    <div>DR: <span className="font-medium">{site.ahrefs_dr_range}</span></div>
                  </div>
                </td>
                <td className="px-6 py-4">{site.tat}</td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-medium">
                    {site.link_attribution_type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.291M6.343 6.343A8 8 0 1017.657 17.657 8 8 0 006.343 6.343z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No results match your filters.</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
} 