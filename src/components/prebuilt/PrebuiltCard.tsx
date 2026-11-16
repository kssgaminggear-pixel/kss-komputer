'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Cpu,
  Disc3,
  MemoryStick,
  HardDriveDownload,
  ShieldCheck,
  ExternalLink,
  MessageSquareCheck,
  SlidersHorizontal,
  Gamepad2,
  ArrowRight,
} from 'lucide-react';
import { ProductCategory, PublicHardwarePart } from '@/lib/types';
import { formatIDR, generateWhatsAppOrderUrl, TOKOPEDIA_OFFICIAL_STORE_URL } from '@/lib/format';
import { useBuilderStore } from '@/store/useBuilderStore';
import type { PublicPrebuiltPCDTO } from '@/lib/sanitizer';

export interface PrebuiltCardProps {
  pkg: PublicPrebuiltPCDTO;
}

export function PrebuiltCard({ pkg }: PrebuiltCardProps) {
  const router = useRouter();
  const loadPrebuilt = useBuilderStore((state) => state.loadPrebuilt);

  const partsList: { category: ProductCategory; part: PublicHardwarePart; quantity: number }[] =
    pkg.parts.map((item) => ({
      category: item.category,
      part: item.part,
      quantity: item.quantity,
    }));

  const partsMap: Record<string, PublicHardwarePart> = Object.fromEntries(
    pkg.parts.map((item) => [item.partId, item.part])
  );

  const cpuPart = partsList.find((p) => p.category === 'cpu')?.part;
  const gpuPart = partsList.find((p) => p.category === 'gpu')?.part;
  const ramPart = partsList.find((p) => p.category === 'ram')?.part;
  const ssdPart = partsList.find((p) => p.category === 'ssd')?.part;

  const handleCustomize = () => {
    loadPrebuilt(pkg, partsMap, pkg.totalBundlePrice);
    router.push('/simulasi');
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

  return (
    <article className="group flex flex-col overflow-hidden rounded-md border border-zinc-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700">
      {/* Header */}
      <div className="border-b border-zinc-100 p-5 dark:border-zinc-800">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-tight text-blue-600 dark:text-blue-400">
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
          <span className="ml-auto flex items-center gap-1 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3 w-3" />
            {pkg.warrantyYears} Th
          </span>
        </div>

        <h3 className="text-base font-black tracking-tight text-zinc-900 transition-colors group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
          <Link href={`/paket-rakitan/${pkg.slug}`}>{pkg.name}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {pkg.description}
        </p>
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
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span className="line-clamp-2 font-semibold text-zinc-700 dark:text-zinc-300">
                  {spec.value}
                </span>
              </div>
            );
          })}
        </div>

        {pkg.estimatedFps && pkg.estimatedFps.length > 0 && (
          <div className="space-y-1.5 border-t border-zinc-200/80 pt-3 dark:border-zinc-800">
            <div className="flex items-center justify-between font-mono text-[10px] font-semibold uppercase text-zinc-400">
              <span className="flex items-center gap-1">
                <Gamepad2 className="h-3 w-3 text-blue-500" />
                Estimasi FPS
              </span>
              <span>{pkg.targetResolution}</span>
            </div>
            {pkg.estimatedFps.slice(0, 2).map((bench, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="max-w-[180px] truncate text-zinc-600 dark:text-zinc-400">
                    {bench.game}
                  </span>
                  <span className="font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                    ~{bench.fps} FPS
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
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
            <span className="block font-mono text-[10px] uppercase tracking-tight text-zinc-400">
              Total Harga Paket
            </span>
            <span className="kss-price text-xl text-zinc-900 dark:text-zinc-100">
              {formatIDR(pkg.totalBundlePrice)}
            </span>
          </div>
          <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            Termasuk Rakit
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={handleCustomize} className="kss-btn-outline h-9 px-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ubah Spek</span>
          </button>
          <button type="button" onClick={handleWhatsAppOrder} className="kss-btn-primary h-9 px-2">
            <MessageSquareCheck className="h-3.5 w-3.5" />
            <span>Pesan WA</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/paket-rakitan/${pkg.slug}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-700 transition-colors hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
          >
            <span>Lihat Detail</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
          <a
            href={pkg.tokopediaUrl || TOKOPEDIA_OFFICIAL_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400"
          >
            <span>Tokopedia</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
