'use client';

import { Button } from '~/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/shared/components/ui/dialog';

import { useCallback, useEffect, useState } from 'react';
import { useFetcher } from 'react-router';

import { AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteRoomDialogProps {
  /** Room to be deleted */
  room: {
    id: string;
    name: string;
  };
  /** Number of plants currently in the room */
  plantCount: number;
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * DeleteRoomDialog - Confirmation dialog for deleting a room
 * Shows warning if room has plants, which will be unassigned on deletion
 */
export function DeleteRoomDialog({
  room,
  plantCount,
  open,
  onOpenChange,
}: DeleteRoomDialogProps): React.ReactNode {
  const fetcher = useFetcher();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isSubmitting = fetcher.state === 'submitting';
  const error = fetcher.data?.error as string | undefined;

  const handleDelete = useCallback(() => {
    setHasSubmitted(true);
    const formData = new FormData();
    formData.append('_method', 'DELETE');
    formData.append('roomId', room.id);

    fetcher.submit(formData, {
      method: 'POST',
      action: '/api/rooms',
    });
  }, [room.id, fetcher]);

  // Close dialog on success
  useEffect(() => {
    if (fetcher.state === 'idle' && hasSubmitted && !error) {
      onOpenChange(false);
      setHasSubmitted(false);
    }
  }, [fetcher.state, hasSubmitted, error, onOpenChange]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setHasSubmitted(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="h-5 w-5" />
            Delete Room
          </DialogTitle>
          <DialogDescription>Are you sure you want to delete "{room.name}"?</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {plantCount > 0 && (
            <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">
                  This room has {plantCount} {plantCount === 1 ? 'plant' : 'plants'}
                </p>
                <p className="text-amber-600 dark:text-amber-300 mt-1">
                  {plantCount === 1 ? 'This plant' : 'These plants'} will be unassigned from the
                  room but not deleted.
                </p>
              </div>
            </div>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-400">
            This action cannot be undone.
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Room'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
