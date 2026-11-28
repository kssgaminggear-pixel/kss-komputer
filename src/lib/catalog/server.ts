/**
 * HANYA boleh diimpor dari Server Component. Satu-satunya modul yang membaca kedua
 * domain (paket dan produk Toko). Setiap field dipilih satu per satu, tanpa spread,
 * agar rincian komponen paket tidak pernah ikut terkirim.
 */
import { getPublicPrebuilts } from '@/lib/server-catalog';
import { getTopSellers } from '@/lib/marketplace/server';
import { getPackageImage } from '@/lib/package-images';
import type { PublicPrebuiltPCDTO } from '@/lib/sanitizer';
import { toProdukItem } from './produk';
import type { CatalogPaketItem, CatalogProdukItem } from './types';

export { toProdukItem };

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

/** Semua paket, unggulan di depan. */
export function getPaketItems(): CatalogPaketItem[] {
  return getPublicPrebuilts()
    .map(toPaketItem)
    .sort((a, b) => Number(b.featured) - Number(a.featured));
}

/** Isi bagian Toko di Beranda: paket dan produk terlaris. */
export function getHomeCatalog(productLimit = 12): { paket: CatalogPaketItem[]; produk: CatalogProdukItem[] } {
  return {
    paket: getPaketItems().slice(0, 6),
    produk: getTopSellers(productLimit).map(toProdukItem),
  };
}
