/**
 * Progress Bar Component
 *
 * Shows progress during page navigation and form submissions
 */
import { useEffect, useState } from 'react';
import { useNavigation } from 'react-router';

/**
 * Navigation progress bar that appears during route transitions
 */
export function NavigationProgressBar() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show progress bar when navigation starts
    if (navigation.state === 'loading' || navigation.state === 'submitting') {
      setIsVisible(true);
      setProgress(10);

      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          const increment = Math.random() * 30;
          return Math.min(prev + increment, 85);
        });
      }, 300);

      return () => clearInterval(interval);
    } else if (isVisible) {
      // Complete progress bar
      setProgress(100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [navigation.state, isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 transition-all duration-300 ease-out z-50"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label="Page loading progress"
    />
  );
}

/**
 * Loading overlay with spinner
 */
export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-emerald-600 border-r-emerald-600 rounded-full animate-spin" />
        </div>

        {message && (
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">{message}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Inline loading spinner (small)
 */
export function LoadingSpinner({
  size = 'md',
  message,
}: {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 border-2 border-slate-200 dark:border-slate-700 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-emerald-600 border-r-emerald-600 rounded-full animate-spin" />
      </div>
      {message && <span className="text-sm text-slate-600 dark:text-slate-400">{message}</span>}
    </div>
  );
}
