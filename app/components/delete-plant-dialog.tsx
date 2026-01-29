'use client';

import { Form } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeletePlantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plantName: string;
  plantId: string;
}

export function DeletePlantDialog({
  open,
  onOpenChange,
  plantName,
  plantId,
}: DeletePlantDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <DialogTitle>Delete Plant</DialogTitle>
              <DialogDescription className="mt-2">
                Are you sure you want to delete <strong>{plantName}</strong>?
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Form method="post" onSubmit={() => onOpenChange(false)}>
            <input type="hidden" name="_action" value="delete" />
            <Button type="submit" variant="destructive">
              Delete Plant
            </Button>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
