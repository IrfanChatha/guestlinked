'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabaseClient';

export default function DebugAuth() {
  const [user, setUser] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabase();
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('Auth user:', user, 'Error:', userError);
        
        if (user) {
          setUser(user);
          
          // Fetch user settings
          const { data: settings, error: settingsError } = await supabase
            .from('users_settings_tb')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          console.log('User settings:', settings, 'Error:', settingsError);
          
          if (settingsError) {
            setError(settingsError.message);
          } else {
            setUserSettings(settings);
          }
        }
      } catch (err) {
        console.error('Debug auth error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Authentication User</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">User Settings</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(userSettings, null, 2)}
          </pre>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h2 className="font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Expected Redirect</h2>
          {userSettings?.role === 'Buyer' && (
            <p>Should redirect to: <strong>/buyer/buyer-dashboard</strong></p>
          )}
          {userSettings?.role === 'Seller' && (
            <p>Should redirect to: <strong>/seller/seller-dashboard</strong></p>
          )}
          {!userSettings?.role && (
            <p>Should redirect to: <strong>/dashboard</strong> (fallback)</p>
          )}
        </div>
      </div>
    </div>
  );
} 