import { requireAuth } from '~/lib/auth';
import { getPlantById } from '~/lib/plants';
import { recordWatering } from '~/lib/watering';
import { logger } from '~/shared/lib/logger';

import type { Route } from './+types/api.water.$plantId';

export const action = async ({ request, params }: Route.ActionArgs) => {
  if (request.method !== 'POST') {
    return { error: 'Method not allowed' };
  }

  const userId = await requireAuth(request);
  const plantId = params.plantId;

  if (!plantId) {
    return { error: 'Plant ID is required' };
  }

  try {
    // Verify plant ownership
    const plant = await getPlantById(plantId, userId);
    if (!plant) {
      return { error: 'Plant not found' };
    }

    // Record the watering
    await recordWatering(plantId, userId);

    return { success: true, plantId };
  } catch (error) {
    logger.error('Error recording watering', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to record watering',
    };
  }
};
