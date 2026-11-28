import { describe, expect, it } from 'vitest';
import { getHomeCatalog } from '@/lib/catalog/server';
import { filterCatalog, searchText, sortCatalog } from '@/lib/catalog/search';
import type { CatalogItem } from '@/lib/catalog/types';
import { getPublicPrebuilts } from '@/lib/server-catalog';

/** Daftar putih: field baru di DTO paket harus ditambahkan di sini dengan sadar. */
const PAKET_KEYS = [
  'featured', 'href', 'image', 'key', 'kind', 'name', 'priceIdr', 'priceLabel', 'slug', 'specs', 'tokopediaUrl',
];

describe('katalog gabungan', () => {
  const catalog = getHomeCatalog();

  it('berisi 6 paket dan 12 produk, unggulan di depan', () => {
    expect(catalog.paket).toHaveLength(6);
    expect(catalog.produk).toHaveLength(12);
    const flags = catalog.paket.map((item) => Number(item.featured));
    expect(flags).toEqual([...flags].sort((a, b) => b - a));
  });

  it('paket hanya membawa field yang diizinkan dan harga total', () => {
    const totals = new Map(getPublicPrebuilts().map((pkg) => [pkg.slug, pkg.totalBundlePrice]));
    for (const item of catalog.paket) {
      expect(Object.keys(item).sort()).toEqual(PAKET_KEYS);
      expect(item.priceIdr).toBe(totals.get(item.slug));
    }
  });

  const items: CatalogItem[] = [...catalog.produk, ...catalog.paket];

  it('urutan terlaris menaruh paket di depan, rating menaruhnya di belakang', () => {
    const kinds = (sort: 'terlaris' | 'rating') => sortCatalog(items, sort).map((item) => item.kind);
    expect(kinds('terlaris').slice(0, 6)).toEqual(Array(6).fill('paket'));
    expect(kinds('rating').slice(-6)).toEqual(Array(6).fill('paket'));
  });

  it('urutan harga berlaku lintas jenis', () => {
    const cheap = sortCatalog(items, 'termurah').map((item) => item.priceIdr);
    expect(cheap).toEqual([...cheap].sort((a, b) => a - b));
    const expensive = sortCatalog(items, 'termahal').map((item) => item.priceIdr);
    expect(expensive).toEqual([...expensive].sort((a, b) => b - a));
  });

  it('pencarian menemukan paket lewat nama dan label', () => {
    const index = new Map(items.map((item) => [item.key, searchText(item, new Map())]));
    const found = filterCatalog(items, index, 'siap pakai 4K');
    expect(found.length).toBeGreaterThan(0);
    expect(found.every((item) => item.kind === 'paket')).toBe(true);
  });

  it('tidak memuat rincian komponen paket', () => {
    expect(JSON.stringify(catalog)).not.toMatch(/"(parts|baseParts|deltaPrice|estimatedFps|costPrice|sellPrice|assemblyFee)"/);
  });
});
