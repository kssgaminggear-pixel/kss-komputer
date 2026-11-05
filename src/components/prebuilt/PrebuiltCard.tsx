'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Cpu,
  Disc3,
  MemoryStick,
  HardDriveDownload,
  Zap,
  Box,
  ShieldCheck,
  ExternalLink,
  MessageSquareCheck,
  SlidersHorizontal,
  Gamepad2,
  Layers,
} from 'lucide-react';
import { PrebuiltPC, ProductCategory, HardwarePart } from '@/lib/types';
import { PARTS_BY_ID } from '@/lib/mock-data';
import { formatIDR, generateWhatsAppOrderUrl, TOKOPEDIA_OFFICIAL_STORE_URL } from '@/lib/format';
import { calculateBundleTotal } from '@/lib/compatibility';
import { useBuilderStore } from '@/store/useBuilderStore';

export interface PrebuiltCardProps {
  pkg: PrebuiltPC;
  compact?: boolean;
}

export function PrebuiltCard({ pkg, compact = false }: PrebuiltCardProps) {
  const router = useRouter();
  const loadPrebuilt = useBuilderStore((state) => state.loadPrebuilt);

  // Resolusi part objek dari baseParts
  const partsList: { category: ProductCategory; part: HardwarePart; quantity: number }[] = [];
  const rawParts: (HardwarePart | undefined)[] = [];

  for (const [catKey, item] of Object.entries(pkg.baseParts)) {
    if (!item) continue;
    const part = PARTS_BY_ID[item.partId];
    if (part) {
      partsList.push({ category: catKey as ProductCategory, part, quantity: item.quantity });
      rawParts.push(part);
    }
  }

  // Hitung total harga rakitan jadi (sellPrice + assemblyFee)
  const totalBundlePrice = calculateBundleTotal(rawParts, pkg.assemblyFee || 150000);

  // Ambil komponen inti untuk ringkasan cepat
  const cpuPart = partsList.find((p) => p.category === 'cpu')?.part;
  const gpuPart = partsList.find((p) => p.category === 'gpu')?.part;
  const ramPart = partsList.find((p) => p.category === 'ram')?.part;
  const ssdPart = partsList.find((p) => p.category === 'ssd')?.part;

  const handleCustomize = () => {
    loadPrebuilt(pkg, PARTS_BY_ID);
    router.push(`/simulasi`);
  };

  const handleWhatsAppOrder = () => {
    const url = generateWhatsAppOrderUrl(undefined, {
      buildName: pkg.name,
      items: partsList.map((p) => ({
        category: p.category,
        name: p.part.name,
        quantity: p.quantity,
      })),
      totalPrice: totalBundlePrice,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col justify-between rounded-sm border border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700 transition-all shadow-xs overflow-hidden group">
      {/* 1. Header Paket */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="rounded-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight">
              {pkg.platform}
            </span>
            <span className="rounded-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
              {pkg.targetResolution}
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            {pkg.warrantyYears} Th Garansi
          </span>
        </div>

        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <Link href={`/paket-rakitan/${pkg.slug}`}>{pkg.name}</Link>
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {pkg.description}
        </p>
      </div>

      {/* 2. Daftar Spesifikasi Inti (ZERO PART-PRICE LEAK: Tanpa harga satuan!) */}
      <div className="p-4 sm:p-5 space-y-2 text-xs bg-zinc-50/50 dark:bg-zinc-950/30">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1">
          <Layers className="h-3 w-3" />
          <span>Spesifikasi Komponen Utama</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {cpuPart?.name || 'Processor Ready'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Disc3 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {gpuPart ? gpuPart.name : 'Integrated Graphics (iGPU)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MemoryStick className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span className="text-zinc-600 dark:text-zinc-300 truncate">
              {ramPart?.name || 'RAM Ready'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <HardDriveDownload className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span className="text-zinc-600 dark:text-zinc-300 truncate">
              {ssdPart?.name || 'Storage NVMe Ready'}
            </span>
          </div>
        </div>

        {/* 3. Bar Estimasi FPS Game */}
        {pkg.estimatedFps && pkg.estimatedFps.length > 0 && (
          <div className="mt-4 pt-3 border-t border-zinc-200/80 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 font-semibold uppercase">
              <span className="flex items-center gap-1">
                <Gamepad2 className="h-3 w-3 text-blue-500" />
                Estimasi Rata-Rata FPS
              </span>
              <span>{pkg.targetResolution}</span>
            </div>
            <div className="space-y-1.5">
              {pkg.estimatedFps.slice(0, 3).map((bench, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-[170px]">
                      {bench.game}
                    </span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      ~{bench.fps} FPS
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, (bench.fps / 240) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Footer Kartu: Total Harga Paket & Action CTA */}
      <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight block">
              Total Harga Paket (Siap Pakai)
            </span>
            <span className="font-mono text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
              {formatIDR(totalBundlePrice)}
            </span>
          </div>
          <span className="rounded-xs bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            Termasuk Biaya Rakit
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCustomize}
            className="flex items-center justify-center gap-1.5 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 transition-colors"
            title="Kustomisasi komponen paket ini di PC Configurator"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ubah Spek</span>
          </button>

          <button
            onClick={handleWhatsAppOrder}
            className="flex items-center justify-center gap-1.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-bold transition-colors shadow-xs"
            title="Pesan paket ini via WhatsApp resmi"
          >
            <MessageSquareCheck className="h-3.5 w-3.5" />
            <span>Pesan (WA)</span>
          </button>
        </div>

        <a
          href={pkg.tokopediaUrl || TOKOPEDIA_OFFICIAL_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 text-center"
        >
          <span>Checkout via Tokopedia Resmi</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
