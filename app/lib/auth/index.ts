/**
 * Auth Domain - User authentication and session management
 *
 * Handles user registration, login, session management, and route protection.
 */

// Session management
export {
  sessionStorage,
  getSession,
  commitSession,
  destroySession,
  getUserId,
  requireUserId,
  createUserSession,
  logout,
} from './session.server';

// Authentication
export { registerUser, loginUser, getUserById, getUserByEmail } from './auth.server';

// Route protection
export { requireAuth } from './require-auth.server';
