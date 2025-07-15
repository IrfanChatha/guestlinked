'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabaseClient';

// CategoryDropdown component for multi-select functionality
function CategoryDropdown({ categories, selectedCategories, onCategoryToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleCategoryClick = (category) => {
    onCategoryToggle(category);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.category-dropdown')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative category-dropdown">
      {/* Dropdown trigger */}
      <div
        onClick={handleToggleDropdown}
        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
      >
        <span className="text-sm">
          {selectedCategories.length === 0
            ? 'Select categories...'
            : `${selectedCategories.length} category${selectedCategories.length > 1 ? 'ies' : 'y'} selected`}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-600 border border-gray-500 rounded-md shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b border-gray-500">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search categories..."
              className="w-full px-2 py-1 bg-gray-700 border border-gray-400 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          {/* Categories list */}
          <div className="max-h-40 overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <div className="p-2 text-gray-400 text-sm">No categories found</div>
            ) : (
              filteredCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-500 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryClick(category)}
                    className="form-checkbox text-blue-500 bg-gray-700 border-gray-400 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-white">{category}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected categories display */}
      {selectedCategories.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedCategories.map((cat) => (
            <span key={cat} className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs">
              {cat}
              <button
                type="button"
                onClick={() => onCategoryToggle(cat)}
                className="ml-1 text-blue-200 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Component to display existing websites
function ExistingWebsites({ user }) {
  const [existingWebsites, setExistingWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', url: '', category: [] });
  const [message, setMessage] = useState('');

  // Comprehensive categories list
  const categories = [
    'Agriculture',
    'Animals and Pets',
    'Art',
    'Automobiles',
    'Beauty',
    'Books',
    'Business',
    'Career and Employment',
    'Computers',
    'Construction and Repairs',
    'Culture',
    'E-commerce',
    'Education',
    'Entertainment',
    'Environment',
    'Equipment',
    'Fashion',
    'Finance',
    'Food',
    'For Children',
    'For Men',
    'For Women',
    'Gadgets',
    'Games',
    'Hardware development',
    'Health',
    'Home and Family',
    'Humor',
    'Internet',
    'Law',
    'Leisure and Hobbies',
    'Lifestyle',
    'Literature',
    'Manufacturing',
    'Marketing and Advertising',
    'Media',
    'Miscellaneous',
    'Mobile',
    'Movies',
    'Music',
    'Nature',
    'News',
    'News and Media',
    'Personal Blogs',
    'Photography',
    'Places',
    'Politics',
    'Programming',
    'Public Service',
    'Real Estate',
    'Science',
    'Shopping',
    'Society',
    'Software development',
    'Sports',
    'Startups',
    'Technology',
    'Transport',
    'Travel',
    'Web-development'
  ];

  useEffect(() => {
    if (user) {
      fetchExistingWebsites();
    }
  }, [user]);

  const fetchExistingWebsites = async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('buyer_websites_tb')
        .select('*')
        .eq('buyer_id', user.user_id)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching websites:', error);
      } else {
        setExistingWebsites(data || []);
      }
    } catch (error) {
      console.error('Error in fetchExistingWebsites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (website) => {
    setEditingWebsite(website.id);
    setEditFormData({
      name: website.website_name,
      url: website.website_url,
      category: Array.isArray(website.category) ? website.category : [website.category].filter(Boolean)
    });
    setMessage('');
  };

  const handleCancelEdit = () => {
    setEditingWebsite(null);
    setEditFormData({ name: '', url: '', category: [] });
    setMessage('');
  };

  const handleCategoryToggle = (category) => {
    setEditFormData(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }));
  };

  const handleSaveEdit = async (websiteId) => {
    if (!editFormData.name.trim() || !editFormData.url.trim() || editFormData.category.length === 0) {
      setMessage('All fields are required');
      return;
    }

    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(editFormData.url.trim())) {
      setMessage('Please enter a valid URL starting with http:// or https://');
      return;
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('buyer_websites_tb')
        .update({
          website_name: editFormData.name.trim(),
          website_url: editFormData.url.trim(),
          category: editFormData.category
        })
        .eq('id', websiteId);

      if (error) {
        console.error('Error updating website:', error);
        setMessage('Error updating website');
      } else {
        setMessage('Website updated successfully!');
        setEditingWebsite(null);
        fetchExistingWebsites(); // Refresh the list
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error in handleSaveEdit:', error);
      setMessage('Error updating website');
    }
  };

  const handleDelete = async (websiteId, websiteName) => {
    if (!confirm(`Are you sure you want to delete "${websiteName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('buyer_websites_tb')
        .delete()
        .eq('id', websiteId);

      if (error) {
        console.error('Error deleting website:', error);
        setMessage('Error deleting website');
      } else {
        setMessage('Website deleted successfully!');
        fetchExistingWebsites(); // Refresh the list
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      setMessage('Error deleting website');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-8 bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Websites</h2>
        <span className="text-gray-400 text-sm">
          {existingWebsites.length} website{existingWebsites.length !== 1 ? 's' : ''}
        </span>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('successfully') 
            ? 'bg-green-900 text-green-300' 
            : 'bg-red-900 text-red-300'
        }`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-400">Loading your websites...</div>
        </div>
      ) : existingWebsites.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400">No websites added yet</div>
          <p className="text-sm text-gray-500 mt-2">Add your first website using the form above</p>
        </div>
      ) : (
        <div className="space-y-4">
          {existingWebsites.map((website) => (
            <div key={website.id} className="bg-gray-700 rounded-lg p-4">
              {editingWebsite === website.id ? (
                // Edit mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Website name"
                    />
                    <input
                      type="url"
                      value={editFormData.url}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, url: e.target.value }))}
                      className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Website URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Categories * (Select multiple)
                    </label>
                    <CategoryDropdown
                      categories={categories}
                      selectedCategories={editFormData.category}
                      onCategoryToggle={handleCategoryToggle}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveEdit(website.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{website.website_name}</h3>
                    <a
                      href={website.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm break-all"
                    >
                      {website.website_url}
                    </a>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(website.category) ? website.category : [website.category]).filter(Boolean).map((cat, index) => (
                          <span key={index} className="bg-gray-600 px-2 py-1 rounded text-xs">
                            {cat}
                          </span>
                        ))}
                      </div>
                      <span>Added {formatDate(website.added_at)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(website)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded-md transition-colors"
                      title="Edit website"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(website.id, website.website_name)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded-md transition-colors"
                      title="Delete website"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AddWebsite() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const [websites, setWebsites] = useState([{ id: 1, name: '', url: '', category: [] }]);
  const [nextId, setNextId] = useState(2);

  // Comprehensive categories list
  const categories = [
    'Agriculture',
    'Animals and Pets',
    'Art',
    'Automobiles',
    'Beauty',
    'Books',
    'Business',
    'Career and Employment',
    'Computers',
    'Construction and Repairs',
    'Culture',
    'E-commerce',
    'Education',
    'Entertainment',
    'Environment',
    'Equipment',
    'Fashion',
    'Finance',
    'Food',
    'For Children',
    'For Men',
    'For Women',
    'Gadgets',
    'Games',
    'Hardware development',
    'Health',
    'Home and Family',
    'Humor',
    'Internet',
    'Law',
    'Leisure and Hobbies',
    'Lifestyle',
    'Literature',
    'Manufacturing',
    'Marketing and Advertising',
    'Media',
    'Miscellaneous',
    'Mobile',
    'Movies',
    'Music',
    'Nature',
    'News',
    'News and Media',
    'Personal Blogs',
    'Photography',
    'Places',
    'Politics',
    'Programming',
    'Public Service',
    'Real Estate',
    'Science',
    'Shopping',
    'Society',
    'Software development',
    'Sports',
    'Startups',
    'Technology',
    'Transport',
    'Travel',
    'Web-development'
  ];

  useEffect(() => {
    const checkUser = async () => {
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

      // Only buyers can add websites
      if (settings.role !== 'Buyer') {
        if (settings.role === 'Seller') {
          router.push('/seller/seller-dashboard');
        } else if (settings.role === 'Agent') {
          router.push('/agent/dashboard');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      setUser(settings);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleInputChange = (id, field, value) => {
    setWebsites(prev => 
      prev.map(website => 
        website.id === id ? { ...website, [field]: value } : website
      )
    );
  };

  const handleCategoryToggle = (websiteId, category) => {
    setWebsites(prev =>
      prev.map(website => {
        if (website.id === websiteId) {
          const currentCategories = Array.isArray(website.category) ? website.category : [];
          const newCategories = currentCategories.includes(category)
            ? currentCategories.filter(c => c !== category)
            : [...currentCategories, category];
          return { ...website, category: newCategories };
        }
        return website;
      })
    );
  };

  const addWebsiteField = () => {
    setWebsites(prev => [...prev, { id: nextId, name: '', url: '', category: [] }]);
    setNextId(prev => prev + 1);
  };

  const removeWebsiteField = (id) => {
    if (websites.length > 1) {
      setWebsites(prev => prev.filter(website => website.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out entries with empty required fields
    const validWebsites = websites.filter(website => 
      website.name.trim() && website.url.trim() && Array.isArray(website.category) && website.category.length > 0
    );
    
    if (validWebsites.length === 0) {
      setMessage('Please fill in all fields for at least one website');
      return;
    }

    // Validate URL format
    const urlPattern = /^https?:\/\/.+/;
    const invalidUrls = validWebsites.filter(website => !urlPattern.test(website.url.trim()));
    
    if (invalidUrls.length > 0) {
      setMessage('Please enter valid URLs starting with http:// or https://');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const supabase = getSupabase();
      
      // Insert websites into buyer_websites_tb table
      const websitesToInsert = validWebsites.map(website => ({
        buyer_id: user.user_id,
        website_name: website.name.trim(),
        website_url: website.url.trim(),
        category: website.category, // Store as array as per table schema
        added_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('buyer_websites_tb')
        .insert(websitesToInsert);

    if (error) {
        console.error('Error adding websites:', error);
        setMessage('Error adding websites. Please try again.');
    } else {
        setMessage(`Successfully added ${validWebsites.length} website${validWebsites.length > 1 ? 's' : ''}!`);
        
      // Reset form
        setWebsites([{ id: 1, name: '', url: '', category: [] }]);
        setNextId(2);
        
        // Redirect after success
        setTimeout(() => {
          router.push('/buyer/buyer-dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting websites:', error);
      setMessage('An error occurred while adding the websites');
    } finally {
      setSubmitting(false);
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-4"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold mb-2">Add Your Websites</h1>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <label className="block text-lg font-medium text-gray-300 mb-4">
                  Website Details *
                </label>
                
                {websites.map((website, index) => (
                  <div key={website.id} className="bg-gray-700 rounded-lg p-6 relative">
                    {websites.length > 1 && (
                      <div className="flex justify-end mb-4">
                        <button
                          type="button"
                          onClick={() => removeWebsiteField(website.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded-md transition-colors duration-200"
                          title="Remove website"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Website Name *
                        </label>
                        <input
                          type="text"
                          value={website.name}
                          onChange={(e) => handleInputChange(website.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="My Business Website"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Website URL *
                </label>
                <input
                          type="url"
                          value={website.url}
                          onChange={(e) => handleInputChange(website.id, 'url', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Categories * (Select multiple)
                      </label>
                      <CategoryDropdown
                        categories={categories}
                        selectedCategories={Array.isArray(website.category) ? website.category : []}
                        onCategoryToggle={(category) => handleCategoryToggle(website.id, category)}
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addWebsiteField}
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 p-3 border-2 border-dashed border-gray-600 hover:border-blue-400 rounded-lg w-full justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add another website</span>
                </button>
              </div>

              {message && (
                <div className={`p-4 rounded-md ${
                  message.includes('Successfully') 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-red-900 text-red-300'
                }`}>
                  {message}
                </div>
              )}

              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">💡 Tips:</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Add your websites for guest posting</li>
                  <li>• Website name should be descriptive (e.g., "My Tech Blog")</li>
                  <li>• URLs must include http:// or https://</li>
                  <li>• Use the dropdown to select multiple relevant categories</li>
                </ul>
              </div>

              <div className="flex space-x-4">
              <button
                type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-md font-medium transition-colors duration-200"
                >
                 {submitting ? 'Adding Websites...' : `Add Websites`}
                  {/* {submitting ? 'Adding Websites...' : `Add ${websites.filter(w => w.name.trim() && w.url.trim() && Array.isArray(w.category) && w.category.length > 0).length || 1} Website${websites.filter(w => w.name.trim() && w.url.trim() && Array.isArray(w.category) && w.category.length > 0).length !== 1 ? 's' : ''}`} */}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors duration-200"
                >
                  Cancel
              </button>
            </div>
          </form>
        </div>

          <ExistingWebsites user={user} />
        </div>
      </div>
    </div>
  );
}
