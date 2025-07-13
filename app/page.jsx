'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const router = useRouter();
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Website slider state
  const [websites, setWebsites] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [websitesLoading, setWebsitesLoading] = useState(true);

  // Fetch websites for slider
  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const supabase = getSupabase();
        const { data: websitesData, error } = await supabase
          .from('web_sites')
          .select('*')
          .not('moz_da', 'is', null)
          .not('similarweb_traffic', 'is', null)
          .order('moz_da', { ascending: false })
          .limit(20); // Get top 20 websites for slider

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

    fetchWebsites();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (websites.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % websites.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [websites.length]);

  // Helper function to parse categories
  const parseCategories = (categories) => {
    if (typeof categories === 'string') {
      try {
        return JSON.parse(categories);
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(categories) ? categories : [];
  };

  // Slider navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % websites.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + websites.length) % websites.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!signUpData.name.trim()) {
      setMessage('Name is required');
      return;
    }

    if (!signUpData.role) {
      setMessage('Please select your role (Buyer or Seller)');
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (signUpData.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const supabase = getSupabase();
      
      // Sign up user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            display_name: signUpData.name,
            role: signUpData.role
          }
        }
      });

      if (error) {
        setMessage(error.message);
      } else if (data.user) {
        // Store additional user data in custom users_settings_tb table
        const { error: insertError } = await supabase
          .from('users_settings_tb')
          .insert([
            {
              user_id: data.user.id,
              name: signUpData.name,
              email: signUpData.email,
              role: signUpData.role,
              created_at: new Date().toISOString()
            }
          ]);

        if (insertError) {
          console.error('Error storing user settings:', insertError);
          setMessage('Account created but there was an issue storing your preferences. Please contact support.');
        } else {
          setMessage('Account created successfully! Please check your email to verify your account.');
          setSignUpData({ name: '', email: '', password: '', confirmPassword: '', role: '' });
          setTimeout(() => {
            setShowSignUpModal(false);
            setMessage('');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        setMessage(error.message);
        console.error('Login error:', error);
      } else if (data.user) {
        console.log('Login successful, user:', data.user.id);
        
        // Close modal immediately
        setShowLoginModal(false);
        setLoginData({ email: '', password: '' });
        setMessage('Login successful! Redirecting...');
        
        // Wait for auth state to propagate, then redirect
        const redirectUser = async () => {
          try {
            // Wait a bit for auth state to propagate
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Fetch user role from users_settings_tb
            const { data: userSettings, error: settingsError } = await supabase
              .from('users_settings_tb')
              .select('role')
              .eq('user_id', data.user.id)
              .single();

            console.log('User settings:', userSettings, 'Error:', settingsError);

            if (settingsError) {
              console.error('Error fetching user settings:', settingsError);
              setMessage('Login successful but could not load user preferences. Please contact support.');
            } else if (userSettings && userSettings.role) {
              console.log('Redirecting user with role:', userSettings.role);
              
              // Redirect to appropriate dashboard based on role
              if (userSettings.role === 'Buyer') {
                console.log('Redirecting to buyer dashboard');
                window.location.href = '/buyer/buyer-dashboard';
              } else if (userSettings.role === 'Seller') {
                console.log('Redirecting to seller dashboard');
                window.location.href = '/seller/seller-dashboard';
              } else {
                console.log('Redirecting to general dashboard');
                window.location.href = '/dashboard';
              }
            } else {
              console.error('No role found for user');
              setMessage('Login successful but no role found. Please contact support.');
            }
          } catch (redirectError) {
            console.error('Redirect error:', redirectError);
            setMessage('Login successful but redirect failed. Please refresh the page.');
          }
        };

        redirectUser();
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <Image
        src="/guest-posting-main.jpeg"
        alt="Guest Posting Background"
        fill
        className="object-cover"
        priority
      />
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/80 z-10"></div>

      {/* Content */}
      <div className="relative z-20 min-h-screen flex">
        {/* Left side - Main content */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Premium Guest Posting Platform
            </h1>
            <p className="text-xl lg:text-2xl text-gray-100 mb-8 leading-relaxed">
              Connect with high-authority websites and boost your SEO rankings through quality guest posting opportunities.
            </p>
            {/* Website Slider */}
            <div className="mt-8">
              {websitesLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="ml-4 text-white">Loading websites...</p>
                </div>
              ) : websites.length > 0 ? (
                <div className="relative">
                  <div className="overflow-hidden rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {websites.map((website, index) => {
                        const categories = parseCategories(website.category);
                        return (
                          <div key={website.id} className="w-full flex-shrink-0 p-6">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-xl font-bold text-white">{website.link}</h3>
                                  {website.badge && (
                                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                      {website.badge}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-400">{website.moz_da || 'N/A'}</p>
                                    <p className="text-sm text-gray-400">Domain Authority</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-green-400">${website.price_from || 'N/A'}</p>
                                    <p className="text-sm text-gray-400">Starting Price</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-purple-400">{website.similarweb_traffic || 'N/A'}</p>
                                    <p className="text-sm text-gray-400">Monthly Traffic</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-orange-400">{website.tat || 'N/A'}</p>
                                    <p className="text-sm text-gray-400">Turnaround Time</p>
                                  </div>
                                </div>
                                
                                {categories.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {categories.slice(0, 3).map((category, catIndex) => (
                                      <span key={catIndex} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                                        {category}
                                      </span>
                                    ))}
                                    {categories.length > 3 && (
                                      <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                                        +{categories.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  

                  
                  {/* Dots indicator */}
                  <div className="flex justify-center mt-4 space-x-2">
                    {websites.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide ? 'bg-blue-500' : 'bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No websites available at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Auth buttons */}
        <div className="px-10 w-80 lg:w-96 p-4 flex flex-col justify-center pt-16">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Get Started
            </h2>

            <div className="space-y-4">
              <button
                onClick={() => setShowSignUpModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 text-center"
              >
                Sign Up
              </button>

              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-all duration-300 text-center"
              >
                Log In
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="relative z-20 bg-gray-900 bg-opacity-95 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Choose GuestLinked?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              The most comprehensive platform for guest posting opportunities with verified, high-quality websites.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Verified Quality</h3>
              <p className="text-gray-400">All websites are manually verified for DA, traffic, and quality standards.</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Boost Your SEO</h3>
              <p className="text-gray-400">Get high-quality backlinks from authoritative domains to improve your rankings.</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Fast Turnaround</h3>
              <p className="text-gray-400">Quick approval and publishing times to get your content live faster.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Up Modal */}
      {showSignUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
              <button
                onClick={() => {
                  setShowSignUpModal(false);
                  setMessage('');
                  setSignUpData({ name: '', email: '', password: '', confirmPassword: '', role: '' });
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Confirm your password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setSignUpData({ ...signUpData, role: 'Buyer' })}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 text-center ${
                      signUpData.role === 'Buyer'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignUpData({ ...signUpData, role: 'Seller' })}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 text-center ${
                      signUpData.role === 'Seller'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    Seller
                  </button>
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes('successfully')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                  }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setMessage('');
                  setLoginData({ email: '', password: '' });
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your password"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes('successful')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                  }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Forgot your password?
                </button>
              </div>

              <div className="text-center text-gray-500 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowSignUpModal(true);
                    setMessage('');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign up here
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
