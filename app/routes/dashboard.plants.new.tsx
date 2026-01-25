import { Link, useLoaderData, useActionData, redirect } from "react-router";
import type { Route } from "./+types/dashboard.plants.new";
import { Button } from "~/components/ui/button";
import { requireAuth } from "~/lib/require-auth.server";
import { getUserRooms } from "~/lib/rooms.server";
import { createPlant } from "~/lib/plants.server";
import { processPlantImage, extractImageFromFormData, fileToBuffer } from "~/lib/image.server";
import { uploadPlantPhoto } from "~/lib/storage.server";
import { PlantForm } from "~/components/plant-form";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await requireAuth(request);
  const rooms = await getUserRooms(userId);
  return { rooms };
};

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return null;
  }

  try {
    const userId = await requireAuth(request);
    const formData = await request.formData();

    // Extract and validate required fields
    const name = formData.get("name");
    const wateringFrequencyStr = formData.get("watering_frequency_days");
    const roomId = formData.get("room_id");
    const lightRequirements = formData.get("light_requirements");
    const fertilizingTips = formData.get("fertilizing_tips");
    const pruningTips = formData.get("pruning_tips");
    const troubleshooting = formData.get("troubleshooting");

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return { error: "Plant name is required" };
    }

    const wateringFrequency = Number(wateringFrequencyStr);
    if (wateringFrequency < 1 || wateringFrequency > 365) {
      return { error: "Watering frequency must be between 1 and 365 days" };
    }

    // Extract and process photo if provided
    let photoUrl: string | null = null;
    try {
      const photoFile = await extractImageFromFormData(formData, "photo");
      if (photoFile) {
        const buffer = await fileToBuffer(photoFile);
        const processedBuffer = await processPlantImage(buffer);
        photoUrl = await uploadPlantPhoto(userId, processedBuffer, "image/jpeg");

        if (!photoUrl) {
          return { error: "Failed to upload photo. Please try again." };
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image processing failed";
      return { error: message };
    }

    // Create plant
    const plant = await createPlant(userId, {
      name: name.trim(),
      watering_frequency_days: wateringFrequency,
      photo_url: photoUrl,
      room_id: roomId && typeof roomId === "string" && roomId !== "" ? roomId : null,
      light_requirements: lightRequirements && typeof lightRequirements === "string" ? lightRequirements.trim() || null : null,
      fertilizing_tips: fertilizingTips && typeof fertilizingTips === "string" ? fertilizingTips.trim() || null : null,
      pruning_tips: pruningTips && typeof pruningTips === "string" ? pruningTips.trim() || null : null,
      troubleshooting: troubleshooting && typeof troubleshooting === "string" ? troubleshooting.trim() || null : null,
    });

    // Redirect to plant detail
    return redirect(`/dashboard/plants/${plant.id}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create plant";
    console.error("Error in create plant action:", error);
    return { error: message };
  }
};

export default function NewPlant() {
  const { rooms } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/dashboard">
        <Button variant="outline" className="mb-4">
          ← Back
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-8">Add Plant</h1>
      <PlantForm rooms={rooms} mode="create" error={actionData?.error} />
    </div>
  );
}
