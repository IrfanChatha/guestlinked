'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const router = useRouter();
  
    useEffect(() => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) router.push('/login');
        else setUser(user);
      });
    }, [router]);
  
    const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push('/login');
    };
  
    if (!user) return <p>Loading...</p>;
  
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
  
        {/* Your dashboard content goes here */}
      </div>
    );
  }
  