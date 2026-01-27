/**
 * Step 5: Care Preview & Edit
 * Shows all plant data and allows user to review/edit before saving
 */
import { Alert, AlertDescription } from '~/shared/components/ui/alert';
import { Button } from '~/shared/components/ui/button';
import { Input } from '~/shared/components/ui/input';
import { Label } from '~/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/shared/components/ui/select';
import { Textarea } from '~/shared/components/ui/textarea';

import { useState } from 'react';

import { useAIWizard } from '../ai-wizard';

interface CarePreviewStepProps {
  onContinue?: () => void;
  rooms?: Array<{ id: string; name: string }>;
}

export function CarePreviewStep({ onContinue, rooms = [] }: CarePreviewStepProps) {
  const { state, updateState } = useAIWizard();
  const [isEditing, setIsEditing] = useState(false);

  const plantName = state.manualPlantName || state.identification?.commonNames[0];

  if (!state.careInstructions) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-sm text-red-900">Care instructions missing. Please try again.</p>
      </div>
    );
  }

  const handleWateringFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (value > 0 && value <= 365) {
      updateState({
        careInstructions: {
          ...state.careInstructions,
          wateringFrequencyDays: value,
        },
      });
    }
  };

  const handleLightRequirementsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateState({
      careInstructions: {
        ...state.careInstructions,
        lightRequirements: event.target.value,
      },
    });
  };

  const handleTipsChange = (
    section: 'fertilizingTips' | 'pruningTips' | 'troubleshooting',
    index: number,
    value: string
  ) => {
    const tips = [...state.careInstructions[section]];
    tips[index] = value;
    updateState({
      careInstructions: {
        ...state.careInstructions,
        [section]: tips,
      },
    });
  };

  const handleContinue = () => {
    updateState({ error: null });
    onContinue?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Review Plant Care</h2>
          <p className="mt-2 text-gray-600">
            Here's what AI generated for your {plantName}. You can edit any details before saving.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="whitespace-nowrap"
        >
          {isEditing ? 'View' : 'Edit'}
        </Button>
      </div>

      {/* Photo preview */}
      {state.photoPreviewUrl && (
        <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
          <img src={state.photoPreviewUrl} alt="Plant" className="h-48 w-full object-contain" />
        </div>
      )}

      {/* Plant info */}
      <div className="rounded-lg border-2 border-gray-200 p-6">
        <h3 className="text-lg font-bold">Plant Information</h3>
        <div className="mt-4 space-y-4">
          {/* Plant name (display only) */}
          <div>
            <p className="text-sm font-semibold text-gray-600">Name</p>
            <p className="text-lg text-gray-900">{plantName}</p>
          </div>

          {/* Room selection */}
          <div>
            <Label htmlFor="room">Room (Optional)</Label>
            <Select
              value={state.selectedRoomId || ''}
              onValueChange={(value) =>
                updateState({
                  selectedRoomId: value || null,
                })
              }
            >
              <SelectTrigger id="room">
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No room assigned</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Watering */}
      <div className="rounded-lg border-2 border-gray-200 p-6">
        <h3 className="text-lg font-bold">Watering</h3>
        <div className="mt-4 space-y-2">
          {isEditing ? (
            <>
              <Label htmlFor="watering-frequency">Watering Frequency (days)</Label>
              <Input
                id="watering-frequency"
                type="number"
                min="1"
                max="365"
                value={state.careInstructions.wateringFrequencyDays}
                onChange={handleWateringFrequencyChange}
              />
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-600">Frequency</p>
              <p className="text-lg text-gray-900">
                Every {state.careInstructions.wateringFrequencyDays} day
                {state.careInstructions.wateringFrequencyDays !== 1 ? 's' : ''}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Light Requirements */}
      <div className="rounded-lg border-2 border-gray-200 p-6">
        <h3 className="text-lg font-bold">Light Requirements</h3>
        <div className="mt-4 space-y-2">
          {isEditing ? (
            <>
              <Label htmlFor="light">Light Requirements</Label>
              <Textarea
                id="light"
                value={state.careInstructions.lightRequirements}
                onChange={handleLightRequirementsChange}
                rows={3}
              />
            </>
          ) : (
            <p className="text-gray-700">{state.careInstructions.lightRequirements}</p>
          )}
        </div>
      </div>

      {/* Fertilizing Tips */}
      <div className="rounded-lg border-2 border-gray-200 p-6">
        <h3 className="text-lg font-bold">Fertilizing Tips</h3>
        <div className="mt-4 space-y-2">
          {state.careInstructions.fertilizingTips.map((tip, index) => (
            <div key={index}>
              {isEditing ? (
                <Input
                  value={tip}
                  onChange={(e) => handleTipsChange('fertilizingTips', index, e.target.value)}
                  className="mb-2"
                />
              ) : (
                <div className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                  <p className="text-gray-700">{tip}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pruning Tips */}
      <div className="rounded-lg border-2 border-gray-200 p-6">
        <h3 className="text-lg font-bold">Pruning Tips</h3>
        <div className="mt-4 space-y-2">
          {state.careInstructions.pruningTips.map((tip, index) => (
            <div key={index}>
              {isEditing ? (
                <Input
                  value={tip}
                  onChange={(e) => handleTipsChange('pruningTips', index, e.target.value)}
                  className="mb-2"
                />
              ) : (
                <div className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-green-600 flex-shrink-0" />
                  <p className="text-gray-700">{tip}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="rounded-lg border-2 border-gray-200 p-6">
        <h3 className="text-lg font-bold">Troubleshooting</h3>
        <div className="mt-4 space-y-2">
          {state.careInstructions.troubleshooting.map((tip, index) => (
            <div key={index}>
              {isEditing ? (
                <Input
                  value={tip}
                  onChange={(e) => handleTipsChange('troubleshooting', index, e.target.value)}
                  className="mb-2"
                />
              ) : (
                <div className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-red-600 flex-shrink-0" />
                  <p className="text-gray-700">{tip}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <Alert>
        <AlertDescription>
          AI-generated content is a starting point. Feel free to customize the care instructions
          based on your experience with this plant.
        </AlertDescription>
      </Alert>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEditing(false)}
          className="flex-1"
        >
          ← Back
        </Button>
        <Button type="button" onClick={handleContinue} className="flex-1">
          Save & Continue →
        </Button>
      </div>
    </div>
  );
}
