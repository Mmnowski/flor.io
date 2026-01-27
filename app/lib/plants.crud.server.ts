import type { Plant, PlantInsertData, PlantUpdateData } from '~/types/plant.types';

import { deletePlantPhoto } from './storage.server';
import { supabaseServer } from './supabase.server';

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

  const { data: plant, error } = await (supabaseServer
    .from('plants')
    .insert({
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
    } as any)
    .select()
    .single() as any);

  if (error) {
    throw new Error('Failed to create plant');
  }

  return plant as Plant;
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
  // Verify ownership
  const existing = await (supabaseServer
    .from('plants')
    .select('id, user_id')
    .eq('id', plantId)
    .single() as any);

  if (existing.error || existing.data?.user_id !== userId) {
    throw new Error('Plant not found or unauthorized');
  }

  // Prepare update data
  const updateData: any = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  // Validate watering frequency if provided
  if (
    updateData.watering_frequency_days &&
    (updateData.watering_frequency_days < 1 || updateData.watering_frequency_days > 365)
  ) {
    throw new Error('Watering frequency must be between 1 and 365 days');
  }

  const updateQuery = (supabaseServer as any)
    .from('plants')
    .update(updateData)
    .eq('id', plantId)
    .select()
    .single();

  const { data: plant, error } = await updateQuery;

  if (error) {
    throw new Error('Failed to update plant');
  }

  return plant as Plant;
}

/**
 * Delete a plant and its photo
 *
 * @param plantId - Plant ID
 * @param userId - User ID (for ownership verification)
 * @throws {Error} If deletion fails or unauthorized
 */
export async function deletePlant(plantId: string, userId: string): Promise<void> {
  // Get plant to verify ownership and get photo URL
  const { data, error: fetchError } = await (supabaseServer
    .from('plants')
    .select('id, user_id, photo_url')
    .eq('id', plantId)
    .single() as any);

  if (fetchError || data?.user_id !== userId) {
    throw new Error('Plant not found or unauthorized');
  }

  // Delete photo from storage if exists
  if (data?.photo_url) {
    await deletePlantPhoto(data.photo_url);
  }

  // Delete plant (cascades to watering_history)
  const { error: deleteError } = await (supabaseServer
    .from('plants')
    .delete()
    .eq('id', plantId) as any);

  if (deleteError) {
    throw new Error('Failed to delete plant');
  }
}
