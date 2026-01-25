import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <Alert
      variant="destructive"
      className="mb-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg transition-colors"
    >
      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      <AlertDescription className="text-red-800 dark:text-red-200">{message}</AlertDescription>
    </Alert>
  );
}
