import { describe, expect, it } from 'vitest';
import { getHomeCatalog } from '@/lib/catalog/server';
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

  it('tidak memuat rincian komponen paket', () => {
    expect(JSON.stringify(catalog)).not.toMatch(/"(parts|baseParts|deltaPrice|estimatedFps|costPrice|sellPrice|assemblyFee)"/);
  });
});
