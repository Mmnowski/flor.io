/**
 * Skeleton Loader Components
 *
 * Provides placeholder skeletons while data is loading
 */
import { cn } from '~/lib';

interface SkeletonProps {
  className?: string;
}

/**
 * Generic skeleton element (animated gray box)
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('bg-slate-200 dark:bg-slate-700 rounded animate-pulse', className)} />;
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

/**
 * Plant form skeleton for edit/create pages
 */
export function PlantFormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back button */}
      <Skeleton className="h-10 w-20 mb-4" />

      {/* Page title */}
      <Skeleton className="h-9 w-40 mb-8" />

      {/* Form */}
      <div className="space-y-6 max-w-2xl">
        {/* Photo upload area */}
        <div>
          <Skeleton className="h-5 w-24 mb-3" />
          <Skeleton className="h-48 w-48 rounded-lg" />
        </div>

        {/* Plant name field */}
        <FormFieldSkeleton />

        {/* Watering frequency field */}
        <FormFieldSkeleton />

        {/* Watering amount field */}
        <FormFieldSkeleton />

        {/* Room field */}
        <FormFieldSkeleton />

        {/* Light requirements textarea */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </div>

        {/* Fertilizing tips textarea */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </div>

        {/* Pruning tips textarea */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-20 w-full" />
        </div>

        {/* Troubleshooting textarea */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-20 w-full" />
        </div>

        {/* Form actions */}
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * AI Wizard skeleton
 */
export function AIWizardSkeleton() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="w-full">
        {/* Progress indicator */}
        <div className="mb-8 space-y-2">
          {/* Step circles */}
          <div className="flex justify-between">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-3 w-12 mt-1" />
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <Skeleton className="h-1 w-full" />
        </div>

        {/* Main content area - photo upload style */}
        <div className="space-y-6">
          {/* Title */}
          <Skeleton className="h-8 w-2/3 mx-auto" />

          {/* Upload area */}
          <div className="rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 p-12">
            <div className="space-y-4 flex flex-col items-center">
              {/* Icon placeholder */}
              <Skeleton className="h-16 w-16 rounded-full" />
              {/* Text */}
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              {/* Button */}
              <Skeleton className="h-11 w-40 mt-4" />
            </div>
          </div>
        </div>

        {/* AI remaining indicator */}
        <Skeleton className="h-14 w-full mt-8 rounded-lg" />
      </div>
    </div>
  );
}
