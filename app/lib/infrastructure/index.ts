/**
 * Infrastructure Domain - Database and external service clients
 *
 * Provides Supabase client instances and generic database operation helpers.
 * This is the foundational layer used by all other domains.
 */

// Supabase clients
export { supabaseServer, createAuthenticatedSupabaseClient } from './supabase.server';
export { supabaseClient } from './supabase.client';

// Database helpers
export * from './supabase-helpers';
