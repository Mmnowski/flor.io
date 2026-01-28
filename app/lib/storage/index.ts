/**
 * Storage Domain - File management and image processing
 *
 * Handles plant photo uploads, deletion, and image processing (resizing, compression).
 */

// Photo management
export { uploadPlantPhoto, deletePlantPhoto, getPlantPhotoUrl } from './storage.server';

// Image processing
export { processPlantImage, extractImageFromFormData, fileToBuffer } from './image.server';
