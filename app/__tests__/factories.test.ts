import { describe, it, expect } from 'vitest';
import {
  createMockPlant,
  createMockPlantWithWatering,
  createMockPlantWithDetails,
  createMockRoom,
  createMockRooms,
  createMockWateringHistory,
  createMockWateringHistoryList,
  createMockPlantsWithWatering,
  createMockPlantFormData,
  createMockImageFile,
  createMockOverduePlant,
  createMockPlantDueToday,
  createMockPlantWithAllFields,
} from './factories';

describe('Factory Functions', () => {
  describe('createMockPlant', () => {
    it('should create a plant with default values', () => {
      const plant = createMockPlant();

      expect(plant.id).toBe('plant-123');
      expect(plant.user_id).toBe('user-456');
      expect(plant.name).toBe('Mock Plant');
      expect(plant.watering_frequency_days).toBe(7);
    });

    it('should allow overriding plant properties', () => {
      const plant = createMockPlant({ name: 'Custom Plant', watering_frequency_days: 14 });

      expect(plant.name).toBe('Custom Plant');
      expect(plant.watering_frequency_days).toBe(14);
      expect(plant.id).toBe('plant-123'); // Default still applies
    });
  });

  describe('createMockPlantWithWatering', () => {
    it('should include watering fields', () => {
      const plant = createMockPlantWithWatering();

      expect(plant.room_name).toBeDefined();
      expect(plant.next_watering_date).toBeInstanceOf(Date);
      expect(plant.last_watered_date).toBeInstanceOf(Date);
      expect(plant.days_until_watering).toBeDefined();
      expect(plant.is_overdue).toBeDefined();
    });

    it('should default to not overdue', () => {
      const plant = createMockPlantWithWatering();

      expect(plant.is_overdue).toBe(false);
      expect(plant.days_until_watering).toBeGreaterThan(0);
    });
  });

  describe('createMockPlantWithDetails', () => {
    it('should include watering history', () => {
      const plant = createMockPlantWithDetails();

      expect(plant.watering_history).toBeDefined();
      expect(Array.isArray(plant.watering_history)).toBe(true);
      expect(plant.watering_history.length).toBeGreaterThan(0);
    });

    it('should allow custom watering history', () => {
      const history = [
        createMockWateringHistory({ id: 'h1' }),
        createMockWateringHistory({ id: 'h2' }),
      ];

      const plant = createMockPlantWithDetails({}, history);

      expect(plant.watering_history).toHaveLength(2);
      expect(plant.watering_history[0].id).toBe('h1');
    });
  });

  describe('createMockRoom', () => {
    it('should create a room with default values', () => {
      const room = createMockRoom();

      expect(room.id).toBe('room-123');
      expect(room.user_id).toBe('user-456');
      expect(room.name).toBe('Living Room');
    });
  });

  describe('createMockRooms', () => {
    it('should create multiple rooms', () => {
      const rooms = createMockRooms(3);

      expect(rooms).toHaveLength(3);
      expect(rooms[0].id).toBe('room-0');
      expect(rooms[1].id).toBe('room-1');
      expect(rooms[2].id).toBe('room-2');
    });

    it('should have different names for each room', () => {
      const rooms = createMockRooms(5);

      const names = rooms.map((r) => r.name);
      expect(new Set(names).size).toBeGreaterThanOrEqual(3); // Some repetition expected
    });
  });

  describe('createMockWateringHistory', () => {
    it('should create a watering history entry', () => {
      const history = createMockWateringHistory();

      expect(history.id).toBeDefined();
      expect(history.plant_id).toBe('plant-123');
      expect(history.watered_at).toBeDefined();
      expect(history.created_at).toBeDefined();
    });
  });

  describe('createMockWateringHistoryList', () => {
    it('should create multiple history entries', () => {
      const history = createMockWateringHistoryList(5);

      expect(history).toHaveLength(5);
      expect(history[0].watered_at).toBeDefined();
    });

    it('should have dates in descending order (newest first)', () => {
      const history = createMockWateringHistoryList(3);

      const date1 = new Date(history[0].watered_at);
      const date2 = new Date(history[1].watered_at);

      expect(date1.getTime()).toBeGreaterThan(date2.getTime());
    });
  });

  describe('createMockPlantsWithWatering', () => {
    it('should create multiple plants with watering data', () => {
      const plants = createMockPlantsWithWatering(3);

      expect(plants).toHaveLength(3);
      expect(plants[0].next_watering_date).toBeInstanceOf(Date);
      expect(plants[0].days_until_watering).toBeDefined();
    });

    it('should vary days_until_watering', () => {
      const plants = createMockPlantsWithWatering(10);

      const days = plants.map((p) => p.days_until_watering);
      const unique = new Set(days);

      // Should have some variation
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe('createMockPlantFormData', () => {
    it('should create form data with required fields', () => {
      const formData = createMockPlantFormData();

      expect(formData.name).toBeDefined();
      expect(formData.watering_frequency_days).toBeGreaterThan(0);
    });

    it('should allow overriding form data', () => {
      const formData = createMockPlantFormData({
        name: 'Special Plant',
        watering_frequency_days: 14,
      });

      expect(formData.name).toBe('Special Plant');
      expect(formData.watering_frequency_days).toBe(14);
    });
  });

  describe('createMockImageFile', () => {
    it('should create a File object', () => {
      const file = createMockImageFile();

      expect(file).toBeInstanceOf(File);
      expect(file.type).toBe('image/jpeg');
      expect(file.name).toContain('.jpg');
    });
  });

  describe('createMockOverduePlant', () => {
    it('should create an overdue plant', () => {
      const plant = createMockOverduePlant();

      expect(plant.is_overdue).toBe(true);
      expect(plant.days_until_watering).toBeLessThan(0);
    });
  });

  describe('createMockPlantDueToday', () => {
    it('should create a plant due today', () => {
      const plant = createMockPlantDueToday();

      expect(plant.is_overdue).toBe(false);
      expect(plant.days_until_watering).toBe(0);
    });
  });

  describe('createMockPlantWithAllFields', () => {
    it('should have all optional fields filled', () => {
      const plant = createMockPlantWithAllFields();

      expect(plant.photo_url).not.toBeNull();
      expect(plant.room_id).not.toBeNull();
      expect(plant.room_name).not.toBeNull();
      expect(plant.light_requirements).not.toBeNull();
      expect(plant.fertilizing_tips).not.toBeNull();
      expect(plant.pruning_tips).not.toBeNull();
      expect(plant.troubleshooting).not.toBeNull();
      expect(plant.watering_history).toHaveLength(3);
    });
  });
});
