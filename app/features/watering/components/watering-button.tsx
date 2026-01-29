'use client';

import { Button } from '~/shared/components/ui/button';

import { useState } from 'react';
import { useFetcher } from 'react-router';

import { Check, Droplet } from 'lucide-react';

interface WateringButtonProps {
  plantId: string;
  nextWateringDate: Date | null;
  lastWateredDate: Date | null;
}

export function WateringButton({
  plantId,
  nextWateringDate,
  lastWateredDate,
}: WateringButtonProps) {
  const fetcher = useFetcher();
  const [optimisticLastWatered, setOptimisticLastWatered] = useState<Date | null>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleWater = () => {
    // Optimistic UI: show the current date as last watered immediately
    setOptimisticLastWatered(new Date());

    const formData = new FormData();
    formData.append('_action', 'water');
    fetcher.submit(formData, {
      method: 'POST',
      action: `/dashboard/plants/${plantId}`,
    });
  };

  const isSubmitting = fetcher.state === 'submitting';
  const displayLastWatered = optimisticLastWatered || lastWateredDate;

  return (
    <div className="space-y-4">
      <Button
        onClick={handleWater}
        disabled={isSubmitting}
        size="lg"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-60"
      >
        <Droplet className="w-5 h-5 mr-2" />
        {isSubmitting ? 'Recording...' : 'Record Watering'}
      </Button>

      {displayLastWatered && (
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Check className="w-4 h-4 text-emerald-600" />
            Last watered: {formatDate(displayLastWatered)}
            {optimisticLastWatered && <span className="text-xs text-emerald-600"> (pending)</span>}
          </div>
        </div>
      )}

      {nextWateringDate && !optimisticLastWatered && (
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          Next watering: {formatDate(nextWateringDate)}
        </div>
      )}
    </div>
  );
}
