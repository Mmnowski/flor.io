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
  // Server-side Supabase client
  supabaseServer,
  createAuthenticatedSupabaseClient,
  // Browser-side Supabase client
  supabaseClient,
  // Database helpers
  fetchOne,
  fetchMany,
  insertOne,
  updateOne,
  deleteOne,
  callRpc,
  type TableName,
  type Row,
  type Insert,
  type Update,
} from './infrastructure';

// ============================================================================
// Auth Domain
// ============================================================================
export {
  // Session management
  sessionStorage,
  getSession,
  commitSession,
  destroySession,
  getUserId,
  requireUserId,
  createUserSession,
  logout,
  // Authentication
  registerUser,
  loginUser,
  getUserById,
  getUserByEmail,
  // Route protection
  requireAuth,
} from './auth';

// ============================================================================
// Storage Domain (Photos & Images)
// ============================================================================
export {
  // Photo management
  uploadPlantPhoto,
  deletePlantPhoto,
  getPlantPhotoUrl,
  // Image processing
  processPlantImage,
  extractImageFromFormData,
  fileToBuffer,
} from './storage';

// ============================================================================
// Plants Domain
// ============================================================================
export {
  // CRUD operations
  createPlant,
  updatePlant,
  deletePlant,
  // Query operations
  getUserPlants,
  getPlantById,
  getNextWateringDate,
  getLastWateredDate,
  getWateringHistory,
  // AI operations
  createAIPlant,
  recordAIFeedback,
} from './plants';

// ============================================================================
// Rooms Domain
// ============================================================================
export {
  getUserRooms,
  getRoomById,
  countPlantsInRoom,
  createRoom,
  updateRoom,
  deleteRoom,
} from './rooms';

// ============================================================================
// Watering Domain
// ============================================================================
export {
  recordWatering,
  getWateringHistory as getWateringHistoryFromWatering,
  getNextWateringDate as getNextWateringDateFromWatering,
  getPlantsNeedingWater,
} from './watering';

// ============================================================================
// Usage Limits Domain
// ============================================================================
export {
  LIMITS,
  checkAIGenerationLimit,
  incrementAIUsage,
  checkPlantLimit,
  getUserUsageLimits,
  getDetailedUsage,
  type AIGenerationLimitStatus,
  type PlantCountLimitStatus,
  type UserUsageLimits,
} from './usage-limits';

// ============================================================================
// AI Integration
// ============================================================================
export {
  generateCareInstructions,
  generateCareInstructionsInstant,
  type CareInstructions,
} from './ai/openai.server';

export {
  identifyPlant,
  identifyPlantInstant,
  type PlantIdentificationResult,
} from './ai/plantnet.server';
