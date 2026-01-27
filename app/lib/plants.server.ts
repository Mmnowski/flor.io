import type {
  Plant,
  PlantInsertData,
  PlantUpdateData,
  PlantWithDetails,
  PlantWithWatering,
  WateringHistory,
} from '~/types/plant.types';

import { deletePlantPhoto } from './storage.server';
import { supabaseServer } from './supabase.server';

/**
 * Get all plants for a user, optionally filtered by room
 * Includes watering status information
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
      console.error('Failed to fetch plants:', error);
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
          ? Math.ceil((nextWateringDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
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
  } catch (error) {
    console.error('Error fetching plants:', error);
    return [];
  }
}

/**
 * Get a specific plant by ID with full details
 * Includes watering history
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
      console.error('Failed to fetch plant:', error);
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
      ? Math.ceil((nextWateringDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
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
  } catch (error) {
    console.error('Error fetching plant:', error);
    return null;
  }
}

/**
 * Create a new plant
 * @param userId - User ID
 * @param data - Plant data
 * @returns Created plant
 */
export async function createPlant(userId: string, data: PlantInsertData): Promise<Plant> {
  try {
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
      console.error('Failed to create plant:', error);
      throw new Error('Failed to create plant');
    }

    return plant as Plant;
  } catch (error) {
    console.error('Error creating plant:', error);
    throw error;
  }
}

/**
 * Update a plant
 * @param plantId - Plant ID
 * @param userId - User ID (for ownership verification)
 * @param data - Partial plant data to update
 * @returns Updated plant
 */
export async function updatePlant(
  plantId: string,
  userId: string,
  data: PlantUpdateData
): Promise<Plant> {
  try {
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
      console.error('Failed to update plant:', error);
      throw new Error('Failed to update plant');
    }

    return plant as Plant;
  } catch (error) {
    console.error('Error updating plant:', error);
    throw error;
  }
}

/**
 * Delete a plant and its photo
 * @param plantId - Plant ID
 * @param userId - User ID (for ownership verification)
 */
export async function deletePlant(plantId: string, userId: string): Promise<void> {
  try {
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
      console.error('Failed to delete plant:', deleteError);
      throw new Error('Failed to delete plant');
    }
  } catch (error) {
    console.error('Error deleting plant:', error);
    throw error;
  }
}

/**
 * Get next watering date for a plant
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
 * Get last watered date for a plant
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
  } catch (error) {
    console.error('Error getting last watered date:', error);
    return null;
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

    const { data, error } = await supabaseServer
      .from('watering_history')
      .select('id, plant_id, watered_at, created_at')
      .eq('plant_id', plantId)
      .order('watered_at', { ascending: false })
      .limit(limit);

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
 * Create a plant from AI identification
 * Similar to createPlant but with created_with_ai=true and response snapshot
 * @param userId - User ID
 * @param data - Plant data including care instructions
 * @param aiResponseSnapshot - Original AI response for feedback/analytics
 * @returns Created plant with ID
 */
export async function createAIPlant(
  userId: string,
  data: PlantInsertData & { care_response_snapshot?: Record<string, any> }
): Promise<Plant> {
  try {
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
        created_with_ai: true, // Mark as AI-created
      } as any)
      .select()
      .single() as any);

    if (error) {
      console.error('Failed to create AI plant:', error);
      throw new Error('Failed to create plant');
    }

    return plant as Plant;
  } catch (error) {
    console.error('Error creating AI plant:', error);
    throw error;
  }
}

/**
 * Record AI feedback for a plant
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
    const { data: plant, error: plantError } = await (supabaseServer
      .from('plants')
      .select('id, user_id')
      .eq('id', plantId)
      .single() as any);

    if (plantError || !plant || plant.user_id !== userId) {
      throw new Error('Plant not found or access denied');
    }

    const { error } = await supabaseServer.from('ai_feedback').insert({
      user_id: userId,
      plant_id: plantId,
      feedback_type: feedbackType,
      comment: comment.trim() || null,
      ai_response_snapshot: aiResponseSnapshot || null,
    });

    if (error) {
      console.error('Failed to record feedback:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error recording AI feedback:', error);
    return false;
  }
}
