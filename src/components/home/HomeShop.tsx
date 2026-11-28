import React from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { CatalogCard } from '@/components/catalog/CatalogCard';
import type { CatalogItem, CatalogPaketItem, CatalogProdukItem } from '@/lib/catalog/types';
import type { PublicEtalase } from '@/lib/marketplace/types';

/** Jumlah yang tampil di HP; sisanya disembunyikan di bawah 768px. */
const MOBILE_PAKET = 4;
const MOBILE_PRODUK = 8;
const CHIP =
  'inline-flex h-10 shrink-0 items-center rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink';

export interface HomeShopProps {
  paket: CatalogPaketItem[];
  produk: CatalogProdukItem[];
  shelves: PublicEtalase[];
  totalProducts: number;
}

/** Toko gabungan bergaya marketplace. Tanpa state klien: pencarian adalah form GET ke /toko. */
export function HomeShop({ paket, produk, shelves, totalProducts }: HomeShopProps) {
  return (
    <section id="toko-kss" aria-labelledby="judul-toko" className="scroll-mt-20 py-12 lg:py-20">
      <div className="kss-container">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 id="judul-toko" className="text-h2 text-ink">
            Toko KSS
          </h2>
          <form action="/toko" role="search" className="flex w-full gap-2 lg:max-w-xl">
            <label className="relative flex-1">
              <span className="sr-only">Cari produk di Toko</span>
              <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                name="q"
                placeholder="Cari di Toko"
                className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-4 text-base text-ink placeholder:text-zinc-500 sm:text-sm"
              />
            </label>
            <button type="submit" className="kss-btn-dark h-12 px-5">
              Cari
            </button>
          </form>
        </div>

        <nav aria-label="Kategori toko" className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/paket-rakitan" className={CHIP}>
            PC siap pakai
          </Link>
          {shelves.map((shelf) => (
            <Link key={shelf.id} href={`/toko/etalase/${shelf.slug}`} className={CHIP}>
              {shelf.name}
            </Link>
          ))}
        </nav>

        <Group title="PC siap pakai" note="harga total satu paket" href="/paket-rakitan" action="Semua paket">
          <Grid items={paket} mobileLimit={MOBILE_PAKET} />
        </Group>
        <Group title="Produk terlaris" note="dari katalog toko" href="/toko" action="Semua produk">
          <Grid items={produk} mobileLimit={MOBILE_PRODUK} />
        </Group>

        <div className="mt-8 flex justify-center">
          <Link href="/toko" className="kss-btn-outline h-12 px-6 text-sm">
            Lihat {totalProducts.toLocaleString('id-ID')} produk di Toko
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Group({
  title,
  note,
  href,
  action,
  children,
}: {
  title: string;
  note: string;
  href: string;
  action: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <div className="flex items-end justify-between gap-3">
        <h3 className="text-title text-ink">
          {title} <span className="font-normal text-zinc-500">· {note}</span>
        </h3>
        <Link href={href} className="kss-link shrink-0 text-body-sm">
          {action}
        </Link>
      </div>
      {children}
    </div>
  );
}

function Grid({ items, mobileLimit }: { items: CatalogItem[]; mobileLimit: number }) {
  return (
    <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-6">
      {items.map((item, index) => (
        <li key={item.key} className={index >= mobileLimit ? 'max-md:hidden' : ''}>
          <CatalogCard item={item} highlight={index === 0 && item.kind === 'paket' && item.featured} />
        </li>
      ))}
    </ul>
  );
}
