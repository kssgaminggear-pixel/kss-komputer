import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MediaImage } from '@/components/ui/MediaImage';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Price } from '@/components/ui/Price';
import { getPackageImage } from '@/lib/package-images';
import { getSpecPills } from '@/lib/package-specs';
import type { PublicPrebuiltPCDTO } from '@/lib/sanitizer';

export function HomePackages({ packages, total }: { packages: PublicPrebuiltPCDTO[]; total: number }) {
  return (
    <section id="paket-terlaris" className="kss-section-alt scroll-mt-20">
      <div className="kss-container">
        <SectionHeader
          eyebrow="Paket siap pakai"
          title="Paket PC rakitan terlaris"
          action={{ href: '/paket-rakitan', label: `Semua paket (${total})` }}
        />
        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:gap-5">
          {packages.map((pkg) => (
            <li key={pkg.id} className="kss-card kss-card-hover flex w-[78vw] shrink-0 snap-start flex-col overflow-hidden md:w-auto">
              <Link
                href={`/paket-rakitan/${pkg.slug}`}
                tabIndex={-1}
                aria-hidden
                className="flex justify-center bg-zinc-100 py-6"
              >
                <span className="relative block aspect-[4/5] w-40 overflow-hidden rounded-sm">
                  <MediaImage src={getPackageImage(pkg.slug)} alt="" sizes="160px" />
                </span>
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap gap-1.5">
                  <span className="kss-tag kss-tag-neutral">{pkg.targetResolution}</span>
                  {pkg.featured && <span className="kss-tag kss-tag-ink">Rekomendasi</span>}
                </div>
                <h3 className="mt-2.5 line-clamp-2 text-title text-zinc-950">
                  <Link href={`/paket-rakitan/${pkg.slug}`} className="hover:underline">
                    {pkg.name}
                  </Link>
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {getSpecPills(pkg).map((pill) => (
                    <span key={pill} className="kss-spec-pill">{pill}</span>
                  ))}
                </div>
                <div className="mt-auto pt-4">
                  <div className="kss-label text-zinc-500">Total paket</div>
                  <Price value={pkg.totalBundlePrice} className="mt-0.5 text-[22px] leading-none text-zinc-950" />
                  <Link href={`/paket-rakitan/${pkg.slug}`} className="kss-btn-dark mt-3 w-full">
                    Lihat detail
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
