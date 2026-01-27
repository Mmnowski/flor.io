import type { WateringHistory } from '~/types/plant.types';

import { supabaseServer } from './supabase.server';

/**
 * Record a watering event for a plant
 * @param plantId - Plant ID
 * @param userId - User ID (for ownership verification)
 * @param wateredAt - Optional timestamp (defaults to now)
 */
export async function recordWatering(
  plantId: string,
  userId: string,
  wateredAt?: Date
): Promise<void> {
  try {
    // Verify plant ownership
    const { data: plant, error: plantError } = await (supabaseServer
      .from('plants')
      .select('id, user_id')
      .eq('id', plantId)
      .single() as any);

    if (plantError || !plant || plant.user_id !== userId) {
      throw new Error('Plant not found or unauthorized');
    }

    const wateringDate = wateredAt || new Date();

    const { error } = await (supabaseServer.from('watering_history').insert({
      plant_id: plantId,
      watered_at: wateringDate.toISOString(),
    } as any) as any);

    if (error) {
      console.error('Failed to record watering:', error);
      throw new Error('Failed to record watering');
    }
  } catch (error) {
    console.error('Error recording watering:', error);
    throw error;
  }
}

/**
 * Get watering history for a plant
 * @param plantId - Plant ID
 * @param userId - User ID (for ownership verification)
 * @param limit - Maximum number of records to fetch
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

    const { data, error } = await (supabaseServer
      .from('watering_history')
      .select('id, plant_id, watered_at, created_at')
      .eq('plant_id', plantId)
      .order('watered_at', { ascending: false })
      .limit(limit) as any);

    if (error) {
      console.error('Failed to fetch watering history:', error);
      return [];
    }

    return (data || []) as WateringHistory[];
  } catch (error) {
    console.error('Error fetching watering history:', error);
    return [];
  }
}

/**
 * Get the next watering date for a plant
 * @param plantId - Plant ID
 * @returns Next watering date or null
 */
export async function getNextWateringDate(plantId: string): Promise<Date | null> {
  try {
    const { data, error } = await (supabaseServer as any).rpc('get_next_watering_date', {
      p_plant_id: plantId,
    });

    if (error) {
      console.error('Failed to get next watering date:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return new Date(data);
  } catch (error) {
    console.error('Error getting next watering date:', error);
    return null;
  }
}

/**
 * Get plants that need watering for a user
 * @param userId - User ID
 * @returns Array of plants needing water
 */
export async function getPlantsNeedingWater(userId: string): Promise<any[]> {
  try {
    const { data, error } = await (supabaseServer as any).rpc('get_plants_needing_water', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Failed to get plants needing water:', error);
      return [];
    }

    return (data || []) as any[];
  } catch (error) {
    console.error('Error getting plants needing water:', error);
    return [];
  }
}
