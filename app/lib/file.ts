/**
 * File conversion utilities
 */

/**
 * Convert a File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove 'data:image/...;base64,' prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Convert base64 string to Buffer
 */
export function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}
