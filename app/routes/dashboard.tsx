import { requireAuth } from '~/lib/require-auth.server';

import { Outlet } from 'react-router';

import type { Route } from './+types/dashboard';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await requireAuth(request);
  return { userId };
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      <Outlet />
    </div>
  );
}
