import React from "react";
import { Button } from "~/components/ui/button";

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
    <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-emerald-50 to-white py-16 px-4 border border-emerald-100">
      {Icon && <Icon className="w-12 h-12 text-emerald-300 mb-4" />}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 text-center mb-8 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          className="mt-2"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
