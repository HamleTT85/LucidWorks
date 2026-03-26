import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Create client — will fail gracefully on API calls if not configured
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return (
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-key'
  );
}
