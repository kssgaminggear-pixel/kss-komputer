import { describe, expect, it } from 'vitest';
import { sanitizeHardwarePartForPublic } from '@/lib/sanitizer';
import {
  getPublicHardwareParts,
  getPublicPrebuiltDetail,
  getPublicPrebuilts,
} from '@/lib/server-catalog';
import type { HardwarePart } from '@/lib/types';

const rawPart: HardwarePart = {
  id: 'cpu-1',
  sku: 'CPU-1',
  name: 'Ryzen 5 7600',
  slug: 'ryzen-5-7600',
  brand: 'AMD',
  category: 'cpu',
  costPrice: 2_100_000,
  sellPrice: 2_450_000,
  price: 2_450_000,
  retailPrice: 2_590_000,
  originalPrice: 2_700_000,
  stockStatus: 'ready',
  wattage: 65,
  warrantyYears: 3,
  specs: { socket: 'AM5' },
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const PART_PRICE_FIELD = /"(?:costPrice|sellPrice|retailPrice|originalPrice|price|priceIdr)":/;

describe('sanitizeHardwarePartForPublic', () => {
  it('tidak membawa field harga apa pun, termasuk retailPrice', () => {
    const result = sanitizeHardwarePartForPublic(rawPart);

    expect(Object.keys(result).filter((key) => /price/i.test(key))).toEqual([]);
  });
});

describe('DTO publik dari katalog', () => {
  it('daftar komponen tanpa harga', () => {
    expect(JSON.stringify(getPublicHardwareParts())).not.toMatch(PART_PRICE_FIELD);
  });

  it('daftar dan detail paket hanya membawa total serta delta', () => {
    const packages = getPublicPrebuilts();
    expect(packages.length).toBeGreaterThan(0);
    expect(JSON.stringify(packages)).not.toMatch(PART_PRICE_FIELD);

    for (const pkg of packages) {
      const detail = getPublicPrebuiltDetail(pkg.slug);
      expect(detail?.baseTotalPrice).toBeGreaterThan(0);
      expect(JSON.stringify(detail)).not.toMatch(PART_PRICE_FIELD);
    }
  });
});
