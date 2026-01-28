/**
 * Complete AI Wizard Page
 * Renders the full wizard with all steps
 */
import { Alert, AlertDescription } from '~/shared/components/ui/alert';
import { logger } from '~/shared/lib/logger';

import { useRef, useState } from 'react';
import { Form } from 'react-router';

import { AIWizard, type WizardStep, useAIWizard } from './ai-wizard';
import {
  CarePreviewStep,
  FeedbackStep,
  GeneratingCareStep,
  IdentificationResultStep,
  IdentifyingStep,
  ManualNameStep,
  PhotoUploadStep,
} from './ai-wizard-steps';

interface AIWizardPageProps {
  userId: string;
  aiRemaining: number;
  rooms?: Array<{ id: string; name: string }>;
  onComplete?: (plantId: string) => void;
}

/**
 * Inner component that uses wizard context
 */
function AIWizardPageContent({ userId, aiRemaining, rooms = [], onComplete }: AIWizardPageProps) {
  const { state, goToStep, updateState } = useAIWizard();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSavePlant = async () => {
    if (!formRef.current) return;

    try {
      setIsSubmitting(true);
      updateState({ error: null });

      // Create FormData with all plant information
      const formData = new FormData(formRef.current);
      formData.append('_action', 'save-plant');
      formData.append('name', state.manualPlantName);
      formData.append(
        'wateringFrequencyDays',
        state.careInstructions?.wateringFrequencyDays.toString() || '7'
      );
      formData.append('lightRequirements', state.careInstructions?.lightRequirements || '');
      formData.append(
        'fertilizingTips',
        JSON.stringify(state.careInstructions?.fertilizingTips || [])
      );
      formData.append('pruningTips', JSON.stringify(state.careInstructions?.pruningTips || []));
      formData.append(
        'troubleshooting',
        JSON.stringify(state.careInstructions?.troubleshooting || [])
      );
      formData.append('roomId', state.selectedRoomId || '');

      // Add photo file if exists
      if (state.photoFile) {
        formData.append('photoFile', state.photoFile);
      }

      // Submit to server with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save plant');
      }

      const result = await response.json();
      updateState({
        error: null,
        plantId: result.plantId,
      });

      // Move to feedback step
      goToStep('feedback');
    } catch (error) {
      let errorMessage = 'Failed to save plant';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }

      updateState({
        error: errorMessage,
        isLoading: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFeedback = async (feedbackData: {
    feedbackType: 'thumbs_up' | 'thumbs_down' | null;
    feedbackComment: string;
  }) => {
    const plantId = state.plantId;
    if (!plantId || !feedbackData.feedbackType) {
      onComplete?.(plantId ?? '');
      return;
    }

    try {
      setIsSubmitting(true);
      updateState({ error: null });

      const formData = new FormData();
      formData.append('_action', 'save-feedback');
      formData.append('plantId', plantId);
      formData.append('feedbackType', feedbackData.feedbackType);
      formData.append('comment', feedbackData.feedbackComment || '');
      formData.append(
        'aiResponseSnapshot',
        JSON.stringify({
          identification: state.identification,
          careInstructions: state.careInstructions,
        })
      );

      // Submit with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.redirected) {
        // Server issued redirect, let browser handle it
        window.location.href = response.url;
      } else if (!response.ok) {
        throw new Error('Failed to save feedback');
      } else {
        // Redirect to plant details
        onComplete?.(plantId);
      }
    } catch (error) {
      let errorMessage = 'Failed to save feedback';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out, but your plant was created successfully.';
        } else {
          errorMessage = error.message;
        }
      }

      // Log error but still allow user to continue
      logger.error('Feedback error', error);
      updateState({ error: errorMessage });

      // Still redirect to plant even if feedback fails
      setTimeout(() => {
        onComplete?.(state.plantId ?? '');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Photo Upload
  if (state.currentStep === 'photo-upload') {
    return <PhotoUploadStep onContinue={() => goToStep('identifying')} />;
  }

  // Step 2: Identifying
  if (state.currentStep === 'identifying') {
    return (
      <IdentifyingStep
        onComplete={() => goToStep('identification-result')}
        onError={(error) => updateState({ error })}
      />
    );
  }

  // Step 3: Identification Result
  if (state.currentStep === 'identification-result') {
    return (
      <IdentificationResultStep
        onConfirm={() => goToStep('generating-care')}
        onManualEntry={() => goToStep('manual-name')}
      />
    );
  }

  // Step 3b: Manual Name Entry
  if (state.currentStep === 'manual-name') {
    return <ManualNameStep onContinue={() => goToStep('generating-care')} />;
  }

  // Step 4: Generating Care Instructions
  if (state.currentStep === 'generating-care') {
    return (
      <GeneratingCareStep
        onComplete={() => goToStep('care-preview')}
        onError={(error) => updateState({ error })}
      />
    );
  }

  // Step 5: Care Preview & Edit
  if (state.currentStep === 'care-preview') {
    return (
      <form ref={formRef} className="space-y-6">
        {state.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <CarePreviewStep onContinue={handleSavePlant} rooms={rooms} />
        {state.isLoading && (
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900">Saving your plant...</p>
          </div>
        )}
      </form>
    );
  }

  // Step 6: Feedback
  if (state.currentStep === 'feedback') {
    const plantName = state.manualPlantName || state.identification?.commonNames[0] || 'your plant';

    return (
      <FeedbackStep
        plantName={plantName}
        onSubmit={() =>
          handleSubmitFeedback({
            feedbackType: state.feedbackType,
            feedbackComment: state.feedbackComment,
          })
        }
        onSkip={() =>
          handleSubmitFeedback({
            feedbackType: state.feedbackType,
            feedbackComment: state.feedbackComment,
          })
        }
      />
    );
  }

  // Fallback
  return (
    <div className="rounded-lg bg-yellow-50 p-4">
      <p className="text-sm text-yellow-900">Unknown step: {state.currentStep}</p>
    </div>
  );
}

/**
 * Main component
 */
export function AIWizardPage({ userId, aiRemaining, rooms = [], onComplete }: AIWizardPageProps) {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <AIWizard userId={userId} aiRemaining={aiRemaining}>
        <AIWizardPageContent
          userId={userId}
          aiRemaining={aiRemaining}
          rooms={rooms}
          onComplete={onComplete}
        />
      </AIWizard>
    </div>
  );
}
