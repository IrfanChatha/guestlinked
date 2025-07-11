'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Verifying login...');

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Redirect to dashboard on successful login
        router.push('/dashboard');
        console.log('Login successful');
        console.log(session);
        console.log(event);
        
      } else {
        // Handle cases where login fails or session is not found
        setMessage('Login failed. Please try again.');
        setTimeout(() => router.push('/'), 3000); // Redirect to home after 3 seconds
      }
    });
  }, [router]);

  return <p className="text-center mt-20">{message}</p>;
}
