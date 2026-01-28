import { PlantForm } from '~/features/plants/components';
import { requireAuth } from '~/lib/auth';
import { getPlantById, updatePlant } from '~/lib/plants';
import { getUserRooms } from '~/lib/rooms';
import { extractImageFromFormData, fileToBuffer, processPlantImage } from '~/lib/storage';
import { deletePlantPhoto, uploadPlantPhoto } from '~/lib/storage';
import { Button } from '~/shared/components';
import { logger } from '~/shared/lib/logger';

import { Link, redirect, useActionData, useLoaderData } from 'react-router';

import type { Route } from './+types/dashboard.plants.$plantId.edit';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const userId = await requireAuth(request);
  const plantId = params.plantId;

  if (!plantId) {
    throw new Response('Not Found', { status: 404 });
  }

  const [plant, rooms] = await Promise.all([getPlantById(plantId, userId), getUserRooms(userId)]);

  if (!plant) {
    throw new Response('Not Found', { status: 404 });
  }

  return { plant, rooms };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  if (request.method !== 'POST') {
    return null;
  }

  try {
    const userId = await requireAuth(request);
    const plantId = params.plantId;

    if (!plantId) {
      throw new Response('Not Found', { status: 404 });
    }

    const formData = await request.formData();

    // Extract fields
    const name = formData.get('name');
    const wateringFrequencyStr = formData.get('watering_frequency_days');
    const roomId = formData.get('room_id');
    const lightRequirements = formData.get('light_requirements');
    const fertilizingTips = formData.get('fertilizing_tips');
    const pruningTips = formData.get('pruning_tips');
    const troubleshooting = formData.get('troubleshooting');

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return { error: 'Plant name is required' };
    }

    const wateringFrequency = Number(wateringFrequencyStr);
    if (wateringFrequency < 1 || wateringFrequency > 365) {
      return { error: 'Watering frequency must be between 1 and 365 days' };
    }

    // Get current plant to check for old photo
    const currentPlant = await getPlantById(plantId, userId);
    if (!currentPlant) {
      throw new Response('Not Found', { status: 404 });
    }

    // Handle photo update
    let photoUrl: string | null | undefined = undefined;
    try {
      const photoFile = await extractImageFromFormData(formData, 'photo');
      if (photoFile) {
        // Process and upload new photo
        const buffer = await fileToBuffer(photoFile);
        const processedBuffer = await processPlantImage(buffer);
        photoUrl = await uploadPlantPhoto(userId, processedBuffer, 'image/jpeg');

        if (!photoUrl) {
          return { error: 'Failed to upload photo. Please try again.' };
        }

        // Delete old photo if exists
        if (currentPlant.photo_url) {
          await deletePlantPhoto(currentPlant.photo_url);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Image processing failed';
      return { error: message };
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      watering_frequency_days: wateringFrequency,
      room_id: roomId && typeof roomId === 'string' && roomId !== '' ? roomId : null,
      light_requirements:
        lightRequirements && typeof lightRequirements === 'string'
          ? lightRequirements.trim() || null
          : null,
      fertilizing_tips:
        fertilizingTips && typeof fertilizingTips === 'string'
          ? fertilizingTips.trim() || null
          : null,
      pruning_tips:
        pruningTips && typeof pruningTips === 'string' ? pruningTips.trim() || null : null,
      troubleshooting:
        troubleshooting && typeof troubleshooting === 'string'
          ? troubleshooting.trim() || null
          : null,
    };

    // Only update photo if new one was uploaded
    if (photoUrl) {
      updateData.photo_url = photoUrl;
    }

    // Update plant
    await updatePlant(plantId, userId, updateData);

    // Redirect to detail view
    return redirect(`/dashboard/plants/${plantId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update plant';
    logger.error('Error in edit plant action', error);
    return { error: message };
  }
};

export default function EditPlant() {
  const { plant, rooms } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to={`/dashboard/plants/${plant.id}`}>
        <Button variant="outline" className="mb-4">
          ← Back
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-8">Edit Plant</h1>
      <PlantForm plant={plant} rooms={rooms} mode="edit" error={actionData?.error} />
    </div>
  );
}
