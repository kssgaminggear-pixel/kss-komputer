import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Package, Star } from 'lucide-react';
import { Price } from '@/components/ui/Price';
import { formatIDR } from '@/lib/format';
import { discountPercent } from '@/lib/marketplace/search';
import type { PublicMarketplaceProduct } from '@/lib/marketplace/types';
import { AddToCartButton } from './AddToCartButton';

export const formatRating = (value: number) =>
  value.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function RatingLine({ rating, soldLabel }: { rating: number; soldLabel: string }) {
  return (
    <p className="kss-num flex items-center gap-1 text-meta text-zinc-500">
      <Star aria-hidden className="h-3 w-3 fill-amber-500 text-amber-500" />
      <span className="sr-only">Rating </span>
      {formatRating(rating)}
      <span aria-hidden>·</span>
      {soldLabel} terjual
    </p>
  );
}

export function ProductCard({ product }: { product: PublicMarketplaceProduct }) {
  const discount = discountPercent(product);
  const soldOut = product.stock === 'out_of_stock';

  return (
    <article className="flex min-w-0 flex-col p-3">
      <Link href={`/toko/${product.slug}`} className="kss-focusable group block">
        <div className={`relative aspect-square overflow-hidden rounded-md bg-zinc-100 ${soldOut ? 'opacity-60' : ''}`}>
          {product.image ? (
            <Image
              src={product.image}
              alt=""
              fill
              sizes="(min-width:1280px) 240px, (min-width:640px) 30vw, 46vw"
              className="object-contain"
            />
          ) : (
            <Package aria-hidden className="absolute inset-0 m-auto h-8 w-8 text-zinc-400" />
          )}
          {soldOut ? (
            <span className="kss-tag kss-tag-warn absolute left-1.5 top-1.5">Stok habis</span>
          ) : (
            discount > 0 && <span className="kss-tag kss-tag-danger absolute left-1.5 top-1.5">−{discount}%</span>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-snug text-zinc-900 group-hover:underline">
          {product.name}
        </h3>
      </Link>

      <div className="mt-1">
        <Price value={product.priceIdr} className="text-base text-zinc-950" />
        <p className="min-h-[1.25rem]">
          {product.originalPriceIdr && (
            <s className="kss-num text-meta text-zinc-500">{formatIDR(product.originalPriceIdr)}</s>
          )}
        </p>
        <RatingLine rating={product.rating} soldLabel={product.soldLabel} />
      </div>

      <div className="mt-auto flex flex-col gap-1.5 pt-3">
        <a
          href={product.tokopediaUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label={`${soldOut ? 'Lihat' : 'Beli'} ${product.name} di Tokopedia (tab baru)`}
          className="kss-btn-tokopedia h-9 w-full px-2 text-meta"
        >
          <span>{soldOut ? 'Lihat di Tokopedia' : 'Beli di Tokopedia'}</span>
          <ExternalLink aria-hidden className="h-3.5 w-3.5" />
        </a>
        <AddToCartButton
          disabled={soldOut}
          className="h-9 w-full px-2 text-meta"
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            unitPrice: product.priceIdr,
            originalPrice: product.originalPriceIdr,
            tokopediaUrl: product.tokopediaUrl,
          }}
        />
      </div>
    </article>
  );
}
