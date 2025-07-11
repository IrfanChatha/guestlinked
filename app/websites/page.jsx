'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { getSupabase } from '@/lib/supabaseClient';

const supabase = getSupabase();

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
      const { data, error } = await supabase
        .from('web_sites')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        setWebsites(data);
        setFiltered(data);
        
        // Extract unique categories from all category columns
        const allCategories = [];
        data.forEach(site => {
          [site.category].forEach(cat => {
            if (cat && !allCategories.includes(cat)) {
              allCategories.push(cat);
            }
          });
        });
        setCategories(allCategories.sort());
      }
    };
    fetchWebsites();
  }, []);

  useEffect(() => {
    const { search, category, minDA, maxPrice } = filters;
    const results = websites.filter((site) => {
      const matchSearch =
        site.link?.toLowerCase().includes(search.toLowerCase()) ||
        site.category_1?.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        !category ||
        [site.category_1, site.category_2, site.category_3]
          .map((c) => c?.toLowerCase())
          .includes(category.toLowerCase());
      const matchDA = !minDA || (site.moz_da || 0) >= parseInt(minDA);
      const matchPrice = !maxPrice || (site.price_to || 0) <= parseInt(maxPrice);

      return matchSearch && matchCategory && matchDA && matchPrice;
    });
    setFiltered(results);
  }, [filters, websites]);

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
          <select
            className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
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
        <div className="mb-4">
          <p className="text-gray-400">
            Showing {filtered.length} of {websites.length} websites
          </p>
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
              {filtered.map((site) => (
                <tr key={site.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <a 
                      href={site.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline font-medium"
                    >
                      {site.link}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {[site.category_1, site.category_2, site.category_3]
                        .filter(Boolean)
                        .map((category, index) => (
                          <span 
                            key={index}
                            className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded-md text-xs font-medium"
                          >
                            {category}
                          </span>
                        ))}
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
      </div>
    </div>
  );
} 