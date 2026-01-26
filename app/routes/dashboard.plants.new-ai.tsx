/**
 * AI Plant Creation Wizard Route
 *
 * Multi-step wizard for creating plants with AI assistance.
 * Entry point: /dashboard/plants/new-ai
 * Flow: Upload → Identify → Confirm → Generate → Preview → Feedback → Success
 */

import { redirect, type Route } from "react-router";
import { requireAuth } from "~/lib/require-auth.server";
import {
  checkAIGenerationLimit,
  checkPlantLimit,
  incrementAIUsage,
} from "~/lib/usage-limits.server";
import { AIWizardPage } from "~/components/AIWizardPage";
import { getUserRooms } from "~/lib/rooms.server";
import { createAIPlant, recordAIFeedback } from "~/lib/plants.server";
import { uploadPlantPhoto } from "~/lib/storage.server";
import { processPlantImage } from "~/lib/image.server";

export const meta: Route.MetaFunction = () => [
  { title: "Create Plant with AI - Flor" },
];

/**
 * Loader validates authentication and limits before entering wizard
 */
export const loader: Route.LoaderFunction = async ({ request }) => {
  const userId = await requireAuth(request);

  // Check if user can create plants
  const plantLimitStatus = await checkPlantLimit(userId);
  if (!plantLimitStatus.allowed) {
    throw new Error(
      `Plant limit reached: ${plantLimitStatus.limit} max plants`
    );
  }

  // Check if user can use AI
  const aiLimitStatus = await checkAIGenerationLimit(userId);
  if (!aiLimitStatus.allowed) {
    throw new Error(
      `AI generation limit reached: ${aiLimitStatus.limit} per month`
    );
  }

  // Get user's rooms for dropdown
  const rooms = await getUserRooms(userId);

  return {
    userId,
    aiRemaining: aiLimitStatus.limit - aiLimitStatus.used,
    rooms: rooms || [],
  };
};

/**
 * Action handler processes form submissions from wizard steps
 * Handles plant creation and feedback recording
 */
export const action: Route.ActionFunction = async ({ request }) => {
  const userId = await requireAuth(request);
  const formData = await request.formData();
  const action = formData.get("_action") as string;

  // Validate action parameter
  if (!action) {
    return { error: "Invalid action" };
  }

  try {
    switch (action) {
      case "save-plant": {
        // Parse plant data from form
        const name = formData.get("name") as string;
        const wateringFrequencyDays = parseInt(
          formData.get("wateringFrequencyDays") as string,
          10
        );
        const lightRequirements = formData.get("lightRequirements") as string;
        const roomId = formData.get("roomId") as string | null;

        // Parse array fields (fertilizingTips, pruningTips, troubleshooting)
        const fertilizingTips = JSON.parse(
          formData.get("fertilizingTips") as string
        );
        const pruningTips = JSON.parse(
          formData.get("pruningTips") as string
        );
        const troubleshooting = JSON.parse(
          formData.get("troubleshooting") as string
        );

        // Handle photo if provided
        let photoUrl: string | null = null;
        const photoFile = formData.get("photoFile") as File | null;

        if (photoFile && photoFile.size > 0) {
          // Read file as buffer
          const buffer = Buffer.from(await photoFile.arrayBuffer());

          // Process image (compress, resize)
          const processedBuffer = await processPlantImage(buffer);

          // Upload to storage
          const filename = `${userId}/${Date.now()}-${name.replace(/\s+/g, "-")}.jpg`;
          photoUrl = await uploadPlantPhoto(filename, processedBuffer);
        }

        // Create plant with AI flag
        const plant = await createAIPlant(userId, {
          name,
          watering_frequency_days: wateringFrequencyDays,
          light_requirements: lightRequirements,
          fertilizing_tips: fertilizingTips,
          pruning_tips: pruningTips,
          troubleshooting: troubleshooting,
          photo_url: photoUrl,
          room_id: roomId || null,
        });

        // Increment AI usage
        await incrementAIUsage(userId);

        return {
          success: true,
          plantId: plant.id,
        };
      }

      case "save-feedback": {
        // Parse feedback data
        const plantId = formData.get("plantId") as string;
        const feedbackType = formData.get("feedbackType") as
          | "thumbs_up"
          | "thumbs_down";
        const comment = formData.get("comment") as string | null;
        const aiResponseSnapshot = JSON.parse(
          formData.get("aiResponseSnapshot") as string
        );

        // Record feedback
        await recordAIFeedback(
          userId,
          plantId,
          feedbackType,
          comment || "",
          aiResponseSnapshot
        );

        // Redirect to plant details
        return redirect(`/dashboard/plants/${plantId}`);
      }

      default:
        return { error: "Unknown action" };
    }
  } catch (error) {
    console.error("Wizard action error:", error);
    return {
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
};

/**
 * Component renders the AI wizard UI
 */
export default function AIWizardRoute({
  loaderData,
}: Route.ComponentProps) {
  const handleComplete = (plantId: string) => {
    // Navigate to plant details page
    window.location.href = `/dashboard/plants/${plantId}`;
  };

  return (
    <AIWizardPage
      userId={loaderData.userId}
      aiRemaining={loaderData.aiRemaining}
      rooms={loaderData.rooms}
      onComplete={handleComplete}
    />
  );
}
