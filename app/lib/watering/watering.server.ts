import { callRpc, fetchMany, fetchOne, insertOne, supabaseServer } from '~/lib';
import type { WateringHistory } from '~/types/plant.types';

/**
 * Verify that a user owns a plant
 * @param plantId - Plant ID
 * @param userId - User ID
 * @returns True if user owns the plant, false otherwise
 */
async function verifyPlantOwnership(plantId: string, userId: string): Promise<boolean> {
  try {
    const plant = await fetchOne(supabaseServer, 'plants', {
      id: plantId,
    });

    return plant ? plant.user_id === userId : false;
  } catch {
    return false;
  }
}

/**
 * Record a watering event for a plant
 *
 * @param plantId - Plant ID
 * @param userId - User ID (for ownership verification)
 * @param wateredAt - Optional timestamp (defaults to now)
 * @throws {Error} If plant not found or unauthorized
 */
export async function recordWatering(
  plantId: string,
  userId: string,
  wateredAt?: Date
): Promise<void> {
  const isOwned = await verifyPlantOwnership(plantId, userId);

  if (!isOwned) {
    throw new Error('Plant not found or unauthorized');
  }

  const wateringDate = wateredAt || new Date();

  await insertOne(supabaseServer, 'watering_history', {
    plant_id: plantId,
    watered_at: wateringDate.toISOString(),
  });
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

  const records = await fetchMany(
    supabaseServer,
    'watering_history',
    { plant_id: plantId },
    {
      limit,
      orderBy: { column: 'watered_at', ascending: false },
    }
  );

  return records as WateringHistory[];
}

/**
 * Get the next watering date for a plant
 *
 * @param plantId - Plant ID
 * @returns Next watering date or null if calculation fails
 */
export async function getNextWateringDate(plantId: string): Promise<Date | null> {
  try {
    const result = await callRpc<string>(supabaseServer, 'get_next_watering_date', {
      p_plant_id: plantId,
    });

    if (!result) {
      return null;
    }

    return new Date(result);
  } catch {
    return null;
  }
}

/**
 * Get plants that need watering for a user
 *
 * @param userId - User ID
 * @returns Array of plants needing water
 */
export async function getPlantsNeedingWater(userId: string): Promise<
  Array<{
    plant_id: string;
    plant_name: string;
    photo_url: string | null;
    last_watered: string;
    next_watering: string;
    days_overdue: number;
  }>
> {
  try {
    const data = await callRpc<
      Array<{
        plant_id: string;
        plant_name: string;
        photo_url: string | null;
        last_watered: string;
        next_watering: string;
        days_overdue: number;
      }>
    >(supabaseServer, 'get_plants_needing_water', {
      p_user_id: userId,
    });

    return data || [];
  } catch {
    return [];
  }
}
