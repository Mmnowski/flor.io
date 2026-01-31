import { fetchOne, insertOne } from '~/lib/infrastructure/supabase-helpers';
import { supabaseServer } from '~/lib/infrastructure/supabase.server';
import { logger } from '~/shared/lib/logger';
import type { Plant, PlantInsertData } from '~/types/plant.types';

/**
 * Create a plant from AI identification
 * Similar to createPlant but with created_with_ai=true
 *
 * @param userId - User ID
 * @param data - Plant data including care instructions
 * @returns Created plant with ID
 * @throws {Error} If creation fails
 */
export async function createAIPlant(
  userId: string,
  data: PlantInsertData & { care_response_snapshot?: Record<string, any> }
): Promise<Plant> {
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
      created_with_ai: true, // Mark as AI-created
    });

    return plant as Plant;
  } catch (error) {
    throw new Error(
      `Failed to create plant: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Record AI feedback for a plant
 *
 * @param userId - User ID
 * @param plantId - Plant ID
 * @param feedbackType - 'thumbs_up' or 'thumbs_down'
 * @param comment - Optional user comment
 * @param aiResponseSnapshot - AI response that was given
 * @returns Success boolean
 */
export async function recordAIFeedback(
  userId: string,
  plantId: string,
  feedbackType: 'thumbs_up' | 'thumbs_down',
  comment: string = '',
  aiResponseSnapshot?: Record<string, any>
): Promise<boolean> {
  try {
    // Verify plant ownership
    const plant = await fetchOne(supabaseServer, 'plants', {
      id: plantId,
    });

    if (!plant || plant.user_id !== userId) {
      throw new Error('Plant not found or access denied');
    }

    await insertOne(supabaseServer, 'ai_feedback', {
      user_id: userId,
      plant_id: plantId,
      feedback_type: feedbackType,
      comment: comment.trim() || null,
      ai_response_snapshot: aiResponseSnapshot || null,
    });

    return true;
  } catch {
    return false;
  }
}
