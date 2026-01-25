export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      plants: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          photo_url: string | null;
          watering_frequency_days: number;
          room_id: string | null;
          light_requirements: string | null;
          fertilizing_tips: string | null;
          pruning_tips: string | null;
          troubleshooting: string | null;
          created_with_ai: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          photo_url?: string | null;
          watering_frequency_days: number;
          room_id?: string | null;
          light_requirements?: string | null;
          fertilizing_tips?: string | null;
          pruning_tips?: string | null;
          troubleshooting?: string | null;
          created_with_ai?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          photo_url?: string | null;
          watering_frequency_days?: number;
          room_id?: string | null;
          light_requirements?: string | null;
          fertilizing_tips?: string | null;
          pruning_tips?: string | null;
          troubleshooting?: string | null;
          created_with_ai?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      watering_history: {
        Row: {
          id: string;
          plant_id: string;
          watered_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          plant_id: string;
          watered_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          plant_id?: string;
          watered_at?: string;
          created_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      ai_feedback: {
        Row: {
          id: string;
          user_id: string;
          plant_id: string;
          feedback_type: "thumbs_up" | "thumbs_down";
          comment: string | null;
          ai_response_snapshot: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plant_id: string;
          feedback_type: "thumbs_up" | "thumbs_down";
          comment?: string | null;
          ai_response_snapshot?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plant_id?: string;
          feedback_type?: "thumbs_up" | "thumbs_down";
          comment?: string | null;
          ai_response_snapshot?: Json | null;
          created_at?: string;
        };
      };
      usage_limits: {
        Row: {
          id: string;
          user_id: string;
          ai_generations_this_month: number;
          month_year: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ai_generations_this_month?: number;
          month_year: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ai_generations_this_month?: number;
          month_year?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      get_next_watering_date: {
        Args: {
          p_plant_id: string;
        };
        Returns: string;
      };
      get_plants_needing_water: {
        Args: {
          p_user_id: string;
        };
        Returns: Array<{
          plant_id: string;
          plant_name: string;
          photo_url: string | null;
          last_watered: string;
          next_watering: string;
          days_overdue: number;
        }>;
      };
    };
    Enums: {};
  };
}
