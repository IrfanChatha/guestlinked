'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If user is authenticated, redirect to dashboard
        router.replace('/dashboard');
      } else {
        // If not authenticated, redirect to home page where login modal is
        router.replace('/');
      }
    };

    checkAuth();
  }, [router]);

  return null;
} 