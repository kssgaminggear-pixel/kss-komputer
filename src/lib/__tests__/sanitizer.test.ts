import { describe, expect, it } from 'vitest';
import {
  sanitizeAccessoryForPublic,
  sanitizeHardwarePartForPublic,
} from '@/lib/sanitizer';
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
  stockStatus: 'ready',
  wattage: 65,
  warrantyYears: 3,
  specs: { socket: 'AM5' },
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('sanitizeHardwarePartForPublic', () => {
  it('tidak pernah membocorkan harga modal atau harga jual internal', () => {
    const result = sanitizeHardwarePartForPublic(rawPart) as Record<string, unknown>;

    expect(result).not.toHaveProperty('costPrice');
    expect(result).not.toHaveProperty('sellPrice');
    expect(result).not.toHaveProperty('price');
  });

  it('mempertahankan harga eceran resmi untuk katalog retail', () => {
    const result = sanitizeHardwarePartForPublic(rawPart);

    expect(result.retailPrice).toBe(2_590_000);
  });

  it('memakai sellPrice sebagai fallback bila retailPrice kosong', () => {
    const result = sanitizeHardwarePartForPublic({ ...rawPart, retailPrice: undefined });

    expect(result.retailPrice).toBe(2_450_000);
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
