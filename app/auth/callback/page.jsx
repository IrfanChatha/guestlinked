'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Verifying login...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = getSupabase();
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch user settings to determine role
          const { data: userSettings, error } = await supabase
            .from('users_settings_tb')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (error || !userSettings) {
            console.error('Error fetching user settings:', error);
            setMessage('Login failed. Please try again.');
            setTimeout(() => router.push('/'), 3000);
            return;
          }

          // Redirect based on role
          if (userSettings.role === 'Buyer') {
            router.push('/buyer/buyer-dashboard');
          } else if (userSettings.role === 'Seller') {
            router.push('/seller/seller-dashboard');
          } else {
            // Fallback for users without specific roles
            router.push('/dashboard');
          }
        } else {
          setMessage('Login failed. Please try again.');
          setTimeout(() => router.push('/'), 3000);
        }
      } catch (error) {
        console.error('Callback error:', error);
        setMessage('Login failed. Please try again.');
        setTimeout(() => router.push('/'), 3000);
      }
    };

    // Handle auth state changes
    const supabase = getSupabase();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await handleAuthCallback();
      } else if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    // Also check current auth state
    handleAuthCallback();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">{message}</p>
      </div>
    </div>
  );
}
