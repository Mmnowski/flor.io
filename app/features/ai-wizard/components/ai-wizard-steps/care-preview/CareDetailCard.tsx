/**
 * CareDetailCard - Generic card wrapper for care details sections
 * Used in the care preview step to display plant care information
 */

interface CareDetailCardProps {
  /** Section title displayed in the card header */
  title: string;
  /** Card content */
  children: React.ReactNode;
}

/**
 * CareDetailCard - A styled card container for care detail sections
 * Provides consistent styling for the care preview step
 */
export function CareDetailCard({ title, children }: CareDetailCardProps): React.ReactNode {
  return (
    <div className="rounded-lg border-2 border-gray-200 p-6 dark:border-gray-700">
      <h3 className="text-lg font-bold dark:text-white">{title}</h3>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  );
}
