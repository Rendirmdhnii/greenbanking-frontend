import { createClient } from '@supabase/supabase-js';

// Koneksi ke Supabase — GreenBanking Nusantara
// jarno moco soko .env, bahaya lek disimpen kene iso dimaling uwong
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // PKCE flow — lebih aman, token ditukar via exchangeCodeForSession
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
