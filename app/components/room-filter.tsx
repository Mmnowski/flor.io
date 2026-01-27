'use client';

import { CreateRoomDialog } from '~/components/create-room-dialog';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import type { Room } from '~/types/plant.types';

import { useCallback } from 'react';

interface RoomFilterProps {
  rooms: Room[];
  activeRoomId: string | null;
  onFilterChange: (roomId: string | null) => void;
  plantCounts?: Record<string, number>;
}

export function RoomFilter({
  rooms,
  activeRoomId,
  onFilterChange,
  plantCounts = {},
}: RoomFilterProps) {
  const handleRoomClick = useCallback(
    (roomId: string | null) => {
      onFilterChange(roomId);
    },
    [onFilterChange]
  );

  return (
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
        <button
          key={room.id}
          onClick={() => handleRoomClick(room.id)}
          className={cn(
            'px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0 transition-colors font-medium flex items-center gap-2',
            activeRoomId === room.id
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
          )}
        >
          {room.name}
          {plantCounts[room.id] !== undefined && (
            <Badge
              variant="secondary"
              className={cn('text-xs ml-1', activeRoomId === room.id && 'bg-white/20 text-white')}
            >
              {plantCounts[room.id]}
            </Badge>
          )}
        </button>
      ))}

      {/* Create Room button */}
      <CreateRoomDialog />
    </div>
  );
}
