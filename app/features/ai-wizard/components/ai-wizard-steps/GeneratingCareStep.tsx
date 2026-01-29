/**
 * Step 4: Generating Care Instructions
 * Loading state while AI generates care instructions for the identified plant
 * Includes timeout and retry support
 */
import { parseError, withTimeout } from '~/lib';
import { Alert, AlertDescription } from '~/shared/components/ui/alert';
import { Button } from '~/shared/components/ui/button';

import { useEffect, useState } from 'react';

import { useAIWizard } from '../ai-wizard';

interface GeneratingCareStepProps {
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const GENERATE_TIMEOUT_MS = 45000; // 45 second timeout for care generation

export function GeneratingCareStep({ onComplete, onError }: GeneratingCareStepProps) {
  const { state, updateState, incrementRetry } = useAIWizard();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Generate care instructions
    const generateCare = async () => {
      const plantName = state.manualPlantName || state.identification?.commonNames[0];

      if (!plantName) {
        onError?.('No plant name provided');
        return;
      }

      try {
        updateState({ isLoading: true, error: null });

        // Simulate the 3-second delay from openai.server.ts with timeout
        const apiCall = new Promise<void>((resolve) => {
          setTimeout(resolve, 3000);
        });

        await withTimeout(
          apiCall,
          GENERATE_TIMEOUT_MS,
          'Care instruction generation took too long'
        );

        // Mock: return care instructions based on plant name
        const mockCareData = {
          wateringFrequencyDays: 7,
          lightRequirements: 'Bright indirect light, 6-8 hours daily. Avoid direct sun.',
          fertilizingTips: [
            'Fertilize every 4-6 weeks during growing season',
            'Use balanced liquid fertilizer diluted to half strength',
            'Reduce fertilizing in fall and winter',
          ],
          pruningTips: [
            'Prune yellow or damaged leaves at the base',
            'Trim aerial roots if they become unruly',
            'Best time to prune is spring or early summer',
          ],
          troubleshooting: [
            'Yellow leaves: Usually overwatering or too much direct sun',
            'Brown leaf tips: Low humidity or underwatering',
            'Slow growth: Insufficient light or nutrients',
          ],
        };

        updateState({
          careInstructions: mockCareData,
          isLoading: false,
          retryCount: 0,
        });

        onComplete?.();
      } catch (error) {
        const errorInfo = parseError(error);
        updateState({
          isLoading: false,
          error: errorInfo.userMessage,
        });
        onError?.(errorInfo.userMessage);
        setIsRetrying(false);
      }
    };

    if (!isRetrying) {
      generateCare();
    }
  }, [state.manualPlantName, state.identification, updateState, onComplete, onError, isRetrying]);

  const plantName = state.manualPlantName || state.identification?.commonNames[0] || 'plant';

  const handleRetry = () => {
    setIsRetrying(true);
    incrementRetry();
    setTimeout(() => setIsRetrying(false), 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Generating Care Instructions</h2>
        <p className="mt-2 text-gray-600">
          Please wait while AI generates personalized care instructions for your{' '}
          <strong>{plantName}</strong>...
        </p>
      </div>

      {/* Error state */}
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription className="space-y-3">
            <p>{state.error}</p>
            {state.retryCount < 3 && (
              <Button onClick={handleRetry} variant="outline" size="sm" className="mt-2">
                Try Again
              </Button>
            )}
            {state.retryCount >= 3 && (
              <p className="text-sm text-red-700">
                Maximum retry attempts reached. Please try again later.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading animation */}
      {!state.error && (
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
              <p className="text-lg font-semibold text-gray-900">Creating care instructions...</p>
              <p className="mt-1 text-sm text-gray-600">This should take about 3 seconds</p>
              {state.retryCount > 0 && (
                <p className="mt-2 text-xs text-amber-600">Attempt {state.retryCount + 1}/3</p>
              )}
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
      )}

      {/* Cancel button */}
      {!state.error && (
        <div className="flex justify-center">
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
            onClick={() => {
              updateState({ error: 'Cancelled by user' });
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
