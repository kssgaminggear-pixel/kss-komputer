'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Cpu,
  Disc3,
  MemoryStick,
  HardDriveDownload,
  ShieldCheck,
  ExternalLink,
  MessageSquareCheck,
  Gamepad2,
  ArrowRight,
} from 'lucide-react';
import { ProductCategory, PublicHardwarePart } from '@/lib/types';
import {
  formatIDR,
  generateWhatsAppOrderUrl,
  generateCustomBuildWAMessage,
  TOKOPEDIA_OFFICIAL_STORE_URL,
} from '@/lib/format';
import type { PublicPrebuiltPCDTO } from '@/lib/sanitizer';
import { getPackageImage } from '@/lib/package-images';

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
    { icon: Cpu, value: cpuPart?.name || 'Processor Ready' },
    { icon: Disc3, value: gpuPart ? gpuPart.name : 'Integrated Graphics' },
    { icon: MemoryStick, value: ramPart?.name || 'RAM Ready' },
    { icon: HardDriveDownload, value: ssdPart?.name || 'Storage NVMe Ready' },
  ];

  const totalWattage = partsList.reduce(
    (sum, item) => sum + (item.part.wattage || 0) * item.quantity,
    0
  );

  const specPills = [
    cpuPart?.specs.socket,
    ramPart?.specs.ramType,
    totalWattage > 0 ? `${totalWattage}W` : null,
    pkg.targetResolution,
  ].filter(Boolean) as string[];

  const packageImage = getPackageImage(pkg.slug);

  return (
    <article className="group flex flex-col overflow-hidden rounded-md border border-zinc-200 bg-white transition-colors duration-150 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-600">
      {/* Header */}
      <div className="border-b border-zinc-100 p-5 dark:border-zinc-800">
        <div className="flex items-start gap-3">
          {packageImage && (
            <div className="relative h-24 w-[76px] shrink-0 overflow-hidden rounded-sm border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
              <Image
                src={packageImage}
                alt={`Foto unit ${pkg.name}`}
                fill
                sizes="76px"
                className="object-cover"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-tight text-orange-700 dark:text-orange-400">
                {pkg.platform}
              </span>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {pkg.targetResolution}
              </span>
              {pkg.featured && (
                <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  Rekomendasi
                </span>
              )}
              <span className="ml-auto flex items-center gap-1 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                {pkg.warrantyYears} Th
              </span>
            </div>

            <h3 className="text-base font-black tracking-tight text-zinc-900 transition-colors group-hover:text-orange-700 dark:text-zinc-100 dark:group-hover:text-orange-400">
              <Link href={`/paket-rakitan/${pkg.slug}`}>{pkg.name}</Link>
            </h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
              {pkg.description}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {specPills.map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center rounded-sm border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* Specs */}
      <div className="flex-1 space-y-2 bg-zinc-50/60 p-5 dark:bg-zinc-950/30">
        <div className="grid grid-cols-1 gap-2 text-[11px] sm:grid-cols-2">
          {specs.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-1.5 rounded-md border border-zinc-100 bg-white px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" />
                <span className="line-clamp-2 font-semibold text-zinc-700 dark:text-zinc-300">
                  {spec.value}
                </span>
              </div>
            );
          })}
        </div>

        {pkg.estimatedFps && pkg.estimatedFps.length > 0 && (
          <div className="space-y-1.5 rounded-sm border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between font-mono text-[10px] font-semibold uppercase text-zinc-500">
              <span className="flex items-center gap-1">
                <Gamepad2 className="h-3 w-3 text-orange-500" />
                Estimasi FPS
              </span>
              <span>{pkg.targetResolution}</span>
            </div>
            {pkg.estimatedFps.slice(0, 2).map((bench, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="max-w-[180px] truncate text-zinc-600 dark:text-zinc-500">
                    {bench.game}
                  </span>
                  <span className="font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                    ~{bench.fps} FPS
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full bg-orange-500"
                    style={{ width: `${Math.min(100, (bench.fps / 240) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="flex items-end justify-between gap-2">
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-tight text-zinc-500">
              Total Harga Paket
            </span>
            <span className="kss-price text-xl text-zinc-900 dark:text-zinc-100">
              {formatIDR(pkg.totalBundlePrice)}
            </span>
          </div>
          <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
            Termasuk Rakit
          </span>
        </div>

        <button type="button" onClick={handleCustomize} className="kss-btn-primary h-10 w-full">
          <MessageSquareCheck className="h-3.5 w-3.5" />
          <span>Konsultasi Upgrade via WA</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={handleWhatsAppOrder} className="kss-btn-outline h-9 px-2">
            <MessageSquareCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Pesan WA</span>
          </button>
          <a
            href={pkg.tokopediaUrl || TOKOPEDIA_OFFICIAL_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-emerald-700 px-2 text-xs font-bold text-white transition-colors hover:bg-emerald-800"
          >
            <span>Tokopedia</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/paket-rakitan/${pkg.slug}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-700 transition-colors hover:text-orange-700 dark:text-zinc-300 dark:hover:text-orange-400"
          >
            <span>Lihat Detail</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
          <span className="font-mono text-[10px] text-zinc-500">
            {pkg.warrantyYears} Th Garansi
          </span>
        </div>
      </div>
    </article>
  );
}
