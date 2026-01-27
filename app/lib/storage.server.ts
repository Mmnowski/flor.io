import { logger } from '~/shared/lib/logger';

import { v4 as uuidv4 } from 'uuid';

import { supabaseServer } from './supabase.server';

const BUCKET_NAME = 'plant-photos';

/**
 * Upload a plant photo to Supabase Storage
 * @param userId - User ID for path organization
 * @param buffer - Image buffer
 * @param mimeType - MIME type of the image
 * @returns Public URL of uploaded photo, or null on error
 */
export async function uploadPlantPhoto(
  userId: string,
  buffer: Buffer,
  mimeType: string
): Promise<string | null> {
  try {
    const filename = `${uuidv4()}.jpg`;
    const path = `${userId}/${filename}`;

    const { error } = await supabaseServer.storage.from(BUCKET_NAME).upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    });

    if (error) {
      logger.error('Failed to upload photo', error);
      return null;
    }

    const url = getPlantPhotoUrl(path);
    return url;
  } catch (error) {
    logger.error('Error uploading plant photo', error);
    return null;
  }
}

/**
 * Delete a plant photo from Supabase Storage
 * @param photoUrl - Public URL of the photo
 * @returns Promise that resolves when deletion is complete
 */
export async function deletePlantPhoto(photoUrl: string): Promise<void> {
  try {
    // Extract path from URL
    // URL format: https://{projectId}.supabase.co/storage/v1/object/public/plant-photos/{userId}/{filename}
    const urlParts = photoUrl.split('/');
    const bucketIndex = urlParts.indexOf(BUCKET_NAME);

    if (bucketIndex === -1) {
      logger.warn('Could not extract path from photo URL');
      return;
    }

    const path = urlParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabaseServer.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      logger.error('Failed to delete photo', error);
    }
  } catch (error) {
    logger.error('Error deleting plant photo', error);
  }
}

/**
 * Get the public URL for a plant photo path
 * @param path - Path in storage (e.g., "userId/filename.jpg")
 * @returns Public URL
 */
export function getPlantPhotoUrl(path: string): string {
  const { data } = supabaseServer.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}
