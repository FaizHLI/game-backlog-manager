import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'supabase.auth.token',
      detectSessionInUrl: true,
      flowType: 'pkce',
    }
  }
);

export const getServiceSupabase = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  
  if (!supabaseServiceKey) {
    throw new Error('Missing Supabase service role key');
  }
  
  return createClient<Database>(
    supabaseUrl, 
    supabaseServiceKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  );
};