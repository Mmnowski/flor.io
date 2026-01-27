import { plantFormSchema } from '~/lib/validation';
import type { PlantFormInput } from '~/lib/validation';

import { useCallback, useMemo, useState } from 'react';

/**
 * Manage plant form state with validation
 * Tracks form data, errors, and dirty state
 *
 * @param initialData - Initial form data
 * @returns Form state and control methods
 *
 * @example
 * const form = usePlantForm();
 * const { formData, errors, updateField, validate } = form;
 *
 * const handleSubmit = () => {
 *   if (form.validate()) {
 *     // Submit form.formData
 *   }
 * };
 *
 * return (
 *   <form>
 *     <input
 *       value={formData.name}
 *       onChange={(e) => updateField('name', e.target.value)}
 *     />
 *     {errors.name && <span className="error">{errors.name}</span>}
 *   </form>
 * );
 */
export function usePlantForm(initialData?: Partial<PlantFormInput>): {
  formData: Partial<PlantFormInput>;
  errors: Record<string, string>;
  updateField: (field: keyof PlantFormInput, value: unknown) => void;
  validate: () => boolean;
  reset: () => void;
  isDirty: boolean;
} {
  const defaultData = useMemo<Partial<PlantFormInput>>(
    () => ({
      name: '',
      watering_frequency_days: 7,
      room_id: null,
      light_requirements: '',
      fertilizing_tips: '',
      pruning_tips: '',
      troubleshooting: '',
      ...initialData,
    }),
    [initialData]
  );

  const [formData, setFormData] = useState<Partial<PlantFormInput>>(defaultData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((field: keyof PlantFormInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const validate = useCallback((): boolean => {
    const result = plantFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      const flattened = result.error.flatten().fieldErrors;
      Object.entries(flattened).forEach(([field, messages]) => {
        fieldErrors[field] = Array.isArray(messages) ? messages[0] || field : field;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData(defaultData);
    setErrors({});
  }, [defaultData]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(defaultData);

  return {
    formData,
    errors,
    updateField,
    validate,
    reset,
    isDirty,
  };
}
