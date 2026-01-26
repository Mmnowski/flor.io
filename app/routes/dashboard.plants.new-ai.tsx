/**
 * AI Plant Creation Wizard Route
 *
 * Multi-step wizard for creating plants with AI assistance.
 * Entry point: /dashboard/plants/new-ai
 * Flow: Upload → Identify → Confirm → Generate → Preview → Feedback → Success
 */

import { redirect, type Route } from "react-router";
import { requireUserId } from "~/lib/require-auth.server";
import { checkAIGenerationLimit, checkPlantLimit } from "~/lib/usage-limits.server";

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
    return {
      error: "Plant limit reached",
      message: `You've reached the limit of ${plantLimitStatus.limit} plants`,
      redirect: "/dashboard",
    };
  }

  // Check if user can use AI
  const aiLimitStatus = await checkAIGenerationLimit(userId);
  if (!aiLimitStatus.allowed) {
    return {
      error: "AI limit reached",
      message: `You've used all ${aiLimitStatus.limit} AI generations this month`,
      resetDate: aiLimitStatus.resetsOn,
      redirect: "/dashboard",
    };
  }

  return {
    userId,
    aiRemaining: aiLimitStatus.limit - aiLimitStatus.used,
    plantCount: plantLimitStatus.count,
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
export default function AIWizardPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  // Check for redirect needed (limits exceeded)
  if (loaderData.redirect) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">{loaderData.error}</h1>
          <p className="mt-2 text-gray-600">{loaderData.message}</p>
          {loaderData.resetDate && (
            <p className="mt-2 text-sm text-gray-500">
              Resets on {new Date(loaderData.resetDate).toLocaleDateString()}
            </p>
          )}
          <a
            href="/dashboard"
            className="mt-4 inline-block bg-blue-500 px-4 py-2 text-white rounded"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold">Identify Your Plant</h1>
      <p className="mt-2 text-gray-600">
        Upload a photo and let AI identify your plant and generate care instructions
      </p>

      {/* Usage indicator */}
      {loaderData.aiRemaining && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            AI generations remaining this month: {loaderData.aiRemaining}/20
          </p>
        </div>
      )}

      {/* Wizard will be rendered here by step component */}
      <div className="mt-8">
        <p className="text-center text-gray-500">
          Wizard steps component goes here
        </p>
      </div>
    </div>
  );
}
