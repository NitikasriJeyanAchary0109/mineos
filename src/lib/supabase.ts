import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
export const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

export let supabase: SupabaseClient | null = null;
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')
);

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 15,
        },
      },
    });
    console.log('⚡ [Supabase Frontend] Connected to Supabase Realtime at:', supabaseUrl);
  } catch (err) {
    console.warn('⚠️ [Supabase Frontend] Client initialization error:', err);
  }
} else {
  console.log('ℹ️ [Supabase Frontend] Cloud credentials not found in env (VITE_SUPABASE_URL).');
  console.log('ℹ️ [Supabase Frontend] Will stream live data from Express backend:', BACKEND_API_URL);
}
