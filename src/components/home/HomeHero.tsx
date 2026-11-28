import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BadgeCheck, MessageSquareText } from 'lucide-react';
import { MediaImage } from '@/components/ui/MediaImage';
import { SlotImage } from '@/components/ui/SlotImage';
import { Price } from '@/components/ui/Price';
import { getPackageImage } from '@/lib/package-images';
import type { PublicPrebuiltPCDTO } from '@/lib/sanitizer';

const STATS = [
  { label: 'Garansi', value: 'Resmi' },
  { label: 'Stress test', value: '24 jam' },
  { label: 'Harga', value: '1 total' },
  { label: 'Siap ambil', value: 'Same day' },
];

export function HomeHero({ featured }: { featured?: PublicPrebuiltPCDTO }) {
  return (
    <section className="kss-chapter-dark border-b border-zinc-800">
      <div className="kss-container max-md:!px-0 md:py-6 lg:py-8">
        <div className="kss-grid-hairline-dark grid-cols-1 !rounded-none !border-x-0 !border-t-0 md:!rounded-md md:!border lg:grid-cols-12">
          {/* A: gambar utama + ajakan */}
          <div className="flex flex-col lg:relative lg:col-span-7 lg:row-span-2 lg:min-h-[600px]">
            <div className="relative h-[min(52svh,460px)] md:h-auto md:aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto">
              <SlotImage slot="home.hero" sizes="(max-width: 767px) 100vw, 760px" lcp />
              <div className="absolute right-2 top-2 flex flex-col items-end gap-1.5">
                <span className="kss-tag kss-tag-on-dark">
                  <BadgeCheck aria-hidden className="h-3 w-3 text-emerald-400" />
                  Official Store
                </span>
                <span className="kss-tag kss-tag-on-dark tabular-nums">4.9 · 33 rb terjual</span>
              </div>
            </div>
            <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-5 sm:px-6 lg:absolute lg:bottom-0 lg:left-0 lg:max-w-[340px] lg:border-r lg:p-6">
              <p className="kss-eyebrow text-orange-400">
                <span aria-hidden className="h-1.5 w-1.5 bg-orange-500" />
                System integrator · Mangga Dua Mall
              </p>
              <h1 className="mt-3 text-h2 text-balance text-zinc-50">
                PC rakitan siap pakai. Satu harga, sudah diuji.
              </h1>
              <p className="mt-3 hidden text-body-sm text-pretty text-zinc-400 sm:block">
                Pilih paket jadi atau konsultasikan racikan sendiri.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <a href="#paket-terlaris" className="kss-btn-primary h-11 px-5 text-sm">
                  Lihat paket siap pakai
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </a>
                <Link href="/konsultasi" className="kss-btn-outline-dark h-11 px-5 text-sm">
                  <MessageSquareText aria-hidden className="h-4 w-4" />
                  Konsultasi budget
                </Link>
              </div>
            </div>
          </div>

          {/* B: paket unggulan dengan foto unit asli */}
          {featured && (
            <Link
              href={`/paket-rakitan/${featured.slug}`}
              className="group flex items-center gap-4 p-4 sm:gap-6 sm:p-6 lg:col-span-5"
            >
              <span className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-sm bg-zinc-900 sm:w-40">
                <MediaImage
                  src={getPackageImage(featured.slug)}
                  alt={`Foto unit ${featured.name}`}
                  sizes="160px"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="kss-label block text-zinc-400">Paket unggulan</span>
                <span className="mt-2 block text-title text-zinc-50 group-hover:underline">{featured.name}</span>
                <span className="kss-label mt-4 block text-zinc-400">Total paket</span>
                <Price value={featured.totalBundlePrice} className="mt-1 text-xl text-zinc-50 sm:text-2xl" />
              </span>
              <ArrowUpRight aria-hidden className="h-4 w-4 shrink-0 self-start text-zinc-400" />
            </Link>
          )}

          {/* C: fakta toko */}
          <dl className="grid grid-cols-2 gap-px !bg-zinc-800 lg:col-span-5">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col justify-center bg-zinc-950 px-4 py-4 sm:px-6">
                <dt className="kss-label text-zinc-400">{stat.label}</dt>
                <dd className="mt-1.5 font-mono text-base font-semibold tabular-nums text-zinc-50 sm:text-lg">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
