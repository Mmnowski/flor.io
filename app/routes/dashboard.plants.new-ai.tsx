/**
 * AI Plant Creation Wizard Route
 *
 * Multi-step wizard for creating plants with AI assistance.
 * Entry point: /dashboard/plants/new-ai
 * Flow: Upload → Identify → Confirm → Generate → Preview → Feedback → Success
 */

import { type Route } from "react-router";
import { requireUserId } from "~/lib/require-auth.server";
import { checkAIGenerationLimit, checkPlantLimit } from "~/lib/usage-limits.server";
import { AIWizardPage } from "~/components/AIWizardPage";
import { getUserRooms } from "~/lib/rooms.server";

export const meta: Route.MetaFunction = () => [
  { title: "Create Plant with AI - Flor" },
];

/**
 * Loader validates authentication and limits before entering wizard
 */
export const loader: Route.LoaderFunction = async (args) => {
  const userId = await requireUserId(args);

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
 * Each step is identified by the `step` parameter in FormData
 */
export const action: Route.ActionFunction = async (args) => {
  const userId = await requireUserId(args);
  const formData = await args.request.formData();
  const step = formData.get("step") as string;

  // Validate step parameter
  if (!step) {
    return { error: "Invalid step" };
  }

  // Route to appropriate handler based on step
  switch (step) {
    case "upload": {
      // Step 1: Validate uploaded image
      // Future: Parse and validate image file
      return { success: true, step: "identify" };
    }

    case "identify": {
      // Step 2: Call PlantNet API (mocked)
      // Future: Actual identification
      return { success: true, step: "confirm" };
    }

    case "generate": {
      // Step 4: Call OpenAI API (mocked)
      // Future: Actual care generation
      return { success: true, step: "preview" };
    }

    case "save": {
      // Step 5-6: Save plant and feedback
      // Future: Create plant record, save AI snapshot, record feedback
      return { success: true, plantId: null };
    }

    default:
      return { error: "Unknown step" };
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
