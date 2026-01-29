/**
 * Global constants for the Flor.io application
 */

// Time-related constants
export const MS_PER_DAY = 1000 * 60 * 60 * 24;
export const SECONDS_PER_DAY = 60 * 60 * 24;
export const DAYS_PER_WEEK = 7;

// User limits and quotas
export const FREE_AI_GENERATIONS_PER_MONTH = 5;
export const MAX_PLANTS_PER_USER = 1000;
export const MAX_ROOMS_PER_USER = 50;

// File upload constraints
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Plant-related constraints
export const MAX_PLANT_NAME_LENGTH = 100;
export const MIN_WATERING_FREQUENCY_DAYS = 1;
export const MAX_WATERING_FREQUENCY_DAYS = 365;
export const DEFAULT_WATERING_FREQUENCY_DAYS = 3;

// Room constraints
export const MAX_ROOM_NAME_LENGTH = 50;

// API request timeouts
export const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
export const AI_REQUEST_TIMEOUT_MS = 60000;

// Pagination
export const DEFAULT_PLANTS_PER_PAGE = 20;
export const DEFAULT_WATERING_HISTORY_LIMIT = 10;

// Cache durations (in milliseconds)
export const PLANT_DATA_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
export const USER_PREFERENCES_CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

// UI configuration
export const NOTIFICATION_TOAST_DURATION_MS = 3000;
export const MODAL_ANIMATION_DURATION_MS = 200;

// Email-related
export const VERIFY_EMAIL_TOKEN_EXPIRY_HOURS = 24;
export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;

// Default values
export const DEFAULT_PLANTS_OVERDUE_THRESHOLD_DAYS = -1; // Plants with negative days until watering
export const DEFAULT_PLANTS_DUE_SOON_THRESHOLD_DAYS = 2; // Plants watering due within 2 days

// Feature flags (can be moved to environment variables)
export const ENABLE_AI_PLANT_IDENTIFICATION = true;
