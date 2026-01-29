/**
 * Skeleton Loader Components
 *
 * Provides placeholder skeletons while data is loading
 */

import { cn } from '~/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Generic skeleton element (animated gray box)
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-slate-200 dark:bg-slate-700 rounded animate-pulse',
        className
      )}
    />
  );
}

/**
 * Plant card skeleton
 */
export function PlantCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      {/* Image */}
      <Skeleton className="w-full aspect-video" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-2/3" />

        {/* Badge */}
        <Skeleton className="h-6 w-1/3" />

        {/* Status */}
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

/**
 * Plant grid skeleton (multiple cards)
 */
export function PlantGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PlantCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Form field skeleton
 */
export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

/**
 * Plant details page skeleton
 */
export function PlantDetailsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Skeleton className="h-10 w-20 mb-8" />

      {/* Header grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Photo */}
        <Skeleton className="aspect-square rounded-lg" />

        {/* Info */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      </div>

      {/* Care sections */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Dashboard skeleton with filters
 */
export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-11 w-32" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 flex-shrink-0 rounded-full" />
        ))}
      </div>

      {/* Plant grid */}
      <PlantGridSkeleton count={6} />
    </div>
  );
}
