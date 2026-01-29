/**
 * Add Plant Dialog
 * Lets users choose between manual or AI-assisted plant creation
 */

import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Sparkles, Pencil } from "lucide-react";

interface AddPlantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPlantDialog({ open, onOpenChange }: AddPlantDialogProps) {
  const navigate = useNavigate();

  const handleManual = () => {
    navigate("/dashboard/plants/new");
    onOpenChange(false);
  };

  const handleAI = () => {
    navigate("/dashboard/plants/new-ai");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Plant</DialogTitle>
          <DialogDescription>
            Choose how you'd like to add your plant to the collection
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Manual Option */}
          <button
            onClick={handleManual}
            className="rounded-lg border-2 border-gray-200 p-4 text-left transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                <Pencil className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                  Manual Entry
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Add plant details manually with optional photo
                </p>
              </div>
            </div>
          </button>

          {/* AI Option */}
          <button
            onClick={handleAI}
            className="rounded-lg border-2 border-gray-200 p-4 text-left transition-all hover:border-green-500 hover:bg-green-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                <Sparkles className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                  AI Identification
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Upload a photo and let AI identify & generate care instructions
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
