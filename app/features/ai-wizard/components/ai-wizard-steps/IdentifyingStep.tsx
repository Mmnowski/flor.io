/**
 * Step 2: Identifying
 * Loading state while AI identifies the plant with timeout and retry support
 */
import { parseError, withTimeout } from '~/lib';
import { Alert, AlertDescription } from '~/shared/components/ui/alert';
import { Button } from '~/shared/components/ui/button';

import { useEffect, useState } from 'react';

import { useAIWizard } from '../ai-wizard';

interface IdentifyingStepProps {
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const IDENTIFY_TIMEOUT_MS = 30000; // 30 second timeout for identification

export function IdentifyingStep({ onComplete, onError }: IdentifyingStepProps) {
  const { state, updateState, incrementRetry } = useAIWizard();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Simulate API call to identify plant
    const identifyPlant = async () => {
      if (!state.photoFile) {
        onError?.('No photo provided');
        return;
      }

      try {
        updateState({ isLoading: true, error: null });

        // Simulate the 2-second delay from plantnet.server.ts with timeout
        const apiCall = new Promise<void>((resolve) => {
          setTimeout(resolve, 2000);
        });

        await withTimeout(apiCall, IDENTIFY_TIMEOUT_MS, 'Plant identification took too long');

        // Mock: randomly select a plant (in real app, this comes from API)
        const mockPlants = [
          {
            scientificName: 'Monstera deliciosa',
            commonNames: ['Monstera', 'Swiss Cheese Plant'],
            confidence: 0.92,
          },
          {
            scientificName: 'Epipremnum aureum',
            commonNames: ['Pothos', "Devil's Ivy"],
            confidence: 0.88,
          },
          {
            scientificName: 'Sansevieria trifasciata',
            commonNames: ['Snake Plant', "Mother-in-law's Tongue"],
            confidence: 0.95,
          },
        ];

        const randomPlant = mockPlants[Math.floor(Math.random() * mockPlants.length)];

        updateState({
          identification: randomPlant,
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
      identifyPlant();
    }
  }, [state.photoFile, updateState, onComplete, onError, isRetrying]);

  const handleRetry = () => {
    setIsRetrying(true);
    incrementRetry();
    setTimeout(() => setIsRetrying(false), 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Identifying Your Plant</h2>
        <p className="mt-2 text-gray-600">Please wait while AI analyzes your plant photo...</p>
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
                Maximum retry attempts reached. Please try a different photo.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading animation */}
      {!state.error && (
        <div className="flex justify-center py-12">
          <div className="space-y-6 text-center">
            {/* Spinner */}
            <div className="flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            </div>

            {/* Status text */}
            <div>
              <p className="text-lg font-semibold text-gray-900">Analyzing your plant...</p>
              <p className="mt-1 text-sm text-gray-600">This should take about 2 seconds</p>
              {state.retryCount > 0 && (
                <p className="mt-2 text-xs text-amber-600">Attempt {state.retryCount + 1}/3</p>
              )}
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
