'use client';

import { useState, useRef } from 'react';
import { Button } from '~/components/ui/button';
import { X, Upload } from 'lucide-react';

interface ImageUploadProps {
  currentPhotoUrl?: string | null;
  onFileChange?: (file: File | null) => void;
}

export function ImageUpload({ currentPhotoUrl, onFileChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('Image must be smaller than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setFileName(file.name);
      onFileChange?.(file);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileChange?.(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        name="photo"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload plant photo"
      />

      {preview ? (
        <div className="space-y-3">
          {/* Preview image */}
          <div className="relative w-full rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
            <img
              src={preview}
              alt={`Preview of ${fileName || 'selected plant photo'}`}
              className="w-full h-64 object-cover"
            />
          </div>

          {/* File name */}
          {fileName && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {fileName}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUploadClick}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRemovePhoto}
              className="px-3"
              aria-label="Remove plant photo"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Plant Photo
        </Button>
      )}
    </div>
  );
}
