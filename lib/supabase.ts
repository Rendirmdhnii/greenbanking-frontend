import { createClient } from '@supabase/supabase-js';

// Mirror dari utils/supabase.ts — agar import dari lib/ juga bisa
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://kxdiqofkrxtwycmssbgp.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_ul9Q9xot7UWlJ09H4M3dBQ_8yUbnKwJ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
