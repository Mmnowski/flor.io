import type { Route } from ".react-router/types/app/routes/api.notifications";
import { requireAuth } from "~/lib/require-auth.server";
import { getPlantsNeedingWater } from "~/lib/watering.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await requireAuth(request);

  try {
    const plantsNeedingWater = await getPlantsNeedingWater(userId);

    return {
      notifications: plantsNeedingWater,
      count: plantsNeedingWater.length,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      notifications: [],
      count: 0,
    };
  }
};
