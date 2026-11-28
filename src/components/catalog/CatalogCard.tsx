import React from 'react';
import Link from 'next/link';
import { MediaImage } from '@/components/ui/MediaImage';
import { Price } from '@/components/ui/Price';
import { AddToCartButton } from '@/components/toko/AddToCartButton';
import { RatingLine } from '@/components/toko/ProductCard';
import type { CatalogItem, CatalogPaketItem, CatalogProdukItem } from '@/lib/catalog/types';

const CARD =
  'flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-line bg-white transition-shadow hover:shadow-float';
const NAME = 'mt-2 line-clamp-2 min-h-10 text-body-sm font-medium leading-5 text-ink group-hover:underline';

/** `highlight` memberi bingkai orange; pakai untuk satu kartu saja agar tetap menonjol. */
export function CatalogCard({ item, highlight = false }: { item: CatalogItem; highlight?: boolean }) {
  return item.kind === 'paket' ? <PaketCard item={item} highlight={highlight} /> : <ProdukCard item={item} />;
}

/** Paket hanya menampilkan harga total dan tidak masuk keranjang eceran. */
function PaketCard({ item, highlight }: { item: CatalogPaketItem; highlight: boolean }) {
  return (
    <article className={`${CARD} ${highlight ? 'kss-ring-selected' : ''}`}>
      <Link href={item.href} className="kss-focusable group flex h-full flex-col">
        {/* Foto unit asli hanya 240px, jadi tidak dibentangkan memenuhi kartu. */}
        <span className="relative flex aspect-square items-center justify-center bg-block-steel">
          <span className="relative block aspect-[4/5] w-[min(66%,160px)] overflow-hidden rounded-sm">
            <MediaImage src={item.image} alt="" sizes="160px" fallbackLabel="Foto menyusul" />
          </span>
          <span className="kss-tag kss-tag-ink absolute left-2 top-2">PC siap pakai</span>
        </span>
        <div className="flex flex-1 flex-col p-3">
          <h4 className={NAME}>{item.name}</h4>
          <span className="mt-2 flex flex-wrap gap-1">
            {item.specs.map((spec) => (
              <span key={spec} className="kss-spec-pill">{spec}</span>
            ))}
          </span>
          <span className="mt-auto block pt-3">
            <span className="kss-label block text-zinc-500">{item.priceLabel}</span>
            <Price value={item.priceIdr} className="text-base text-ink" />
            <span className="kss-btn-dark mt-2 h-9 w-full px-2 text-meta">Lihat detail</span>
          </span>
        </div>
      </Link>
    </article>
  );
}

function ProdukCard({ item }: { item: CatalogProdukItem }) {
  const soldOut = item.stock === 'out_of_stock';
  return (
    <article className={CARD}>
      <Link href={item.href} className="kss-focusable group block">
        <span className={`relative block aspect-square bg-white ${soldOut ? 'opacity-60' : ''}`}>
          <MediaImage
            src={item.image}
            alt=""
            sizes="(min-width:1280px) 200px, (min-width:768px) 25vw, 50vw"
            className="object-contain"
            fallbackLabel="Foto menyusul"
          />
          {soldOut && <span className="kss-tag kss-tag-warn absolute left-2 top-2">Stok habis</span>}
        </span>
        <div className="px-3">
          <h4 className={NAME}>{item.name}</h4>
        </div>
      </Link>
      <div className="flex flex-1 flex-col px-3 pb-3">
        <div className="mt-auto pt-2">
          <Price value={item.priceIdr} className="text-base text-ink" />
          <RatingLine rating={item.rating} soldLabel={item.soldLabel} />
        </div>
        <AddToCartButton
          disabled={soldOut}
          className="mt-2 h-9 w-full px-2 text-meta"
          product={{
            id: item.productId,
            slug: item.slug,
            name: item.name,
            unitPrice: item.priceIdr,
            tokopediaUrl: item.tokopediaUrl ?? '',
          }}
        />
      </div>
    </article>
  );
}
