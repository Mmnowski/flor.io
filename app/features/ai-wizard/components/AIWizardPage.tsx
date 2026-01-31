/**
 * Complete AI Wizard Page
 * Renders the full wizard with all steps
 */
import { Alert, AlertDescription } from '~/shared/components/ui/alert';
import { logger } from '~/shared/lib/logger';

import { useEffect, useRef, useState } from 'react';
import { Form, useFetcher } from 'react-router';

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
  const fetcher = useFetcher();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAction, setLastAction] = useState<'save-plant' | 'save-feedback' | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Watch for fetcher data to handle response
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.error) {
        updateState({
          error: fetcher.data.error,
          isLoading: false,
        });
        setIsSubmitting(false);
      } else if (fetcher.data.plantId && lastAction === 'save-plant') {
        // Save plant succeeded, move to feedback step
        updateState({
          error: null,
          plantId: fetcher.data.plantId,
        });
        goToStep('feedback');
        setIsSubmitting(false);
        setLastAction(null);
      }
    }
  }, [fetcher.state, fetcher.data, lastAction, goToStep, updateState]);

  // Watch for feedback submission
  useEffect(() => {
    if (fetcher.state === 'idle' && lastAction === 'save-feedback') {
      // Feedback was submitted, navigate to plant details
      if (fetcher.data?.redirect) {
        window.location.href = fetcher.data.redirect;
      } else {
        onComplete?.(state.plantId ?? '');
      }
      setLastAction(null);
    }
  }, [fetcher.state, lastAction, fetcher.data, state.plantId, onComplete]);

  const handleSavePlant = async () => {
    try {
      setIsSubmitting(true);
      updateState({ error: null });

      // Convert file to base64 if exists
      let photoBase64: string | null = null;
      if (state.photoFile) {
        photoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data:image/jpeg;base64, prefix
            const base64Only = result.split(',')[1];
            resolve(base64Only);
          };
          reader.onerror = reject;
          reader.readAsDataURL(state.photoFile!);
        });
      }

      if (!formRef.current) {
        throw new Error('Form not available');
      }

      // Clear form and build new form data
      formRef.current.innerHTML = '';

      // Add hidden inputs
      const fields: Record<string, string> = {
        _action: 'save-plant',
        name: state.manualPlantName,
        wateringFrequencyDays: state.careInstructions?.wateringFrequencyDays.toString() || '7',
        wateringAmount: state.careInstructions?.wateringAmount || 'mid',
        lightRequirements: state.careInstructions?.lightRequirements || '',
        fertilizingTips: JSON.stringify(state.careInstructions?.fertilizingTips || []),
        pruningTips: JSON.stringify(state.careInstructions?.pruningTips || []),
        troubleshooting: JSON.stringify(state.careInstructions?.troubleshooting || []),
        roomId: state.selectedRoomId || '',
      };

      if (photoBase64) {
        fields.photoBase64 = photoBase64;
      }

      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        formRef.current.appendChild(input);
      }

      // Track this action for proper response handling
      setLastAction('save-plant');
      // Submit form using React Router's fetcher
      fetcher.submit(formRef.current, { method: 'POST' });
    } catch (error) {
      let errorMessage = 'Failed to save plant';

      if (error instanceof Error) {
        errorMessage = error.message;
      }
      updateState({
        error: errorMessage,
        isLoading: false,
      });
      setIsSubmitting(false);
    }
  };

  const handleSubmitFeedback = (feedbackData: {
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

      // Track this action for proper response handling
      setLastAction('save-feedback');
      // Submit using React Router's fetcher
      fetcher.submit(formData, { method: 'POST' });
    } catch (error) {
      let errorMessage = 'Failed to save feedback';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      logger.error('Feedback error', error);
      updateState({ error: errorMessage });

      // Still redirect to plant even if feedback fails
      setTimeout(() => {
        onComplete?.(state.plantId ?? '');
      }, 2000);
    }
  };

  // Render current step
  let stepContent;

  // Step 1: Photo Upload
  if (state.currentStep === 'photo-upload') {
    stepContent = <PhotoUploadStep onContinue={() => goToStep('identifying')} />;
  }
  // Step 2: Identifying
  else if (state.currentStep === 'identifying') {
    stepContent = (
      <IdentifyingStep
        onComplete={() => goToStep('identification-result')}
        onError={(error) => updateState({ error })}
      />
    );
  }
  // Step 3: Identification Result
  else if (state.currentStep === 'identification-result') {
    stepContent = (
      <IdentificationResultStep
        onConfirm={() => goToStep('generating-care')}
        onManualEntry={() => goToStep('manual-name')}
      />
    );
  }
  // Step 3b: Manual Name Entry
  else if (state.currentStep === 'manual-name') {
    stepContent = <ManualNameStep onContinue={() => goToStep('generating-care')} />;
  }
  // Step 4: Generating Care Instructions
  else if (state.currentStep === 'generating-care') {
    stepContent = (
      <GeneratingCareStep
        onComplete={() => goToStep('care-preview')}
        onError={(error) => updateState({ error })}
      />
    );
  }
  // Step 5: Care Preview & Edit
  else if (state.currentStep === 'care-preview') {
    stepContent = (
      <div className="space-y-6">
        {state.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <CarePreviewStep onContinue={handleSavePlant} rooms={rooms} />
        {state.isLoading && (
          <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/50">
            <p className="text-sm text-emerald-900 dark:text-emerald-100">Saving your plant...</p>
          </div>
        )}
      </div>
    );
  }
  // Step 6: Feedback
  else if (state.currentStep === 'feedback') {
    const plantName = state.manualPlantName || state.identification?.commonNames[0] || 'your plant';

    stepContent = (
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
  } else {
    stepContent = (
      <div className="rounded-lg bg-yellow-50 p-4">
        <p className="text-sm text-yellow-900">Unknown step: {state.currentStep}</p>
      </div>
    );
  }

  return (
    <>
      {stepContent}
      {/* Hidden form for file uploads */}
      <form ref={formRef} style={{ display: 'none' }} />
    </>
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
