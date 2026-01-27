import { Button } from '~/components/ui/button';

import React from 'react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800 py-16 px-4 border border-emerald-100 dark:border-emerald-900 transition-colors">
      {Icon && <Icon className="w-12 h-12 text-emerald-300 dark:text-emerald-700 mb-4" />}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 dark:text-slate-400 text-center mb-8 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          className="mt-2 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
