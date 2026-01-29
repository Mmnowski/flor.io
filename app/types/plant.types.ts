import type { Database } from './database.types';

// Base types from database
export type Plant = Database['public']['Tables']['plants']['Row'];
export type PlantInsert = Database['public']['Tables']['plants']['Insert'];
export type PlantUpdate = Database['public']['Tables']['plants']['Update'];
export type Room = Database['public']['Tables']['rooms']['Row'];
export type WateringHistory = Database['public']['Tables']['watering_history']['Row'];

// Extended types with computed fields
export type PlantWithWatering = Plant & {
  room_name: string | null;
  next_watering_date: Date | null;
  last_watered_date: Date | null;
  days_until_watering: number | null;
  is_overdue: boolean;
};

export type PlantWithDetails = PlantWithWatering & {
  watering_history: WateringHistory[];
};

// Form data type
export type PlantFormData = {
  name: string;
  photo?: File | null;
  watering_frequency_days: number;
  room_id?: string | null;
  light_requirements?: string | null;
  fertilizing_tips?: string | null;
  pruning_tips?: string | null;
  troubleshooting?: string | null;
};

// Database insert type (without user_id, which is added by server)
export type PlantInsertData = Omit<PlantInsert, 'id' | 'created_at' | 'updated_at' | 'user_id'>;
export type PlantUpdateData = Partial<Omit<PlantInsert, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;
