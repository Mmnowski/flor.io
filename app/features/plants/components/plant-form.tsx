'use client';

import { getFieldError, plantNameSchema, wateringFrequencySchema } from '~/lib';
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
import type { PlantWithDetails, Room } from '~/types/plant.types';

import { useCallback, useState } from 'react';
import { Form, useNavigate } from 'react-router';

import { FieldError, TextareaField } from './form-fields';

interface FieldErrors {
  [key: string]: string[] | undefined;
  name?: string[];
  watering_frequency_days?: string[];
}

interface PlantFormProps {
  /** Existing plant data for edit mode */
  plant?: PlantWithDetails;
  /** Available rooms for assignment */
  rooms: Room[];
  /** Server-side error message */
  error?: string | null;
  /** Server-side field validation errors */
  fieldErrors?: FieldErrors;
  /** Form mode: create new plant or edit existing */
  mode: 'create' | 'edit';
}

/**
 * PlantForm - Form component for creating and editing plants
 * Handles validation, image upload, and room/watering amount selection
 */
export function PlantForm({
  plant,
  rooms,
  error,
  fieldErrors: serverFieldErrors,
  mode,
}: PlantFormProps) {
  const navigate = useNavigate();
  const isEdit = mode === 'edit';
  const [selectedRoom, setSelectedRoom] = useState<string>(
    isEdit && plant?.room_id ? plant.room_id : ''
  );
  const [selectedWateringAmount, setSelectedWateringAmount] = useState<string>(
    isEdit && plant?.watering_amount ? plant.watering_amount : ''
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(serverFieldErrors || {});

  const handleRoomChange = useCallback((value: string) => {
    setSelectedRoom(value);
  }, []);

  const handleWateringAmountChange = useCallback((value: string) => {
    setSelectedWateringAmount(value);
  }, []);

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

  const handleFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      validateField(e.target.name, e.target.value);
    },
    [validateField]
  );

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
        {fieldErrors.name && <FieldError id="name-error" message={fieldErrors.name} />}
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
          <FieldError id="watering-frequency-error" message={fieldErrors.watering_frequency_days} />
        )}
        {!fieldErrors.watering_frequency_days && (
          <p className="text-sm text-slate-500 mt-1">How often to water in days (1-365)</p>
        )}
      </div>

      {/* Watering Amount */}
      <div>
        <Label htmlFor="watering_amount" className="text-base">
          Watering Amount (Optional)
        </Label>
        <Select value={selectedWateringAmount} onValueChange={handleWateringAmountChange}>
          <SelectTrigger id="watering_amount" className="mt-2">
            <SelectValue placeholder="Select watering amount" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Light - Small amount of water</SelectItem>
            <SelectItem value="mid">Moderate - Medium amount of water</SelectItem>
            <SelectItem value="heavy">Heavy - Thorough watering</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="watering_amount" value={selectedWateringAmount} />
        <p className="text-sm text-slate-500 mt-1">How much water to give each time</p>
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
      <TextareaField
        id="light_requirements"
        label="Light Requirements"
        placeholder="e.g., Bright indirect light"
        defaultValue={isEdit ? plant?.light_requirements || '' : ''}
      />

      {/* Fertilizing Tips */}
      <TextareaField
        id="fertilizing_tips"
        label="Fertilizing Tips"
        placeholder="e.g., Fertilize monthly during growing season"
        defaultValue={isEdit ? plant?.fertilizing_tips || '' : ''}
      />

      {/* Pruning Tips */}
      <TextareaField
        id="pruning_tips"
        label="Pruning Tips"
        placeholder="e.g., Prune in spring for bushier growth"
        defaultValue={isEdit ? plant?.pruning_tips || '' : ''}
      />

      {/* Troubleshooting */}
      <TextareaField
        id="troubleshooting"
        label="Troubleshooting"
        placeholder="e.g., Brown leaf tips indicate underwatering"
        defaultValue={isEdit ? plant?.troubleshooting || '' : ''}
      />

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1" disabled={Object.keys(fieldErrors).length > 0}>
          {isEdit ? 'Save Changes' : 'Create Plant'}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </Form>
  );
}
