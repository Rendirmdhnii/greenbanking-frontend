import { createClient } from '@supabase/supabase-js';

// Mirror dari utils/supabase.ts — agar import dari lib/ juga bisa
// njupuk teko .env ae bos ben aman gak bocor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
