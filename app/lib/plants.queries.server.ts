import type { PlantWithDetails, PlantWithWatering, WateringHistory } from '~/types/plant.types';

import { MS_PER_DAY } from './constants';
import { supabaseServer } from './supabase.server';

/**
 * Fetch room name from database
 * @param roomId - Room ID
 * @returns Room name or null if not found
 */
async function fetchRoomName(roomId: string): Promise<string | null> {
  try {
    const room = await supabaseServer.from('rooms').select('name').eq('id', roomId).single();
    return (room.data as any)?.name || null;
  } catch {
    return null;
  }
}

/**
 * Calculate days until next watering
 * @param nextWateringDate - Next watering date
 * @returns Days until watering or null if date is null
 */
function calculateDaysUntilWatering(nextWateringDate: Date | null): number | null {
  if (!nextWateringDate) {
    return null;
  }
  return Math.ceil((nextWateringDate.getTime() - new Date().getTime()) / MS_PER_DAY);
}

/**
 * Enrich a plant with watering information
 * @param plant - Raw plant data
 * @returns Plant with watering information
 */
async function enrichSinglePlant(plant: any): Promise<PlantWithWatering> {
  const nextWateringDate = await getNextWateringDate(plant.id);
  const lastWateredDate = await getLastWateredDate(plant.id);
  const roomName = plant.room_id ? await fetchRoomName(plant.room_id) : null;
  const daysUntilWatering = calculateDaysUntilWatering(nextWateringDate);

  return {
    ...plant,
    room_name: roomName,
    next_watering_date: nextWateringDate,
    last_watered_date: lastWateredDate,
    days_until_watering: daysUntilWatering,
    is_overdue: daysUntilWatering ? daysUntilWatering < 0 : false,
  } as PlantWithWatering;
}

/**
 * Fetch user plants from database
 * @param userId - User ID
 * @param roomId - Optional room ID filter
 * @returns Array of raw plant data
 */
async function fetchUserPlantsFromDB(userId: string, roomId?: string | null): Promise<any[]> {
  try {
    let query: any = supabaseServer
      .from('plants')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (roomId) {
      query = query.eq('room_id', roomId);
    }

    const { data, error } = await query.order('updated_at', {
      ascending: false,
    });

    return error ? [] : (data as any[]) || [];
  } catch {
    return [];
  }
}

/**
 * Sort plants by watering date (soonest first)
 * @param plants - Array of plants with watering info
 * @returns Sorted array
 */
function sortByWateringDate(plants: PlantWithWatering[]): PlantWithWatering[] {
  return plants.sort((a, b) => {
    if (!a.next_watering_date) return 1;
    if (!b.next_watering_date) return -1;
    return a.next_watering_date.getTime() - b.next_watering_date.getTime();
  });
}

/**
 * Get all plants for a user, optionally filtered by room
 * Includes watering status information
 *
 * @param userId - User ID
 * @param roomId - Optional room ID filter
 * @returns Array of plants with watering information
 */
export async function getUserPlants(
  userId: string,
  roomId?: string | null
): Promise<PlantWithWatering[]> {
  const plants = await fetchUserPlantsFromDB(userId, roomId);
  const plantsWithWatering = await Promise.all(plants.map(enrichSinglePlant));
  return sortByWateringDate(plantsWithWatering);
}

/**
 * Fetch plant by ID from database
 * @param plantId - Plant ID
 * @param userId - User ID (for ownership verification)
 * @returns Plant data or null if not found
 */
async function fetchPlantFromDB(plantId: string, userId: string): Promise<any | null> {
  try {
    const { data, error } = await (supabaseServer
      .from('plants')
      .select('*')
      .eq('id', plantId)
      .eq('user_id', userId)
      .single() as any);

    return error || !data ? null : data;
  } catch {
    return null;
  }
}

/**
 * Get a specific plant by ID with full details
 * Includes watering history
 *
 * @param plantId - Plant ID
 * @param userId - User ID (for ownership verification)
 * @returns Plant with details or null if not found
 */
export async function getPlantById(
  plantId: string,
  userId: string
): Promise<PlantWithDetails | null> {
  const plantData = await fetchPlantFromDB(plantId, userId);
  if (!plantData) {
    return null;
  }

  const basePlant = await enrichSinglePlant(plantData);
  const wateringHistory = await getWateringHistory(plantId, userId, 10);

  return {
    ...basePlant,
    watering_history: wateringHistory,
  } as PlantWithDetails;
}

/**
 * Get next watering date for a plant
 *
 * @param plantId - Plant ID
 * @returns Next watering date or null
 */
export async function getNextWateringDate(plantId: string): Promise<Date | null> {
  try {
    const { data, error } = await (supabaseServer as any).rpc('get_next_watering_date', {
      p_plant_id: plantId,
    });

    if (error) {
      return null;
    }

    if (!data) {
      return null;
    }

    return new Date(data);
  } catch {
    return null;
  }
}

/**
 * Get last watered date for a plant
 *
 * @param plantId - Plant ID
 * @returns Last watered date or null
 */
export async function getLastWateredDate(plantId: string): Promise<Date | null> {
  try {
    const { data, error } = await (supabaseServer
      .from('watering_history')
      .select('watered_at, id')
      .eq('plant_id', plantId)
      .order('watered_at', { ascending: false })
      .limit(1)
      .single() as any);

    if (error || !data) {
      return null;
    }

    return new Date(data.watered_at);
  } catch {
    return null;
  }
}

/**
 * Verify that a user owns a plant
 * @param plantId - Plant ID
 * @param userId - User ID
 * @returns True if user owns the plant, false otherwise
 */
async function verifyPlantOwnership(plantId: string, userId: string): Promise<boolean> {
  try {
    const { data: plant, error } = await (supabaseServer
      .from('plants')
      .select('id, user_id')
      .eq('id', plantId)
      .single() as any);

    return !error && plant && plant.user_id === userId;
  } catch {
    return false;
  }
}

/**
 * Get watering history for a plant
 *
 * @param plantId - Plant ID
 * @param userId - User ID (for ownership verification)
 * @param limit - Maximum number of records to fetch (default: 10)
 * @returns Array of watering history records
 */
export async function getWateringHistory(
  plantId: string,
  userId: string,
  limit: number = 10
): Promise<WateringHistory[]> {
  const isOwned = await verifyPlantOwnership(plantId, userId);

  if (!isOwned) {
    return [];
  }

  try {
    const { data, error } = await supabaseServer
      .from('watering_history')
      .select('id, plant_id, watered_at, created_at')
      .eq('plant_id', plantId)
      .order('watered_at', { ascending: false })
      .limit(limit);

    return error ? [] : ((data || []) as WateringHistory[]);
  } catch {
    return [];
  }
}
