import React from 'react';

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions, aside }: PageHeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="kss-container py-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            {eyebrow && (
              <div className="kss-eyebrow mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-700" />
                <span>{eyebrow}</span>
              </div>
            )}
            <h1 className="text-2xl font-black leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl lg:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-500 sm:text-sm">
                {description}
              </p>
            )}
          </div>

          {(actions || aside) && (
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:shrink-0">
              {actions}
              {aside}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
