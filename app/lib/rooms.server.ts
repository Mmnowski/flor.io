import { supabaseServer } from './supabase.server';
import type { Room } from '~/types/plant.types';

/**
 * Get all rooms for a user
 * @param userId - User ID
 * @returns Array of rooms ordered by name
 */
export async function getUserRooms(userId: string): Promise<Room[]> {
  try {
    const { data, error } = await supabaseServer
      .from('rooms')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Failed to fetch rooms:', error);
      return [];
    }

    return (data || []) as Room[];
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
}

/**
 * Get a specific room by ID, verifying ownership
 * @param roomId - Room ID
 * @param userId - User ID
 * @returns Room object or null if not found
 */
export async function getRoomById(
  roomId: string,
  userId: string
): Promise<Room | null> {
  try {
    const { data, error } = await supabaseServer
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Failed to fetch room:', error);
      return null;
    }

    return (data || null) as Room | null;
  } catch (error) {
    console.error('Error fetching room:', error);
    return null;
  }
}

/**
 * Count plants in a room for a specific user
 * @param roomId - Room ID
 * @param userId - User ID
 * @returns Number of plants in room
 */
export async function countPlantsInRoom(
  roomId: string,
  userId: string
): Promise<number> {
  try {
    const { count, error } = await supabaseServer
      .from('plants')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to count plants:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error counting plants:', error);
    return 0;
  }
}
