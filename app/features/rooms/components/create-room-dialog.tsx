'use client';

import { Button } from '~/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/shared/components/ui/dialog';
import { Input } from '~/shared/components/ui/input';
import { Label } from '~/shared/components/ui/label';

import { useCallback, useEffect, useState } from 'react';
import { useFetcher } from 'react-router';

import { AlertCircle, Plus } from 'lucide-react';

/**
 * CreateRoomDialog - Dialog for creating a new room
 * Opens from a trigger button, submits to the rooms API
 */
export function CreateRoomDialog() {
  const fetcher = useFetcher();
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isSubmitting = fetcher.state === 'submitting';
  const error = fetcher.data?.error as string | undefined;

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!roomName.trim()) return;

      setHasSubmitted(true);
      const formData = new FormData();
      formData.append('_method', 'POST');
      formData.append('name', roomName);

      fetcher.submit(formData, {
        method: 'POST',
        action: '/api/rooms',
      });
    },
    [roomName, fetcher]
  );

  // Close dialog and reset form on success
  useEffect(() => {
    if (fetcher.state === 'idle' && hasSubmitted && !error) {
      setOpen(false);
      setRoomName('');
      setHasSubmitted(false);
    }
  }, [fetcher.state, hasSubmitted, error]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setHasSubmitted(false);
      setRoomName('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0 transition-colors font-medium flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
          <Plus className="w-4 h-4" />
          New Room
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
          <DialogDescription>Add a new room to organize your plants</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="room-name" className="text-base">
              Room Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="room-name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g., Living Room, Bedroom"
              maxLength={50}
              disabled={isSubmitting}
              className="mt-2"
              required
              autoFocus
            />
            <p className="text-sm text-slate-500 mt-1">Maximum 50 characters</p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !roomName.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
