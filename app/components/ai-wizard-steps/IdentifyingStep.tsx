/**
 * Step 2: Identifying
 * Loading state while AI identifies the plant
 */

import { useEffect } from "react";
import { useAIWizard } from "../ai-wizard";

interface IdentifyingStepProps {
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function IdentifyingStep({
  onComplete,
  onError,
}: IdentifyingStepProps) {
  const { state, updateState } = useAIWizard();

  useEffect(() => {
    // Simulate API call to identify plant
    const identifyPlant = async () => {
      if (!state.photoFile) {
        onError?.("No photo provided");
        return;
      }

      try {
        updateState({ isLoading: true, error: null });

        // Create FormData to send to server
        const formData = new FormData();
        formData.append("photoFile", state.photoFile);

        // In a real scenario, this would call the server action
        // const response = await fetch("/api/identify-plant", {
        //   method: "POST",
        //   body: formData,
        // });

        // For now, simulate the 2-second delay from plantnet.server.ts
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock: randomly select a plant (in real app, this comes from API)
        const mockPlants = [
          {
            scientificName: "Monstera deliciosa",
            commonNames: ["Monstera", "Swiss Cheese Plant"],
            confidence: 0.92,
          },
          {
            scientificName: "Epipremnum aureum",
            commonNames: ["Pothos", "Devil's Ivy"],
            confidence: 0.88,
          },
          {
            scientificName: "Sansevieria trifasciata",
            commonNames: ["Snake Plant", "Mother-in-law's Tongue"],
            confidence: 0.95,
          },
        ];

        const randomPlant =
          mockPlants[Math.floor(Math.random() * mockPlants.length)];

        updateState({
          identification: randomPlant,
          isLoading: false,
        });

        onComplete?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to identify plant";
        updateState({ isLoading: false, error: errorMessage });
        onError?.(errorMessage);
      }
    };

    identifyPlant();
  }, [state.photoFile, updateState, onComplete, onError]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Identifying Your Plant</h2>
        <p className="mt-2 text-gray-600">
          Please wait while AI analyzes your plant photo...
        </p>
      </div>

      {/* Loading animation */}
      <div className="flex justify-center py-12">
        <div className="space-y-6 text-center">
          {/* Spinner */}
          <div className="flex justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>

          {/* Status text */}
          <div>
            <p className="text-lg font-semibold text-gray-900">
              Analyzing your plant...
            </p>
            <p className="mt-1 text-sm text-gray-600">
              This should take about 2 seconds
            </p>
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
