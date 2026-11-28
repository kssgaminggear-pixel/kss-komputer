/**
 * DTO tampilan katalog gabungan (aman untuk klien). Domain data paket dan produk Toko
 * tetap terpisah (AGENTS.md §1.1); yang digabung hanya tampilannya.
 */
interface CatalogItemBase {
  /** `${kind}:${id}` */
  key: string;
  slug: string;
  href: string;
  name: string;
  image?: string;
  /** Paket: hanya harga total. Produk: harga eceran Toko. */
  priceIdr: number;
  tokopediaUrl?: string;
}

export interface CatalogPaketItem extends CatalogItemBase {
  kind: 'paket';
  priceLabel: 'Total paket';
  /** Maksimal 3 label ringkas. */
  specs: string[];
  featured: boolean;
}

export interface CatalogProdukItem extends CatalogItemBase {
  kind: 'produk';
  /** ID produk Tokopedia, dipakai keranjang. */
  productId: string;
  rating: number;
  sold: number;
  soldLabel: string;
  stock: 'ready' | 'out_of_stock';
  etalaseIds: string[];
  firstSeenAt: string;
}

export type CatalogItem = CatalogPaketItem | CatalogProdukItem;
