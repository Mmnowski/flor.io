/**
 * AI Plant Creation Wizard Route
 *
 * Multi-step wizard for creating plants with AI assistance.
 * Entry point: /dashboard/plants/new-ai
 * Flow: Upload → Identify → Confirm → Generate → Preview → Feedback → Success
 */
import { AIWizardPage } from '~/features/ai-wizard/components';
import { generateCareInstructions } from '~/lib/ai/openai.server';
import { identifyPlant } from '~/lib/ai/plantid.server';
import { requireAuth } from '~/lib/auth/require-auth.server';
import { base64ToBuffer } from '~/lib/file';
import { createAIPlant, recordAIFeedback } from '~/lib/plants/ai.server';
import { getUserRooms } from '~/lib/rooms/rooms.server';
import { processPlantImage } from '~/lib/storage/image.server';
import { uploadPlantPhoto } from '~/lib/storage/storage.server';
import {
  checkAIGenerationLimit,
  checkPlantLimit,
  incrementAIUsage,
} from '~/lib/usage-limits/usage-limits.server';
import { logger } from '~/shared/lib/logger';

import { redirect, useLoaderData } from 'react-router';

import type { Route } from './+types/dashboard.plants.new-ai';

/**
 * Loader validates authentication and limits before entering wizard
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await requireAuth(request);

  // Check if user can create plants
  const plantLimitStatus = await checkPlantLimit(userId);
  if (!plantLimitStatus.allowed) {
    throw new Error(`Plant limit reached: ${plantLimitStatus.limit} max plants`);
  }

  // Check if user can use AI
  const aiLimitStatus = await checkAIGenerationLimit(userId);
  if (!aiLimitStatus.allowed) {
    throw new Error(`AI generation limit reached: ${aiLimitStatus.limit} per month`);
  }

  // Get user's rooms for dropdown
  const rooms = await getUserRooms(userId);

  return {
    userId,
    aiRemaining: aiLimitStatus.limit - aiLimitStatus.used,
    rooms: rooms || [],
  };
};

/**
 * Action handler processes form submissions from wizard steps
 * Handles plant creation and feedback recording
 */
export const action = async ({ request }: Route.ActionArgs) => {
  const userId = await requireAuth(request);
  const formData = await request.formData();
  const action = formData.get('_action') as string;

  // Validate action parameter
  if (!action) {
    return { error: 'Invalid action' };
  }

  try {
    switch (action) {
      case 'identify-plant': {
        // Identify plant from uploaded image (base64 encoded)
        const imageBase64 = formData.get('plantImageBase64') as string | null;

        if (!imageBase64) {
          return { error: 'Image file is required' };
        }

        try {
          // Decode base64 to buffer
          const buffer = base64ToBuffer(imageBase64);
          const result = await identifyPlant(buffer);
          return {
            success: true,
            identification: result,
          };
        } catch (error) {
          logger.error('Plant identification failed', error);
          return {
            error: error instanceof Error ? error.message : 'Plant identification failed',
          };
        }
      }

      case 'generate-care': {
        // Generate care instructions for identified plant
        const plantName = formData.get('plantName') as string;

        if (!plantName) {
          return { error: 'Plant name is required' };
        }

        try {
          const careInstructions = await generateCareInstructions(plantName);
          return {
            success: true,
            careInstructions,
          };
        } catch (error) {
          logger.error('Care instruction generation failed', error);
          return {
            error: error instanceof Error ? error.message : 'Failed to generate care instructions',
          };
        }
      }

      case 'save-plant': {
        // Parse plant data from form
        const name = formData.get('name') as string;
        const wateringFrequencyDays = parseInt(formData.get('wateringFrequencyDays') as string, 10);
        const lightRequirements = formData.get('lightRequirements') as string;
        const roomId = formData.get('roomId') as string | null;

        // Parse array fields (fertilizingTips, pruningTips, troubleshooting)
        const fertilizingTips = JSON.parse(formData.get('fertilizingTips') as string);
        const pruningTips = JSON.parse(formData.get('pruningTips') as string);
        const troubleshooting = JSON.parse(formData.get('troubleshooting') as string);

        // Handle photo if provided
        let photoUrl: string | null = null;
        const photoFile = formData.get('photoFile') as File | null;

        if (photoFile && photoFile.size > 0) {
          // Read file as buffer
          const buffer = Buffer.from(await photoFile.arrayBuffer());

          // Process image (compress, resize)
          const processedBuffer = await processPlantImage(buffer);

          // Upload to storage
          photoUrl = await uploadPlantPhoto(userId, processedBuffer, 'image/jpeg');
        }

        // Create plant with AI flag
        const plant = await createAIPlant(userId, {
          name,
          watering_frequency_days: wateringFrequencyDays,
          light_requirements: lightRequirements,
          fertilizing_tips: fertilizingTips,
          pruning_tips: pruningTips,
          troubleshooting: troubleshooting,
          photo_url: photoUrl,
          room_id: roomId || null,
        });

        // Increment AI usage
        await incrementAIUsage(userId);

        return {
          success: true,
          plantId: plant.id,
        };
      }

      case 'save-feedback': {
        // Parse feedback data
        const plantId = formData.get('plantId') as string;
        const feedbackType = formData.get('feedbackType') as 'thumbs_up' | 'thumbs_down';
        const comment = formData.get('comment') as string | null;
        const aiResponseSnapshot = JSON.parse(formData.get('aiResponseSnapshot') as string);

        // Record feedback
        await recordAIFeedback(userId, plantId, feedbackType, comment || '', aiResponseSnapshot);

        // Redirect to plant details
        return redirect(`/dashboard/plants/${plantId}`);
      }

      default:
        return { error: 'Unknown action' };
    }
  } catch (error) {
    logger.error('Wizard action error', error);
    return {
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
};

/**
 * Component renders the AI wizard UI
 */
export default function AIWizardRoute() {
  const loaderData = useLoaderData<typeof loader>();

  const handleComplete = (plantId: string) => {
    // Navigate to plant details page
    window.location.href = `/dashboard/plants/${plantId}`;
  };

  return (
    <AIWizardPage
      userId={loaderData.userId}
      aiRemaining={loaderData.aiRemaining}
      rooms={loaderData.rooms}
      onComplete={handleComplete}
    />
  );
}
