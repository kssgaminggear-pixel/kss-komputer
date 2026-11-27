import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: {
    href: string;
    label: string;
  };
}

export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-2xl">
        {eyebrow && (
          <p className="kss-eyebrow">
            <span aria-hidden className="h-1.5 w-1.5 bg-orange-600" />
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 text-h2 text-balance text-zinc-950">{title}</h2>
        {description && (
          <p className="mt-2 text-body text-pretty text-zinc-600">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-zinc-900 transition-colors hover:text-orange-700"
        >
          {action.label}
          <ArrowRight
            aria-hidden
            className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none"
          />
        </Link>
      )}
    </div>
  );
}
