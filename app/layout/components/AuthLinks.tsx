import { Button } from '~/shared/components';

import { Link } from 'react-router';

export function AuthLinks(): React.ReactNode {
  return (
    <>
      <Link to="/auth/login">
        <Button className="text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-slate-900">
          Login
        </Button>
      </Link>
      <Link to="/auth/register">
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-300">
          Sign up
        </Button>
      </Link>
    </>
  );
}
