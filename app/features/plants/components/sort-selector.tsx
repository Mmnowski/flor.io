'use client';

import { cn } from '~/lib';

import { ArrowDownAZ, Droplets } from 'lucide-react';

export type SortOption = 'watering' | 'name';

interface SortSelectorProps {
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function SortSelector({ activeSort, onSortChange }: SortSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500 dark:text-slate-400 mr-1">Sort by:</span>
      <button
        onClick={() => onSortChange('watering')}
        className={cn(
          'px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-colors text-sm font-medium flex items-center gap-1.5',
          activeSort === 'watering'
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
        )}
      >
        <Droplets className="w-3.5 h-3.5" />
        Watering
      </button>
      <button
        onClick={() => onSortChange('name')}
        className={cn(
          'px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-colors text-sm font-medium flex items-center gap-1.5',
          activeSort === 'name'
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
        )}
      >
        <ArrowDownAZ className="w-3.5 h-3.5" />
        Name
      </button>
    </div>
  );
}
