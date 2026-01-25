'use client';

import { Link } from 'react-router';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Leaf } from 'lucide-react';
import { cn } from '~/lib/utils';
import type { PlantWithWatering } from '~/types/plant.types';

interface PlantCardProps {
  plant: PlantWithWatering;
}

export function PlantCard({ plant }: PlantCardProps) {
  const getWateringColor = () => {
    if (plant.is_overdue) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (plant.days_until_watering === 0)
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
  };

  const getWateringText = () => {
    if (plant.is_overdue) return `${Math.abs(plant.days_until_watering || 0)} days overdue`;
    if (plant.days_until_watering === 0) return 'Water today';
    if (plant.days_until_watering === 1) return 'Tomorrow';
    return `In ${plant.days_until_watering} days`;
  };

  return (
    <Link to={`/dashboard/plants/${plant.id}`}>
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow hover:scale-102">
        {/* Photo */}
        <div className="relative aspect-video bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
          {plant.photo_url ? (
            <img
              src={plant.photo_url}
              alt={plant.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 dark:from-emerald-950 dark:to-slate-800">
              <Leaf className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Plant name */}
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2">
            {plant.name}
          </h3>

          {/* Room badge */}
          {plant.room_name && (
            <Badge variant="outline" className="w-fit mb-3 text-xs">
              {plant.room_name}
            </Badge>
          )}

          {/* Watering status */}
          <div className="mt-auto">
            <div className={cn('px-3 py-2 rounded-md text-sm font-medium text-center', getWateringColor())}>
              {getWateringText()}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
