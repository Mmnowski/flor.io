/**
 * TextareaField - Reusable textarea form field with label
 */
import { Label } from '~/shared/components/ui/label';
import { Textarea } from '~/shared/components/ui/textarea';

interface TextareaFieldProps {
  /** Field ID and name */
  id: string;
  /** Label text */
  label: string;
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  defaultValue?: string;
  /** Number of rows */
  rows?: number;
  /** Whether the field is required */
  required?: boolean;
}

/**
 * TextareaField - A labeled textarea component for forms
 * Provides consistent styling for optional plant form fields
 */
export function TextareaField({
  id,
  label,
  placeholder,
  defaultValue = '',
  rows = 3,
  required = false,
}: TextareaFieldProps): React.ReactNode {
  return (
    <div>
      <Label htmlFor={id} className="text-base">
        {label}
        {required && <span className="text-red-500"> *</span>}
        {!required && ' (Optional)'}
      </Label>
      <Textarea
        id={id}
        name={id}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2"
        rows={rows}
        required={required}
      />
    </div>
  );
}
