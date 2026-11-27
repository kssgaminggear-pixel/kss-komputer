import { describe, expect, it } from 'vitest';
import {
  sanitizeAccessoryForPublic,
  sanitizeHardwarePartForPublic,
} from '@/lib/sanitizer';
import {
  getPartSearchEntries,
  getPublicHardwareParts,
  getPublicPrebuiltDetail,
  getPublicPrebuilts,
} from '@/lib/server-catalog';
import type { AccessoryItem, HardwarePart } from '@/lib/types';

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

const PART_PRICE_FIELD = /"(?:costPrice|sellPrice|retailPrice|originalPrice|price)":/;

describe('sanitizeHardwarePartForPublic', () => {
  it('tidak membawa field harga apa pun, termasuk retailPrice', () => {
    const result = sanitizeHardwarePartForPublic(rawPart);

    expect(Object.keys(result).filter((key) => /price/i.test(key))).toEqual([]);
  });
});

describe('DTO publik dari katalog', () => {
  it('daftar komponen dan indeks pencarian tanpa harga', () => {
    expect(JSON.stringify(getPublicHardwareParts())).not.toMatch(PART_PRICE_FIELD);
    expect(JSON.stringify(getPartSearchEntries())).not.toMatch(/price/i);
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

describe('sanitizeAccessoryForPublic', () => {
  it('menghapus costPrice tapi menyimpan data publik', () => {
    const raw = {
      id: 'acc-1',
      sku: 'ACC-1',
      name: 'Keyboard Mekanikal',
      slug: 'keyboard-mekanikal',
      brand: 'KSS',
      category: 'keyboard',
      costPrice: 300_000,
      retailPrice: 450_000,
      stockStatus: 'ready',
      warrantyYears: 1,
      features: ['Hot-swap'],
      specs: {},
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as unknown as AccessoryItem;

    const result = sanitizeAccessoryForPublic(raw) as Record<string, unknown>;

    expect(result).not.toHaveProperty('costPrice');
    expect(result.retailPrice).toBe(450_000);
    expect(result.name).toBe('Keyboard Mekanikal');
  });
});
