import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ExternalLink, MessageCircle } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { MediaImage } from '@/components/ui/MediaImage';
import { AddToCartButton } from '@/components/toko/AddToCartButton';
import { ProductCard, RatingLine } from '@/components/toko/ProductCard';
import { Price } from '@/components/ui/Price';
import { SITE_URL } from '@/lib/constants';
import { DEFAULT_WHATSAPP_PHONE } from '@/lib/format';
import {
  getMarketplaceEtalase,
  getMarketplaceProductBySlug,
  getMarketplaceProducts,
  getRelatedProducts,
} from '@/lib/marketplace/server';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getMarketplaceProducts().map((product) => ({ slug: product.slug }));
}

export const instant = false;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getMarketplaceProductBySlug(slug);
  if (!product) return { title: 'Produk tidak ditemukan', robots: { index: false } };
  return {
    title: `${product.name} — Toko KSS Komputer`,
    description: `${product.name}. ${product.soldLabel} terjual di toko resmi KSS Komputer.`,
    alternates: { canonical: `/toko/${product.slug}` },
    openGraph: product.image ? { images: [product.image] } : undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getMarketplaceProductBySlug(slug);
  if (!product) notFound();

  const shelf = getMarketplaceEtalase().find((item) => product.etalaseIds.includes(item.id));
  const related = getRelatedProducts(product);
  const soldOut = product.stock === 'out_of_stock';
  const waUrl = `https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
    `Halo KSS Komputer, saya mau tanya produk ini:\n*${product.name}*\n${SITE_URL}/toko/${product.slug}`
  )}`;

  const tokopediaButton = (className: string) => (
    <a
      href={product.tokopediaUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={`kss-btn-tokopedia ${className}`}
    >
      <span>{soldOut ? 'Lihat di Tokopedia' : 'Beli di Tokopedia'}</span>
      <ExternalLink aria-hidden className="h-4 w-4" />
    </a>
  );

  return (
    <div className="kss-container py-6 sm:py-8">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.image ? `${SITE_URL}${product.image}` : undefined,
            offers: {
              '@type': 'Offer',
              price: product.priceIdr,
              priceCurrency: 'IDR',
              availability: soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
              url: product.tokopediaUrl,
            },
          },
        ]}
      />

      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-meta text-zinc-500">
        <Link href="/toko" className="hover:text-zinc-900">Toko</Link>
        {shelf && (
          <>
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
            <Link href={`/toko/etalase/${shelf.slug}`} className="hover:text-zinc-900">{shelf.name}</Link>
          </>
        )}
        <ChevronRight aria-hidden className="h-3.5 w-3.5" />
        <span aria-current="page" className="line-clamp-1 text-zinc-900">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-md border border-zinc-200 bg-white">
          <MediaImage
            src={product.image}
            alt={product.name}
            lcp
            sizes="(min-width:1024px) 600px, 100vw"
            className="object-contain"
            fallbackLabel="Foto menyusul"
          />
        </div>

        <div className="min-w-0">
          <h1 className="text-xl font-semibold leading-snug text-balance text-zinc-950 sm:text-2xl">{product.name}</h1>
          <div className="mt-2">
            <RatingLine rating={product.rating} soldLabel={product.soldLabel} />
          </div>

          <div className="mt-4 border-y border-zinc-200 py-4">
            <Price value={product.priceIdr} className="text-3xl text-zinc-950" />
            {soldOut && <p className="mt-2"><span className="kss-tag kss-tag-warn">Stok habis</span></p>}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {tokopediaButton('h-11 w-full')}
            <div className="grid grid-cols-2 gap-2">
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="kss-btn-wa h-10">
                <MessageCircle aria-hidden className="h-4 w-4" />
                <span>Tanya via WhatsApp</span>
              </a>
              <AddToCartButton
                disabled={soldOut}
                className="h-10"
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  unitPrice: product.priceIdr,
                  tokopediaUrl: product.tokopediaUrl,
                }}
              />
            </div>
          </div>

          <section className="mt-6">
            <h2 className="kss-label text-zinc-500">Deskripsi</h2>
            <p className="mt-2 whitespace-pre-line text-body text-zinc-700">
              {product.description || 'Spesifikasi dan deskripsi lengkap tersedia di halaman produk Tokopedia.'}
            </p>
          </section>

          <p className="mt-6 text-meta text-zinc-500">
            Data per{' '}
            {new Date(product.syncedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}.
            Harga normal toko; harga di Tokopedia dapat berbeda karena promo.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-base font-semibold text-zinc-950">Produk lain di etalase ini</h2>
          <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.id} className="flex min-w-0 rounded-md border border-zinc-200 bg-white [&>article]:w-full">
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Bar aksi di HP, di atas navigasi bawah. */}
      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 border-t border-zinc-200 bg-white px-4 py-2 md:hidden">
        <Price value={product.priceIdr} className="text-base text-zinc-950" />
        {tokopediaButton('h-10 flex-1')}
      </div>
      <div aria-hidden className="h-14 md:hidden" />
    </div>
  );
}
