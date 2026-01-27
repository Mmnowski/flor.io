# Zod Validation Quick Reference

## Using Existing Schemas

### In Server Actions (Form Submissions)

```typescript
import { plantFormSchema } from '~/lib/validation';

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Validate
  const validation = plantFormSchema.safeParse(data);
  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return { error: errors };
  }

  // Use validated data (type-safe!)
  const plant = await createPlant(validation.data);
  return redirect(`/plants/${plant.id}`);
};
```

### In Client Components (Real-Time Validation)

```typescript
import { getFieldError, plantNameSchema } from '~/lib/validation';

function PlantForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Get error for this field
    const error = getFieldError(plantNameSchema, 'name', value);

    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
  };

  return (
    <>
      <Input
        name="name"
        onChange={handleFieldChange}
        aria-invalid={!!errors.name}
        aria-describedby={errors.name ? 'name-error' : undefined}
      />
      {errors.name && <FormError message={errors.name} id="name-error" />}
    </>
  );
}
```

---

## Available Schemas

### Individual Field Schemas

```typescript
import {
  emailSchema,
  // 1-50 characters
  imageFileSchema,
  // JPG/PNG/WebP, max 10MB
  // Email format
  passwordSchema,
  // Min 8 chars, 1 uppercase, 1 number, 1 special
  plantNameSchema,
  // 1-365
  roomNameSchema,
  // 1-100 characters
  wateringFrequencySchema,
} from '~/lib/validation';

// Usage
const result = emailSchema.safeParse('user@example.com');
if (result.success) {
  console.log(result.data); // Type-safe!
}
```

### Composite Form Schemas

```typescript
import {
  loginSchema,
  // { email, password, confirmPassword }
  plantFormSchema,
  // { email, password }
  registerSchema,
  // { name, watering_frequency_days, room_id, ... }
  roomFormSchema, // { name }
} from '~/lib/validation';

// These include all related field validation
// Plus cross-field validation (e.g., password match)
```

### Type Inference

```typescript
import type { PlantFormInput } from '~/lib/validation';

// TypeScript knows the shape of validated data
function createPlant(data: PlantFormInput) {
  // data.name is string
  // data.watering_frequency_days is number
  // data.room_id is string | null
  // No type mismatches possible!
}
```

---

## Creating New Schemas

### Simple Single Field

```typescript
// Or reuse existing schema as base
import { plantNameSchema } from '~/lib/validation';

import { z } from 'zod';

export const maxLengthSchema = z
  .string()
  .min(1, 'Required')
  .max(50, 'Must be 50 characters or less');

export const extendedPlantNameSchema = plantNameSchema.max(200);
```

### Composite Schema

```typescript
export const myFormSchema = z.object({
  name: plantNameSchema,
  frequency: wateringFrequencySchema,
  room: roomNameSchema.optional(),
  notes: z.string().optional(),
});

export type MyFormInput = z.infer<typeof myFormSchema>;
```

### With Cross-Field Validation

```typescript
export const newPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });
```

### Custom Validation

```typescript
export const customSchema = z
  .string()
  .min(1, 'Required')
  .refine((val) => !val.includes('admin'), 'Cannot contain word "admin"');

// Or for async validation (DB checks)
export const uniqueEmailSchema = z
  .string()
  .email()
  .refine(async (email) => {
    const exists = await checkEmailExists(email);
    return !exists;
  }, 'Email already registered');
```

---

## Helper Functions

### validateForm() - Validate Entire Form

```typescript
import { plantFormSchema, validateForm } from '~/lib/validation';

const result = validateForm(plantFormSchema, {
  name: 'My Plant',
  watering_frequency_days: 7,
});

if (result.success) {
  console.log(result.data); // Validated, type-safe data
} else {
  console.log(result.errors);
  // { name: 'error message', watering_frequency_days: 'error message' }
}
```

### getFieldError() - Validate Single Field

```typescript
import { getFieldError, plantNameSchema } from '~/lib/validation';

// For real-time validation
const error = getFieldError(plantNameSchema, 'name', 'M');
// Returns: 'Plant name is required' or undefined

// In event handler
const handleChange = (e) => {
  const error = getFieldError(plantNameSchema, 'name', e.target.value);
  setErrors((prev) => ({ ...prev, name: error }));
};
```

### schema.safeParse() - Standard Zod Method

```typescript
const validation = plantFormSchema.safeParse(data);

if (validation.success) {
  const validData = validation.data; // Type-safe
  // Process valid data
} else {
  const errors = validation.error.flatten().fieldErrors;
  // { name: ['error'], frequency: ['error'] }

  // Get first error message
  const firstError = Object.values(errors)[0]?.[0];
}
```

---

## Error Handling Patterns

### Return Errors to Component

```typescript
export const action = async ({ request }: Route.ActionArgs) => {
  const data = Object.fromEntries(await request.formData());
  const validation = registerSchema.safeParse(data);

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
    };
  }

  // ... create user
  return redirect('/dashboard');
};

// In component
const actionData = useActionData<typeof action>();

return (
  <form method="post">
    <Input name="email" />
    {actionData?.errors?.email && (
      <FormError message={actionData.errors.email[0]} />
    )}
  </form>
);
```

### Return Single Error Message

```typescript
if (!validation.success) {
  const errors = validation.error.flatten().fieldErrors;
  const firstError = Object.values(errors)[0]?.[0];
  return { error: firstError || 'Validation failed' };
}
```

### Log for Debugging

```typescript
const validation = plantFormSchema.safeParse(data);

if (!validation.success) {
  console.error('Validation errors:', {
    errors: validation.error.flatten().fieldErrors,
    issues: validation.error.issues, // Detailed issues
  });
}
```

---

## Migration Guide

### Updating Existing Forms

1. **Import schema:**

   ```typescript
   import { plantFormSchema } from '~/lib/validation';
   ```

2. **Replace validation code:**

   ```typescript
   // OLD
   if (!name || !name.trim()) return { error: 'Name required' };
   if (frequency < 1 || frequency > 365) return { error: '...' };

   // NEW
   const validation = plantFormSchema.safeParse({
     name,
     watering_frequency_days: frequency,
   });
   if (!validation.success) {
     const errors = validation.error.flatten().fieldErrors;
     return { error: Object.values(errors)[0]?.[0] };
   }
   ```

3. **Use validated data:**

   ```typescript
   // OLD - type unsafe
   const plant = await createPlant(name, frequency);

   // NEW - type safe
   const plant = await createPlant(validation.data);
   ```

---

## Tips

- **Always use `safeParse()`** not `parse()` (safer, won't throw)
- **Reuse schemas** - compose from smaller schemas
- **Add to zod schemas** not in routes - DRY principle
- **Test schemas independently** - they're functions too
- **Use type inference** - `z.infer<typeof schema>` for type safety
- **Error messages are user-friendly** - they show in UI
