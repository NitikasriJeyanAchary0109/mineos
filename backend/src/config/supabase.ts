import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();

// Polyfill global WebSocket for Node.js < 22 environments
if (typeof (globalThis as any).WebSocket === 'undefined') {
  (globalThis as any).WebSocket = WebSocket;
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export let supabase: SupabaseClient | null = null;
export let isCloudConnected = false;

if (supabaseUrl && supabaseServiceKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    isCloudConnected = true;
    console.log('✅ [Supabase] Connected to Managed Cloud Postgres at:', supabaseUrl);
  } catch (error) {
    console.warn('⚠️ [Supabase] Failed to initialize client:', error);
  }
} else {
  console.log('ℹ️ [Supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured.');
  console.log('ℹ️ [Supabase] Running in Dev/Ingestion-Validation mode (persisting to in-memory store).');
}
