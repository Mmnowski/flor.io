import { type ReactNode, createContext, useContext, useMemo, useState } from 'react';

interface PlantFiltersContextValue {
  selectedRoomId: string | null;
  setSelectedRoomId: (roomId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'name' | 'nextWatering';
  setSortBy: (sort: 'name' | 'nextWatering') => void;
}

const PlantFiltersContext = createContext<PlantFiltersContextValue | null>(null);

/**
 * Provider component for plant filters context
 * Manages room filtering, search, and sorting state
 *
 * @example
 * export default function DashboardLayout() {
 *   return (
 *     <PlantFiltersProvider>
 *       <PlantList />
 *       <RoomFilter />
 *     </PlantFiltersProvider>
 *   );
 * }
 */
export function PlantFiltersProvider({ children }: { children: ReactNode }): React.ReactNode {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'nextWatering'>('nextWatering');

  const value = useMemo(
    () => ({
      selectedRoomId,
      setSelectedRoomId,
      searchQuery,
      setSearchQuery,
      sortBy,
      setSortBy,
    }),
    [selectedRoomId, searchQuery, sortBy]
  );

  return <PlantFiltersContext.Provider value={value}>{children}</PlantFiltersContext.Provider>;
}

/**
 * Hook to access plant filters context
 * @throws Error if used outside PlantFiltersProvider
 *
 * @example
 * function PlantList() {
 *   const { selectedRoomId, searchQuery } = usePlantFilters();
 *   // Use filters to query/display plants
 * }
 */
export function usePlantFilters(): PlantFiltersContextValue {
  const context = useContext(PlantFiltersContext);
  if (!context) {
    throw new Error('usePlantFilters must be used within PlantFiltersProvider');
  }
  return context;
}
