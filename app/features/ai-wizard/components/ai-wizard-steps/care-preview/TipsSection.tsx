/**
 * TipsSection - Reusable tips list component
 * Displays a list of tips with edit functionality
 */
import { Input } from '~/shared/components/ui/input';

type BulletColor = 'blue' | 'green' | 'red' | 'emerald';

interface TipsSectionProps {
  /** Array of tip strings to display */
  tips: string[];
  /** Whether editing mode is active */
  isEditing: boolean;
  /** Bullet point color */
  bulletColor: BulletColor;
  /** Callback when a tip is changed (only called in edit mode) */
  onTipChange: (index: number, value: string) => void;
}

const BULLET_COLORS: Record<BulletColor, string> = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  red: 'bg-red-600',
  emerald: 'bg-emerald-600',
};

/**
 * TipsSection - Renders a list of tips with optional editing
 * Used for fertilizing, pruning, and troubleshooting tips in care preview
 */
export function TipsSection({
  tips,
  isEditing,
  bulletColor,
  onTipChange,
}: TipsSectionProps): React.ReactNode {
  const bulletClass = BULLET_COLORS[bulletColor];

  return (
    <div className="space-y-2">
      {tips.map((tip, index) => (
        <div key={index}>
          {isEditing ? (
            <Input
              value={tip}
              onChange={(e) => onTipChange(index, e.target.value)}
              className="mb-2"
            />
          ) : (
            <div className="flex items-start gap-2">
              <span
                className={`mt-1 inline-block h-2 w-2 rounded-full flex-shrink-0 ${bulletClass}`}
              />
              <p className="text-gray-700 dark:text-gray-300">{tip}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
