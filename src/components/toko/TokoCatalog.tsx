'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, Search, X } from 'lucide-react';
import { SORT_OPTIONS, isSortValue, type SortValue } from '@/lib/marketplace/search';
import type { PublicEtalase, PublicMarketplaceProduct } from '@/lib/marketplace/types';
import { toProdukItem } from '@/lib/catalog/produk';
import { JENIS_OPTIONS, filterCatalog, isJenis, searchText, sortCatalog, type Jenis } from '@/lib/catalog/search';
import type { CatalogItem, CatalogPaketItem } from '@/lib/catalog/types';
import { CatalogCard } from '@/components/catalog/CatalogCard';

const PAGE_SIZE = 24;
const TOP_SHELVES = 8;
const CHIP =
  'inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[13px] font-semibold transition-colors';
const chipTone = (active: boolean) =>
  active ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink';

export interface TokoCatalogProps {
  products: PublicMarketplaceProduct[];
  /** Kosong di halaman etalase: etalase hanya berisi produk. */
  paket: CatalogPaketItem[];
  etalase: PublicEtalase[];
  activeEtalaseSlug?: string;
}

interface Filters {
  q: string;
  sort: SortValue;
  jenis: Jenis;
}

const DEFAULT_FILTERS: Filters = { q: '', sort: 'terlaris', jenis: 'semua' };

function toQuery(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.jenis !== 'semua') params.set('jenis', filters.jenis);
  if (filters.q) params.set('q', filters.q);
  if (filters.sort !== 'terlaris') params.set('sort', filters.sort);
  const query = params.toString();
  return query ? `?${query}` : '';
}

/** Filter disimpan di URL agar bisa dibagikan dan mengikuti tombol kembali. */
export function TokoCatalogFromUrl(props: TokoCatalogProps) {
  const params = useSearchParams();
  const sort = params.get('sort');
  const jenis = params.get('jenis');
  return (
    <TokoCatalog
      {...props}
      filters={{
        q: params.get('q') ?? '',
        sort: isSortValue(sort) ? sort : 'terlaris',
        jenis: props.paket.length && isJenis(jenis) ? jenis : 'semua',
      }}
    />
  );
}

