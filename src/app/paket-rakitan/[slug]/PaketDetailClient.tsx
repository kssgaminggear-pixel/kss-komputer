'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MediaImage } from '@/components/ui/MediaImage';
import {
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  SlidersHorizontal,
  Check,
  Gamepad2,
  Clock,
  Truck,
  Layers,
} from 'lucide-react';
import { ProductCategory, PublicHardwarePart } from '@/lib/types';
import { formatIDR, formatWatt, generateWhatsAppOrderUrl, TOKOPEDIA_OFFICIAL_STORE_URL } from '@/lib/format';
import type { PublicPrebuiltDetailDTO } from '@/lib/sanitizer';
import { getPackageImage } from '@/lib/package-images';
import { PaymentInfo } from '@/components/payment/PaymentInfo';

const UPGRADEABLE_CATEGORIES: ProductCategory[] = ['gpu', 'ram', 'ssd', 'cooler', 'case'];

export default function PaketDetailContent({ pkg }: { pkg: PublicPrebuiltDetailDTO }) {
  // Peta part publik (base + seluruh opsi upgrade) — tanpa harga satuan.
  const partsMap = useMemo(() => {
    const map: Record<string, PublicHardwarePart> = {};
    for (const item of pkg.parts) {
      map[item.partId] = item.part;
    }
    for (const options of Object.values(pkg.upgradeOptions)) {
      for (const option of options || []) {
        map[option.part.id] = option.part;
      }
    }
    return map;
  }, [pkg]);

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

  // Resolusi part objek saat ini
  const currentPartsList = useMemo(() => {
    const list: { category: ProductCategory; part: PublicHardwarePart; quantity: number }[] = [];
    for (const [cat, partId] of Object.entries(selectedParts)) {
      const part = partsMap[partId];
      if (part) {
        const qty = pkg.baseParts[cat as ProductCategory]?.quantity || 1;
        list.push({ category: cat as ProductCategory, part, quantity: qty });
      }
    }
    return list;
  }, [selectedParts, pkg.baseParts, partsMap]);

  // Total bundle price = harga dasar server + akumulasi delta upgrade.
  const totalBundlePrice = useMemo(() => {
    let total = pkg.baseTotalPrice;
    for (const cat of UPGRADEABLE_CATEGORIES) {
      const selectedId = selectedParts[cat];
      const baseId = pkg.baseParts[cat]?.partId;
      if (!selectedId || selectedId === baseId) continue;
      const option = pkg.upgradeOptions[cat]?.find((opt) => opt.part.id === selectedId);
      if (option) total += option.deltaPrice;
    }
    return total;
  }, [selectedParts, pkg]);

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

  // Dapatkan opsi kandidat upgrade
  const getCandidateOptions = (cat: ProductCategory) => {
    const basePartId = pkg.baseParts[cat]?.partId;
    const currentMobo = partsMap[selectedParts.motherboard || ''];

    let candidates = pkg.upgradeOptions[cat] || [];

    // Filter kompatibilitas spesifik
    if (cat === 'ram' && currentMobo?.specs.ramType) {
      candidates = candidates.filter(
        (opt) => opt.part.specs.ramType === currentMobo.specs.ramType
      );
    }

    return candidates.map((opt) => {
      const isSelected = selectedParts[cat] === opt.part.id;
      const isBase = basePartId === opt.part.id;
      return {
        part: opt.part,
        isSelected,
        isBase,
      };
    });
  };

  return (
    <div className="kss-container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4 font-mono">
        <Link href="/" className="hover:text-orange-700">Beranda</Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
        <Link href="/paket-rakitan" className="hover:text-orange-700">Paket PC Rakitan</Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-zinc-900 dark:text-zinc-100 font-semibold truncate">{pkg.name}</span>
      </nav>

      {/* Main Grid: Detail + Spec Upgrader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Info Paket, Komponen Aktif, & Quick Upgrader */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="rounded-md bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-micro font-mono font-bold text-orange-700 dark:text-orange-400 uppercase">
                    {pkg.platform}
                  </span>
                  <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-micro font-mono text-zinc-700 dark:text-zinc-300">
                    {pkg.targetResolution}
                  </span>
                  <span className="rounded-md bg-zinc-50 border border-zinc-200 px-2 py-0.5 text-micro font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {pkg.tier}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {pkg.name}
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">
                  {pkg.description}
                </p>
              </div>

              <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-sm border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 sm:h-36 sm:w-28">
                <MediaImage
                  src={getPackageImage(pkg.slug)}
                  alt={`Foto unit ${pkg.name}`}
                  lcp
                  sizes="(max-width: 640px) 80px, 112px"
                />
              </div>
            </div>

            {/* Highlights */}
            {pkg.highlights && pkg.highlights.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pkg.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <Check className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Total & CTA ringkas untuk mobile */}
            <div className="mt-4 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800 lg:hidden">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <span className="block font-mono text-micro uppercase tracking-tight text-zinc-500">
                    Total Harga Paket
                  </span>
                  <span className="kss-price text-xl text-zinc-900 dark:text-zinc-100">
                    {formatIDR(totalBundlePrice)}
                  </span>
                </div>
                <span className="rounded-sm border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-micro font-bold text-zinc-800 dark:text-zinc-200">
                  Termasuk Rakit
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={handleWhatsAppCheckout} className="kss-btn-dark h-10">
                  <MessageCircle className="h-4 w-4" />
                  <span>Pesan WA</span>
                </button>
                <a
                  href={pkg.tokopediaUrl || TOKOPEDIA_OFFICIAL_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kss-btn-outline h-10"
                >
                  <ExternalLink className="h-4 w-4 text-emerald-700" />
                  <span>Tokopedia</span>
                </a>
              </div>
            </div>
          </div>
          <div className="rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-5">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-orange-700 dark:text-orange-400" />
                  <span>Quick Spec Upgrader (Tukar / Upgrade Part)</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Klik opsi di bawah untuk upgrade kapasitas atau performa. Total harga PC diperbarui otomatis.
                </p>
              </div>
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
                      <span className="text-meta font-mono text-zinc-500">
                        {options.length} Opsi Kompatibel
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {options.map((opt) => (
                        <button
                          key={opt.part.id}
                          type="button"
                          onClick={() => handleSelectUpgrade(cat, opt.part.id)}
                          className={`flex flex-col gap-2 rounded-md border p-3 text-left transition-all ${
                            opt.isSelected
                              ? 'border-orange-600 bg-orange-50/50 dark:border-orange-500 dark:bg-orange-950/30'
                              : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            {opt.isSelected && (
                              <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-orange-700 text-white">
                                <Check className="h-2.5 w-2.5" />
                              </span>
                            )}
                            <span className="line-clamp-2 text-meta font-bold text-zinc-900 dark:text-zinc-100">
                              {opt.part.name}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-mono text-micro text-zinc-500">
                              {opt.part.sku} · {opt.part.warrantyYears} Th
                            </span>
                            {opt.isBase && (
                              <span className="shrink-0 rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-meta font-bold text-zinc-500 dark:bg-zinc-800/80">
                                Bawaan paket
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabel Spesifikasi Lengkap Rakitan (ZERO PART-PRICE LEAK) */}
          <div className="rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-orange-700 dark:text-orange-400" />
              <span>Rincian Spesifikasi Terpasang</span>
            </h2>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
              {currentPartsList.map((item) => (
                <div key={item.part.id} className="py-2.5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-micro font-mono text-zinc-500 uppercase block mb-0.5">
                      {item.category}
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.part.name} {item.quantity > 1 ? `(${item.quantity}x)` : ''}
                    </span>
                    <span className="text-meta text-zinc-500 block">
                      Distributor Resmi ID ({item.part.officialDistributor || 'Astrindo/EMD'}) • Garansi {item.part.warrantyYears} Tahun
                    </span>
                  </div>
                  <span className="rounded-md bg-zinc-50 border border-zinc-200 px-2 py-0.5 font-mono text-micro font-bold text-zinc-800 dark:text-zinc-200 shrink-0">
                    Termasuk Paket
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Estimasi FPS Game Bar */}
          {pkg.estimatedFps && pkg.estimatedFps.length > 0 && (
            <div className="rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4 text-orange-700 dark:text-orange-400" />
                  <span>Estimasi Performa Gaming (Benchmark Rata-Rata)</span>
                </h2>
                <span className="font-mono text-xs text-zinc-500">{pkg.targetResolution}</span>
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
                    <div className="h-1.5 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-full bg-orange-500"
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
        <div className="space-y-4 lg:col-span-4 lg:sticky lg:top-24">
          <div className="rounded-md border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/90 shadow-sm space-y-4">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-micro font-mono text-zinc-500 uppercase tracking-tight block">
                Total Harga Paket (Siap Pakai)
              </span>
              <div className="kss-price mt-0.5 text-2xl text-zinc-900 dark:text-zinc-100">
                {formatIDR(totalBundlePrice)}
              </div>
              <span className="text-meta text-zinc-800 dark:text-zinc-200 font-semibold block mt-0.5">
                Sudah termasuk jasa rakit rapi, OS test &amp; stress test
              </span>
            </div>

            {/* Telemetry Daya & Kompatibilitas */}
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Estimasi TDP Daya:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatWatt(totalWattage)}</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Rekomendasi PSU:</span>
                <span className="font-bold text-orange-700 dark:text-orange-400">
                  Min. {Math.round((totalWattage * 1.35) / 50) * 50}W
                </span>
              </div>
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Status Perakitan:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">100% Kompatibel</span>
              </div>
            </div>

            {/* Tombol Aksi Utama */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="flex items-center justify-center gap-2 kss-btn-dark h-11 w-full text-xs"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Pesan Paket Ini via WhatsApp</span>
              </button>

              <a
                href={pkg.tokopediaUrl || TOKOPEDIA_OFFICIAL_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-md bg-zinc-900 hover:bg-zinc-700 text-white py-2.5 text-xs font-bold transition-colors"
              >
                <span>Beli di Tokopedia Resmi</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <PaymentInfo />
            </div>

            {/* Keunggulan Toko */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-meta text-zinc-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-orange-700" />
                <span>Garansi Resmi Toko &amp; Distributor Indonesia</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-orange-700" />
                <span>Gratis Packing Kayu &amp; Asuransi Pengiriman</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-orange-700" />
                <span>Proses Rakit &amp; Test Cepat (Same-Day / 1 Hari)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

