import {
  AddPlantDialog,
  PlantCard,
  type SortOption,
  SortSelector,
} from '~/features/plants/components';
import { RoomFilter } from '~/features/rooms/components';
import { requireAuth } from '~/lib/auth/require-auth.server';
import { getUserPlants } from '~/lib/plants/queries.server';
import { getUserRooms } from '~/lib/rooms/rooms.server';
import { Button, DashboardSkeleton, EmptyState } from '~/shared/components';
import type { PlantWithWatering, Room } from '~/types/plant.types';

import { useMemo, useState } from 'react';
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
  const [sortBy, setSortBy] = useState<SortOption>('watering');

  // Only show skeleton when navigating TO the dashboard, not away from it
  const isNavigatingToDashboard =
    navigation.state === 'loading' && navigation.location?.pathname === '/dashboard';

  const handleFilterChange = (newRoomId: string | null) => {
    if (newRoomId) {
      navigate(`?room=${newRoomId}`);
    } else {
      navigate('');
    }
  };

  // Sort plants based on selected option
  const sortedPlants = useMemo(() => {
    const sorted = [...plants];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Sort by watering: overdue first, then by days until watering
      sorted.sort((a, b) => {
        const aDays = a.days_until_watering ?? Infinity;
        const bDays = b.days_until_watering ?? Infinity;
        return aDays - bDays;
      });
    }
    return sorted;
  }, [plants, sortBy]);

  if (isNavigatingToDashboard) {
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {plants.length} {plants.length === 1 ? 'plant' : 'plants'} in your collection
            </p>
            <SortSelector activeSort={sortBy} onSortChange={setSortBy} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
