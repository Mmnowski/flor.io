import { DeletePlantDialog, PlantInfoSection } from '~/features/plants/components';
import { WateringButton } from '~/features/watering/components';
import { deletePlant, getPlantById } from '~/lib/plants.server';
import { requireAuth } from '~/lib/require-auth.server';
import { cn } from '~/lib/utils';
import { recordWatering } from '~/lib/watering.server';
import { Badge, Button, PlantDetailsSkeleton } from '~/shared/components';
import type { PlantWithDetails } from '~/types/plant.types';

import { useState } from 'react';
import { Link, redirect, useLoaderData, useNavigation } from 'react-router';

import { Bug, Droplet, Leaf, Leaf as LeafIcon, Pencil, Sun } from 'lucide-react';

import type { Route } from './+types/dashboard.plants.$plantId';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const userId = await requireAuth(request);
  const plantId = params.plantId;

  if (!plantId) {
    throw new Response('Not Found', { status: 404 });
  }

  const plant = await getPlantById(plantId, userId);

  if (!plant) {
    throw new Response('Not Found', { status: 404 });
  }

  return { plant };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const userId = await requireAuth(request);
  const plantId = params.plantId;

  if (!plantId) {
    throw new Response('Not Found', { status: 404 });
  }

  if (request.method === 'POST') {
    const formData = await request.formData();
    const action = formData.get('_action');

    try {
      if (action === 'water') {
        // Record watering
        await recordWatering(plantId, userId);
        // Return to trigger revalidation
        return null;
      } else if (action === 'delete') {
        // Delete plant
        await deletePlant(plantId, userId);
        return redirect('/dashboard');
      }
    } catch (error) {
      console.error('Error in plant action:', error);
      const message = error instanceof Error ? error.message : 'An error occurred';
      return { error: message };
    }
  }

  return null;
};

export default function PlantDetail() {
  const { plant } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isLoading = navigation.state === 'loading';

  if (isLoading) {
    return <PlantDetailsSkeleton />;
  }

  const getWateringColor = () => {
    if (plant.is_overdue) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
    if (plant.days_until_watering === 0) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    }
    return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
  };

  const getWateringLabel = () => {
    if (plant.is_overdue) return 'Overdue';
    if (plant.days_until_watering === 0) return 'Water Today';
    if (plant.days_until_watering === 1) return 'Tomorrow';
    return 'Upcoming';
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/dashboard">
        <Button variant="outline" className="mb-4">
          ← Back
        </Button>
      </Link>

      {/* Header with photo */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Photo */}
        <div className="rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 aspect-square">
          {plant.photo_url ? (
            <img src={plant.photo_url} alt={plant.name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 dark:from-emerald-950 dark:to-slate-800"
              role="img"
              aria-label={`No photo available for ${plant.name}`}
            >
              <Leaf className="w-24 h-24 text-emerald-600 dark:text-emerald-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Plant name and room */}
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{plant.name}</h1>
            {plant.room_name && (
              <Badge variant="outline" className="mb-6">
                {plant.room_name}
              </Badge>
            )}

            {/* Watering status */}
            <div className="mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Watering Status</p>
              <div
                className={cn(
                  'px-4 py-2 rounded-lg font-semibold inline-block',
                  getWateringColor()
                )}
              >
                {getWateringLabel()} (
                {plant.days_until_watering !== null
                  ? plant.days_until_watering < 0
                    ? `${Math.abs(plant.days_until_watering)} days overdue`
                    : `${plant.days_until_watering} days`
                  : 'Unknown'}
                )
              </div>
            </div>

            {/* Quick info */}
            <div className="space-y-2 mb-6">
              <p className="text-sm">
                <span className="text-slate-600 dark:text-slate-400">Watering Frequency:</span>
                <span className="ml-2 font-semibold text-slate-900 dark:text-white">
                  Every {plant.watering_frequency_days} days
                </span>
              </p>
              <p className="text-sm">
                <span className="text-slate-600 dark:text-slate-400">Last Watered:</span>
                <span className="ml-2 font-semibold text-slate-900 dark:text-white">
                  {formatDate(plant.last_watered_date)}
                </span>
              </p>
              <p className="text-sm">
                <span className="text-slate-600 dark:text-slate-400">Next Watering:</span>
                <span className="ml-2 font-semibold text-slate-900 dark:text-white">
                  {formatDate(plant.next_watering_date)}
                </span>
              </p>
            </div>
          </div>

          {/* Watering button */}
          <WateringButton
            plantId={plant.id}
            nextWateringDate={plant.next_watering_date}
            lastWateredDate={plant.last_watered_date}
          />
        </div>
      </div>

      {/* Info sections */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Care Information</h2>
        <div className="space-y-2">
          <PlantInfoSection
            title="Light Requirements"
            content={plant.light_requirements}
            icon={Sun}
            defaultOpen={true}
          />
          <PlantInfoSection
            title="Fertilizing Tips"
            content={plant.fertilizing_tips}
            icon={LeafIcon}
          />
          <PlantInfoSection title="Pruning Tips" content={plant.pruning_tips} icon={LeafIcon} />
          <PlantInfoSection title="Troubleshooting" content={plant.troubleshooting} icon={Bug} />
        </div>
      </div>

      {/* Watering history */}
      {plant.watering_history && plant.watering_history.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Watering History
          </h2>
          <div className="space-y-2">
            {plant.watering_history.map((history) => (
              <div
                key={history.id}
                className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <Droplet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  {formatDate(new Date(history.watered_at))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-8 border-t border-slate-200 dark:border-slate-700">
        <Link to={`/dashboard/plants/${plant.id}/edit`} className="flex-1">
          <Button className="w-full" variant="outline">
            <Pencil className="w-4 h-4 mr-2" />
            Edit Plant
          </Button>
        </Link>
        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
          Delete
        </Button>
      </div>

      <DeletePlantDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        plantName={plant.name}
        plantId={plant.id}
      />
    </div>
  );
}
