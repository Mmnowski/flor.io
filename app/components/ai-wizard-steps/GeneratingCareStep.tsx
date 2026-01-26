/**
 * Step 4: Generating Care Instructions
 * Loading state while AI generates care instructions for the identified plant
 */

import { useEffect } from "react";
import { useAIWizard } from "../ai-wizard";

interface GeneratingCareStepProps {
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function GeneratingCareStep({
  onComplete,
  onError,
}: GeneratingCareStepProps) {
  const { state, updateState } = useAIWizard();

  useEffect(() => {
    // Generate care instructions
    const generateCare = async () => {
      const plantName =
        state.manualPlantName || state.identification?.commonNames[0];

      if (!plantName) {
        onError?.("No plant name provided");
        return;
      }

      try {
        updateState({ isLoading: true, error: null });

        // In a real scenario, this would call the server action
        // const response = await fetch("/api/generate-care", {
        //   method: "POST",
        //   body: JSON.stringify({ plantName }),
        // });

        // For now, simulate the 3-second delay from openai.server.ts
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Mock: return care instructions based on plant name
        const mockCareData = {
          wateringFrequencyDays: 7,
          lightRequirements:
            "Bright indirect light, 6-8 hours daily. Avoid direct sun.",
          fertilizingTips: [
            "Fertilize every 4-6 weeks during growing season",
            "Use balanced liquid fertilizer diluted to half strength",
            "Reduce fertilizing in fall and winter",
          ],
          pruningTips: [
            "Prune yellow or damaged leaves at the base",
            "Trim aerial roots if they become unruly",
            "Best time to prune is spring or early summer",
          ],
          troubleshooting: [
            "Yellow leaves: Usually overwatering or too much direct sun",
            "Brown leaf tips: Low humidity or underwatering",
            "Slow growth: Insufficient light or nutrients",
          ],
        };

        updateState({
          careInstructions: mockCareData,
          isLoading: false,
        });

        onComplete?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to generate care instructions";
        updateState({ isLoading: false, error: errorMessage });
        onError?.(errorMessage);
      }
    };

    generateCare();
  }, [state.manualPlantName, state.identification, updateState, onComplete, onError]);

  const plantName =
    state.manualPlantName || state.identification?.commonNames[0] || "plant";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Generating Care Instructions</h2>
        <p className="mt-2 text-gray-600">
          Please wait while AI generates personalized care instructions for your{" "}
          <strong>{plantName}</strong>...
        </p>
      </div>

      {/* Loading animation */}
      <div className="flex justify-center py-12">
        <div className="space-y-6 text-center">
          {/* Animated plant icon */}
          <div className="flex justify-center">
            <div className="relative h-24 w-24">
              {/* Rotating leaves */}
              <svg
                className="absolute inset-0 h-24 w-24 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                  fill="currentColor"
                  className="text-gray-300"
                />
                <path
                  d="M12 6v6l5 3"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="text-blue-600"
                />
              </svg>

              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
            </div>
          </div>

          {/* Status text */}
          <div>
            <p className="text-lg font-semibold text-gray-900">
              Creating care instructions...
            </p>
            <p className="mt-1 text-sm text-gray-600">
              This should take about 3 seconds
            </p>
          </div>

          {/* Progress indicators */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">Analyzing plant type</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600">Generating instructions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-300" />
              <span className="text-sm text-gray-400">Preparing preview</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mx-auto w-full max-w-xs rounded-full bg-gray-200">
            <div className="h-1 w-full animate-pulse rounded-full bg-blue-600" />
          </div>
        </div>
      </div>

      {/* Cancel button */}
      <div className="flex justify-center">
        <button
          type="button"
          className="text-sm text-gray-500 hover:text-gray-700 underline"
          onClick={() => {
            updateState({ error: "Cancelled by user" });
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
