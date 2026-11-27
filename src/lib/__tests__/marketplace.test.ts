import { describe, expect, it } from 'vitest';
import {
  getMarketplaceEtalase,
  getMarketplaceProductBySlug,
  getMarketplaceProducts,
  getSearchEntries,
  isVisible,
} from '@/lib/marketplace/server';
import { discountPercent, matchesTokens, normalizeSearch, searchTokens, sortProducts } from '@/lib/marketplace/search';
import type { MarketplaceProduct } from '@/lib/marketplace/types';
import { parseSold } from '../../../scripts/marketplace/parse-sold.mjs';

const base = { status: 'active', rating: 5, sold: 1 } as MarketplaceProduct;

describe('aturan tampil Toko', () => {
  it('hanya produk aktif yang punya rating dan sudah terjual', () => {
    expect(isVisible(base)).toBe(true);
    expect(isVisible({ ...base, rating: 0 })).toBe(false);
    expect(isVisible({ ...base, sold: 0 })).toBe(false);
    expect(isVisible({ ...base, status: 'hidden' })).toBe(false);
  });

  it('daftar publik mematuhi aturan dan tidak membawa field harga komponen', () => {
    const products = getMarketplaceProducts();
    expect(products.length).toBeGreaterThan(0);
    for (const product of products) {
      expect(product.rating).toBeGreaterThan(0);
      expect(product.sold).toBeGreaterThan(0);
    }
    expect(JSON.stringify(products)).not.toMatch(/costPrice|sellPrice|retailPrice/);
  });

  it('indeks pencarian global tanpa harga', () => {
    expect(Object.keys(getSearchEntries()[0]).sort()).toEqual(['etalase', 'image', 'name', 'slug']);
  });

  it('jumlah etalase sama dengan isi daftar dan etalase kosong disembunyikan', () => {
    const products = getMarketplaceProducts();
    for (const shelf of getMarketplaceEtalase()) {
      expect(shelf.count).toBeGreaterThan(0);
      expect(shelf.count).toBe(products.filter((p) => p.etalaseIds.includes(shelf.id)).length);
    }
  });

  it('slug tak dikenal tidak menghasilkan produk', () => {
    expect(getMarketplaceProductBySlug('tidak-ada')).toBeUndefined();
  });
});

describe('pencarian dan urutan', () => {
  it('multi-token, tanpa diakritik dan tanda hubung', () => {
    const text = normalizeSearch('Monitor ASUS VP227HFY 22" Full-HD');
    expect(matchesTokens(text, searchTokens('asus full hd'))).toBe(true);
    expect(matchesTokens(text, searchTokens('asus 27inch'))).toBe(false);
  });

  it('mengurutkan harga dan menghitung diskon', () => {
    const items = [{ ...base, name: 'b', priceIdr: 200 }, { ...base, name: 'a', priceIdr: 100 }];
    expect(sortProducts(items, 'termurah').map((p) => p.priceIdr)).toEqual([100, 200]);
    expect(discountPercent({ priceIdr: 750, originalPriceIdr: 1000 })).toBe(25);
    expect(discountPercent({ priceIdr: 750 })).toBe(0);
  });

  it('membaca label terjual Tokopedia', () => {
    expect(parseSold('2 terjual')).toEqual({ sold: 2, soldLabel: '2' });
    expect(parseSold('1rb+ terjual')).toEqual({ sold: 1000, soldLabel: '1rb+' });
    expect(parseSold('1,5rb+ terjual')).toEqual({ sold: 1500, soldLabel: '1,5rb+' });
    expect(parseSold('')).toEqual({ sold: 0, soldLabel: '' });
  });
});
