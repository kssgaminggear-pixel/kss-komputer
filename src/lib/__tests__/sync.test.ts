import { describe, expect, it } from 'vitest';
import { diffCatalog as diffUntyped } from '../../../scripts/sync/lib/diff.mjs';
import { cleanDescription, isFaithful } from '../../../scripts/sync/lib/describe.mjs';

type Row = Record<string, unknown> & { id: string };
type Product = { id: string; slug: string; status: string; missingRuns: number };
type DiffResult = { aborted?: string; products: Product[]; etalase: object[]; flags: string[] };
const diffCatalog = diffUntyped as unknown as (products: Product[], etalase: object[], source: object) => DiffResult;

const row = (id: number, price = 100_000): Row => ({
  id: String(1_000_000 + id),
  name: `Produk ${id}`,
  url: `https://www.tokopedia.com/ksskomputer/produk-${id}`,
  price,
  originalPrice: null,
  rating: 5,
  soldLabel: '3 terjual',
  soldOut: false,
  image: '',
  etalaseIds: ['1'],
});
const snapshot = (products: Row[], day = 1) => ({
  fetchedAt: `2026-01-0${day}T00:00:00.000Z`,
  failures: [] as string[],
  etalase: [{ id: '1', name: 'Kabel', position: 0 }],
  products,
});
const rows = Array.from({ length: 10 }, (_, i) => row(i));
const first = diffCatalog([], [], snapshot(rows));
const run = (products: Row[], from = first, day = 2) => diffCatalog(from.products, from.etalase, snapshot(products, day));
const find = (result: typeof first, id: number) => result.products.find((p) => p.id === String(1_000_000 + id))!;

describe('diff sinkron katalog', () => {
  it('tanpa perubahan tidak menandai apa pun dan syncedAt tidak maju', () => {
    const next = run(rows);
    expect(next.flags).toEqual([]);
    expect(next.products).toEqual(first.products);
  });

  it('produk hilang tetap tampil di run pertama, disembunyikan di run kedua, lalu kembali dengan slug sama', () => {
    const one = run(rows.slice(1));
    expect(find(one, 0)).toMatchObject({ status: 'active', missingRuns: 1 });
    const two = run(rows.slice(1), one, 3);
    expect(find(two, 0)).toMatchObject({ status: 'hidden', missingRuns: 2 });
    const back = run(rows, two, 4);
    expect(find(back, 0)).toMatchObject({ status: 'active', missingRuns: 0, slug: find(first, 0).slug });
  });

  it('memakai harga normal, jadi perubahan diskon tidak mengubah harga', () => {
    const discounted = (price: number) => ({ ...row(0, price), originalPrice: 120_000 });
    const before = diffCatalog([], [], snapshot([discounted(110_000), ...rows.slice(1)]));
    const after = run([discounted(105_000), ...rows.slice(1)], before);
    expect(find(after, 0)).toMatchObject({ priceIdr: 120_000 });
    expect(find(after, 0)).not.toHaveProperty('originalPriceIdr');
    expect(after.products).toEqual(before.products);
  });

  it('nama berubah tidak mengubah slug', () => {
    const renamed = [{ ...rows[0], name: 'Nama baru' }, ...rows.slice(1)];
    expect(find(run(renamed), 0).slug).toBe(find(first, 0).slug);
  });

  it('harga naik lebih dari 40% perlu tinjauan, 40% pas tidak', () => {
    expect(run([row(0, 150_000), ...rows.slice(1)]).flags).toHaveLength(1);
    expect(run([row(0, 140_000), ...rows.slice(1)]).flags).toEqual([]);
  });

  it('lebih dari 20% hilang: perlu tinjauan dan hitungan takedown tidak naik', () => {
    const next = run(rows.slice(3));
    expect(next.flags.length).toBeGreaterThan(0);
    expect(find(next, 0)).toMatchObject({ status: 'active', missingRuns: 0 });
  });

  it('membatalkan snapshot kosong, tidak lengkap, atau banyak baris rusak', () => {
    expect(run([]).aborted).toBeTruthy();
    expect(diffCatalog(first.products, first.etalase, { ...snapshot(rows), failures: ['x'] }).aborted).toBeTruthy();
    expect(run(rows.map((r, i) => (i < 3 ? { ...r, price: null } : r))).aborted).toBeTruthy();
  });
});

describe('pembersihan deskripsi', () => {
  const raw = 'Spesifikasi:\n• RAM 16GB 🔥\nHarga Rp 5.000.000\nHubungi admin dulu ya\nWA 0812-3456-7890\ncek https://contoh.com/x #promo\nGaransi 1 tahun';

  it('membuang emoji, harga, nomor telepon, tautan, dan ajakan chat', () => {
    const text = cleanDescription(raw);
    expect(text).toContain('- RAM 16GB');
    expect(text).toContain('Garansi 1 tahun');
    expect(text).not.toMatch(/Rp|0812|https|#promo|Hubungi|🔥/);
  });

  it('menolak keluaran model yang menambah angka atau fakta', () => {
    const source = 'Spesifikasi:\n- RAM 16GB\nGaransi 1 tahun resmi';
    expect(isFaithful('Spesifikasi:\n- RAM 16GB\n- Garansi 1 tahun resmi', source)).toBe(true);
    expect(isFaithful('Spesifikasi:\n- RAM 32GB\nGaransi 1 tahun resmi', source)).toBe(false);
    expect(isFaithful('Laptop premium dengan layar jernih, baterai awet, bonus tas eksklusif', source)).toBe(false);
  });
});
