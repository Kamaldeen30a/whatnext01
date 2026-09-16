// Supabase client for WHATNEXT INVESTMENT NIGERIA LIMITED dashboard.
// Reads credentials from .env (see .env.example). Falls back gracefully
// when no backend is configured yet, so the app keeps running on local data.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

if (!isSupabaseConfigured) {
  // Visible in the browser console during development only.
  if (import.meta.env.DEV) {
    console.info(
      '[Supabase] Not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to connect your backend.'
    );
  }
}
