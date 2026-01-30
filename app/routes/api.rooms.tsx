/**
 * Rooms API Endpoint
 *
 * Provides CRUD operations for room management:
 * - GET: Fetch all rooms for authenticated user
 * - POST: Create new room
 * - PATCH: Update room name
 * - DELETE: Delete room
 */
import { roomNameSchema } from '~/lib';
import { requireAuth } from '~/lib/auth/require-auth.server';
import {
  countPlantsInRoom,
  createRoom,
  deleteRoom,
  getRoomById,
  getUserRooms,
  updateRoom,
} from '~/lib/rooms/rooms.server';
import { logger } from '~/shared/lib/logger';

import type { Route } from './+types/api.rooms';

export const loader = async ({ request }: Route.LoaderArgs) => {
  if (request.method !== 'GET') {
    throw new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const userId = await requireAuth(request);
    const rooms = await getUserRooms(userId);
    return { rooms };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch rooms';
    throw new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};

export const action = async ({ request }: Route.ActionArgs) => {
  const userId = await requireAuth(request);

  try {
    const formData = await request.formData();
    const method = (formData.get('_method') as string) || request.method;

    switch (method) {
      case 'POST': {
        // Create new room
        const name = String(formData.get('name'));

        // Validate room name
        const validation = roomNameSchema.safeParse(name);
        if (!validation.success) {
          throw new Response(
            JSON.stringify({
              error: validation.error.issues[0]?.message || 'Invalid room name',
            }),
            { status: 400 }
          );
        }

        const room = await createRoom(userId, validation.data);
        return new Response(JSON.stringify({ room }), { status: 201 });
      }

      case 'PATCH': {
        // Update room name
        const roomId = String(formData.get('roomId'));
        const name = String(formData.get('name'));

        // Verify room ownership
        const room = await getRoomById(roomId, userId);
        if (!room) {
          throw new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
        }

        // Validate new name
        const validation = roomNameSchema.safeParse(name);
        if (!validation.success) {
          throw new Response(
            JSON.stringify({
              error: validation.error.issues[0]?.message || 'Invalid room name',
            }),
            { status: 400 }
          );
        }

        const updated = await updateRoom(roomId, validation.data);
        return { room: updated };
      }

      case 'DELETE': {
        // Delete room
        const roomId = String(formData.get('roomId'));

        // Verify room ownership
        const room = await getRoomById(roomId, userId);
        if (!room) {
          throw new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
        }

        // Check if room has plants
        const plantCount = await countPlantsInRoom(roomId, userId);
        if (plantCount > 0) {
          throw new Response(
            JSON.stringify({
              error: `Cannot delete room with ${plantCount} plant${plantCount !== 1 ? 's' : ''}. Move plants to another room first.`,
            }),
            { status: 400 }
          );
        }

        await deleteRoom(roomId);
        return { success: true };
      }

      default:
        throw new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Operation failed';
    logger.error('Room API error', error);
    throw new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
