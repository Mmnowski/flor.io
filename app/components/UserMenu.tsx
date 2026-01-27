import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

import { Menu } from 'lucide-react';

interface UserMenuProps {
  userEmail?: string;
}

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
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem disabled>
          <span className="text-xs text-gray-500 dark:text-slate-400 truncate">{userEmail}</span>
        </DropdownMenuItem>
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
