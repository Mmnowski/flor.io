import { requireAuth } from '~/lib/require-auth.server';
import { getPlantsNeedingWater } from '~/lib/watering.server';
import { logger } from '~/shared/lib/logger';

import type { Route } from '.react-router/types/app/routes/api.notifications';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await requireAuth(request);

  try {
    const plantsNeedingWater = await getPlantsNeedingWater(userId);

    return {
      notifications: plantsNeedingWater,
      count: plantsNeedingWater.length,
    };
  } catch (error) {
    logger.error('Error fetching notifications', error);
    return {
      notifications: [],
      count: 0,
    };
  }
};
