/**
 * Utility functions for the AI Wizard
 */
import type { WizardState } from '../components/ai-wizard';

/**
 * Converts a File object to a base64 string
 * Strips the data URL prefix (e.g., "data:image/jpeg;base64,")
 *
 * @param file - The file to convert
 * @returns Promise resolving to the base64 string without prefix
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      const base64Only = result.split(',')[1];
      resolve(base64Only);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Builds FormData for saving a plant from wizard state
 *
 * @param state - Current wizard state
 * @param photoBase64 - Optional base64 encoded photo
 * @returns FormData ready for submission
 */
export function buildPlantFormData(
  state: Pick<WizardState, 'manualPlantName' | 'careInstructions' | 'selectedRoomId'>,
  photoBase64: string | null
): FormData {
  const formData = new FormData();

  formData.append('_action', 'save-plant');
  formData.append('name', state.manualPlantName);
  formData.append(
    'wateringFrequencyDays',
    state.careInstructions?.wateringFrequencyDays.toString() || '7'
  );
  formData.append('wateringAmount', state.careInstructions?.wateringAmount || 'mid');
  formData.append('lightRequirements', state.careInstructions?.lightRequirements || '');
  formData.append('fertilizingTips', JSON.stringify(state.careInstructions?.fertilizingTips || []));
  formData.append('pruningTips', JSON.stringify(state.careInstructions?.pruningTips || []));
  formData.append('troubleshooting', JSON.stringify(state.careInstructions?.troubleshooting || []));
  formData.append('roomId', state.selectedRoomId || '');

  if (photoBase64) {
    formData.append('photoBase64', photoBase64);
  }

  return formData;
}

/**
 * Builds FormData for saving feedback from wizard state
 *
 * @param plantId - The plant ID to associate feedback with
 * @param feedbackType - Type of feedback (thumbs_up or thumbs_down)
 * @param comment - Optional feedback comment
 * @param aiSnapshot - Snapshot of AI responses for feedback context
 * @returns FormData ready for submission
 */
export function buildFeedbackFormData(
  plantId: string,
  feedbackType: 'thumbs_up' | 'thumbs_down',
  comment: string,
  aiSnapshot: { identification: unknown; careInstructions: unknown }
): FormData {
  const formData = new FormData();

  formData.append('_action', 'save-feedback');
  formData.append('plantId', plantId);
  formData.append('feedbackType', feedbackType);
  formData.append('comment', comment || '');
  formData.append('aiResponseSnapshot', JSON.stringify(aiSnapshot));

  return formData;
}
