import React from 'react';

/**
 * Fallback saat data halaman sedang disiapkan.
 * Sengaja tanpa animasi/shadow supaya tidak ada layout shift besar.
 */
export default function Loading() {
  return (
    <div className="kss-container py-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat halaman</span>
      <div className="h-3 w-40 animate-pulse rounded-sm bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-4 h-7 w-3/4 animate-pulse rounded-sm bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-2 h-3 w-full max-w-2xl animate-pulse rounded-sm bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            <div className="aspect-[4/3] w-full animate-pulse rounded-sm bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-3 h-4 w-2/3 animate-pulse rounded-sm bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-2 h-3 w-full animate-pulse rounded-sm bg-zinc-100 dark:bg-zinc-800/60" />
            <div className="mt-4 h-6 w-1/2 animate-pulse rounded-sm bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
