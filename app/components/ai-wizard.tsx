/**
 * AI Wizard Orchestrator Component
 *
 * Manages multi-step wizard state and navigation between steps.
 * Each step is a separate component that can be composed together.
 *
 * Step flow:
 * 1. PhotoUpload - User uploads plant photo
 * 2. Identifying - Loading state while AI identifies plant
 * 3. IdentificationResult - Shows identified plant, confirm or manual entry
 * 4. GeneratingCare - Loading state while AI generates care instructions
 * 5. CarePreview - Review/edit all plant data before saving
 * 6. FeedbackModal - Collect feedback on AI quality
 */

import React, { useState } from "react";
import type { ReactNode } from "react";

export type WizardStep =
  | "photo-upload"
  | "identifying"
  | "identification-result"
  | "manual-name"
  | "generating-care"
  | "care-preview"
  | "feedback";

export interface PlantIdentification {
  scientificName: string;
  commonNames: string[];
  confidence: number;
}

export interface CareInstructionsData {
  wateringFrequencyDays: number;
  lightRequirements: string;
  fertilizingTips: string[];
  pruningTips: string[];
  troubleshooting: string[];
}

export interface WizardState {
  // Step management
  currentStep: WizardStep;
  completedSteps: Set<WizardStep>;

  // Photo upload data
  photoFile: File | null;
  photoPreviewUrl: string | null;

  // Identification data
  identification: PlantIdentification | null;
  userConfirmedIdentification: boolean;

  // Manual name fallback
  manualPlantName: string;

  // Care instructions
  careInstructions: CareInstructionsData | null;

  // Room selection
  selectedRoomId: string | null;

  // Feedback
  feedbackType: "thumbs_up" | "thumbs_down" | null;
  feedbackComment: string;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Error recovery
  lastAttemptedStep?: WizardStep;
  retryCount: number;
}

interface AIWizardProps {
  children: ReactNode;
  userId: string;
  aiRemaining: number;
}

/**
 * Default wizard state
 */
const defaultState: WizardState = {
  currentStep: "photo-upload",
  completedSteps: new Set(),
  photoFile: null,
  photoPreviewUrl: null,
  identification: null,
  userConfirmedIdentification: false,
  manualPlantName: "",
  careInstructions: null,
  selectedRoomId: null,
  feedbackType: null,
  feedbackComment: "",
  isLoading: false,
  error: null,
  lastAttemptedStep: undefined,
  retryCount: 0,
};

/**
 * Wizard context for passing state and handlers to step components
 */
export const AIWizardContext = React.createContext<{
  state: WizardState;
  goToStep: (step: WizardStep) => void;
  updateState: (updates: Partial<WizardState>) => void;
  completeCurrentStep: () => void;
  goBack: () => void;
  incrementRetry: () => void;
} | null>(null);

/**
 * Main wizard component
 * Manages state and provides context to child step components
 */
export function AIWizard({
  children,
  userId,
  aiRemaining,
}: AIWizardProps) {
  const [state, setState] = useState<WizardState>(defaultState);
  const [stepHistory, setStepHistory] = useState<WizardStep[]>(["photo-upload"]);

  const goToStep = (step: WizardStep) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
      error: null,
      retryCount: 0,
      lastAttemptedStep: undefined,
    }));
    setStepHistory((prev) => [...prev, step]);
  };

  const updateState = (updates: Partial<WizardState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const completeCurrentStep = () => {
    setState((prev) => ({
      ...prev,
      completedSteps: new Set(prev.completedSteps).add(prev.currentStep),
    }));
  };

  const goBack = () => {
    setStepHistory((prev) => {
      if (prev.length <= 1) return prev;
      const newHistory = prev.slice(0, -1);
      const previousStep = newHistory[newHistory.length - 1];
      setState((prevState) => ({
        ...prevState,
        currentStep: previousStep,
        error: null,
        retryCount: 0,
        lastAttemptedStep: undefined,
      }));
      return newHistory;
    });
  };

  const incrementRetry = () => {
    setState((prev) => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      lastAttemptedStep: prev.currentStep,
    }));
  };

  return (
    <AIWizardContext.Provider
      value={{
        state,
        goToStep,
        updateState,
        completeCurrentStep,
        goBack,
        incrementRetry,
      }}
    >
      <div className="w-full">
        {/* Progress indicator */}
        <div className="mb-8">
          <WizardProgressBar currentStep={state.currentStep} />
        </div>

        {/* Main content */}
        <div className="space-y-6">{children}</div>

        {/* Usage indicator */}
        {aiRemaining !== undefined && (
          <div className="mt-8 rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              AI generations remaining: <strong>{aiRemaining}/20</strong>
            </p>
          </div>
        )}
      </div>
    </AIWizardContext.Provider>
  );
}

/**
 * Progress indicator component
 * Shows which steps are completed and current step
 */
function WizardProgressBar({ currentStep }: { currentStep: WizardStep }) {
  const steps: { id: WizardStep; label: string }[] = [
    { id: "photo-upload", label: "Photo" },
    { id: "identifying", label: "Identifying" },
    { id: "identification-result", label: "Confirm" },
    { id: "generating-care", label: "Generating" },
    { id: "care-preview", label: "Review" },
    { id: "feedback", label: "Feedback" },
  ];

  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex flex-col items-center ${
              index <= currentIndex ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                index < currentIndex
                  ? "border-blue-600 bg-blue-600 text-white"
                  : index === currentIndex
                    ? "border-blue-600 bg-white text-blue-600"
                    : "border-gray-300 bg-white text-gray-300"
              }`}
            >
              {index < currentIndex ? "✓" : index + 1}
            </div>
            <span className="mt-1 text-xs font-medium">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / steps.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Hook for step components to access wizard context
 */
export function useAIWizard() {
  const context = React.useContext(AIWizardContext);
  if (!context) {
    throw new Error("useAIWizard must be used inside AIWizard component");
  }
  return context;
}
