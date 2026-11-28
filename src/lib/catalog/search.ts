import { matchesTokens, normalizeSearch, searchTokens, type SortValue } from '@/lib/marketplace/search';
import type { CatalogItem, CatalogProdukItem } from './types';

export const JENIS_OPTIONS = [
  { value: 'semua', label: 'Semua' },
  { value: 'paket', label: 'Paket PC' },
  { value: 'produk', label: 'Produk toko' },
] as const;

export type Jenis = (typeof JENIS_OPTIONS)[number]['value'];

export function isJenis(value: string | null): value is Jenis {
  return JENIS_OPTIONS.some((option) => option.value === value);
}

/** Teks yang dicari untuk satu item. `shelfNames` memetakan ID etalase ke namanya. */
export function searchText(item: CatalogItem, shelfNames: Map<string, string>): string {
  const extra =
    item.kind === 'paket'
      ? `paket pc rakitan siap pakai ${item.specs.join(' ')}`
      : item.etalaseIds.map((id) => shelfNames.get(id) ?? '').join(' ');
  return normalizeSearch(`${item.name} ${extra}`);
}

export function filterCatalog(items: CatalogItem[], index: Map<string, string>, query: string): CatalogItem[] {
  const tokens = searchTokens(query);
  return items.filter((item) => matchesTokens(index.get(item.key) ?? '', tokens));
}

const bySales = (a: CatalogProdukItem, b: CatalogProdukItem) =>
  b.sold - a.sold || b.rating - a.rating || a.name.localeCompare(b.name, 'id');

/**
 * Paket tidak punya data penjualan atau rating: pada "terlaris" paket tampil sebagai blok di depan
 * (urutan aslinya), pada "rating" di belakang. Urutan harga berlaku lintas jenis.
 */
export function sortCatalog(items: CatalogItem[], sort: SortValue): CatalogItem[] {
  return [...items].sort((a, b) => {
    if (sort === 'termurah') return a.priceIdr - b.priceIdr || a.name.localeCompare(b.name, 'id');
    if (sort === 'termahal') return b.priceIdr - a.priceIdr || a.name.localeCompare(b.name, 'id');
    if (a.kind === 'produk' && b.kind === 'produk') {
      return sort === 'rating' ? b.rating - a.rating || bySales(a, b) : bySales(a, b);
    }
    if (a.kind === b.kind) return 0;
    const paketFirst = a.kind === 'paket' ? -1 : 1;
    return sort === 'rating' ? -paketFirst : paketFirst;
  });
}
