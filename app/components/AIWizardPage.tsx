/**
 * Complete AI Wizard Page
 * Renders the full wizard with all steps
 */

import { useState } from "react";
import { AIWizard, useAIWizard, type WizardStep } from "./ai-wizard";
import {
  PhotoUploadStep,
  IdentifyingStep,
  IdentificationResultStep,
  ManualNameStep,
  GeneratingCareStep,
  CarePreviewStep,
  FeedbackStep,
} from "./ai-wizard-steps";

interface AIWizardPageProps {
  userId: string;
  aiRemaining: number;
  rooms?: Array<{ id: string; name: string }>;
  onComplete?: (plantId: string) => void;
}

/**
 * Inner component that uses wizard context
 */
function AIWizardPageContent({
  userId,
  aiRemaining,
  rooms = [],
  onComplete,
}: AIWizardPageProps) {
  const { state, goToStep, updateState } = useAIWizard();

  // Step 1: Photo Upload
  if (state.currentStep === "photo-upload") {
    return (
      <PhotoUploadStep
        onContinue={() => goToStep("identifying")}
      />
    );
  }

  // Step 2: Identifying
  if (state.currentStep === "identifying") {
    return (
      <IdentifyingStep
        onComplete={() => goToStep("identification-result")}
        onError={(error) => updateState({ error })}
      />
    );
  }

  // Step 3: Identification Result
  if (state.currentStep === "identification-result") {
    return (
      <IdentificationResultStep
        onConfirm={() => goToStep("generating-care")}
        onManualEntry={() => goToStep("manual-name")}
      />
    );
  }

  // Step 3b: Manual Name Entry
  if (state.currentStep === "manual-name") {
    return (
      <ManualNameStep
        onContinue={() => goToStep("generating-care")}
      />
    );
  }

  // Step 4: Generating Care Instructions
  if (state.currentStep === "generating-care") {
    return (
      <GeneratingCareStep
        onComplete={() => goToStep("care-preview")}
        onError={(error) => updateState({ error })}
      />
    );
  }

  // Step 5: Care Preview & Edit
  if (state.currentStep === "care-preview") {
    return (
      <CarePreviewStep
        onContinue={() => goToStep("feedback")}
        rooms={rooms}
      />
    );
  }

  // Step 6: Feedback
  if (state.currentStep === "feedback") {
    const plantName = state.manualPlantName ||
      state.identification?.commonNames[0] || "your plant";

    return (
      <FeedbackStep
        plantName={plantName}
        onSubmit={() => {
          // In real app: submit plant and feedback to server
          // then redirect to plant details or dashboard
          onComplete?.(Math.random().toString()); // Mock plant ID
        }}
        onSkip={() => {
          // In real app: submit plant without feedback
          onComplete?.(Math.random().toString()); // Mock plant ID
        }}
      />
    );
  }

  // Fallback
  return (
    <div className="rounded-lg bg-yellow-50 p-4">
      <p className="text-sm text-yellow-900">
        Unknown step: {state.currentStep}
      </p>
    </div>
  );
}

/**
 * Main component
 */
export function AIWizardPage({
  userId,
  aiRemaining,
  rooms = [],
  onComplete,
}: AIWizardPageProps) {
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
