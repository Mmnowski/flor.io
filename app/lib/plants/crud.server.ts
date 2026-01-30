import { deleteOne, fetchOne, insertOne, updateOne } from '~/lib/infrastructure/supabase-helpers';
import { supabaseServer } from '~/lib/infrastructure/supabase.server';
import { deletePlantPhoto } from '~/lib/storage/storage.server';
import type { Plant, PlantInsertData, PlantUpdateData } from '~/types/plant.types';

/**
 * Create a new plant
 *
 * @param userId - User ID
 * @param data - Plant data
 * @returns Created plant
 * @throws {Error} If creation fails
 */
export async function createPlant(userId: string, data: PlantInsertData): Promise<Plant> {
  // Validate required fields
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    throw new Error('Plant name is required');
  }

  if (
    !data.watering_frequency_days ||
    data.watering_frequency_days < 1 ||
    data.watering_frequency_days > 365
  ) {
    throw new Error('Watering frequency must be between 1 and 365 days');
  }

  try {
    const plant = await insertOne(supabaseServer, 'plants', {
      user_id: userId,
      name: data.name.trim(),
      photo_url: data.photo_url || null,
      watering_frequency_days: data.watering_frequency_days,
      room_id: data.room_id || null,
      light_requirements: data.light_requirements || null,
      fertilizing_tips: data.fertilizing_tips || null,
      pruning_tips: data.pruning_tips || null,
      troubleshooting: data.troubleshooting || null,
      created_with_ai: false,
    });

    return plant as Plant;
  } catch (error) {
    throw new Error(
      `Failed to create plant: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Update a plant
 *
 * @param plantId - Plant ID
 * @param userId - User ID (for ownership verification)
 * @param data - Partial plant data to update
 * @returns Updated plant
 * @throws {Error} If update fails or unauthorized
 */
export async function updatePlant(
  plantId: string,
  userId: string,
  data: PlantUpdateData
): Promise<Plant> {
  try {
    // Verify ownership
    const existing = await fetchOne(supabaseServer, 'plants', {
      id: plantId,
    });

    if (!existing || existing.user_id !== userId) {
      throw new Error('Plant not found or unauthorized');
    }

    // Validate watering frequency if provided
    if (
      data.watering_frequency_days &&
      (data.watering_frequency_days < 1 || data.watering_frequency_days > 365)
    ) {
      throw new Error('Watering frequency must be between 1 and 365 days');
    }

    const plant = await updateOne(supabaseServer, 'plants', { id: plantId }, data);

    return plant as Plant;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Plant not found')) {
      throw error;
    }
    throw new Error(
      `Failed to update plant: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete a plant and its photo
 *
 * @param plantId - Plant ID
 * @param userId - User ID (for ownership verification)
 * @throws {Error} If deletion fails or unauthorized
 */
export async function deletePlant(plantId: string, userId: string): Promise<void> {
  try {
    // Get plant to verify ownership and get photo URL
    const plant = await fetchOne(supabaseServer, 'plants', {
      id: plantId,
    });

    if (!plant || plant.user_id !== userId) {
      throw new Error('Plant not found or unauthorized');
    }

    // Delete photo from storage if exists
    if (plant.photo_url) {
      await deletePlantPhoto(plant.photo_url);
    }

    // Delete plant (cascades to watering_history)
    await deleteOne(supabaseServer, 'plants', { id: plantId });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Plant not found')) {
      throw error;
    }
    throw new Error(
      `Failed to delete plant: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
