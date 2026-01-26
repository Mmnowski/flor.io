/**
 * Step 1: Photo Upload
 * User uploads a plant photo for identification
 */

import { useRef } from "react";
import { useAIWizard } from "../ai-wizard";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";

const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface PhotoUploadStepProps {
  onContinue?: () => void;
}

export function PhotoUploadStep({ onContinue }: PhotoUploadStepProps) {
  const { state, updateState } = useAIWizard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      updateState({
        error: "Please upload a JPG, PNG, or WebP image",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      updateState({
        error: "Image must be smaller than 10MB",
      });
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    updateState({
      photoFile: file,
      photoPreviewUrl: previewUrl,
      error: null,
    });
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect({
        target: { files } as any,
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleContinue = () => {
    if (!state.photoFile) {
      updateState({
        error: "Please select a photo",
      });
      return;
    }

    // Mark this step as complete
    updateState({ error: null });
    onContinue?.();
  };

  const handleClear = () => {
    // Clean up preview URL
    if (state.photoPreviewUrl) {
      URL.revokeObjectURL(state.photoPreviewUrl);
    }

    updateState({
      photoFile: null,
      photoPreviewUrl: null,
      error: null,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload Plant Photo</h2>
        <p className="mt-2 text-gray-600">
          Take or upload a clear photo of your plant's leaves. This helps AI
          identify it accurately.
        </p>
      </div>

      {/* Error alert */}
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Photo preview or upload area */}
      {state.photoPreviewUrl ? (
        <div className="space-y-4">
          {/* Preview */}
          <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
            <img
              src={state.photoPreviewUrl}
              alt="Plant preview"
              className="h-96 w-full object-contain"
            />
          </div>

          {/* File info */}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              <strong>File:</strong> {state.photoFile?.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Size:</strong> {(state.photoFile?.size || 0 / 1024).toFixed(2)} KB
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="flex-1"
            >
              Choose Different Photo
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1"
            >
              Continue →
            </Button>
          </div>
        </div>
      ) : (
        // Upload area
        <div
          onDragOver={handleDragOver}
          onDrop={handleDragDrop}
          className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center transition-colors hover:border-blue-400 hover:bg-blue-50"
        >
          <div className="space-y-4">
            {/* Upload icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-blue-100 p-4">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="text-lg font-semibold text-gray-900">
                Drag & drop your photo here
              </p>
              <p className="mt-1 text-sm text-gray-600">or</p>
            </div>

            {/* Button */}
            <label>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES.join(",")}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mx-auto"
              >
                Browse Files
              </Button>
            </label>

            {/* Supported formats */}
            <p className="text-xs text-gray-500">
              JPG, PNG, or WebP • Max 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
