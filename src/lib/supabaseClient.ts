import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl as string, supabasePublishableKey as string)
  : null;

export function requireSupabaseSetup(action: string) {
  return {
    title: 'Supabase setup required',
    body: `${action} is production-wired to Supabase. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then apply reviewed migrations before enabling live writes.`
  };
}
