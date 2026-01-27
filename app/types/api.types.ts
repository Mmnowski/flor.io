import type { Plant, PlantWithWatering, Room, WateringHistory } from './plant.types';

/**
 * Standard API response wrapper for successful responses
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: never;
}

/**
 * Standard API response wrapper for error responses
 */
export interface ApiErrorResponse {
  data?: never;
  error: string;
}

/**
 * Union type for API responses
 */
export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

/**
 * Plant needing water (from RPC query result)
 */
export interface PlantNeedingWater {
  plant_id: string;
  plant_name: string;
  photo_url: string | null;
  last_watered: string;
  next_watering: string;
  days_overdue: number;
}

/**
 * Response from /api/notifications endpoint
 */
export interface NotificationsResponse {
  notifications: PlantNeedingWater[];
  count: number;
}

/**
 * Response from watering action
 */
export interface WaterPlantResponse {
  success: boolean;
  plant_id: string;
  watered_at: string;
}

/**
 * Response from creating a plant
 */
export interface CreatePlantResponse {
  plant: Plant;
  success: boolean;
}

/**
 * Response from updating a plant
 */
export interface UpdatePlantResponse {
  plant: Plant;
  success: boolean;
}

/**
 * Response from deleting a plant
 */
export interface DeletePlantResponse {
  plant_id: string;
  success: boolean;
}

/**
 * Response from getting plants list
 */
export interface GetPlantsResponse {
  plants: PlantWithWatering[];
  count: number;
}

/**
 * Response from getting plant details
 */
export interface GetPlantResponse {
  plant: PlantWithWatering;
  history: WateringHistory[];
}

/**
 * Response from getting rooms
 */
export interface GetRoomsResponse {
  rooms: Room[];
  count: number;
}

/**
 * Response from creating a room
 */
export interface CreateRoomResponse {
  room: Room;
  success: boolean;
}

/**
 * Response from updating a room
 */
export interface UpdateRoomResponse {
  room: Room;
  success: boolean;
}

/**
 * Response from deleting a room
 */
export interface DeleteRoomResponse {
  room_id: string;
  success: boolean;
}

/**
 * AI identification result
 */
export interface AIIdentificationResult {
  plant_name: string;
  confidence: number;
  care_instructions: string;
}

/**
 * AI care generation result
 */
export interface AICareResult {
  watering_frequency_days: number;
  light_requirements: string;
  fertilizing_tips: string;
  pruning_tips: string;
  troubleshooting: string;
}

/**
 * Response from AI plant identification
 */
export interface AIPlantIdentificationResponse {
  result: AIIdentificationResult | null;
  success: boolean;
  error?: string;
}

/**
 * Response from AI care generation
 */
export interface AICareGenerationResponse {
  care: AICareResult | null;
  success: boolean;
  error?: string;
}
