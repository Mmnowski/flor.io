import { deleteOne, fetchMany, fetchOne, insertOne, supabaseServer, updateOne } from '~/lib';
import type { Room } from '~/types/plant.types';

/**
 * Get all rooms for a user
 *
 * @param userId - User ID
 * @returns Array of rooms ordered by name
 */
export async function getUserRooms(userId: string): Promise<Room[]> {
  try {
    const rooms = await fetchMany(
      supabaseServer,
      'rooms',
      { user_id: userId },
      { orderBy: { column: 'name', ascending: true } }
    );

    return rooms as Room[];
  } catch {
    return [];
  }
}

/**
 * Get a specific room by ID, verifying ownership
 *
 * @param roomId - Room ID
 * @param userId - User ID
 * @returns Room object or null if not found
 */
export async function getRoomById(roomId: string, userId: string): Promise<Room | null> {
  try {
    const room = await fetchOne(supabaseServer, 'rooms', {
      id: roomId,
      user_id: userId,
    });

    return (room || null) as Room | null;
  } catch {
    return null;
  }
}

/**
 * Count plants in a room for a specific user
 *
 * @param roomId - Room ID
 * @param userId - User ID
 * @returns Number of plants in room
 */
export async function countPlantsInRoom(roomId: string, userId: string): Promise<number> {
  try {
    const { count, error } = await supabaseServer
      .from('plants')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) {
      return 0;
    }

    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Create a new room for a user
 *
 * @param userId - User ID
 * @param name - Room name
 * @returns Created room
 * @throws {Error} If creation fails
 */
export async function createRoom(userId: string, name: string): Promise<Room> {
  const room = await insertOne(supabaseServer, 'rooms', {
    user_id: userId,
    name,
  });

  return room as Room;
}

/**
 * Update room name
 *
 * @param roomId - Room ID
 * @param name - New room name
 * @returns Updated room
 * @throws {Error} If update fails
 */
export async function updateRoom(roomId: string, name: string): Promise<Room> {
  const room = await updateOne(supabaseServer, 'rooms', { id: roomId }, { name });

  return room as Room;
}

/**
 * Delete a room
 *
 * @param roomId - Room ID
 * @throws {Error} If deletion fails
 */
export async function deleteRoom(roomId: string): Promise<void> {
  await deleteOne(supabaseServer, 'rooms', { id: roomId });
}
