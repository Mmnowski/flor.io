/**
 * Usage Limits System
 *
 * Tracks and enforces monthly quotas for AI generation and total plant count.
 * Uses Supabase database for persistence.
 */
import { supabaseServer } from './supabase.server';

// Configurable limits (can be moved to environment variables later)
export const LIMITS = {
  AI_GENERATIONS_PER_MONTH: 20,
  MAX_PLANTS_PER_USER: 100,
};

export interface AIGenerationLimitStatus {
  allowed: boolean;
  used: number;
  limit: number;
  resetsOn: Date;
}

export interface PlantCountLimitStatus {
  allowed: boolean;
  count: number;
  limit: number;
}

export interface UserUsageLimits {
  aiGenerations: AIGenerationLimitStatus;
  plantCount: PlantCountLimitStatus;
}

/**
 * Get current month/year string in "YYYY-MM" format
 */
function getCurrentMonthYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Calculate when current month's limit resets (first day of next month)
 */
function getResetDate(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
}

/**
 * Check if user can create a new AI-generated plant
 * Returns true if under monthly limit, false otherwise
 *
 * @param userId - Supabase user ID
 * @returns Status object with allowed flag and current usage
 *
 * @example
 * const status = await checkAIGenerationLimit(userId);
 * if (!status.allowed) {
 *   // Show error: "You've used all 20 AI generations this month"
 * }
 */
export async function checkAIGenerationLimit(userId: string): Promise<AIGenerationLimitStatus> {
  const supabase = supabaseServer;
  const monthYear = getCurrentMonthYear();

  // Get or create usage record for current month
  const { data, error } = await supabase
    .from('usage_limits')
    .select('ai_generations_this_month')
    .eq('user_id', userId)
    .eq('month_year', monthYear)
    .single();

  // If no record exists, user hasn't hit limit yet
  if (error && error.code === 'PGRST116') {
    // PGRST116 = no rows found
    return {
      allowed: true,
      used: 0,
      limit: LIMITS.AI_GENERATIONS_PER_MONTH,
      resetsOn: getResetDate(),
    };
  }

  if (error) {
    console.error('Error checking AI generation limit:', error);
    // On error, allow the operation (fail open)
    return {
      allowed: true,
      used: 0,
      limit: LIMITS.AI_GENERATIONS_PER_MONTH,
      resetsOn: getResetDate(),
    };
  }

  const used = data?.ai_generations_this_month || 0;
  const allowed = used < LIMITS.AI_GENERATIONS_PER_MONTH;

  return {
    allowed,
    used,
    limit: LIMITS.AI_GENERATIONS_PER_MONTH,
    resetsOn: getResetDate(),
  };
}

/**
 * Increment AI generation counter for current month
 * Call this after successfully creating an AI-generated plant
 *
 * @param userId - Supabase user ID
 * @throws Error if database operation fails
 *
 * @example
 * // After plant created with AI
 * await incrementAIUsage(userId);
 */
export async function incrementAIUsage(userId: string): Promise<void> {
  const supabase = supabaseServer;
  const monthYear = getCurrentMonthYear();
  const now = new Date().toISOString();

  // Try to increment existing record
  const { data: existing } = await supabase
    .from('usage_limits')
    .select('id')
    .eq('user_id', userId)
    .eq('month_year', monthYear)
    .single();

  if (existing) {
    // Record exists, increment it
    const { error } = await supabase
      .from('usage_limits')
      .update({
        ai_generations_this_month: (existing as any) + 1,
        updated_at: now,
      })
      .eq('user_id', userId)
      .eq('month_year', monthYear);

    if (error) {
      console.error('Error incrementing AI usage:', error);
      throw error;
    }
  } else {
    // No record exists, create one
    const { error } = await supabase.from('usage_limits').insert([
      {
        user_id: userId,
        month_year: monthYear,
        ai_generations_this_month: 1,
        created_at: now,
        updated_at: now,
      },
    ]);

    if (error) {
      console.error('Error creating AI usage record:', error);
      throw error;
    }
  }
}

/**
 * Check if user can create more plants (total limit)
 * Returns true if under limit, false otherwise
 *
 * @param userId - Supabase user ID
 * @returns Status object with allowed flag and current count
 *
 * @example
 * const status = await checkPlantLimit(userId);
 * if (!status.allowed) {
 *   // Show error: "You've reached the limit of 100 plants"
 * }
 */
export async function checkPlantLimit(userId: string): Promise<PlantCountLimitStatus> {
  const supabase = supabaseServer;

  // Count user's plants
  const { count, error } = await supabase
    .from('plants')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (error) {
    console.error('Error checking plant limit:', error);
    // On error, allow the operation (fail open)
    return {
      allowed: true,
      count: 0,
      limit: LIMITS.MAX_PLANTS_PER_USER,
    };
  }

  const plantCount = count || 0;
  const allowed = plantCount < LIMITS.MAX_PLANTS_PER_USER;

  return {
    allowed,
    count: plantCount,
    limit: LIMITS.MAX_PLANTS_PER_USER,
  };
}

/**
 * Get all usage limits for a user (AI generations + plant count)
 *
 * @param userId - Supabase user ID
 * @returns Combined limit status for both AI and plants
 *
 * @example
 * const usage = await getUserUsageLimits(userId);
 * // Returns:
 * // {
 * //   aiGenerations: { allowed: true, used: 5, limit: 20, resetsOn: Date },
 * //   plantCount: { allowed: true, count: 12, limit: 100 }
 * // }
 */
export async function getUserUsageLimits(userId: string): Promise<UserUsageLimits> {
  const [aiStatus, plantStatus] = await Promise.all([
    checkAIGenerationLimit(userId),
    checkPlantLimit(userId),
  ]);

  return {
    aiGenerations: aiStatus,
    plantCount: plantStatus,
  };
}

/**
 * Get detailed usage information for display in UI
 * Includes formatted text for showing users
 *
 * @param userId - Supabase user ID
 * @returns Usage information with human-readable text
 *
 * @example
 * const usage = await getDetailedUsage(userId);
 * console.log(usage.aiDisplay); // "AI: 5/20 generations used this month"
 */
export async function getDetailedUsage(userId: string) {
  const limits = await getUserUsageLimits(userId);

  const aiRemaining = limits.aiGenerations.limit - limits.aiGenerations.used;
  const plantRemaining = limits.plantCount.limit - limits.plantCount.count;

  return {
    ai: {
      used: limits.aiGenerations.used,
      limit: limits.aiGenerations.limit,
      remaining: aiRemaining,
      allowed: limits.aiGenerations.allowed,
      display: `${limits.aiGenerations.used}/${limits.aiGenerations.limit}`,
      remainingDisplay: `${aiRemaining} left this month`,
      resetsOn: limits.aiGenerations.resetsOn,
    },
    plants: {
      count: limits.plantCount.count,
      limit: limits.plantCount.limit,
      remaining: plantRemaining,
      allowed: limits.plantCount.allowed,
      display: `${limits.plantCount.count}/${limits.plantCount.limit}`,
      remainingDisplay: `${plantRemaining} plant slots available`,
    },
  };
}