export function TokoCatalog({
  products,
  paket,
  etalase,
  activeEtalaseSlug,
  filters = DEFAULT_FILTERS,
}: TokoCatalogProps & { filters?: Filters }) {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const activeShelf = etalase.find((shelf) => shelf.slug === activeEtalaseSlug);

  const items = useMemo<CatalogItem[]>(() => [...paket, ...products.map(toProdukItem)], [paket, products]);
  const index = useMemo(() => {
    const names = new Map(etalase.map((shelf) => [shelf.id, shelf.name]));
    return new Map(items.map((item) => [item.key, searchText(item, names)]));
  }, [items, etalase]);

  const matches = useMemo(() => filterCatalog(items, index, filters.q), [items, index, filters.q]);

  const results = useMemo(() => {
    const scoped = matches.filter((item) => {
      if (activeShelf) return item.kind === 'produk' && item.etalaseIds.includes(activeShelf.id);
      return filters.jenis === 'semua' || item.kind === filters.jenis;
    });
    return sortCatalog(scoped, filters.sort);
  }, [matches, activeShelf, filters.jenis, filters.sort]);

  // Tanpa pencarian pada urutan bawaan, paket tampil sebagai kelompok tersendiri di atas produk.
  const grouped = !filters.q && filters.sort === 'terlaris' && filters.jenis === 'semua' && !activeShelf && paket.length > 0;
  const flat = grouped ? results.filter((item) => item.kind === 'produk') : results;
  const highlightKey = grouped || filters.jenis === 'paket' ? paket.find((item) => item.featured)?.key : undefined;

  const update = (patch: Partial<Filters>) => {
    setLimit(PAGE_SIZE);
    window.history.replaceState(null, '', `${window.location.pathname}${toQuery({ ...filters, ...patch })}`);
  };

  const shelfHref = (slug?: string) =>
    `${slug ? `/toko/etalase/${slug}` : '/toko'}${toQuery({ ...filters, jenis: 'semua' })}`;
  const popular = [...etalase].sort((a, b) => b.count - a.count).slice(0, TOP_SHELVES);
  const chips = activeShelf && !popular.includes(activeShelf) ? [activeShelf, ...popular] : popular;

  return (
    <div>
      <div className="sticky top-14 z-30 -mx-4 flex gap-2 bg-paper px-4 py-2 sm:mx-0 sm:px-0 md:top-16">
        <div className="relative min-w-0 flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={filters.q}
            onChange={(event) => update({ q: event.target.value })}
            onKeyDown={(event) => event.key === 'Escape' && update({ q: '' })}
            placeholder="Cari di Toko"
            aria-label="Cari di toko KSS Komputer"
            className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-4 text-base text-ink placeholder:text-zinc-500 sm:text-sm"
          />
        </div>
        <select
          value={filters.sort}
          onChange={(event) => update({ sort: event.target.value as SortValue })}
          aria-label="Urutkan"
          className="h-12 w-32 shrink-0 rounded-full border border-line bg-white px-3 text-[13px] font-semibold text-ink sm:w-48 sm:px-4"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <nav aria-label="Etalase toko" className="mt-1">
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          {activeShelf ? (
            <li>
              <Link href={shelfHref()} className={`${CHIP} ${chipTone(false)}`}>
                Semua produk
              </Link>
            </li>
          ) : (
            <li>
              <Link href="/paket-rakitan" className={`${CHIP} ${chipTone(false)}`}>
                PC siap pakai
              </Link>
            </li>
          )}
          {chips.map((shelf) => {
            const active = shelf.slug === activeEtalaseSlug;
            return (
              <li key={shelf.id}>
                <Link
                  href={shelfHref(shelf.slug)}
                  aria-current={active ? 'page' : undefined}
                  className={`${CHIP} ${chipTone(active)}`}
                >
                  {shelf.name}
                  <span className="kss-num opacity-70">{shelf.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <details className="group mt-1">
          <summary className="inline-flex h-10 cursor-pointer list-none items-center gap-1.5 text-[13px] font-semibold text-ink underline decoration-line underline-offset-4 [&::-webkit-details-marker]:hidden">
            Semua etalase ({etalase.length})
            <ChevronDown aria-hidden className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="grid gap-x-6 rounded-lg border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
            {etalase.map((shelf) => (
              <li key={shelf.id}>
                <Link
                  href={shelfHref(shelf.slug)}
                  className="flex min-h-10 items-center justify-between gap-2 text-body-sm text-ink hover:underline"
                >
                  <span className="min-w-0">{shelf.name}</span>
                  <span className="kss-num text-meta text-zinc-500">{shelf.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </nav>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        {!activeShelf && paket.length > 0 ? (
          <div role="group" aria-label="Jenis barang" className="flex gap-2">
            {JENIS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={filters.jenis === option.value}
                onClick={() => update({ jenis: option.value })}
                className={`${CHIP} ${chipTone(filters.jenis === option.value)}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <p aria-live="polite" className="kss-num text-meta text-zinc-500">
          {results.length} {filters.jenis === 'paket' ? 'paket' : activeShelf || filters.jenis === 'produk' ? 'produk' : 'barang'}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-line bg-white p-8 text-center">
          <p className="text-sm text-ink-soft">
            Tidak ada barang yang cocok{filters.q ? ` untuk "${filters.q}"` : ''}
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
          {grouped && (
            <>
              <div className="mt-5 flex items-end justify-between gap-3">
                <h2 className="text-title text-ink">
                  PC siap pakai <span className="font-sans font-normal text-zinc-500">· harga total satu paket</span>
                </h2>
                <Link href="/paket-rakitan" className="kss-link shrink-0 text-body-sm">
                  Semua paket
                </Link>
              </div>
              <Grid items={paket} highlightKey={highlightKey} />
              <h2 className="mt-8 text-title text-ink">Produk toko</h2>
            </>
          )}
          {!grouped && <h2 className="sr-only">Hasil</h2>}
          <Grid items={flat.slice(0, limit)} highlightKey={highlightKey} />
          {flat.length > limit && (
            <div className="mt-6 flex justify-center">
              <button type="button" onClick={() => setLimit((value) => value + PAGE_SIZE)} className="kss-btn-outline h-12 px-6">
                Muat lebih banyak ({flat.length - limit} lagi)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Grid({ items, highlightKey }: { items: CatalogItem[]; highlightKey?: string }) {
  return (
    <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <li key={item.key} className="min-w-0">
          <CatalogCard item={item} highlight={item.key === highlightKey} showTokopedia heading="h3" />
        </li>
      ))}
    </ul>
  );
}
