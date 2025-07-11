import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;

export const getSupabase = () => {
  if (!supabase) {
    supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
};
