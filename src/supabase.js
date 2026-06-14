import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client = null;

export function isSupabaseConfigured() {
  return Boolean(
    url &&
      anonKey &&
      !url.includes('your-project') &&
      anonKey !== 'your-anon-key',
  );
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(url, anonKey);
  }
  return client;
}
