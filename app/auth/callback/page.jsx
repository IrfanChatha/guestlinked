'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard'); // or wherever
      }
    });
  }, [router]);

  return <p className="text-center mt-20">Verifying login...</p>;
}
