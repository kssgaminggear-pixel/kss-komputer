import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import products from '../../../data/marketplace/products.json';
import { diffCatalog as diffUntyped } from '../../../scripts/sync/lib/diff.mjs';
import { FALLBACK_ART, MEDIA_MANIFEST, mediaBlur, mediaCandidates } from '@/lib/media/resolve';

const PUBLIC = path.join(process.cwd(), 'public');

function publicImages(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'marketplace' ? [] : publicImages(full);
    return /\.(webp|avif|png|jpe?g|svg)$/i.test(entry.name)
      ? [`/${path.relative(PUBLIC, full).split(path.sep).join('/')}`]
      : [];
  });
}

describe('media', () => {
  it('membuang sumber kosong dan duplikat', () => {
    expect(mediaCandidates('', undefined, null)).toEqual([]);
    expect(mediaCandidates('/a.webp', '/a.webp', '/b.webp')).toEqual(['/a.webp', '/b.webp']);
  });

  it('manifest cocok dengan isi public/images (jalankan npm run media:build bila gagal)', () => {
    expect(Object.keys(MEDIA_MANIFEST).sort()).toEqual(publicImages(path.join(PUBLIC, 'images')).sort());
    expect(MEDIA_MANIFEST[FALLBACK_ART]).toBeDefined();
  });

  it('placeholder blur kecil dan hanya untuk gambar raster', () => {
    for (const [url, entry] of Object.entries(MEDIA_MANIFEST)) {
      expect(entry.width > 0 && entry.height > 0).toBe(true);
      expect(entry.blurDataURL.length).toBeLessThan(1024);
      expect(Boolean(mediaBlur(url))).toBe(!url.endsWith('.svg'));
    }
  });

  it('setiap foto Toko punya ukuran', () => {
    const missing = (products as { image: string; imageWidth?: number; imageHeight?: number }[]).filter(
      (p) => p.image && !(p.imageWidth && p.imageHeight)
    );
    expect(missing).toEqual([]);
  });

  it('sinkron mempertahankan ukuran foto lama', () => {
    const diffCatalog = diffUntyped as unknown as (a: object[], b: object[], c: object) => {
      products: { imageWidth?: number; imageHeight?: number }[];
    };
    const row = {
      id: '1000001',
      name: 'Produk',
      url: 'https://www.tokopedia.com/ksskomputer/produk',
      price: 1000,
      originalPrice: null,
      rating: 5,
      soldLabel: '3 terjual',
      soldOut: false,
      image: '',
      etalaseIds: ['1'],
    };
    const snapshot = {
      fetchedAt: '2026-01-01T00:00:00.000Z',
      failures: [],
      etalase: [{ id: '1', name: 'Kabel', position: 0 }],
      products: [row],
    };
    const first = diffCatalog([], [], snapshot);
    const sized = [{ ...first.products[0], imageWidth: 600, imageHeight: 450 }];
    const next = diffCatalog(sized, [], snapshot);
    expect(next.products[0]).toMatchObject({ imageWidth: 600, imageHeight: 450 });
  });
});
