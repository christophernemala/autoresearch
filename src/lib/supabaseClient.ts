import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseConfigured
  ? createClient<Database>(supabaseUrl as string, supabaseAnonKey as string)
  : null;

export function requireSupabaseSetup(action: string) {
  return {
    title: 'Supabase setup required',
    body: `${action} is production-wired to Supabase. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then apply reviewed migrations before enabling live writes.`
  };
}
