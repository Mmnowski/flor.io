import { useCallback, useEffect } from 'react';
import { useFetcher } from 'react-router';

/**
 * Handle plant watering action
 * Manages submission, loading state, and success/error callbacks
 *
 * @param onSuccess - Callback fired when watering succeeds
 * @returns Watering action state and handler
 *
 * @example
 * const { waterPlant, isWatering, error } = useWateringAction(() => {
 *   refetchNotifications();
 *   toast.success('Plant watered!');
 * });
 *
 * return (
 *   <button onClick={() => waterPlant(plantId)} disabled={isWatering}>
 *     {isWatering ? 'Watering...' : 'Water Plant'}
 *   </button>
 * );
 */
export function useWateringAction(onSuccess?: () => void): {
  waterPlant: (plantId: string) => void;
  isWatering: boolean;
  error: string | undefined;
} {
  const fetcher = useFetcher<{ success?: boolean; error?: string }>();

  const waterPlant = useCallback(
    (plantId: string) => {
      fetcher.submit(
        {},
        {
          method: 'post',
          action: `/api/water/${plantId}`,
        }
      );
    },
    [fetcher]
  );

  // Call success callback when request completes
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      onSuccess?.();
    }
  }, [fetcher.state, fetcher.data, onSuccess]);

  return {
    waterPlant,
    isWatering: fetcher.state === 'submitting',
    error: fetcher.data?.error,
  };
}
