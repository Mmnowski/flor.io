'use client';

import { getFieldError, plantNameSchema, wateringFrequencySchema } from '~/lib/utils';
import { FormError, ImageUpload } from '~/shared/components';
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
import type { PlantWithDetails, Room } from '~/types/plant.types';

import { useCallback, useState } from 'react';
import { Form } from 'react-router';

import { AlertCircle } from 'lucide-react';

interface FieldErrors {
  [key: string]: string[] | undefined;
  name?: string[];
  watering_frequency_days?: string[];
}

interface PlantFormProps {
  plant?: PlantWithDetails;
  rooms: Room[];
  error?: string | null;
  fieldErrors?: FieldErrors;
  mode: 'create' | 'edit';
}

export function PlantForm({
  plant,
  rooms,
  error,
  fieldErrors: serverFieldErrors,
  mode,
}: PlantFormProps) {
  const isEdit = mode === 'edit';
  const [selectedRoom, setSelectedRoom] = useState<string>(
    isEdit && plant?.room_id ? plant.room_id : ''
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(serverFieldErrors || {});

  const handleRoomChange = (value: string) => {
    setSelectedRoom(value);
  };

  const validateField = useCallback(
    (fieldName: string, value: string | number) => {
      const newErrors = { ...fieldErrors };

      if (fieldName === 'name') {
        const error = getFieldError(plantNameSchema, fieldName, value);
        if (error) {
          newErrors.name = [error];
        } else {
          delete newErrors.name;
        }
      }

      if (fieldName === 'watering_frequency_days') {
        const error = getFieldError(wateringFrequencySchema, fieldName, value);
        if (error) {
          newErrors.watering_frequency_days = [error];
        } else {
          delete newErrors.watering_frequency_days;
        }
      }

      setFieldErrors(newErrors);
    },
    [fieldErrors]
  );

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateField(e.target.name, e.target.value);
  };

  const isFormValid =
    (Object.keys(fieldErrors).length === 0 && plant?.name) ||
    (document.querySelector('input[name="name"]') as HTMLInputElement)?.value?.trim() !== '';

  return (
    <Form method="post" encType="multipart/form-data" className="space-y-6 max-w-2xl">
      {error && <FormError message={error} />}

      {/* Photo Upload */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Plant Photo</Label>
        <ImageUpload currentPhotoUrl={isEdit ? plant?.photo_url : undefined} />
      </div>

      {/* Plant Name */}
      <div>
        <Label htmlFor="name" className="text-base">
          Plant Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g., Monstera Deliciosa"
          defaultValue={isEdit ? plant?.name : ''}
          required
          maxLength={100}
          className={`mt-2 ${fieldErrors.name ? 'border-red-500 focus:ring-red-300' : ''}`}
          onChange={handleFieldChange}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? 'name-error' : undefined}
        />
        {fieldErrors.name && (
          <div
            id="name-error"
            className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mt-2"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {Array.isArray(fieldErrors.name) ? fieldErrors.name[0] : fieldErrors.name}
          </div>
        )}
        {!fieldErrors.name && <p className="text-sm text-slate-500 mt-1">Maximum 100 characters</p>}
      </div>

      {/* Watering Frequency */}
      <div>
        <Label htmlFor="watering_frequency_days" className="text-base">
          Watering Frequency (days) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="watering_frequency_days"
          name="watering_frequency_days"
          type="number"
          placeholder="e.g., 7"
          defaultValue={isEdit ? plant?.watering_frequency_days : ''}
          required
          min="1"
          max="365"
          className={`mt-2 ${
            fieldErrors.watering_frequency_days ? 'border-red-500 focus:ring-red-300' : ''
          }`}
          onChange={handleFieldChange}
          aria-invalid={!!fieldErrors.watering_frequency_days}
          aria-describedby={
            fieldErrors.watering_frequency_days ? 'watering-frequency-error' : undefined
          }
        />
        {fieldErrors.watering_frequency_days && (
          <div
            id="watering-frequency-error"
            className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mt-2"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {Array.isArray(fieldErrors.watering_frequency_days)
              ? fieldErrors.watering_frequency_days[0]
              : fieldErrors.watering_frequency_days}
          </div>
        )}
        {!fieldErrors.watering_frequency_days && (
          <p className="text-sm text-slate-500 mt-1">How often to water in days (1-365)</p>
        )}
      </div>

      {/* Room */}
      <div>
        <Label htmlFor="room_id" className="text-base">
          Room (Optional)
        </Label>
        <Select value={selectedRoom} onValueChange={handleRoomChange}>
          <SelectTrigger id="room_id" className="mt-2">
            <SelectValue placeholder="Select a room" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="room_id" value={selectedRoom} />
      </div>

      {/* Light Requirements */}
      <div>
        <Label htmlFor="light_requirements" className="text-base">
          Light Requirements (Optional)
        </Label>
        <Textarea
          id="light_requirements"
          name="light_requirements"
          placeholder="e.g., Bright indirect light"
          defaultValue={isEdit ? plant?.light_requirements || '' : ''}
          className="mt-2"
          rows={3}
        />
      </div>

      {/* Fertilizing Tips */}
      <div>
        <Label htmlFor="fertilizing_tips" className="text-base">
          Fertilizing Tips (Optional)
        </Label>
        <Textarea
          id="fertilizing_tips"
          name="fertilizing_tips"
          placeholder="e.g., Fertilize monthly during growing season"
          defaultValue={isEdit ? plant?.fertilizing_tips || '' : ''}
          className="mt-2"
          rows={3}
        />
      </div>

      {/* Pruning Tips */}
      <div>
        <Label htmlFor="pruning_tips" className="text-base">
          Pruning Tips (Optional)
        </Label>
        <Textarea
          id="pruning_tips"
          name="pruning_tips"
          placeholder="e.g., Prune in spring for bushier growth"
          defaultValue={isEdit ? plant?.pruning_tips || '' : ''}
          className="mt-2"
          rows={3}
        />
      </div>

      {/* Troubleshooting */}
      <div>
        <Label htmlFor="troubleshooting" className="text-base">
          Troubleshooting (Optional)
        </Label>
        <Textarea
          id="troubleshooting"
          name="troubleshooting"
          placeholder="e.g., Brown leaf tips indicate underwatering"
          defaultValue={isEdit ? plant?.troubleshooting || '' : ''}
          className="mt-2"
          rows={3}
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1" disabled={Object.keys(fieldErrors).length > 0}>
          {isEdit ? 'Save Changes' : 'Create Plant'}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </Form>
  );
}
