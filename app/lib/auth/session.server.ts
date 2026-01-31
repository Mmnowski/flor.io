import { createCookieSessionStorage, redirect } from 'react-router';

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error('SESSION_SECRET environment variable is required');
}

/**
 * Cookie session storage configuration
 * Stores user session (ID) in an encrypted cookie
 */
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

/**
 * Get the user ID from the session
 */
export async function getUserId(request: Request): Promise<string | null> {
  const session = await getSession(request.headers.get('Cookie'));
  return session.get('userId') ?? null;
}

/**
 * Get the user email from the session
 */
export async function getUserEmail(request: Request): Promise<string | null> {
  const session = await getSession(request.headers.get('Cookie'));
  return session.get('userEmail') ?? null;
}

/**
 * Require user to be authenticated, redirect to login if not
 */
export async function requireUserId(request: Request): Promise<string> {
  const userId = await getUserId(request);

  if (!userId) {
    throw redirect('/auth/login');
  }

  return userId;
}

/**
 * Create a session cookie for a user
 */
export async function createUserSession(
  userId: string,
  userEmail?: string,
  redirectTo = '/dashboard'
) {
  const session = await getSession();
  session.set('userId', userId);
  if (userEmail) {
    session.set('userEmail', userEmail);
  }
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

/**
 * Logout the user by destroying the session
 */
export async function logout(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  return redirect('/', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}
