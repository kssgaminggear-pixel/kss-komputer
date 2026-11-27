import type { PublicMarketplaceProduct } from './types';

const SYNONYMS: Record<string, string> = {
  vga: 'graphic',
  memori: 'ram',
  tetikus: 'mouse',
};

/** Huruf kecil, tanpa diakritik, selain huruf/angka menjadi spasi. */
export function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function searchTokens(query: string): string[] {
  const clean = normalizeSearch(query);
  return clean ? clean.split(' ') : [];
}

/** Semua token harus cocok (langsung atau lewat sinonim). */
export function matchesTokens(haystack: string, tokens: string[]): boolean {
  return tokens.every(
    (token) =>
      haystack.includes(token) || (token in SYNONYMS && haystack.includes(SYNONYMS[token]))
  );
}

export const SORT_OPTIONS = [
  { value: 'terlaris', label: 'Terlaris' },
  { value: 'rating', label: 'Rating tertinggi' },
  { value: 'termurah', label: 'Harga terendah' },
  { value: 'termahal', label: 'Harga tertinggi' },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export function isSortValue(value: string | null): value is SortValue {
  return SORT_OPTIONS.some((option) => option.value === value);
}

export function sortProducts(
  products: PublicMarketplaceProduct[],
  sort: SortValue
): PublicMarketplaceProduct[] {
  const bestSelling = (a: PublicMarketplaceProduct, b: PublicMarketplaceProduct) =>
    b.sold - a.sold || b.rating - a.rating || a.name.localeCompare(b.name, 'id');

  return [...products].sort((a, b) => {
    if (sort === 'termurah') return a.priceIdr - b.priceIdr || bestSelling(a, b);
    if (sort === 'termahal') return b.priceIdr - a.priceIdr || bestSelling(a, b);
    if (sort === 'rating') return b.rating - a.rating || bestSelling(a, b);
    return bestSelling(a, b);
  });
}
