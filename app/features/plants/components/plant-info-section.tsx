'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/shared/components/ui/collapsible';

import type { ReactNode } from 'react';

import { ChevronDown } from 'lucide-react';

interface PlantInfoSectionProps {
  title: string;
  content: string | null;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
}

/**
 * Parse content that might be a JSON array or plain text
 */
function parseContent(content: string | null): string | string[] {
  if (!content) {
    return 'No information provided';
  }

  // Try to parse as JSON array
  if (content.startsWith('[')) {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Not valid JSON, treat as plain text
    }
  }

  return content;
}

export function PlantInfoSection({
  title,
  content,
  icon: Icon,
  defaultOpen = false,
}: PlantInfoSectionProps) {
  const parsedContent = parseContent(content);
  const isArray = Array.isArray(parsedContent);

  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span className="font-semibold text-slate-900 dark:text-white flex-1 text-left">
          {title}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 py-3 text-slate-700 dark:text-slate-300">
        {isArray ? (
          <ul className="space-y-2">
            {(parsedContent as string[]).map((item, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex-shrink-0">
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="whitespace-pre-wrap">{parsedContent}</div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
