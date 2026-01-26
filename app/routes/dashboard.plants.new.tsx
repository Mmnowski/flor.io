import { Link, useLoaderData, useActionData, redirect } from "react-router";
import type { Route } from "./+types/dashboard.plants.new";
import { Button } from "~/components/ui/button";
import { requireAuth } from "~/lib/require-auth.server";
import { getUserRooms } from "~/lib/rooms.server";
import { createPlant } from "~/lib/plants.server";
import { processPlantImage, extractImageFromFormData, fileToBuffer } from "~/lib/image.server";
import { uploadPlantPhoto } from "~/lib/storage.server";
import { plantFormSchema } from "~/lib/validation";
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

    // Extract fields
    const data = {
      name: String(formData.get("name")),
      watering_frequency_days: Number(formData.get("watering_frequency_days")),
      room_id: formData.get("room_id"),
      light_requirements: formData.get("light_requirements"),
      fertilizing_tips: formData.get("fertilizing_tips"),
      pruning_tips: formData.get("pruning_tips"),
      troubleshooting: formData.get("troubleshooting"),
    };

    // Server-side validation using Zod
    const validation = plantFormSchema.safeParse(data);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return {
        error: Object.values(errors)[0]?.[0] || "Validation failed",
        fieldErrors: errors,
      };
    }

    const validatedData = validation.data;

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
      name: validatedData.name,
      watering_frequency_days: validatedData.watering_frequency_days,
      photo_url: photoUrl,
      room_id: validatedData.room_id || null,
      light_requirements: validatedData.light_requirements || null,
      fertilizing_tips: validatedData.fertilizing_tips || null,
      pruning_tips: validatedData.pruning_tips || null,
      troubleshooting: validatedData.troubleshooting || null,
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
      <PlantForm rooms={rooms} mode="create" error={actionData?.error} fieldErrors={actionData?.fieldErrors} />
    </div>
  );
}
