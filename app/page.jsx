'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { supabase } from '../utils/supabase';

export default function HomePage() {
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setMessage('');
      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const { data: authData, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectUrl}/dashboard`
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        setMessage(error.message);
      } else {
        console.log('Google OAuth successful:', authData);
        // Get user data after OAuth
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('Retrieved user data:', user);

        if (userError) {
          console.error('Error getting user:', userError);
          return;
        }

        if (user) {
          // Store in custom table
          const { data: insertData, error: insertError } = await supabase
            .from('users_settings_tb')
            .upsert({
                id: authData.user.id,
                name: user.user_metadata?.full_name || 'Guest User',
                email: signUpData.email,
                user_role: 'guest',
                profile_image: user.user_metadata?.avatar_url,
                bio: '' || null,
                is_active: true,
                last_login: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });

          console.log('Insert result:', insertData);
          if (insertError) {
            console.error('Error storing user data:', insertError);
          }
        }
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      setMessage('An error occurred with Google sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

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
      console.log('Starting signup with data:', { ...signUpData, password: '[REDACTED]' });
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.display_name
          }
        }
      });

      console.log('Auth signup result:', { authData, error: authError });

      if (authError) {
        console.error('Auth signup error:', authError);
        setMessage(authError.message);
      } else if (authData.user) {
        console.log('Auth user created:', authData.user);
        // If auth user created successfully, store in custom table
        const { data: insertData, error: insertError } = await supabase
          .from('users_settings_tb')
          .insert([{
            id: authData.user.id,
            name: signUpData.display_name || 'Guest User',
            email: signUpData.email,
            user_role: 'guest',
            profile_image: '' || null,
            bio: '' || null,
            is_active: true,
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();

        console.log('Custom table insert result:', { data: insertData, error: insertError });

        if (insertError) {
          console.error('Error storing user data:', insertError);
          setMessage('Account created but there was an issue setting up your profile. Please contact support.');
        } else {
          setMessage('Account created successfully! Please check your email to verify your account.');
          setSignUpData({ email: '', password: '', confirmPassword: '', display_name: '' });
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      console.log('Login result:', { data, error });

      if (error) {
        console.error('Login error:', error);
        setMessage(error.message);
      } else if (data.user) {
        // Update last_login in custom table
        const { error: updateError } = await supabase
          .from('users_settings_tb')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id)
          .select();

        console.log('Last login update result:', { error: updateError });

        if (updateError) {
          console.error('Error updating last login:', updateError);
        }

        setMessage('Login successful! Redirecting to dashboard...');
        setLoginData({ email: '', password: '' });
        const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        setTimeout(() => {
          setShowLoginModal(false);
          setMessage('');
          // Redirect to dashboard
          window.location.href = `${redirectUrl}/dashboard`;
        }, 2000);
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
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/websites"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 text-center"
              >
                Browse Websites
              </Link>
              <Link
                href="/add-website"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 text-center"
              >
                Submit Your Site
              </Link>
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
      <div className="relative z-20 bg-white bg-opacity-95 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Why Choose GuestLinked?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The most comprehensive platform for guest posting opportunities with verified, high-quality websites.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Verified Quality</h3>
              <p className="text-gray-600">All websites are manually verified for DA, traffic, and quality standards.</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Boost Your SEO</h3>
              <p className="text-gray-600">Get high-quality backlinks from authoritative domains to improve your rankings.</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Fast Turnaround</h3>
              <p className="text-gray-600">Quick approval and publishing times to get your content live faster.</p>
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
                  setSignUpData({ name: '', email: '', password: '', confirmPassword: '' });
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
                  value={signUpData.display_name}
                  onChange={(e) => setSignUpData({ ...signUpData, display_name: e.target.value })}
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3 px-6 rounded-lg font-semibold transition-all duration-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3 px-6 rounded-lg font-semibold transition-all duration-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
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
