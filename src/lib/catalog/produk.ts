import type { PublicMarketplaceProduct } from '@/lib/marketplace/types';
import type { CatalogProdukItem } from './types';

/** Aman untuk klien: katalog /toko mengirim DTO produk ringkas lalu memetakannya di browser. */
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
