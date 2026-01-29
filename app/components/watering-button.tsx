'use client';

import { Form } from 'react-router';
import { Button } from '~/components/ui/button';
import { Droplet, Check } from 'lucide-react';

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
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <Form method="post" className="w-full">
        <input type="hidden" name="_action" value="water" />
        <Button
          type="submit"
          size="lg"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          <Droplet className="w-5 h-5 mr-2" />
          Record Watering
        </Button>
      </Form>

      {lastWateredDate && (
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Check className="w-4 h-4 text-emerald-600" />
            Last watered: {formatDate(lastWateredDate)}
          </div>
        </div>
      )}

      {nextWateringDate && (
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          Next watering: {formatDate(nextWateringDate)}
        </div>
      )}
    </div>
  );
}
