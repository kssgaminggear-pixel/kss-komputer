import React from 'react';
import Link from 'next/link';
import { MediaImage } from '@/components/ui/MediaImage';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Price } from '@/components/ui/Price';
import type { PublicMarketplaceProduct } from '@/lib/marketplace/types';

export function HomeTopSellers({ products }: { products: PublicMarketplaceProduct[] }) {
  return (
    <section className="kss-section">
      <div className="kss-container">
        <SectionHeader
          eyebrow="Toko resmi"
          title="Terlaris di toko"
          action={{ href: '/toko', label: 'Lihat semua produk' }}
        />
        <ul className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
          {products.map((item) => (
            <li key={item.id} className="kss-card kss-card-hover overflow-hidden">
              <Link href={`/toko/${item.slug}`} className="flex h-full flex-col">
                <span className="relative block aspect-square bg-white">
                  <MediaImage src={item.image} alt="" sizes="(max-width: 1023px) 50vw, 304px" className="object-contain" />
                  {item.stock === 'out_of_stock' && (
                    <span className="kss-tag kss-tag-ink absolute left-2 top-2">Stok habis</span>
                  )}
                </span>
                <span className="flex flex-1 flex-col border-t border-zinc-200 p-3">
                  <h3 className="line-clamp-2 text-body-sm font-medium text-zinc-900">{item.name}</h3>
                  <span className="mt-auto flex flex-wrap items-baseline justify-between gap-x-2 pt-2">
                    <Price value={item.priceIdr} className="text-[15px] text-zinc-950" />
                    <span className="kss-num text-meta text-zinc-500">{item.soldLabel} terjual</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
