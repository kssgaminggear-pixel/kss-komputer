import { describe, expect, it } from 'vitest';
import { getRamModuleCount, validateBuild } from '@/lib/compatibility';
import type { HardwarePart, ProductCategory, PublicHardwarePart } from '@/lib/types';

function part(
  category: ProductCategory,
  specs: HardwarePart['specs'],
  overrides: Partial<HardwarePart> = {}
): HardwarePart {
  const id = `${category}-1`;
  return {
    id,
    sku: id.toUpperCase(),
    name: `Contoh ${category}`,
    slug: `contoh-${category}`,
    brand: 'KSS',
    category,
    costPrice: 1_000_000,
    sellPrice: 1_200_000,
    price: 1_200_000,
    retailPrice: 1_250_000,
    stockStatus: 'ready',
    wattage: 65,
    warrantyYears: 3,
    specs,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('getRamModuleCount', () => {
  const ram = {
    id: 'ram-1',
    specs: { kitConfiguration: '2x16GB' },
  } as unknown as PublicHardwarePart;

  it('mengalikan keping kit dengan kuantitas', () => {
    expect(getRamModuleCount(ram, 2)).toBe(4);
  });

  it('menghitung satu keping bila kit tidak didefinisikan', () => {
    expect(getRamModuleCount({ ...ram, specs: {} } as unknown as PublicHardwarePart, 3)).toBe(3);
  });
});

describe('validateBuild', () => {
  it('menandai socket CPU dan motherboard yang berbeda', () => {
    const report = validateBuild([
      part('cpu', { socket: 'AM5' }),
      part('motherboard', { socket: 'LGA1700', ramType: 'DDR5' }),
    ]);

    expect(report.isCompatible).toBe(false);
    expect(report.issues.map((issue) => issue.id)).toContain('socket-mismatch');
  });

  it('lolos saat socket dan tipe RAM cocok', () => {
    const report = validateBuild([
      part('cpu', { socket: 'AM5' }),
      part('motherboard', { socket: 'AM5', ramType: 'DDR5' }),
      part('ram', { ramType: 'DDR5', kitConfiguration: '2x16GB', capacityGb: 32 }),
    ]);

    expect(report.issues.map((issue) => issue.id)).not.toContain('socket-mismatch');
    expect(report.issues.map((issue) => issue.id)).not.toContain('ram-type-mismatch-ram-1');
  });

  it('menandai RAM DDR4 pada motherboard DDR5', () => {
    const report = validateBuild([
      part('motherboard', { socket: 'AM5', ramType: 'DDR5' }),
      part('ram', { ramType: 'DDR4', kitConfiguration: '2x8GB', capacityGb: 16 }),
    ]);

    expect(report.issues.map((issue) => issue.id)).toContain('ram-type-mismatch-ram-1');
  });
});
