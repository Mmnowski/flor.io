import sharp from 'sharp';

const MAX_INPUT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_OUTPUT_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 75;
const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Process a plant image for storage
 * Resizes, compresses, and strips EXIF data
 * @param buffer - Image buffer
 * @returns Processed image buffer
 * @throws Error if image processing fails
 */
export async function processPlantImage(buffer: Buffer): Promise<Buffer> {
  // Validate input size
  if (buffer.length > MAX_INPUT_SIZE) {
    throw new Error('Image must be smaller than 10MB');
  }

  try {
    // Process: resize, convert to JPEG, reduce quality, strip EXIF
    const processed = await sharp(buffer)
      .resize(MAX_WIDTH, undefined, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .jpeg({ quality: JPEG_QUALITY, progressive: true })
      .rotate() // Auto-rotate based on EXIF
      .toBuffer();

    // Validate output size
    if (processed.length > MAX_OUTPUT_SIZE) {
      throw new Error('Processed image exceeds 500KB');
    }

    return processed;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
    throw new Error('Image processing failed');
  }
}

/**
 * Extract an image file from FormData
 * @param formData - FormData object from request
 * @param fieldName - Name of the file field
 * @returns File object or null if not present
 */
export async function extractImageFromFormData(
  formData: FormData,
  fieldName: string
): Promise<File | null> {
  const file = formData.get(fieldName);

  if (!file || !(file instanceof File)) {
    return null;
  }

  // Validate MIME type
  if (!ACCEPTED_FORMATS.includes(file.type)) {
    throw new Error('Invalid image format. Accepted formats: JPG, PNG, WEBP');
  }

  return file;
}

/**
 * Convert File to Buffer
 * @param file - File object
 * @returns Buffer
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
