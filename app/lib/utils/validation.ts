/**
 * Form validation schemas using Zod
 * Provides centralized, type-safe validation for all forms
 */
import { z } from 'zod';

/**
 * RFC 5322 compliant email regex pattern
 * Validates email format according to RFC 5322 standards
 */
const RFC5322_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Email validation schema
 * Uses RFC 5322 compliant regex for better accuracy
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .regex(RFC5322_EMAIL_REGEX, 'Please enter a valid email address');

/**
 * Password validation schema
 * Requirements: min 8 chars, 1 uppercase, 1 number, 1 special char
 */
export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/]/,
    'Password must contain at least one special character (!@#$%^&*)'
  );

/**
 * Plant name validation schema
 */
export const plantNameSchema = z
  .string()
  .min(1, 'Plant name is required')
  .max(100, 'Plant name must be 100 characters or less');

/**
 * Watering frequency validation schema
 */
export const wateringFrequencySchema = z.union([z.number(), z.string()]).refine((val) => {
  const num = typeof val === 'string' ? parseInt(val, 10) : val;
  return !isNaN(num) && num >= 1 && num <= 365;
}, 'Watering frequency must be between 1 and 365 days');

/**
 * Room name validation schema
 */
export const roomNameSchema = z
  .string()
  .min(1, 'Room name is required')
  .max(50, 'Room name must be 50 characters or less');

/**
 * Image file validation schema
 */
export const imageFileSchema = z
  .instanceof(File)
  .refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Photo must be JPG, PNG, or WebP format'
  )
  .refine((file) => file.size <= 10 * 1024 * 1024, 'Photo must be less than 10MB');

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Registration form schema
 */
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Plant form schema
 */
export const plantFormSchema = z.object({
  name: plantNameSchema,
  watering_frequency_days: wateringFrequencySchema,
  room_id: z.string().optional().nullable(),
  light_requirements: z.string().optional().nullable(),
  fertilizing_tips: z.string().optional().nullable(),
  pruning_tips: z.string().optional().nullable(),
  troubleshooting: z.string().optional().nullable(),
});

export type PlantFormInput = z.infer<typeof plantFormSchema>;

/**
 * Room form schema
 */
export const roomFormSchema = z.object({
  name: roomNameSchema,
});

export type RoomFormInput = z.infer<typeof roomFormSchema>;

/**
 * Helper function to validate and return errors
 * Returns object with success boolean and either data or errors
 */
export function validateForm<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};

  // Extract field errors from validation issues
  result.error.issues.forEach((issue) => {
    const fieldPath = issue.path.join('.');
    const field = fieldPath || 'root';

    if (!errors[field]) {
      errors[field] = issue.message;
    }
  });

  return { success: false, errors };
}

/**
 * Helper to get single field error
 */
export function getFieldError(
  schema: z.ZodType,
  fieldName: string,
  value: unknown
): string | undefined {
  const result = schema.safeParse(value);
  if (result.success) {
    return undefined;
  }

  // Find first error matching the field name
  const fieldError = result.error.issues.find(
    (issue) => issue.path.length === 0 || issue.path[0] === fieldName
  );

  return fieldError?.message;
}
