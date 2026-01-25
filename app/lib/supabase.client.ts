import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)"
  );
}

/**
 * Browser-side Supabase client with anon key
 * Used in client components and effects
 */
export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
