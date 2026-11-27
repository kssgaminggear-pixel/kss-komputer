/**
 * Loader katalog Toko. Hanya untuk Server Component, sitemap, dan layout.
 * Data di-import statis sehingga ikut proses build; keabsahannya dijaga
 * `scripts/validate-marketplace.mjs` di CI.
 */
import productsJson from '../../../data/marketplace/products.json';
import etalaseJson from '../../../data/marketplace/etalase.json';
import metaJson from '../../../data/marketplace/meta.json';
import { sortProducts } from './search';
import type {
  MarketplaceEtalase,
  MarketplaceMeta,
  MarketplaceProduct,
  PublicEtalase,
  PublicMarketplaceDetail,
  PublicMarketplaceProduct,
  SearchEntry,
} from './types';

const allProducts = productsJson as MarketplaceProduct[];
const allEtalase = etalaseJson as MarketplaceEtalase[];

/** Syarat tampil dari pemilik: aktif, punya rating, dan pernah terjual. */
export function isVisible(product: MarketplaceProduct): boolean {
  return product.status === 'active' && product.rating > 0 && product.sold > 0;
}

// Daftar field ditulis eksplisit agar field baru tidak otomatis ikut publik.
function toPublic(product: MarketplaceProduct): PublicMarketplaceProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    etalaseIds: product.etalaseIds,
    priceIdr: product.priceIdr,
    rating: product.rating,
    sold: product.sold,
    soldLabel: product.soldLabel,
    stock: product.stock,
    image: product.image,
    tokopediaUrl: product.tokopediaUrl,
    firstSeenAt: product.firstSeenAt,
  };
}

const visible = allProducts.filter(isVisible);
const listing = sortProducts(visible.map(toPublic), 'terlaris');

export function getMarketplaceProducts(): PublicMarketplaceProduct[] {
  return listing;
}

export function getMarketplaceProductBySlug(slug: string): PublicMarketplaceDetail | undefined {
  const product = visible.find((item) => item.slug === slug);
  return product
    ? { ...toPublic(product), description: product.description, syncedAt: product.syncedAt }
    : undefined;
}

/** Hanya etalase yang berisi produk tampil, sesuai urutan di toko. */
export function getMarketplaceEtalase(): PublicEtalase[] {
  return allEtalase
    .map((shelf) => ({
      ...shelf,
      count: listing.filter((product) => product.etalaseIds.includes(shelf.id)).length,
    }))
    .filter((shelf) => shelf.count > 0)
    .sort((a, b) => a.position - b.position);
}

export function getRelatedProducts(
  product: PublicMarketplaceProduct,
  limit = 4
): PublicMarketplaceProduct[] {
  return listing
    .filter(
      (item) =>
        item.id !== product.id && item.etalaseIds.some((id) => product.etalaseIds.includes(id))
    )
    .slice(0, limit);
}

export function getTopSellers(limit = 6): PublicMarketplaceProduct[] {
  return listing.slice(0, limit);
}

export function getMarketplaceMeta(): MarketplaceMeta {
  return metaJson as MarketplaceMeta;
}

export function getAverageRating(): number {
  if (listing.length === 0) return 0;
  return listing.reduce((sum, item) => sum + item.rating, 0) / listing.length;
}

export function getSearchEntries(): SearchEntry[] {
  const names = new Map(allEtalase.map((shelf) => [shelf.id, shelf.name]));
  return listing.map((product) => ({
    slug: product.slug,
    name: product.name,
    etalase: product.etalaseIds.map((id) => names.get(id)).filter(Boolean).join(' · '),
    image: product.image,
  }));
}
