'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface PlantInfoSectionProps {
  title: string;
  content: string | null;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
}

export function PlantInfoSection({
  title,
  content,
  icon: Icon,
  defaultOpen = false,
}: PlantInfoSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span className="font-semibold text-slate-900 dark:text-white flex-1 text-left">
          {title}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
        {content || 'No information provided'}
      </CollapsibleContent>
    </Collapsible>
  );
}
