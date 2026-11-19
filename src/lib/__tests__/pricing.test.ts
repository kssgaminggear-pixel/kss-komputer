import { describe, expect, it } from 'vitest';
import { calculatePackageTotal, calculatePartDelta } from '@/lib/compatibility';
import type { HardwarePart } from '@/lib/types';

function part(overrides: Partial<HardwarePart> = {}): HardwarePart {
  return {
    id: 'part-1',
    sku: 'SKU-1',
    name: 'Contoh Part',
    slug: 'contoh-part',
    brand: 'KSS',
    category: 'cpu',
    costPrice: 1_000_000,
    sellPrice: 1_200_000,
    price: 1_200_000,
    retailPrice: 1_250_000,
    stockStatus: 'ready',
    wattage: 65,
    warrantyYears: 3,
    specs: {},
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('calculatePackageTotal', () => {
  it('menjumlahkan harga jual internal dan biaya rakit', () => {
    const total = calculatePackageTotal(
      [part({ sellPrice: 1_200_000 }), part({ id: 'part-2', category: 'gpu', sellPrice: 4_500_000 })],
      150_000
    );

    expect(total).toBe(5_850_000);
  });

  it('mengabaikan komponen kosong dan biaya rakit negatif', () => {
    const total = calculatePackageTotal([undefined, part({ sellPrice: 2_000_000 })], -50_000);

    expect(total).toBe(2_000_000);
  });

  it('memakai markup global saat diberikan', () => {
    const total = calculatePackageTotal([part({ costPrice: 1_000_000, sellPrice: 9_999_999 })], 0, 10);

    expect(total).toBe(1_100_000);
  });
});

describe('calculatePartDelta', () => {
  it('menghasilkan delta positif untuk upgrade lebih mahal', () => {
    const delta = calculatePartDelta(
      part({ sellPrice: 1_000_000 }),
      part({ id: 'part-2', sellPrice: 1_750_000 })
    );

    expect(delta).toBe(750_000);
  });

  it('menghasilkan delta negatif untuk pilihan lebih murah', () => {
    const delta = calculatePartDelta(
      part({ sellPrice: 1_000_000 }),
      part({ id: 'part-2', sellPrice: 850_000 })
    );

    expect(delta).toBe(-150_000);
  });

  it('menghitung penuh saat komponen awal belum ada', () => {
    const delta = calculatePartDelta(undefined, part({ sellPrice: 650_000 }));

    expect(delta).toBe(650_000);
  });
});
