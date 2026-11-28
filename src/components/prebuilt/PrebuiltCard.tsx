'use client';

import React from 'react';
import Link from 'next/link';
import { MediaImage } from '@/components/ui/MediaImage';
import { ShieldCheck, ExternalLink, MessageCircle, ArrowRight } from 'lucide-react';
import { ProductCategory, PublicHardwarePart } from '@/lib/types';
import {
  generateWhatsAppOrderUrl,
  generateCustomBuildWAMessage,
  TOKOPEDIA_OFFICIAL_STORE_URL,
} from '@/lib/format';
import type { PublicPrebuiltPCDTO } from '@/lib/sanitizer';
import { getPackageImage } from '@/lib/package-images';
import { getSpecPills } from '@/lib/package-specs';
import { Price } from '@/components/ui/Price';

export interface PrebuiltCardProps {
  pkg: PublicPrebuiltPCDTO;
}

export function PrebuiltCard({ pkg }: PrebuiltCardProps) {
  const partsList: { category: ProductCategory; part: PublicHardwarePart; quantity: number }[] =
    pkg.parts.map((item) => ({
      category: item.category,
      part: item.part,
      quantity: item.quantity,
    }));

  const cpuPart = partsList.find((p) => p.category === 'cpu')?.part;
  const gpuPart = partsList.find((p) => p.category === 'gpu')?.part;
  const ramPart = partsList.find((p) => p.category === 'ram')?.part;
  const ssdPart = partsList.find((p) => p.category === 'ssd')?.part;

  const handleCustomize = () => {
    const url = generateCustomBuildWAMessage(undefined, {
      subject: `Rakit / upgrade dari paket ${pkg.name}`,
      parts: partsList.map((p) => ({
        category: p.category,
        name: p.part.name,
        quantity: p.quantity,
      })),
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppOrder = () => {
    const url = generateWhatsAppOrderUrl(undefined, {
      buildName: pkg.name,
      items: partsList.map((p) => ({
        category: p.category,
        name: p.part.name,
        quantity: p.quantity,
      })),
      totalPrice: pkg.totalBundlePrice,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const specs = [
    { label: 'CPU', value: cpuPart?.name || 'Processor ready' },
    { label: 'GPU', value: gpuPart ? gpuPart.name : 'Integrated graphics' },
    { label: 'RAM', value: ramPart?.name || 'RAM ready' },
    { label: 'SSD', value: ssdPart?.name || 'NVMe ready' },
  ];

  const specPills = getSpecPills(pkg);

  const packageImage = getPackageImage(pkg.slug);

  return (
    <article className="group flex flex-col rounded-md border border-zinc-200 bg-white transition-colors duration-150 hover:border-zinc-400">
      {/* 1. Header */}
      <div className="flex gap-4 p-5">
        <Link
          href={`/paket-rakitan/${pkg.slug}`}
          tabIndex={-1}
          aria-hidden
          className="relative h-[120px] w-24 shrink-0 overflow-hidden rounded-sm border border-zinc-200 bg-zinc-100"
        >
          <MediaImage src={packageImage} alt="" sizes="96px" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="kss-tag kss-tag-accent">{pkg.platform}</span>
            <span className="kss-tag kss-tag-neutral">{pkg.targetResolution}</span>
            {pkg.featured && <span className="kss-tag kss-tag-ink">Rekomendasi</span>}
          </div>
          <h3 className="mt-2.5 text-title text-zinc-950">
            <Link
              href={`/paket-rakitan/${pkg.slug}`}
              className="transition-colors hover:text-orange-700"
            >
              {pkg.name}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-body-sm text-zinc-600">{pkg.description}</p>
        </div>
      </div>

      {/* 2. Tabel spesifikasi */}
      <dl className="mx-5 divide-y divide-zinc-100 border-y border-zinc-200">
        {specs.map((s) => (
          <div
            key={s.label}
            className="grid grid-cols-[40px_minmax(0,1fr)] items-baseline gap-3 py-2"
          >
            <dt className="kss-label text-zinc-500">{s.label}</dt>
            <dd className="truncate text-body-sm text-zinc-800" title={s.value}>
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
      {specPills.length > 0 && (
        <div className="mx-5 mt-3 flex flex-wrap gap-1.5">
          {specPills.map((p) => (
            <span key={p} className="kss-spec-pill">
              {p}
            </span>
          ))}
        </div>
      )}

      {/* 3. FPS */}
      {pkg.estimatedFps && pkg.estimatedFps.length > 0 && (
        <div className="mx-5 mt-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="kss-label text-zinc-500">Estimasi FPS</span>
            <span className="kss-label text-zinc-950">{pkg.targetResolution}</span>
          </div>
          {pkg.estimatedFps.slice(0, 2).map((b, i) => (
            <div key={i}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="truncate text-body-sm text-zinc-600">{b.game}</span>
                <span className="kss-num text-meta font-semibold text-zinc-950">~{b.fps} FPS</span>
              </div>
              <div className="kss-fps-track">
                <div
                  className="kss-fps-fill"
                  style={{ width: `${Math.min(100, (b.fps / 240) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Harga + aksi */}
      <div className="mt-auto flex flex-col gap-3 p-5 pt-6">
        <div className="flex items-end justify-between gap-3 border-t border-zinc-200 pt-4">
          <div>
            <div className="kss-label text-zinc-500">Total harga paket</div>
            <Price
              value={pkg.totalBundlePrice}
              className="mt-0.5 text-[22px] leading-none text-zinc-950"
            />
          </div>
          <div className="text-right text-micro leading-4 text-zinc-500">
            <div>Termasuk rakit</div>
            <div className="flex items-center justify-end gap-1 text-emerald-700">
              <ShieldCheck aria-hidden className="h-3 w-3" />
              Garansi {pkg.warrantyYears} th
            </div>
          </div>
        </div>
        <Link href={`/paket-rakitan/${pkg.slug}`} className="kss-btn-dark w-full">
          Detail &amp; upgrade
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={handleWhatsAppOrder} className="kss-btn-outline px-2">
            <MessageCircle aria-hidden className="h-4 w-4" />
            Pesan via WA
          </button>
          <a
            href={pkg.tokopediaUrl || TOKOPEDIA_OFFICIAL_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="kss-btn-tokopedia px-2"
          >
            Tokopedia
            <ExternalLink aria-hidden className="h-3.5 w-3.5" />
          </a>
        </div>
        <button
          type="button"
          onClick={handleCustomize}
          className="self-center text-meta font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-zinc-950 hover:decoration-orange-600"
        >
          Ubah spesifikasi via WhatsApp
        </button>
      </div>
    </article>
  );
}
