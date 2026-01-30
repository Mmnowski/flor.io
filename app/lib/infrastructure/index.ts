/**
 * Infrastructure Domain - Database and external service clients
 *
 * Provides Supabase client instances and generic database operation helpers.
 * This is the foundational layer used by all other domains.
 *
 * Note: Server-only clients and helpers are not exported from this barrel to prevent
 * server code from being bundled into the client.
 */

// Client-side Supabase client only
export { supabaseClient } from './supabase.client';
