'use client';

import React, { useState, useMemo, use, Suspense } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import {
  ChevronRight,
  ShieldCheck,
  Cpu,
  Disc3,
  MemoryStick,
  HardDriveDownload,
  Zap,
  Box,
  Fan,
  Sparkles,
  ExternalLink,
  MessageSquareCheck,
  Printer,
  SlidersHorizontal,
  Check,
  Gamepad2,
  Wrench,
  Clock,
  Truck,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { MOCK_PREBUILT_PCS, MOCK_HARDWARE_PARTS, PARTS_BY_ID } from '@/lib/mock-data';
import { ProductCategory, HardwarePart } from '@/lib/types';
import { formatIDR, formatDeltaIDR, formatWatt, generateWhatsAppOrderUrl, TOKOPEDIA_OFFICIAL_STORE_URL } from '@/lib/format';
import { calculateBundleTotal, calculateDeltaPrice } from '@/lib/compatibility';
import { useBuilderStore } from '@/store/useBuilderStore';

const UPGRADEABLE_CATEGORIES: ProductCategory[] = ['gpu', 'ram', 'ssd', 'cooler', 'case'];

function PaketDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);

  const pkg = MOCK_PREBUILT_PCS.find((p) => p.slug === slug);
  if (!pkg) {
    notFound();
  }

  // Active selections state initialized from pkg.baseParts
  const [selectedParts, setSelectedParts] = useState<Record<ProductCategory, string>>(() => {
    const initial: Record<string, string> = {};
    for (const [cat, item] of Object.entries(pkg.baseParts)) {
      if (item) {
        initial[cat] = item.partId;
      }
    }
    return initial as Record<ProductCategory, string>;
  });

  const loadPrebuilt = useBuilderStore((state) => state.loadPrebuilt);

  // Resolusi part objek saat ini
  const currentPartsList = useMemo(() => {
    const list: { category: ProductCategory; part: HardwarePart; quantity: number }[] = [];
    for (const [cat, partId] of Object.entries(selectedParts)) {
      const part = PARTS_BY_ID[partId];
      if (part) {
        const qty = pkg.baseParts[cat as ProductCategory]?.quantity || 1;
        list.push({ category: cat as ProductCategory, part, quantity: qty });
      }
    }
    return list;
  }, [selectedParts, pkg.baseParts]);

  // Total bundle price kalkulasi real-time
  const totalBundlePrice = useMemo(() => {
    const rawParts = currentPartsList.map((item) => item.part);
    return calculateBundleTotal(rawParts, pkg.assemblyFee);
  }, [currentPartsList, pkg.assemblyFee]);

  // Total wattage kalkulasi real-time
  const totalWattage = useMemo(() => {
    let sum = currentPartsList.reduce((acc, item) => acc + item.part.wattage * item.quantity, 0);
    if (!selectedParts.motherboard) sum += 30;
    return sum;
  }, [currentPartsList, selectedParts.motherboard]);

  // Handler memilih part upgrade
  const handleSelectUpgrade = (cat: ProductCategory, candidatePartId: string) => {
    setSelectedParts((prev) => ({
      ...prev,
      [cat]: candidatePartId,
    }));
  };

  // Handler ke Configurator
  const handleOpenInConfigurator = () => {
    loadPrebuilt(pkg, PARTS_BY_ID);
    router.push('/simulasi');
  };

  // Handler WhatsApp Checkout
  const handleWhatsAppCheckout = () => {
    const url = generateWhatsAppOrderUrl(undefined, {
      buildName: `${pkg.name} (Custom Upgraded)`,
      items: currentPartsList.map((item) => ({
        category: item.category,
        name: item.part.name,
        quantity: item.quantity,
      })),
      totalPrice: totalBundlePrice,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Dapatkan opsi kandidat upgrade yang kompatibel
  const getCandidateOptions = (cat: ProductCategory) => {
    const basePartId = pkg.baseParts[cat]?.partId;
    const basePart = basePartId ? PARTS_BY_ID[basePartId] : undefined;
    const currentMobo = PARTS_BY_ID[selectedParts.motherboard || ''];

    let candidates = MOCK_HARDWARE_PARTS.filter((p) => p.category === cat);

    // Filter kompatibilitas spesifik
    if (cat === 'ram' && currentMobo?.specs.ramType) {
      candidates = candidates.filter((p) => p.specs.ramType === currentMobo.specs.ramType);
    }

    return candidates.map((cand) => {
      const delta = calculateDeltaPrice(basePart, cand);
      const isSelected = selectedParts[cat] === cand.id;
      const isBase = basePartId === cand.id;
      return {
        part: cand,
        delta,
        isSelected,
        isBase,
      };
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4 font-mono">
        <Link href="/" className="hover:text-blue-600">Beranda</Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <Link href="/paket-rakitan" className="hover:text-blue-600">Paket PC Rakitan</Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <span className="text-zinc-900 dark:text-zinc-100 font-semibold truncate">{pkg.name}</span>
      </nav>

      {/* Main Grid: Detail + Spec Upgrader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Info Paket, Komponen Aktif, & Quick Upgrader */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                {pkg.platform}
              </span>
              <span className="rounded-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-700 dark:text-zinc-300">
                {pkg.targetResolution}
              </span>
              <span className="rounded-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {pkg.tier}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              {pkg.name}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {pkg.description}
            </p>

            {/* Highlights */}
            {pkg.highlights && pkg.highlights.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pkg.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Spec Upgrader (DELTA PRICING: ZERO PART LEAK) */}
          <div className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-5">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Quick Spec Upgrader (Tukar / Upgrade Part)</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Klik opsi di bawah untuk upgrade kapasitas atau performa. Selisih harga dihitung otomatis tanpa membongkar modal part.
                </p>
              </div>
              <span className="rounded-xs bg-blue-500/10 border border-blue-500/20 px-2 py-1 font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                Delta Pricing Active
              </span>
            </div>

            <div className="space-y-6">
              {UPGRADEABLE_CATEGORIES.map((cat) => {
                const options = getCandidateOptions(cat);
                if (options.length <= 1) return null;

                const catLabels: Record<string, string> = {
                  gpu: 'VGA / Kartu Grafis',
                  ram: 'Memory RAM',
                  ssd: 'Storage (SSD NVMe)',
                  cooler: 'CPU Cooler',
                  case: 'Casing PC',
                };

                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      <span>{catLabels[cat] || cat}</span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {options.length} Opsi Kompatibel
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {options.map((opt) => (
                        <button
                          key={opt.part.id}
                          type="button"
                          onClick={() => handleSelectUpgrade(cat, opt.part.id)}
                          className={`flex items-start justify-between p-3 rounded-sm border text-left transition-all ${
                            opt.isSelected
                              ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30'
                              : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {opt.isSelected && (
                                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-white shrink-0">
                                  <Check className="h-2.5 w-2.5" />
                                </span>
                              )}
                              <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {opt.part.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 block truncate">
                              {opt.part.sku} • {opt.part.warrantyYears} Th Garansi
                            </span>
                          </div>

                          <span
                            className={`font-mono text-[11px] font-bold shrink-0 px-1.5 py-0.5 rounded-xs tabular-nums ${
                              opt.delta === 0
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                                : opt.delta > 0
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {formatDeltaIDR(opt.delta, true)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabel Spesifikasi Lengkap Rakitan (ZERO PART-PRICE LEAK) */}
          <div className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Rincian Spesifikasi Terpasang</span>
            </h2>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
              {currentPartsList.map((item) => (
                <div key={item.part.id} className="py-2.5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-0.5">
                      {item.category}
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.part.name} {item.quantity > 1 ? `(${item.quantity}x)` : ''}
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      Distributor Resmi ID ({item.part.officialDistributor || 'Astrindo/EMD'}) • Garansi {item.part.warrantyYears} Tahun
                    </span>
                  </div>
                  <span className="rounded-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    Termasuk Paket
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Estimasi FPS Game Bar */}
          {pkg.estimatedFps && pkg.estimatedFps.length > 0 && (
            <div className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Estimasi Performa Gaming (Benchmark Rata-Rata)</span>
                </h2>
                <span className="font-mono text-xs text-zinc-400">{pkg.targetResolution}</span>
              </div>

              <div className="space-y-3">
                {pkg.estimatedFps.map((bench, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{bench.game}</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                        ~{bench.fps} FPS ({bench.settings})
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
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

        {/* Kolom Kanan: Sticky Telemetry & Checkout Box */}
        <div className="lg:col-span-4 sticky top-20 space-y-4">
          <div className="rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/90 shadow-sm space-y-4">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight block">
                Total Harga Paket (Siap Pakai)
              </span>
              <div className="font-mono text-2xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums mt-0.5">
                {formatIDR(totalBundlePrice)}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                Sudah termasuk jasa rakit rapi, OS test &amp; stress test
              </span>
            </div>

            {/* Telemetry Daya & Kompatibilitas */}
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xs border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Estimasi TDP Daya:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatWatt(totalWattage)}</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xs border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Rekomendasi PSU:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  Min. {Math.round((totalWattage * 1.35) / 50) * 50}W
                </span>
              </div>
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xs border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Status Perakitan:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Kompatibel</span>
              </div>
            </div>

            {/* Tombol Aksi Utama */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="flex items-center justify-center gap-2 w-full rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-bold transition-colors shadow-xs"
              >
                <MessageSquareCheck className="h-4 w-4" />
                <span>Pesan Paket Ini via WhatsApp</span>
              </button>

              <a
                href={pkg.tokopediaUrl || TOKOPEDIA_OFFICIAL_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-sm bg-[#03AC0E] hover:bg-[#02950c] text-white py-2.5 text-xs font-bold transition-colors shadow-xs"
              >
                <span>Beli di Tokopedia Resmi</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <button
                type="button"
                onClick={handleOpenInConfigurator}
                className="flex items-center justify-center gap-2 w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 py-2.5 text-xs font-bold transition-colors"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
                <span>Buka di Custom Configurator</span>
              </button>
            </div>

            {/* Keunggulan Toko */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-[11px] text-zinc-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>Garansi Resmi Toko &amp; Distributor Indonesia</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-blue-600" />
                <span>Gratis Packing Kayu &amp; Asuransi Pengiriman</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span>Proses Rakit &amp; Test Cepat (Same-Day / 1 Hari)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaketDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center font-mono text-xs text-zinc-500">
          Memuat spesifikasi paket PC...
        </div>
      }
    >
      <PaketDetailContent params={params} />
    </Suspense>
  );
}
