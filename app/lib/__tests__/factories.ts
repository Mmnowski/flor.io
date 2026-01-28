import {
  createMockPlant,
  createMockPlantWithWatering,
  createMockPlantsWithWatering,
  createMockRoom,
  createMockRooms,
  createMockWateringHistory,
  createMockWateringHistoryList,
} from '~/__tests__/factories';
import type { Plant, PlantWithWatering, Room, WateringHistory } from '~/types/plant.types';

import { vi } from 'vitest';

/**
 * Mock Supabase Select Query Response
 * Simulates the chain: .from('table').select(...)
 */
export function createMockSupabaseSelectQuery<T>(data: T | null, error: Error | null = null) {
  return {
    eq: vi.fn().mockResolvedValue({ data, error }),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  };
}

/**
 * Mock Supabase From Query
 * Simulates: supabaseServer.from('table')
 */
export function createMockSupabaseFrom<T>(data: T | T[] | null, error: Error | null = null) {
  return {
    select: vi.fn().mockReturnValue(createMockSupabaseSelectQuery(data, error)),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data, error }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data, error }),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error }),
    }),
  };
}

/**
 * Mock Supabase RPC Call
 * Simulates: supabaseServer.rpc('function_name', { param })
 */
export function createMockSupabaseRpc<T>(data: T | null, error: Error | null = null) {
  return vi.fn().mockResolvedValue({ data, error });
}

/**
 * Mock get_next_watering_date RPC Response
 */
export function createMockGetNextWateringDateResponse(daysFromNow: number = 3): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
}

/**
 * Mock get_plants_needing_water RPC Response
 */
export function createMockGetPlantsNeedingWaterResponse(count: number = 2): any[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `plant-${i}`,
    name: `Plant ${i}`,
    days_until_watering: Math.floor(Math.random() * -5), // Negative = overdue
    next_watering_date: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
  }));
}

/**
 * Mock Sharp Image Processing
 * Simulates image processing pipeline
 */
export function createMockSharpProcessor() {
  return {
    resize: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    rotate: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('mock-processed-image')),
  };
}

/**
 * Mock Supabase Storage Bucket
 * Simulates: supabaseServer.storage.from('bucket')
 */
export function createMockStorageBucket() {
  return {
    upload: vi.fn().mockResolvedValue({ data: { path: 'user-id/uuid.jpg' }, error: null }),
    remove: vi.fn().mockResolvedValue({ data: null, error: null }),
    getPublicUrl: vi.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/image.jpg' },
    }),
  };
}

/**
 * Mock storage upload error response
 */
export function createMockStorageUploadError() {
  return {
    data: null,
    error: new Error('Storage upload failed'),
  };
}

/**
 * Mock Supabase Auth Session
 */
export function createMockAuthSession(overrides?: any) {
  return {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      ...overrides,
    },
    session: {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
    },
  };
}

/**
 * Database Error Responses
 */
export function createMockDatabaseError(message: string = 'Database error') {
  return new Error(message);
}

export function createMockNetworkError() {
  return new Error('Network error');
}

export function createMockValidationError(field: string) {
  return new Error(`Validation error: ${field} is invalid`);
}

/**
 * Mock Plant Query Responses
 */
export function createMockGetPlantsResponse(count: number = 3): PlantWithWatering[] {
  return createMockPlantsWithWatering(count);
}

export function createMockGetPlantByIdResponse(
  overrides?: Partial<PlantWithWatering>
): PlantWithWatering {
  return createMockPlantWithWatering(overrides);
}

export function createMockCreatePlantResponse(overrides?: Partial<Plant>): Plant {
  return createMockPlant(overrides);
}

export function createMockUpdatePlantResponse(overrides?: Partial<Plant>): Plant {
  return createMockPlant(overrides);
}

/**
 * Mock Room Query Responses
 */
export function createMockGetRoomsResponse(count: number = 3): Room[] {
  return createMockRooms(count);
}

export function createMockGetRoomByIdResponse(overrides?: Partial<Room>): Room {
  return createMockRoom(overrides);
}

/**
 * Mock Watering Query Responses
 */
export function createMockGetWateringHistoryResponse(count: number = 5): WateringHistory[] {
  return createMockWateringHistoryList(count);
}

export function createMockRecordWateringResponse(): void {
  return undefined;
}

/**
 * Mock File Upload Responses
 */
export function createMockFileBuffer(size: number = 1024): Buffer {
  return Buffer.alloc(size, 'mock-image-data');
}

/**
 * Mock FormData for testing form submissions
 */
export function createMockFormData(fields: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  return formData;
}

/**
 * Helper to setup common Supabase mocks for plant tests
 */
export function setupMockSupabaseForPlants(
  plantsData: PlantWithWatering[] = createMockPlantsWithWatering()
) {
  return {
    from: vi.fn((table: string) => {
      if (table === 'plants') {
        return createMockSupabaseFrom(plantsData);
      }
      if (table === 'rooms') {
        return createMockSupabaseFrom(createMockRooms());
      }
      if (table === 'watering_history') {
        return createMockSupabaseFrom(createMockWateringHistoryList());
      }
      return createMockSupabaseFrom(null);
    }),
    rpc: vi.fn((fn: string) => {
      if (fn === 'get_next_watering_date') {
        return Promise.resolve({
          data: createMockGetNextWateringDateResponse(),
          error: null,
        });
      }
      if (fn === 'get_plants_needing_water') {
        return Promise.resolve({
          data: createMockGetPlantsNeedingWaterResponse(),
          error: null,
        });
      }
      return Promise.resolve({ data: null, error: null });
    }),
  };
}

/**
 * Helper to setup common Supabase mocks for storage tests
 */
export function setupMockSupabaseStorage() {
  return {
    storage: {
      from: vi.fn().mockReturnValue(createMockStorageBucket()),
    },
  };
}

/**
 * Helper to setup complete Supabase mock
 */
export function setupMockSupabaseComplete(plantsData?: PlantWithWatering[]) {
  return {
    ...setupMockSupabaseForPlants(plantsData),
    ...setupMockSupabaseStorage(),
  };
}
