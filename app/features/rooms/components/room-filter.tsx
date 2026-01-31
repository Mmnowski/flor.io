'use client';

import { CreateRoomDialog, DeleteRoomDialog } from '~/features/rooms/components';
import { cn } from '~/lib';
import type { Room } from '~/types/plant.types';

import { useCallback, useState } from 'react';

import { X } from 'lucide-react';

interface RoomFilterProps {
  /** List of user's rooms */
  rooms: Room[];
  /** Currently selected room ID, or null for all plants */
  activeRoomId: string | null;
  /** Callback when room filter changes */
  onFilterChange: (roomId: string | null) => void;
  /** Plant count per room for display */
  plantCounts?: Record<string, number>;
}

/**
 * RoomFilter - Horizontal scrolling room filter chips
 * Allows filtering plants by room and creating/deleting rooms
 */
export function RoomFilter({
  rooms,
  activeRoomId,
  onFilterChange,
  plantCounts = {},
}: RoomFilterProps) {
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  const handleRoomClick = useCallback(
    (roomId: string | null) => {
      onFilterChange(roomId);
    },
    [onFilterChange]
  );

  const handleDeleteClick = useCallback((e: React.MouseEvent, room: Room) => {
    e.stopPropagation(); // Prevent room selection
    setRoomToDelete(room);
  }, []);

  const handleDeleteDialogChange = useCallback((open: boolean) => {
    if (!open) {
      setRoomToDelete(null);
    }
  }, []);

  // If no rooms, show a simplified view with just the create button
  if (rooms.length === 0) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Organize your plants by room
        </span>
        <CreateRoomDialog />
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {/* All Plants button */}
        <button
          onClick={() => handleRoomClick(null)}
          className={cn(
            'px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0 transition-colors font-medium',
            activeRoomId === null
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
          )}
        >
          All Plants
        </button>

        {/* Room chips */}
        {rooms.map((room) => (
          <div
            key={room.id}
            className={cn(
              'rounded-full whitespace-nowrap flex-shrink-0 transition-colors font-medium flex items-center',
              activeRoomId === room.id
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
            )}
          >
            <button onClick={() => handleRoomClick(room.id)} className="pl-4 pr-2 py-2">
              {room.name}
            </button>
            <button
              onClick={(e) => handleDeleteClick(e, room)}
              className={cn(
                'p-1.5 mr-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300',
                activeRoomId === room.id
                  ? 'text-white/60 hover:text-white'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200'
              )}
              aria-label={`Delete ${room.name}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Create Room button */}
        <CreateRoomDialog />
      </div>

      {/* Delete Room Dialog */}
      {roomToDelete && (
        <DeleteRoomDialog
          key={roomToDelete.id}
          room={roomToDelete}
          plantCount={plantCounts[roomToDelete.id] || 0}
          open={!!roomToDelete}
          onOpenChange={handleDeleteDialogChange}
        />
      )}
    </>
  );
}
