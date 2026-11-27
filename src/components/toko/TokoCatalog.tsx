'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import {
  SORT_OPTIONS,
  discountPercent,
  isSortValue,
  matchesTokens,
  normalizeSearch,
  searchTokens,
  sortProducts,
  type SortValue,
} from '@/lib/marketplace/search';
import type { PublicEtalase, PublicMarketplaceProduct } from '@/lib/marketplace/types';
import { ProductCard } from './ProductCard';

const PAGE_SIZE = 24;

export interface TokoCatalogProps {
  products: PublicMarketplaceProduct[];
  etalase: PublicEtalase[];
  activeEtalaseSlug?: string;
}

interface Filters {
  q: string;
  sort: SortValue;
  discountOnly: boolean;
}

const DEFAULT_FILTERS: Filters = { q: '', sort: 'terlaris', discountOnly: false };

function toQuery(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.sort !== 'terlaris') params.set('sort', filters.sort);
  if (filters.discountOnly) params.set('diskon', '1');
  const query = params.toString();
  return query ? `?${query}` : '';
}

/** Filter disimpan di URL agar bisa dibagikan dan mengikuti tombol kembali. */
export function TokoCatalogFromUrl(props: TokoCatalogProps) {
  const params = useSearchParams();
  const sort = params.get('sort');
  return (
    <TokoCatalog
      {...props}
      filters={{
        q: params.get('q') ?? '',
        sort: isSortValue(sort) ? sort : 'terlaris',
        discountOnly: params.get('diskon') === '1',
      }}
    />
  );
}

export function TokoCatalog({
  products,
  etalase,
  activeEtalaseSlug,
  filters = DEFAULT_FILTERS,
}: TokoCatalogProps & { filters?: Filters }) {
  const [limit, setLimit] = useState(PAGE_SIZE);

  const index = useMemo(() => {
    const names = new Map(etalase.map((shelf) => [shelf.id, shelf.name]));
    return new Map(
      products.map((product) => [
        product.id,
        normalizeSearch(`${product.name} ${product.etalaseIds.map((id) => names.get(id) ?? '').join(' ')}`),
      ])
    );
  }, [products, etalase]);

  const activeShelf = etalase.find((shelf) => shelf.slug === activeEtalaseSlug);

  const matches = useMemo(() => {
    const tokens = searchTokens(filters.q);
    return products.filter(
      (product) =>
        matchesTokens(index.get(product.id) ?? '', tokens) &&
        (!filters.discountOnly || discountPercent(product) > 0)
    );
  }, [products, index, filters.q, filters.discountOnly]);

  const results = useMemo(
    () =>
      sortProducts(
        activeShelf ? matches.filter((product) => product.etalaseIds.includes(activeShelf.id)) : matches,
        filters.sort
      ),
    [matches, activeShelf, filters.sort]
  );

  const update = (patch: Partial<Filters>) => {
    setLimit(PAGE_SIZE);
    window.history.replaceState(null, '', `${window.location.pathname}${toQuery({ ...filters, ...patch })}`);
  };

  const shelfLinks = [
    { slug: undefined, name: 'Semua produk', count: products.length },
    ...etalase.map((shelf) => ({ slug: shelf.slug, name: shelf.name, count: shelf.count })),
  ];
  const shelfHref = (slug?: string) => `${slug ? `/toko/etalase/${slug}` : '/toko'}${toQuery(filters)}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <nav aria-label="Etalase toko" className="min-w-0">
        {/* Layar kecil: baris chip yang bisa digeser. */}
        <ul className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
          {shelfLinks.map((shelf) => (
            <li key={shelf.slug ?? 'semua'} className="shrink-0">
              <Link
                href={shelfHref(shelf.slug)}
                aria-current={shelf.slug === activeEtalaseSlug ? 'page' : undefined}
                className={`kss-chip ${shelf.slug === activeEtalaseSlug ? 'kss-chip-active' : ''}`}
              >
                {shelf.name}
                <span className="kss-num opacity-70">{shelf.count}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden rounded-md border border-zinc-200 bg-white lg:block">
          <p className="kss-label border-b border-zinc-200 px-3 py-2.5 text-zinc-500">Etalase</p>
          <ul className="max-h-[70vh] overflow-y-auto py-1">
            {shelfLinks.map((shelf) => {
              const active = shelf.slug === activeEtalaseSlug;
              return (
                <li key={shelf.slug ?? 'semua'}>
                  <Link
                    href={shelfHref(shelf.slug)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-start justify-between gap-2 border-l-2 px-3 py-2 text-sm transition-colors hover:bg-zinc-50 ${
                      active ? 'border-orange-700 font-semibold text-zinc-950' : 'border-transparent text-zinc-600'
                    }`}
                  >
                    <span className="min-w-0">{shelf.name}</span>
                    <span className="kss-num text-meta text-zinc-500">{shelf.count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="min-w-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={filters.q}
              onChange={(event) => update({ q: event.target.value })}
              onKeyDown={(event) => event.key === 'Escape' && update({ q: '' })}
              placeholder="Cari di toko KSS Komputer"
              aria-label="Cari di toko KSS Komputer"
              className="kss-input w-full pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-pressed={filters.discountOnly}
              onClick={() => update({ discountOnly: !filters.discountOnly })}
              className={`kss-chip ${filters.discountOnly ? 'kss-chip-active' : ''}`}
            >
              Diskon saja
            </button>
            <select
              value={filters.sort}
              onChange={(event) => update({ sort: event.target.value as SortValue })}
              aria-label="Urutkan produk"
              className="kss-input w-auto flex-1"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p aria-live="polite" className="kss-num mt-3 text-meta text-zinc-500">
          {results.length} produk{activeShelf ? ` di ${activeShelf.name}` : ''}
        </p>

        {results.length === 0 ? (
          <div className="mt-3 rounded-md border border-dashed border-zinc-300 bg-white p-8 text-center">
            <p className="text-sm text-zinc-700">
              Tidak ada produk yang cocok{filters.q ? ` untuk "${filters.q}"` : ''}
              {activeShelf ? ' di etalase ini' : ''}.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => update(DEFAULT_FILTERS)} className="kss-btn-outline">
                <X aria-hidden className="h-3.5 w-3.5" />
                Hapus pencarian
              </button>
              {activeShelf && matches.length > 0 && (
                <Link href={shelfHref()} className="kss-btn-outline">
                  Cari di semua etalase ({matches.length})
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
              {results.slice(0, limit).map((product) => (
                <li key={product.id} className="flex min-w-0 rounded-md border border-zinc-200 bg-white [&>article]:w-full">
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
            {results.length > limit && (
              <div className="mt-6 flex justify-center">
                <button type="button" onClick={() => setLimit((value) => value + PAGE_SIZE)} className="kss-btn-outline">
                  Muat lebih banyak ({results.length - limit} lagi)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
