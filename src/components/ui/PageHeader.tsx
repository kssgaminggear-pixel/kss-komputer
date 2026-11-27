import React from 'react';

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  aside,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="kss-container py-8 sm:py-12 lg:py-14">
        {breadcrumb && <div className="mb-6">{breadcrumb}</div>}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            {eyebrow && (
              <p className="kss-eyebrow">
                <span aria-hidden className="h-1.5 w-1.5 bg-orange-600" />
                {eyebrow}
              </p>
            )}
            <h1 className="mt-3 text-h1-page text-balance text-zinc-950">{title}</h1>
            {description && (
              <p className="mt-3 max-w-[60ch] text-body text-pretty text-zinc-600">
                {description}
              </p>
            )}
          </div>

          {(actions || aside) && (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center lg:shrink-0">
              {actions}
              {aside}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
