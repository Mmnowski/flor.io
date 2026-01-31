/**
 * FieldError - Displays field validation error with icon
 */
import { AlertCircle } from 'lucide-react';

interface FieldErrorProps {
  /** The error message to display */
  message: string | string[];
  /** ID for accessibility (aria-describedby) */
  id?: string;
}

/**
 * FieldError - Displays a field validation error message with an icon
 * Handles both string and array error formats
 */
export function FieldError({ message, id }: FieldErrorProps): React.ReactNode {
  const errorText = Array.isArray(message) ? message[0] : message;

  return (
    <div
      id={id}
      className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mt-2"
      role="alert"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      {errorText}
    </div>
  );
}
