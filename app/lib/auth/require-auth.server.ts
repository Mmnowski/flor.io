import { redirect } from 'react-router';

import { getUserId } from './session.server';

/**
 * Loader utility that requires user authentication
 * Redirects to login if not authenticated
 */
export async function requireAuth(request: Request) {
  const userId = await getUserId(request);

  if (!userId) {
    throw redirect('/auth/login?redirectTo=' + new URL(request.url).pathname);
  }

  return userId;
}
