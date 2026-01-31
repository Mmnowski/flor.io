/**
 * Step 2: Identifying
 * Loading state while AI identifies the plant with timeout and retry support
 */
import { fileToBase64 } from '~/lib/file';
import { Alert, AlertDescription } from '~/shared/components/ui/alert';
import { Button } from '~/shared/components/ui/button';

import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';

import { useAIWizard } from '../ai-wizard';

interface IdentifyingStepProps {
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function IdentifyingStep({ onComplete, onError }: IdentifyingStepProps) {
  const { state, updateState, incrementRetry } = useAIWizard();
  const [isRetrying, setIsRetrying] = useState(false);
  const fetcher = useFetcher();

  // Submit identification request when photo is ready
  useEffect(() => {
    const photoFile = state.photoFile;
    if (!photoFile || isRetrying || state.isLoading) {
      return;
    }

    // Submit identification request
    updateState({ isLoading: true, error: null });

    // Convert file to base64 and submit
    fileToBase64(photoFile)
      .then((base64Data) => {
        const formData = new FormData();
        formData.append('_action', 'identify-plant');
        formData.append('plantImageBase64', base64Data);
        formData.append('plantImageName', photoFile.name);

        fetcher.submit(formData, { method: 'POST' });
      })
      .catch(() => {
        updateState({ isLoading: false, error: 'Failed to read file' });
      });
    // Only re-run when photo or retry state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.photoFile, isRetrying]);

  // Handle fetcher response separately
  useEffect(() => {
    if (!fetcher.data) {
      return;
    }

    if (fetcher.data.error) {
      updateState({
        isLoading: false,
        error: fetcher.data.error,
      });
      onError?.(fetcher.data.error);
      setIsRetrying(false);
      return;
    }

    if (fetcher.data.identification) {
      updateState({
        identification: fetcher.data.identification,
        isLoading: false,
        retryCount: 0,
      });
      onComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data]);

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
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-500" />
            </div>

            {/* Status text */}
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Analyzing your plant...
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                This should take about 2 seconds
              </p>
              {state.retryCount > 0 && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  Attempt {state.retryCount + 1}/3
                </p>
              )}
            </div>

            {/* Progress bar */}
            <div className="mx-auto w-full max-w-xs rounded-full bg-gray-200 dark:bg-slate-700">
              <div className="h-1 w-full animate-pulse rounded-full bg-emerald-600 dark:bg-emerald-500" />
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
