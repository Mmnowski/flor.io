/**
 * Rooms API Endpoint
 *
 * Provides CRUD operations for room management:
 * - GET: Fetch all rooms for authenticated user
 * - POST: Create new room
 * - PATCH: Update room name
 * - DELETE: Delete room
 */

import { json, type Route } from 'react-router';
import { requireAuth } from '~/lib/require-auth.server';
import {
  getUserRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  countPlantsInRoom,
} from '~/lib/rooms.server';
import { roomNameSchema } from '~/lib/validation';

export const loader = async ({ request }: Route.LoaderArgs) => {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const userId = await requireAuth(request);
    const rooms = await getUserRooms(userId);
    return json({ rooms });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch rooms';
    return json({ error: message }, { status: 500 });
  }
};

export const action = async ({ request }: Route.ActionArgs) => {
  const userId = await requireAuth(request);

  try {
    const formData = await request.formData();
    const method = formData.get('_method') as string || request.method;

    switch (method) {
      case 'POST': {
        // Create new room
        const name = String(formData.get('name'));

        // Validate room name
        const validation = roomNameSchema.safeParse(name);
        if (!validation.success) {
          return json(
            { error: validation.error.flatten().fieldErrors.name?.[0] || 'Invalid room name' },
            { status: 400 }
          );
        }

        const room = await createRoom(userId, validation.data);
        return json({ room }, { status: 201 });
      }

      case 'PATCH': {
        // Update room name
        const roomId = String(formData.get('roomId'));
        const name = String(formData.get('name'));

        // Verify room ownership
        const room = await getRoomById(roomId, userId);
        if (!room) {
          return json({ error: 'Room not found' }, { status: 404 });
        }

        // Validate new name
        const validation = roomNameSchema.safeParse(name);
        if (!validation.success) {
          return json(
            { error: validation.error.flatten().fieldErrors.name?.[0] || 'Invalid room name' },
            { status: 400 }
          );
        }

        const updated = await updateRoom(roomId, validation.data);
        return json({ room: updated });
      }

      case 'DELETE': {
        // Delete room
        const roomId = String(formData.get('roomId'));

        // Verify room ownership
        const room = await getRoomById(roomId, userId);
        if (!room) {
          return json({ error: 'Room not found' }, { status: 404 });
        }

        // Check if room has plants
        const plantCount = await countPlantsInRoom(roomId, userId);
        if (plantCount > 0) {
          return json(
            {
              error: `Cannot delete room with ${plantCount} plant${plantCount !== 1 ? 's' : ''}. Move plants to another room first.`,
            },
            { status: 400 }
          );
        }

        await deleteRoom(roomId);
        return json({ success: true });
      }

      default:
        return json({ error: 'Method not allowed' }, { status: 405 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    console.error('Room API error:', error);
    return json({ error: message }, { status: 500 });
  }
};
