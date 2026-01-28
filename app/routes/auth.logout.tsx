import { logout } from '~/lib';

import type { Route } from './+types/auth.logout';

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== 'POST') {
    throw new Response('Method not allowed', { status: 405 });
  }
  return logout(request);
};
