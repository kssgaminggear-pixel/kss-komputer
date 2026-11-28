import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { MediaImage } from '@/components/ui/MediaImage';
import { SlotImage } from '@/components/ui/SlotImage';

const TILE_SIZES = '(max-width: 1023px) 50vw, 320px';
// Gambar lanskap dipotong ke bingkai 3:4, jadi lebar yang digambar melebihi lebar kartu.
const CROP_4_3_SIZES = '(max-width: 1023px) 90vw, 560px';
const CROP_16_9_SIZES = '(max-width: 1023px) 120vw, 740px';

export interface HomeCategoriesProps {
  packageImage?: string;
  tokoImage?: string;
}

export function HomeCategories({ packageImage, tokoImage }: HomeCategoriesProps) {
  const tiles = [
    {
      href: '/paket-rakitan',
      label: 'Siap pakai',
      title: 'Paket PC rakitan',
      // Foto unit asli hanya 240px, jadi tidak dibentangkan memenuhi kartu.
      media: (
        <span className="absolute inset-0 flex items-center justify-center bg-zinc-100 pb-14">
          <span className="relative block aspect-[4/5] w-[min(70%,160px)] overflow-hidden rounded-sm">
            <MediaImage src={packageImage} alt="Foto unit paket PC rakitan KSS" sizes="160px" />
          </span>
        </span>
      ),
    },
    {
      href: '/toko',
      label: 'Toko resmi',
      title: 'Komponen & aksesori',
      media: (
        <span className="absolute inset-0 block bg-white">
          <MediaImage src={tokoImage} alt="Produk terlaris toko KSS" sizes={TILE_SIZES} className="object-contain pb-14" />
        </span>
      ),
    },
    {
      href: '/jasa',
      label: 'Teknisi',
      title: 'Jasa & servis',
      media: <SlotImage slot="home.bento.jasa" sizes={CROP_4_3_SIZES} />,
    },
    {
      href: '/konsultasi',
      label: 'Gratis',
      title: 'Konsultasi rakit',
      media: <SlotImage slot="home.bento.konsultasi" sizes={CROP_16_9_SIZES} />,
    },
  ];

  return (
    <nav aria-label="Kategori belanja" className="border-b border-zinc-200 bg-white py-4 lg:py-8">
      <div className="kss-container">
        <ul className="kss-grid-hairline grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile) => (
            <li key={tile.href}>
              <Link href={tile.href} className="group relative block aspect-[3/4] overflow-hidden">
                {tile.media}
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-zinc-950 px-3 py-2.5 sm:px-4 sm:py-3">
                  <span className="min-w-0">
                    <span className="kss-label block text-zinc-400">{tile.label}</span>
                    <span className="mt-0.5 block truncate text-[13px] font-semibold text-zinc-50 sm:text-[15px]">
                      {tile.title}
                    </span>
                  </span>
                  <ArrowUpRight aria-hidden className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-orange-400" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
