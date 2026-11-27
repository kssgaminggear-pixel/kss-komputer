import React, { Suspense } from 'react';
import { cacheLife } from 'next/cache';
import { ExternalLink } from 'lucide-react';
import bannersJson from '../../../data/marketplace/banners.json';
import { TOKOPEDIA_STORE_URL } from '@/lib/constants';
import {
  getAverageRating,
  getMarketplaceEtalase,
  getMarketplaceMeta,
  getMarketplaceProducts,
} from '@/lib/marketplace/server';
import { PromoBanner, type PromoBannerItem } from './PromoBanner';
import { TokoCatalog, TokoCatalogFromUrl } from './TokoCatalog';
import { formatRating } from './ProductCard';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });

/** Bagian yang bergantung pada tanggal hari ini: banner aktif dan umur data. */
async function getTimeBound(lastSuccessAt: string) {
  'use cache';
  cacheLife('hours');
  const now = Date.now();
  const today = new Date(now + 7 * 36e5).toISOString().slice(0, 10); // tanggal WIB
  const banners = (bannersJson as (PromoBannerItem & { activeFrom?: string; activeUntil?: string })[]).filter(
    (banner) => (!banner.activeFrom || banner.activeFrom <= today) && (!banner.activeUntil || banner.activeUntil >= today)
  );
  return { banners, stale: now - Date.parse(lastSuccessAt) > 72 * 36e5 };
}

export async function TokoView({ activeEtalaseSlug }: { activeEtalaseSlug?: string }) {
  const products = getMarketplaceProducts();
  const etalase = getMarketplaceEtalase();
  const meta = getMarketplaceMeta();
  const { banners, stale } = await getTimeBound(meta.lastSuccessAt);
  const activeShelf = etalase.find((shelf) => shelf.slug === activeEtalaseSlug);
  const catalog = { products, etalase, activeEtalaseSlug };

  const stats = [
    { label: 'Produk tampil', value: String(products.length) },
    { label: 'Rata-rata rating produk', value: formatRating(getAverageRating()) },
    { label: 'Data per', value: formatDate(meta.lastSuccessAt) },
  ];

  return (
    <div>
      <header className="kss-chapter-dark">
        <div className="kss-container flex flex-col gap-6 py-8 sm:py-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="kss-label text-orange-500">Toko resmi di Tokopedia</p>
            <h1 className="mt-3 text-h1-page text-balance text-white">
              {activeShelf ? activeShelf.name : 'Toko KSS Komputer'}
            </h1>
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="kss-label text-zinc-400">{stat.label}</dt>
                  <dd className="kss-num mt-1 text-sm text-zinc-100">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <a href={TOKOPEDIA_STORE_URL} target="_blank" rel="noopener noreferrer" className="kss-btn-outline-dark shrink-0">
            Kunjungi toko di Tokopedia
            <ExternalLink aria-hidden className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      <div className="kss-container space-y-6 py-6">
        {!activeEtalaseSlug && <PromoBanner banners={banners} />}
        {stale && (
          <p className="rounded-md border border-amber-700/30 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Harga terakhir diperbarui {formatDate(meta.lastSuccessAt)}. Cek Tokopedia untuk harga terkini.
          </p>
        )}
        <Suspense fallback={<TokoCatalog {...catalog} />}>
          <TokoCatalogFromUrl {...catalog} />
        </Suspense>
        <p className="border-t border-zinc-200 pt-4 text-meta text-zinc-500">
          Harga normal toko dan stok mengikuti listing Tokopedia pada tanggal data di atas. Harga di Tokopedia
          dapat berbeda karena promo.
        </p>
      </div>
    </div>
  );
}
