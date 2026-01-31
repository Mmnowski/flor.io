'use client';

import { cn } from '~/lib';
import { Badge } from '~/shared/components/ui/badge';
import { Card } from '~/shared/components/ui/card';
import type { PlantWithWatering } from '~/types/plant.types';

import { useMemo } from 'react';
import { Link } from 'react-router';

import { Droplet, Droplets, Leaf } from 'lucide-react';

interface PlantCardProps {
  /** Plant data including watering status */
  plant: PlantWithWatering;
}

/**
 * PlantCard - Displays a plant in the dashboard grid
 * Shows photo, name, room, watering amount and status badges
 */
export function PlantCard({ plant }: PlantCardProps) {
  const wateringColor = useMemo(() => {
    if (plant.is_overdue) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (plant.days_until_watering === 0)
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
  }, [plant.is_overdue, plant.days_until_watering]);

  const wateringText = useMemo(() => {
    if (plant.is_overdue) return `${Math.abs(plant.days_until_watering || 0)} days overdue`;
    if (plant.days_until_watering === 0) return 'Water today';
    if (plant.days_until_watering === 1) return 'Tomorrow';
    return `In ${plant.days_until_watering} days`;
  }, [plant.is_overdue, plant.days_until_watering]);

  const wateringAmountBadge = useMemo(() => {
    switch (plant.watering_amount) {
      case 'low':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs font-medium">
            <Droplet className="w-3 h-3" />
            <span>Light</span>
          </div>
        );
      case 'mid':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs font-medium">
            <Droplet className="w-3 h-3" />
            <span>Moderate</span>
          </div>
        );
      case 'heavy':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-medium">
            <Droplets className="w-3 h-3" />
            <span>Heavy</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 text-xs font-medium">
            <Droplet className="w-3 h-3" />
            <span>Unknown</span>
          </div>
        );
    }
  }, [plant.watering_amount]);

  return (
    <Link to={`/dashboard/plants/${plant.id}`}>
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow hover:scale-102">
        {/* Photo */}
        <div className="relative aspect-square bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 rounded-t-xl">
          {plant.photo_url ? (
            <img
              src={plant.photo_url}
              alt={plant.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 dark:from-emerald-950 dark:to-slate-800"
              role="img"
              aria-label={`No photo available for ${plant.name}`}
            >
              <Leaf className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 flex flex-col flex-grow">
          {/* Plant name */}
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2">
            {plant.name}
          </h3>

          {/* Room and watering amount badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {plant.room_name && (
              <Badge variant="outline" className="text-xs">
                {plant.room_name}
              </Badge>
            )}
            {wateringAmountBadge}
          </div>

          {/* Watering status */}
          <div className="mt-auto">
            <div
              className={cn('px-3 py-2 rounded-md text-sm font-medium text-center', wateringColor)}
            >
              {wateringText}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
