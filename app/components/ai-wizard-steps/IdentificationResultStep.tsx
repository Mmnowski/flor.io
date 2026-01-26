/**
 * Step 3: Identification Result
 * Shows identified plant and asks user to confirm or provide manual name
 */

import { useAIWizard } from "../ai-wizard";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";

interface IdentificationResultStepProps {
  onConfirm?: () => void;
  onManualEntry?: () => void;
}

export function IdentificationResultStep({
  onConfirm,
  onManualEntry,
}: IdentificationResultStepProps) {
  const { state, updateState } = useAIWizard();

  if (!state.identification) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-sm text-red-900">
          Plant identification data missing. Please try again.
        </p>
      </div>
    );
  }

  const { scientificName, commonNames, confidence } = state.identification;
  const confidencePercent = Math.round(confidence * 100);

  const handleConfirm = () => {
    updateState({
      userConfirmedIdentification: true,
      manualPlantName: commonNames[0],
    });
    onConfirm?.();
  };

  const handleManualEntry = () => {
    updateState({ userConfirmedIdentification: false });
    onManualEntry?.();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Is this your plant?</h2>
        <p className="mt-2 text-gray-600">
          AI identified your plant with {confidencePercent}% confidence
        </p>
      </div>

      {/* Plant identification card */}
      <div className="rounded-lg border-2 border-gray-200 p-6">
        {/* Photo preview */}
        {state.photoPreviewUrl && (
          <div className="mb-6 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={state.photoPreviewUrl}
              alt="Identified plant"
              className="h-64 w-full object-contain"
            />
          </div>
        )}

        {/* Plant info */}
        <div className="space-y-4">
          {/* Scientific name */}
          <div>
            <p className="text-sm font-semibold text-gray-600">Scientific Name</p>
            <p className="text-xl font-bold text-gray-900">{scientificName}</p>
          </div>

          {/* Common names */}
          <div>
            <p className="text-sm font-semibold text-gray-600">Common Names</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {commonNames.map((name) => (
                <span
                  key={name}
                  className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-900"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Confidence score */}
          <div>
            <p className="text-sm font-semibold text-gray-600">Confidence</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all ${
                  confidence >= 0.9
                    ? "bg-green-500"
                    : confidence >= 0.7
                      ? "bg-yellow-500"
                      : "bg-orange-500"
                }`}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <p className="mt-1 text-sm text-gray-600">{confidencePercent}%</p>
          </div>
        </div>
      </div>

      {/* Confidence warning if low */}
      {confidence < 0.8 && (
        <Alert>
          <AlertDescription>
            Confidence is lower than ideal. Consider entering the plant name
            manually for better accuracy.
          </AlertDescription>
        </Alert>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleManualEntry}
          className="w-full"
        >
          No, I'll enter it manually
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          className="w-full"
        >
          Yes, that's it!
        </Button>
      </div>

      {/* Info text */}
      <p className="text-center text-sm text-gray-600">
        You can edit the plant name and details later
      </p>
    </div>
  );
}
