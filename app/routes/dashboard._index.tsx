import { AddPlantDialog } from '~/components/add-plant-dialog';
import { EmptyState } from '~/components/empty-state';
import { PlantCard } from '~/components/plant-card';
import { RoomFilter } from '~/components/room-filter';
import { DashboardSkeleton } from '~/components/skeleton-loader';
import { Button } from '~/components/ui/button';
import { getUserPlants } from '~/lib/plants.server';
import { requireAuth } from '~/lib/require-auth.server';
import { getUserRooms } from '~/lib/rooms.server';
import type { PlantWithWatering, Room } from '~/types/plant.types';

import { useState } from 'react';
import { useLoaderData, useNavigate, useNavigation, useSearchParams } from 'react-router';

import { Leaf, Plus } from 'lucide-react';

import type { Route } from './+types/dashboard._index';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await requireAuth(request);

  // Get room filter from URL params
  const url = new URL(request.url);
  const roomId = url.searchParams.get('room');

  // Fetch plants and rooms
  const [plants, rooms] = await Promise.all([
    getUserPlants(userId, roomId || undefined),
    getUserRooms(userId),
  ]);

  return { plants, rooms, activeRoomId: roomId };
};

export default function DashboardIndex() {
  const { plants, rooms, activeRoomId } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [addPlantDialogOpen, setAddPlantDialogOpen] = useState(false);

  const isLoading = navigation.state === 'loading';

  const handleFilterChange = (newRoomId: string | null) => {
    if (newRoomId) {
      navigate(`?room=${newRoomId}`);
    } else {
      navigate('');
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">My Plants</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Track and manage your plant collection
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setAddPlantDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white focus:ring-2 focus:ring-emerald-300 whitespace-nowrap"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Plant
        </Button>
      </div>

      <AddPlantDialog open={addPlantDialogOpen} onOpenChange={setAddPlantDialogOpen} />

      {/* Room Filter */}
      {rooms.length > 0 && (
        <div className="mb-6">
          <RoomFilter
            rooms={rooms}
            activeRoomId={activeRoomId}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      {plants.length === 0 ? (
        <EmptyState
          icon={Leaf}
          title="No plants yet"
          description="Start by adding your first plant to track its watering schedule"
          actionLabel="Add Plant"
          onAction={() => navigate('/dashboard/plants/new')}
        />
      ) : (
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {plants.length} {plants.length === 1 ? 'plant' : 'plants'} in your collection
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
