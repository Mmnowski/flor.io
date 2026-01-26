import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

interface FormErrorProps {
  message?: string | null;
  type?: "error" | "warning" | "info";
  id?: string;
}

export function FormError({
  message,
  type = "error",
  id = "form-error",
}: FormErrorProps) {
  if (!message) return null;

  const variants = {
    error: {
      container:
        "mb-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900",
      icon: "text-red-600 dark:text-red-400",
      text: "text-red-800 dark:text-red-200",
    },
    warning: {
      container:
        "mb-6 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900",
      icon: "text-amber-600 dark:text-amber-400",
      text: "text-amber-800 dark:text-amber-200",
    },
    info: {
      container:
        "mb-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900",
      icon: "text-blue-600 dark:text-blue-400",
      text: "text-blue-800 dark:text-blue-200",
    },
  };

  const variant = variants[type];

  return (
    <Alert
      variant="destructive"
      className={`${variant.container} rounded-lg transition-colors`}
      role="alert"
      id={id}
    >
      <AlertCircle className={`h-4 w-4 ${variant.icon}`} />
      <AlertDescription className={variant.text}>
        {message}
      </AlertDescription>
    </Alert>
  );
}
