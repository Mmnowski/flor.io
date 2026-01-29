import type { Route } from ".react-router/types/app/routes/api.water.$plantId";
import { requireAuth } from "~/lib/require-auth.server";
import { recordWatering } from "~/lib/watering.server";
import { getPlantById } from "~/lib/plants.server";

export const action = async ({ request, params }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return { error: "Method not allowed" };
  }

  const userId = await requireAuth(request);
  const plantId = params.plantId;

  if (!plantId) {
    return { error: "Plant ID is required" };
  }

  try {
    // Verify plant ownership
    const plant = await getPlantById(plantId, userId);
    if (!plant) {
      return { error: "Plant not found" };
    }

    // Record the watering
    await recordWatering(plantId, userId);

    return { success: true, plantId };
  } catch (error) {
    console.error("Error recording watering:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to record watering",
    };
  }
};
