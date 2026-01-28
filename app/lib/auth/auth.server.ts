import { supabaseServer } from '../infrastructure/supabase.server';

/**
 * Register a new user with email and password
 */
export async function registerUser(email: string, password: string) {
  const { data, error } = await supabaseServer.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email for MVP
  });

  if (error) {
    throw new Error(`Failed to register: ${error.message}`);
  }

  return data.user;
}

/**
 * Login a user with email and password
 */
export async function loginUser(email: string, password: string) {
  const { data, error } = await supabaseServer.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to login: ${error.message}`);
  }

  return data.session;
}

/**
 * Get a user by their ID
 */
export async function getUserById(userId: string) {
  const { data, error } = await supabaseServer.auth.admin.getUserById(userId);

  if (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }

  return data.user;
}

/**
 * Get a user by their email
 */
export async function getUserByEmail(email: string) {
  const { data, error } = await supabaseServer.auth.admin.listUsers();

  if (error) {
    throw new Error(`Failed to list users: ${error.message}`);
  }

  return data.users.find((u) => u.email === email);
}
