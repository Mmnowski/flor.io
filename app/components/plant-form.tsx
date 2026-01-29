'use client';

import { useState } from 'react';
import { Form } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { FormError } from '~/components/form-error';
import { ImageUpload } from '~/components/image-upload';
import type { PlantWithDetails, Room } from '~/types/plant.types';

interface PlantFormProps {
  plant?: PlantWithDetails;
  rooms: Room[];
  error?: string | null;
  mode: 'create' | 'edit';
}

export function PlantForm({ plant, rooms, error, mode }: PlantFormProps) {
  const isEdit = mode === 'edit';
  const [selectedRoom, setSelectedRoom] = useState<string>(isEdit && plant?.room_id ? plant.room_id : '');

  const handleRoomChange = (value: string) => {
    setSelectedRoom(value);
  };

  return (
    <Form method="post" encType="multipart/form-data" className="space-y-6 max-w-2xl">
      {error && <FormError message={error} />}

      {/* Photo Upload */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Plant Photo</Label>
        <ImageUpload
          currentPhotoUrl={isEdit ? plant?.photo_url : undefined}
        />
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
          className="mt-2"
        />
        <p className="text-sm text-slate-500 mt-1">Maximum 100 characters</p>
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
          className="mt-2"
        />
        <p className="text-sm text-slate-500 mt-1">How often to water in days (1-365)</p>
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
        <Button type="submit" className="flex-1">
          {isEdit ? 'Save Changes' : 'Create Plant'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
      </div>
    </Form>
  );
}
