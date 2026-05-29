import { createClient } from '@supabase/supabase-js';

// Koneksi ke Supabase — GreenBanking Nusantara
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://kxdiqofkrxtwycmssbgp.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_ul9Q9xot7UWlJ09H4M3dBQ_8yUbnKwJ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // PKCE flow — lebih aman, token ditukar via exchangeCodeForSession
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})