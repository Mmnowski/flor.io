import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';

import { Bell } from 'lucide-react';

interface NotificationBellProps {
  count: number;
  onClick: () => void;
  isLoading?: boolean;
}

export function NotificationBell({
  count,
  onClick,
  isLoading = false,
}: NotificationBellProps): React.ReactNode {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={isLoading}
      className="relative h-11 w-11 focus:ring-2 focus:ring-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 disabled:opacity-50"
      aria-label={`Notifications (${count})`}
    >
      <Bell className="h-5 w-5 text-gray-700 dark:text-slate-300" />
      {count > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {count}
        </Badge>
      )}
    </Button>
  );
}
