import type { Database } from '~/types/database.types';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY)'
  );
}

/**
 * Server-side Supabase client with service role key
 * Used in loaders and actions for server-to-server communication
 */
export const supabaseServer = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

/**
 * Create a Supabase client with a specific auth session
 * Used for authenticated server requests
 */
export function createAuthenticatedSupabaseClient(accessToken: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
