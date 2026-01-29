import type {
  Plant,
  PlantWithWatering,
  PlantWithDetails,
  Room,
  WateringHistory,
  PlantFormData,
} from '~/types/plant.types';

/**
 * Create a mock Plant object
 * Use this as the base for creating plants in tests
 */
export function createMockPlant(overrides?: Partial<Plant>): Plant {
  const now = new Date().toISOString();
  return {
    id: 'plant-123',
    user_id: 'user-456',
    name: 'Mock Plant',
    photo_url: null,
    watering_frequency_days: 7,
    room_id: null,
    light_requirements: null,
    fertilizing_tips: null,
    pruning_tips: null,
    troubleshooting: null,
    created_with_ai: false,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

/**
 * Create a mock Plant with watering information
 * Includes computed fields for watering status
 */
export function createMockPlantWithWatering(
  overrides?: Partial<PlantWithWatering>
): PlantWithWatering {
  const now = new Date();
  const nextWatering = new Date(now);
  nextWatering.setDate(nextWatering.getDate() + 3);

  return {
    ...createMockPlant(),
    room_name: null,
    next_watering_date: nextWatering,
    last_watered_date: now,
    days_until_watering: 3,
    is_overdue: false,
    ...overrides,
  };
}

/**
 * Create a mock Plant with full details including watering history
 * Use for testing detail views and complex components
 */
export function createMockPlantWithDetails(
  overrides?: Partial<PlantWithDetails>,
  wateringHistoryOverrides?: Partial<WateringHistory>[]
): PlantWithDetails {
  const mockHistory = wateringHistoryOverrides || [
    createMockWateringHistory(),
    createMockWateringHistory({
      watered_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    }),
    createMockWateringHistory({
      watered_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    }),
  ];

  return {
    ...createMockPlantWithWatering(),
    watering_history: mockHistory,
    ...overrides,
  };
}

/**
 * Create a mock Room object
 */
export function createMockRoom(overrides?: Partial<Room>): Room {
  return {
    id: 'room-123',
    user_id: 'user-456',
    name: 'Living Room',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create multiple mock rooms
 * Useful for testing room filtering and selection
 */
export function createMockRooms(count: number = 3): Room[] {
  const rooms: Room[] = [];
  const roomNames = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office'];

  for (let i = 0; i < count; i++) {
    rooms.push(
      createMockRoom({
        id: `room-${i}`,
        name: roomNames[i % roomNames.length],
      })
    );
  }

  return rooms;
}

/**
 * Create a mock WateringHistory entry
 */
export function createMockWateringHistory(
  overrides?: Partial<WateringHistory>
): WateringHistory {
  const now = new Date().toISOString();
  return {
    id: `watering-${Math.random().toString(36).substr(2, 9)}`,
    plant_id: 'plant-123',
    watered_at: now,
    created_at: now,
    ...overrides,
  };
}

/**
 * Create mock watering history array
 * Useful for testing history displays
 */
export function createMockWateringHistoryList(
  count: number = 5,
  plantId: string = 'plant-123'
): WateringHistory[] {
  const history: WateringHistory[] = [];
  const baseDate = Date.now();

  for (let i = 0; i < count; i++) {
    const daysAgo = i * 7;
    const date = new Date(baseDate - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    history.push(
      createMockWateringHistory({
        id: `watering-${i}`,
        plant_id: plantId,
        watered_at: date,
        created_at: date,
      })
    );
  }

  return history;
}

/**
 * Create a mock Plant with a specific room
 * Useful for testing room-related functionality
 */
export function createMockPlantInRoom(
  room: Room,
  overrides?: Partial<PlantWithWatering>
): PlantWithWatering {
  return createMockPlantWithWatering({
    room_id: room.id,
    room_name: room.name,
    ...overrides,
  });
}

/**
 * Create multiple plants with watering info
 * Useful for testing plant lists and grids
 */
export function createMockPlantsWithWatering(
  count: number = 3,
  baseOverrides?: Partial<PlantWithWatering>
): PlantWithWatering[] {
  const plants: PlantWithWatering[] = [];
  const plantNames = [
    'Monstera',
    'Succulent',
    'Snake Plant',
    'Pothos',
    'Fern',
    'Orchid',
  ];

  for (let i = 0; i < count; i++) {
    const daysUntil = Math.floor(Math.random() * 7) - 2; // -2 to 5 days
    const nextWatering = new Date();
    nextWatering.setDate(nextWatering.getDate() + daysUntil);

    plants.push(
      createMockPlantWithWatering({
        id: `plant-${i}`,
        name: plantNames[i % plantNames.length],
        days_until_watering: daysUntil,
        is_overdue: daysUntil < 0,
        next_watering_date: nextWatering,
        ...baseOverrides,
      })
    );
  }

  return plants;
}

/**
 * Create mock form data for plant creation
 * Useful for testing forms and submissions
 */
export function createMockPlantFormData(
  overrides?: Partial<PlantFormData>
): PlantFormData {
  return {
    name: 'Test Plant',
    photo: null,
    watering_frequency_days: 7,
    room_id: null,
    light_requirements: 'Bright indirect light',
    fertilizing_tips: 'Monthly during growing season',
    pruning_tips: 'Prune in spring for bushier growth',
    troubleshooting: 'Brown tips indicate underwatering',
    ...overrides,
  };
}

/**
 * Create a mock File object for testing file uploads
 */
export function createMockImageFile(
  overrides?: Partial<File>
): File {
  const buffer = Buffer.from('mock-image-data');
  const blob = new Blob([buffer], { type: 'image/jpeg' });

  const file = new File([blob], 'test-plant.jpg', { type: 'image/jpeg' });

  return file;
}

/**
 * Create overdue plant (for testing overdue status)
 */
export function createMockOverduePlant(
  overrides?: Partial<PlantWithWatering>
): PlantWithWatering {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return createMockPlantWithWatering({
    days_until_watering: -1,
    is_overdue: true,
    next_watering_date: yesterday,
    ...overrides,
  });
}

/**
 * Create plant due today (for testing due today status)
 */
export function createMockPlantDueToday(
  overrides?: Partial<PlantWithWatering>
): PlantWithWatering {
  const today = new Date();

  return createMockPlantWithWatering({
    days_until_watering: 0,
    is_overdue: false,
    next_watering_date: today,
    ...overrides,
  });
}

/**
 * Create plant with all optional fields filled
 * Useful for testing full content rendering
 */
export function createMockPlantWithAllFields(
  overrides?: Partial<PlantWithDetails>
): PlantWithDetails {
  return createMockPlantWithDetails({
    name: 'Monstera Deliciosa',
    photo_url: 'https://example.com/plant.jpg',
    room_id: 'room-123',
    room_name: 'Living Room',
    light_requirements: 'Bright indirect light, tolerates low light',
    fertilizing_tips: 'Fertilize monthly during growing season (spring/summer)',
    pruning_tips: 'Prune in spring for bushier growth, remove dead leaves',
    troubleshooting:
      'Brown leaf tips: underwatering. Yellow leaves: overwatering',
    ...overrides,
  });
}

/**
 * Create plant with minimal fields (for testing required fields only)
 */
export function createMockPlantMinimal(
  overrides?: Partial<PlantWithWatering>
): PlantWithWatering {
  return createMockPlantWithWatering({
    photo_url: null,
    room_id: null,
    room_name: null,
    light_requirements: null,
    fertilizing_tips: null,
    pruning_tips: null,
    troubleshooting: null,
    ...overrides,
  });
}
