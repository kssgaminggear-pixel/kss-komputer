/**
 * HANYA boleh diimpor dari Server Component. Satu-satunya modul yang membaca kedua
 * domain (paket dan produk Toko). Setiap field dipilih satu per satu, tanpa spread,
 * agar rincian komponen paket tidak pernah ikut terkirim.
 */
import { getPublicPrebuilts } from '@/lib/server-catalog';
import { getTopSellers } from '@/lib/marketplace/server';
import { getPackageImage } from '@/lib/package-images';
import type { PublicPrebuiltPCDTO } from '@/lib/sanitizer';
import type { PublicMarketplaceProduct } from '@/lib/marketplace/types';
import type { CatalogPaketItem, CatalogProdukItem } from './types';

export function toPaketItem(pkg: PublicPrebuiltPCDTO): CatalogPaketItem {
  return {
    kind: 'paket',
    key: `paket:${pkg.id}`,
    slug: pkg.slug,
    href: `/paket-rakitan/${pkg.slug}`,
    name: pkg.name,
    image: getPackageImage(pkg.slug),
    priceIdr: pkg.totalBundlePrice,
    tokopediaUrl: pkg.tokopediaUrl,
    priceLabel: 'Total paket',
    specs: [pkg.targetResolution, pkg.platform].filter(Boolean),
    featured: Boolean(pkg.featured),
  };
}

export function toProdukItem(product: PublicMarketplaceProduct): CatalogProdukItem {
  return {
    kind: 'produk',
    key: `produk:${product.id}`,
    productId: product.id,
    slug: product.slug,
    href: `/toko/${product.slug}`,
    name: product.name,
    image: product.image,
    priceIdr: product.priceIdr,
    tokopediaUrl: product.tokopediaUrl,
    rating: product.rating,
    sold: product.sold,
    soldLabel: product.soldLabel,
    stock: product.stock,
    etalaseIds: product.etalaseIds,
    firstSeenAt: product.firstSeenAt,
  };
}

/** Isi bagian Toko di Beranda: semua paket (unggulan di depan) dan produk terlaris. */
export function getHomeCatalog(productLimit = 12): { paket: CatalogPaketItem[]; produk: CatalogProdukItem[] } {
  return {
    paket: getPublicPrebuilts()
      .map(toPaketItem)
      .sort((a, b) => Number(b.featured) - Number(a.featured))
      .slice(0, 6),
    produk: getTopSellers(productLimit).map(toProdukItem),
  };
}
