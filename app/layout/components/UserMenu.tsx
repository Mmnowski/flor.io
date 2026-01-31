import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/shared/components';

import { Menu } from 'lucide-react';

interface UserMenuProps {
  /** Current user's email address */
  userEmail?: string;
}

/**
 * UserMenu - Dropdown menu displaying user info and logout option
 * Shows email and provides logout functionality
 */
export function UserMenu({ userEmail }: UserMenuProps): React.ReactNode {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 focus:ring-2 focus:ring-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800"
          aria-label="User menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2 border-b border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
            {userEmail || 'Unknown user'}
          </p>
        </div>
        <DropdownMenuItem asChild>
          <form action="/auth/logout" method="post" className="w-full">
            <button
              type="submit"
              className="w-full text-left text-sm text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-1"
            >
              Logout
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
