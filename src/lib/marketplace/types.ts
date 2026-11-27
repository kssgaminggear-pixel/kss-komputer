/**
 * Data produk eceran Toko, cermin listing Tokopedia resmi KSS.
 * Domain ini terpisah dari komponen paket rakitan (AGENTS.md §1.1): jangan
 * pernah menautkan produk di sini dengan `HardwarePart`.
 */
export type MarketplaceStock = 'ready' | 'out_of_stock';

export interface MarketplaceProduct {
  /** ID produk Tokopedia, kunci stabil antar sinkron. */
  id: string;
  /** Dibuat sekali dan tidak pernah berubah (SEO). */
  slug: string;
  name: string;
  etalaseIds: string[];
  /** Harga normal toko (sebelum diskon Tokopedia). */
  priceIdr: number;
  rating: number;
  /** Angka bawah dari label: "1rb+" menjadi 1000. */
  sold: number;
  soldLabel: string;
  stock: MarketplaceStock;
  description: string;
  /** Path lokal; kosong bila gambar belum berhasil diunduh. */
  image: string;
  tokopediaUrl: string;
  status: 'active' | 'hidden';
  missingRuns: number;
  firstSeenAt: string;
  syncedAt: string;
}

export interface MarketplaceEtalase {
  id: string;
  slug: string;
  name: string;
  position: number;
}

export interface MarketplaceMeta {
  schemaVersion: 1;
  lastSuccessAt: string;
}

/** DTO daftar produk: tanpa deskripsi agar payload kecil. */
export type PublicMarketplaceProduct = Pick<
  MarketplaceProduct,
  | 'id'
  | 'slug'
  | 'name'
  | 'etalaseIds'
  | 'priceIdr'
  | 'rating'
  | 'sold'
  | 'soldLabel'
  | 'stock'
  | 'image'
  | 'tokopediaUrl'
  | 'firstSeenAt'
>;

export type PublicMarketplaceDetail = PublicMarketplaceProduct &
  Pick<MarketplaceProduct, 'description' | 'syncedAt'>;

export type PublicEtalase = MarketplaceEtalase & { count: number };

/** Indeks pencarian global: dikirim ke setiap halaman, tanpa harga. */
export interface SearchEntry {
  slug: string;
  name: string;
  etalase: string;
  image: string;
}
