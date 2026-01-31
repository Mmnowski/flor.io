/**
 * Complete AI Wizard Page
 * Renders the full wizard with all steps
 */
import { Alert, AlertDescription } from '~/shared/components/ui/alert';
import { logger } from '~/shared/lib/logger';

import { useEffect, useState } from 'react';
import { useFetcher, useNavigate } from 'react-router';

import { buildFeedbackFormData, buildPlantFormData, fileToBase64 } from '../lib';
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
  /** Current user's ID */
  userId: string;
  /** Number of AI generations remaining this month */
  aiRemaining: number;
  /** Available rooms for plant assignment */
  rooms?: Array<{ id: string; name: string }>;
  /** Callback when wizard completes successfully */
  onComplete?: (plantId: string) => void;
}

/**
 * AIWizardPageContent - Inner component that uses wizard context
 * Handles step rendering and form submissions
 */
function AIWizardPageContent({ userId, aiRemaining, rooms = [], onComplete }: AIWizardPageProps) {
  const { state, goToStep, updateState } = useAIWizard();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAction, setLastAction] = useState<'save-plant' | 'save-feedback' | null>(null);

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
        navigate(fetcher.data.redirect);
      } else {
        onComplete?.(state.plantId ?? '');
      }
      setLastAction(null);
    }
  }, [fetcher.state, lastAction, fetcher.data, state.plantId, onComplete, navigate]);

  const handleSavePlant = async () => {
    try {
      setIsSubmitting(true);
      updateState({ error: null });

      // Convert file to base64 if exists
      const photoBase64 = state.photoFile ? await fileToBase64(state.photoFile) : null;

      // Build form data using utility function
      const formData = buildPlantFormData(state, photoBase64);

      // Track this action for proper response handling
      setLastAction('save-plant');
      // Submit using React Router's fetcher
      fetcher.submit(formData, { method: 'POST' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save plant';
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

      // Build form data using utility function
      const formData = buildFeedbackFormData(
        plantId,
        feedbackData.feedbackType,
        feedbackData.feedbackComment,
        {
          identification: state.identification,
          careInstructions: state.careInstructions,
        }
      );

      // Track this action for proper response handling
      setLastAction('save-feedback');
      // Submit using React Router's fetcher
      fetcher.submit(formData, { method: 'POST' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save feedback';
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

  return <>{stepContent}</>;
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
