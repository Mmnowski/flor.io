/**
 * Root Library Barrel Export - Backward Compatibility Layer
 *
 * Re-exports all public APIs from domain-organized subdirectories.
 * This maintains backward compatibility with existing import statements:
 * - `import { X } from '~/lib/[file].server'`
 * - `import { X } from '~/lib/[item]'`
 *
 * New code should import directly from domain modules:
 * - `import { X } from '~/lib'`
 * - `import { X } from '~/lib'`
 * - `import { X } from '~/lib'`
 *
 * Organized by domain/functional area:
 * - utils: Constants, validation, error handling
 * - infrastructure: Supabase clients and database helpers
 * - auth: User authentication and session management
 * - plants: Plant CRUD, queries, and AI operations
 * - rooms: Room management
 * - watering: Watering tracking and scheduling
 * - storage: Photo uploads and image processing
 * - ai: External AI integrations
 * - usage-limits: Quota tracking
 */

// ============================================================================
// Utils Domain
// ============================================================================
export {
  // Constants
  MS_PER_DAY,
  SECONDS_PER_DAY,
  DAYS_PER_WEEK,
  FREE_AI_GENERATIONS_PER_MONTH,
  MAX_PLANTS_PER_USER,
  MAX_ROOMS_PER_USER,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
  ALLOWED_IMAGE_TYPES,
  MAX_PLANT_NAME_LENGTH,
  MIN_WATERING_FREQUENCY_DAYS,
  MAX_WATERING_FREQUENCY_DAYS,
  DEFAULT_WATERING_FREQUENCY_DAYS,
  MAX_ROOM_NAME_LENGTH,
  DEFAULT_REQUEST_TIMEOUT_MS,
  AI_REQUEST_TIMEOUT_MS,
  DEFAULT_PLANTS_PER_PAGE,
  DEFAULT_WATERING_HISTORY_LIMIT,
  PLANT_DATA_CACHE_DURATION_MS,
  USER_PREFERENCES_CACHE_DURATION_MS,
  NOTIFICATION_TOAST_DURATION_MS,
  MODAL_ANIMATION_DURATION_MS,
  VERIFY_EMAIL_TOKEN_EXPIRY_HOURS,
  PASSWORD_RESET_TOKEN_EXPIRY_HOURS,
  DEFAULT_PLANTS_OVERDUE_THRESHOLD_DAYS,
  DEFAULT_PLANTS_DUE_SOON_THRESHOLD_DAYS,
  ENABLE_AI_PLANT_IDENTIFICATION,
  // Utils
  cn,
  // Validation
  emailSchema,
  passwordSchema,
  plantNameSchema,
  wateringFrequencySchema,
  roomNameSchema,
  imageFileSchema,
  loginSchema,
  registerSchema,
  plantFormSchema,
  roomFormSchema,
  validateForm,
  getFieldError,
  type LoginInput,
  type RegisterInput,
  type PlantFormInput,
  type RoomFormInput,
  // Error handling
  TypedError,
  parseError,
  withTimeout,
  withRetry,
  isNetworkError,
  isRetryable,
  type ErrorType,
  type ErrorInfo,
} from './utils';

// ============================================================================
// Infrastructure Domain (Supabase & Database)
// ============================================================================
export {
  // Browser-side Supabase client only
  supabaseClient,
} from './infrastructure';

// Note: Server-only infrastructure (supabaseServer, database helpers, etc.)
// must be imported directly from './infrastructure/supabase.server' and
// './infrastructure/supabase-helpers' in server-side contexts to prevent
// server code from being bundled into the client.

// ============================================================================
// Auth Domain (Server-Only)
// ============================================================================
// All auth functions are server-only and must be imported directly from
// their .server files in server-side contexts (loaders/actions).
//
// Import directly:
// - import { getSession, requireAuth, ... } from '~/lib/auth/session.server'
// - import { registerUser, loginUser, ... } from '~/lib/auth/auth.server'

// ============================================================================
// Storage Domain (Photos & Images - Server-Only)
// ============================================================================
// Photo upload/deletion and image processing are server-only and must be imported
// directly from their .server files in server-side contexts (loaders/actions).
//
// Import directly:
// - import { uploadPlantPhoto, deletePlantPhoto, ... } from '~/lib/storage/storage.server'
// - import { processPlantImage, extractImageFromFormData, ... } from '~/lib/storage/image.server'

// ============================================================================
// Plants Domain (Server-Only)
// ============================================================================
// Plant CRUD, queries, and AI operations are server-only and must be imported
// directly from their specific .server files in server-side contexts.
//
// Import directly:
// - import { createPlant, updatePlant, ... } from '~/lib/plants/crud.server'
// - import { getUserPlants, getPlantById, ... } from '~/lib/plants/queries.server'
// - import { createAIPlant, recordAIFeedback } from '~/lib/plants/ai.server'

// ============================================================================
// Server-Only Domains (not exported from barrel)
// ============================================================================
// Rooms, Watering, and Usage Limits are server-only and must be imported
// directly from their .server files in server-side contexts (loaders/actions)
// to prevent server code from being bundled into the client.
//
// Import directly:
// - import { getUserRooms, ... } from '~/lib/rooms/rooms.server'
// - import { recordWatering, ... } from '~/lib/watering/watering.server'
// - import { checkAIGenerationLimit, ... } from '~/lib/usage-limits/usage-limits.server'
