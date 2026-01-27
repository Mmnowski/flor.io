import { useCallback, useState } from 'react';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/**
 * Handle image file uploads with preview and validation
 * Validates file type and size, generates preview
 *
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 * @returns Image state and control methods
 *
 * @example
 * const { file, preview, error, handleFileChange, clear } = useImageUpload();
 * return (
 *   <>
 *     <input type="file" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
 *     {preview && <img src={preview} alt="Preview" />}
 *     {error && <p className="error">{error}</p>}
 *   </>
 * );
 */
export function useImageUpload(maxSizeMB = MAX_SIZE_MB): {
  file: File | null;
  preview: string | null;
  error: string | null;
  handleFileChange: (file: File | null) => void;
  clear: () => void;
} {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (selectedFile: File | null) => {
      setError(null);

      if (!selectedFile) {
        setFile(null);
        setPreview(null);
        return;
      }

      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
        setError('Please upload a JPG, PNG, or WebP image');
        return;
      }

      // Validate file size
      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        setError(`Image must be less than ${maxSizeMB}MB`);
        return;
      }

      setFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    },
    [maxSizeMB]
  );

  const clear = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError(null);
  }, []);

  return { file, preview, error, handleFileChange, clear };
}
