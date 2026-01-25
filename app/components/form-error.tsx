import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <Alert
      variant="destructive"
      className="mb-6 bg-red-50 border border-red-200 rounded-lg"
    >
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">{message}</AlertDescription>
    </Alert>
  );
}
