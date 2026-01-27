/**
 * Step 3b: Manual Name Entry (Fallback)
 * User manually enters plant name if AI identification is rejected
 */
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

import { useAIWizard } from '../ai-wizard';

interface ManualNameStepProps {
  onContinue?: () => void;
}

export function ManualNameStep({ onContinue }: ManualNameStepProps) {
  const { state, updateState } = useAIWizard();

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;

    // Validate name (1-100 chars, alphanumeric + spaces)
    if (name.length > 100) {
      updateState({
        error: 'Plant name must be 100 characters or less',
      });
      return;
    }

    updateState({
      manualPlantName: name,
      error: null,
    });
  };

  const handleContinue = () => {
    const name = state.manualPlantName.trim();

    if (!name) {
      updateState({
        error: 'Please enter a plant name',
      });
      return;
    }

    if (name.length < 2) {
      updateState({
        error: 'Plant name must be at least 2 characters',
      });
      return;
    }

    updateState({ error: null });
    onContinue?.();
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleContinue();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Enter Plant Name</h2>
        <p className="mt-2 text-gray-600">
          What is the name of your plant? You can use the common name or scientific name.
        </p>
      </div>

      {/* Error alert */}
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Photo preview */}
      {state.photoPreviewUrl && (
        <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
          <img src={state.photoPreviewUrl} alt="Plant" className="h-48 w-full object-contain" />
        </div>
      )}

      {/* Name input */}
      <div className="space-y-2">
        <Label htmlFor="plant-name">Plant Name</Label>
        <Input
          id="plant-name"
          type="text"
          placeholder="e.g., Monstera, Pothos, Snake Plant"
          value={state.manualPlantName}
          onChange={handleNameChange}
          onKeyPress={handleKeyPress}
          className="text-base"
          maxLength={100}
          autoFocus
        />
        <p className="text-xs text-gray-500">{state.manualPlantName.length}/100 characters</p>
      </div>

      {/* Common plant names suggestion */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-900">Popular plants:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            'Monstera',
            'Pothos',
            'Snake Plant',
            'Spider Plant',
            'Philodendron',
            'Rubber Plant',
            'Peace Lily',
          ].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() =>
                updateState({
                  manualPlantName: name,
                  error: null,
                })
              }
              className="rounded bg-white px-3 py-1 text-sm text-blue-600 hover:bg-blue-100"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => updateState({ userConfirmedIdentification: true })}
          className="flex-1"
        >
          ← Back
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!state.manualPlantName.trim()}
          className="flex-1"
        >
          Continue →
        </Button>
      </div>
    </div>
  );
}
