import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { cn } from '~/lib/utils';

import { useState } from 'react';
import { Link } from 'react-router';

import { Droplet, Leaf } from 'lucide-react';

export interface PlantNeedingWater {
  plant_id: string;
  plant_name: string;
  photo_url: string | null;
  last_watered: string;
  next_watering: string;
  days_overdue: number;
}

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: PlantNeedingWater[];
  onWatered: (plantId: string) => void;
  isLoading?: boolean;
}

export function NotificationsModal({
  open,
  onOpenChange,
  notifications,
  onWatered,
  isLoading = false,
}: NotificationsModalProps) {
  const [wateredPlantIds, setWateredPlantIds] = useState<Set<string>>(new Set());

  const handleWatered = (plantId: string) => {
    setWateredPlantIds((prev) => new Set(prev).add(plantId));
    onWatered(plantId);
  };

  const displayNotifications = notifications.filter((n) => !wateredPlantIds.has(n.plant_id));

  const getStatusText = (daysOverdue: number) => {
    if (daysOverdue > 0) {
      return `Overdue by ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}`;
    }
    return 'Due today';
  };

  const getStatusColor = (daysOverdue: number) => {
    if (daysOverdue > 0) {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-amber-600 dark:text-amber-400';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[60vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Plants Needing Water
          </DialogTitle>
          <DialogDescription>
            {displayNotifications.length === 0
              ? 'All caught up! 🌱'
              : `${displayNotifications.length} plant${displayNotifications.length === 1 ? '' : 's'} need${displayNotifications.length === 1 ? 's' : ''} watering`}
          </DialogDescription>
        </DialogHeader>

        {displayNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Leaf className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mb-4 opacity-50" />
            <p className="text-slate-600 dark:text-slate-400">
              All caught up! Your plants are happy and hydrated.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-4 space-y-3">
            {displayNotifications.map((notification) => (
              <div
                key={notification.plant_id}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Plant Photo */}
                <Link
                  to={`/dashboard/plants/${notification.plant_id}`}
                  onClick={() => onOpenChange(false)}
                  className="flex-shrink-0"
                >
                  {notification.photo_url ? (
                    <img
                      src={notification.photo_url}
                      alt={notification.plant_name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Leaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                </Link>

                {/* Plant Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/dashboard/plants/${notification.plant_id}`}
                    onClick={() => onOpenChange(false)}
                    className="font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors block truncate"
                  >
                    {notification.plant_name}
                  </Link>
                  <p
                    className={cn('text-sm font-medium', getStatusColor(notification.days_overdue))}
                  >
                    {getStatusText(notification.days_overdue)}
                  </p>
                </div>

                {/* Watered Button */}
                <Button
                  onClick={() => handleWatered(notification.plant_id)}
                  disabled={isLoading}
                  className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  <Droplet className="h-4 w-4 mr-1" />
                  Watered
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
