'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { getSupabase } from '@/lib/supabaseClient';

export default function AddWebsite() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [formData, setFormData] = useState({
    link: '',
    badge: '',
    category_1: '',
    category_2: '',
    category_3: '',
    price_from: '',
    price_to: '',
    similarweb_traffic: '',
    moz_da: '',
    semrush_as: '',
    ahrefs_dr_range: '',
    tat: '',
    link_attribution_type: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
      } else {
        setUser(user);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const supabase = getSupabase();
    const { error } = await supabase.from('web_sites').insert([formData]);
    if (error) alert('Error saving: ' + error.message);
    else alert('Website added successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90 pointer-events-none"></div>
      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <div className="bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Add New Website
          </h2>
          <p className="text-gray-400 text-center mb-8">
            Submit a high-quality website for guest posting opportunities
          </p>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            {Object.keys(formData).map((field) => (
              <div key={field} className="col-span-2 md:col-span-1">
                <label 
                  htmlFor={field} 
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <input
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
                />
              </div>
            ))}
            <div className="col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300"
              >
                Submit Website
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
