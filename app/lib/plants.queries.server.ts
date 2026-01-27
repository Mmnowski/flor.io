import type { PlantWithDetails, PlantWithWatering, WateringHistory } from '~/types/plant.types';

import { MS_PER_DAY } from './constants';
import { supabaseServer } from './supabase.server';

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

    if (error) {
      return [];
    }

    // Fetch watering data and room names for all plants
    const plantsWithWatering = await Promise.all(
      ((data as any[]) || []).map(async (plant: any) => {
        const nextWateringDate = await getNextWateringDate(plant.id);
        const lastWateredDate = await getLastWateredDate(plant.id);

        // Fetch room name if room_id exists
        let roomName: string | null = null;
        if (plant.room_id) {
          const room = await supabaseServer
            .from('rooms')
            .select('name')
            .eq('id', plant.room_id)
            .single();
          roomName = (room.data as any)?.name || null;
        }

        const daysUntilWatering = nextWateringDate
          ? Math.ceil((nextWateringDate.getTime() - new Date().getTime()) / MS_PER_DAY)
          : null;

        return {
          ...plant,
          room_name: roomName,
          next_watering_date: nextWateringDate,
          last_watered_date: lastWateredDate,
          days_until_watering: daysUntilWatering,
          is_overdue: daysUntilWatering ? daysUntilWatering < 0 : false,
        } as PlantWithWatering;
      })
    );

    // Sort by next watering date (soonest first)
    return plantsWithWatering.sort((a, b) => {
      if (!a.next_watering_date) return 1;
      if (!b.next_watering_date) return -1;
      return a.next_watering_date.getTime() - b.next_watering_date.getTime();
    });
  } catch {
    return [];
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
  try {
    const { data, error } = await (supabaseServer
      .from('plants')
      .select('*')
      .eq('id', plantId)
      .eq('user_id', userId)
      .single() as any);

    if (error) {
      return null;
    }

    if (!data) {
      return null;
    }

    const plantData = data;

    // Fetch room name if room_id exists
    let roomName: string | null = null;
    if (plantData.room_id) {
      const room = await supabaseServer
        .from('rooms')
        .select('name')
        .eq('id', plantData.room_id)
        .single();
      roomName = (room.data as any)?.name || null;
    }

    // Fetch watering info
    const nextWateringDate = await getNextWateringDate(plantId);
    const lastWateredDate = await getLastWateredDate(plantId);
    const wateringHistory = await getWateringHistory(plantId, userId, 10);

    const daysUntilWatering = nextWateringDate
      ? Math.ceil((nextWateringDate.getTime() - new Date().getTime()) / MS_PER_DAY)
      : null;

    return {
      ...plantData,
      room_name: roomName,
      next_watering_date: nextWateringDate,
      last_watered_date: lastWateredDate,
      days_until_watering: daysUntilWatering,
      is_overdue: daysUntilWatering ? daysUntilWatering < 0 : false,
      watering_history: wateringHistory,
    } as PlantWithDetails;
  } catch {
    return null;
  }
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
  try {
    // Verify plant ownership
    const { data: plant, error: plantError } = await (supabaseServer
      .from('plants')
      .select('id, user_id')
      .eq('id', plantId)
      .single() as any);

    if (plantError || !plant || plant.user_id !== userId) {
      return [];
    }

    const { data, error } = await supabaseServer
      .from('watering_history')
      .select('id, plant_id, watered_at, created_at')
      .eq('plant_id', plantId)
      .order('watered_at', { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    return (data || []) as WateringHistory[];
  } catch {
    return [];
  }
}
