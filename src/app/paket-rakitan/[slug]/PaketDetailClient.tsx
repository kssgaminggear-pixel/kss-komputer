'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MediaImage } from '@/components/ui/MediaImage';
import { Check, ChevronDown, ChevronRight, Clock, ExternalLink, MessageCircle, ShieldCheck } from 'lucide-react';
import { ProductCategory, PublicHardwarePart } from '@/lib/types';
import { formatWatt, warrantyLabel, generateWhatsAppOrderUrl, TOKOPEDIA_OFFICIAL_STORE_URL } from '@/lib/format';
import type { PublicPrebuiltDetailDTO } from '@/lib/sanitizer';
import { getPackageImage } from '@/lib/package-images';
import { PaymentInfo } from '@/components/payment/PaymentInfo';
import { Price } from '@/components/ui/Price';
import { MobileActionBar } from '@/components/ui/MobileActionBar';

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

  const categoryLabels: Record<string, string> = {
    cpu: 'Prosesor',
    motherboard: 'Motherboard',
    gpu: 'Kartu grafis',
    ram: 'Memori RAM',
    ssd: 'SSD',
    hdd: 'Hard disk',
    psu: 'Power supply',
    cooler: 'Pendingin prosesor',
    case: 'Casing',
    fan: 'Kipas',
    monitor: 'Monitor',
  };
  const upgradeable = UPGRADEABLE_CATEGORIES.map((cat) => ({ cat, options: getCandidateOptions(cat) })).filter(
    (group) => group.options.length > 1
  );
  const tokopediaUrl = pkg.tokopediaUrl || TOKOPEDIA_OFFICIAL_STORE_URL;
  // Unik per paket: Next menyimpan halaman sebelumnya secara tersembunyi di DOM.
  const orderId = `pesan-${pkg.slug}`;
  const summaryClass =
    'flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 [&::-webkit-details-marker]:hidden';

  return (
    <>
      <section className="mx-2 mt-2 rounded-lg bg-block-steel md:mx-3 md:mt-3 md:rounded-xl">
        <div className="kss-container py-6 lg:py-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-body-sm text-zinc-600">
            <Link href="/" className="hover:text-ink">Beranda</Link>
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
            <Link href="/toko" className="hover:text-ink">Toko</Link>
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
            <Link href="/paket-rakitan" className="hover:text-ink">Paket PC siap pakai</Link>
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
            <span aria-current="page" className="font-semibold text-ink">{pkg.name}</span>
          </nav>

          <div className="mt-4 grid gap-6 lg:grid-cols-12 lg:items-center">
            <div className="flex justify-center rounded-lg bg-white p-4 lg:order-2 lg:col-span-4 lg:p-6">
              <div className="relative aspect-[4/5] w-40">
                <MediaImage
                  src={getPackageImage(pkg.slug)}
                  alt={`Foto unit ${pkg.name}`}
                  lcp
                  sizes="160px"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="flex flex-wrap gap-2">
                {[pkg.platform, pkg.targetResolution, pkg.tier].map((value) => (
                  <span key={value} className="kss-tag kss-tag-neutral bg-white">{value}</span>
                ))}
              </div>
              <h1 className="mt-3 text-[clamp(1.875rem,4vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.02em] text-ink">
                {pkg.name}
              </h1>
              <p className="mt-3 max-w-[60ch] text-body text-ink">{pkg.description}</p>
              {pkg.highlights && pkg.highlights.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {pkg.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-body-sm text-ink">
                      <Check aria-hidden className="h-4 w-4 shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 lg:hidden">
                <span className="kss-label block text-zinc-600">Total harga paket</span>
                <Price value={totalBundlePrice} className="text-2xl text-ink" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="kss-container grid grid-cols-1 gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:py-12">
        <div className="space-y-8">
          {upgradeable.length > 0 && (
            <section aria-labelledby="ubah-spesifikasi">
              <h2 id="ubah-spesifikasi" className="font-display text-2xl font-bold text-ink">Ubah spesifikasi</h2>
              <p className="mt-1 text-body-sm text-zinc-600">Pilih bagian, lalu total harga diperbarui otomatis.</p>
              <div className="mt-4 space-y-2">
                {upgradeable.map(({ cat, options }) => (
                  <details key={cat} data-upgrade-group className="group rounded-md border border-line bg-white">
                    <summary className={summaryClass}>
                      <span className="min-w-0 py-2">
                        <span className="block text-meta text-zinc-500">{categoryLabels[cat] ?? cat}</span>
                        <span className="block truncate text-[15px] font-semibold text-ink">
                          {partsMap[selectedParts[cat] ?? '']?.name}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-meta text-zinc-500">
                        <span><span className="kss-num">{options.length}</span> pilihan</span>
                        <ChevronDown aria-hidden className="h-4 w-4 text-ink transition-transform group-open:rotate-180" />
                      </span>
                    </summary>
                    <div className="grid grid-cols-1 gap-3 p-4 pt-1 sm:grid-cols-2">
                      {options.map((opt) => (
                        <button
                          key={opt.part.id}
                          type="button"
                          aria-pressed={opt.isSelected}
                          onClick={() => handleSelectUpgrade(cat, opt.part.id)}
                          className={`flex flex-col gap-2 rounded-md border border-line bg-white p-3 text-left ${
                            opt.isSelected ? 'kss-ring-selected' : 'hover:border-ink'
                          }`}
                        >
                          <span className="flex items-start gap-2 text-body-sm font-semibold text-ink">
                            {opt.isSelected && <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />}
                            <span className="line-clamp-2">{opt.part.name}</span>
                          </span>
                          <span className="flex items-center justify-between gap-2 text-meta text-zinc-500">
                            <span className="truncate">{warrantyLabel(opt.part.warrantyYears)}</span>
                            {opt.isBase && <span className="kss-tag kss-tag-neutral shrink-0">Bawaan paket</span>}
                          </span>
                        </button>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section aria-label="Isi paket">
            <details data-spec-list className="group rounded-md border border-line bg-white">
              <summary className={summaryClass}>
                <h2 className="font-display text-xl font-bold text-ink">Rincian spesifikasi terpasang</h2>
                <span className="flex shrink-0 items-center gap-2 text-meta text-zinc-500">
                  <span><span className="kss-num">{currentPartsList.length}</span> bagian</span>
                  <ChevronDown aria-hidden className="h-4 w-4 text-ink transition-transform group-open:rotate-180" />
                </span>
              </summary>
              <ul className="divide-y divide-line px-4 pb-2">
                {currentPartsList.map((item) => (
                  <li key={item.part.id} className="py-3">
                    <span className="block text-meta text-zinc-500">{categoryLabels[item.category] ?? item.category}</span>
                    <span className="block text-body-sm font-semibold text-ink">
                      {item.part.name} {item.quantity > 1 ? `(${item.quantity}x)` : ''}
                    </span>
                    <span className="block text-meta text-zinc-500">
                      Distributor: {item.part.officialDistributor || 'Astrindo/EMD'} · {warrantyLabel(item.part.warrantyYears)}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </section>

          {pkg.estimatedFps && pkg.estimatedFps.length > 0 && (
            <section aria-labelledby="perkiraan-fps" className="rounded-lg bg-block-ink p-5 text-zinc-100 sm:p-6">
              <h2 id="perkiraan-fps" className="font-display text-2xl font-bold text-white">Perkiraan performa gaming</h2>
              <p className="mt-1 text-body-sm text-zinc-300">
                Angka perkiraan untuk spesifikasi bawaan di {pkg.targetResolution}. Hasil nyata bergantung pada versi game dan
                pengaturan.
              </p>
              <ul className="mt-4 space-y-3">
                {pkg.estimatedFps.map((bench) => (
                  <li key={`${bench.game}-${bench.settings}`}>
                    <div className="flex flex-wrap justify-between gap-x-3 text-body-sm">
                      <span className="font-semibold text-white">{bench.game}</span>
                      <span className="text-zinc-300">
                        <span className="kss-num font-semibold text-white">~{bench.fps}</span> FPS · {bench.settings}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/15">
                      <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, (bench.fps / 240) * 100)}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside id={orderId} data-order-card className="scroll-mt-24 space-y-4 rounded-lg border border-line bg-white p-5 lg:sticky lg:top-24">
          <div>
            <span className="kss-label block text-zinc-600">Total harga paket siap pakai</span>
            <Price value={totalBundlePrice} className="text-3xl text-ink" />
            <p className="mt-1 text-body-sm text-ink">Sudah termasuk jasa rakit rapi, OS test &amp; stress test</p>
          </div>

          <dl className="divide-y divide-line border-y border-line text-body-sm">
            <div className="flex justify-between gap-3 py-2">
              <dt className="text-zinc-600">Estimasi daya</dt>
              <dd className="kss-num font-semibold text-ink">{formatWatt(totalWattage)}</dd>
            </div>
            <div className="flex justify-between gap-3 py-2">
              <dt className="text-zinc-600">PSU disarankan</dt>
              <dd className="font-semibold text-ink">
                Min. <span className="kss-num">{Math.round((totalWattage * 1.35) / 50) * 50}W</span>
              </dd>
            </div>
            <div className="flex justify-between gap-3 py-2">
              <dt className="text-zinc-600">Kompatibilitas</dt>
              <dd className="font-semibold text-ink">Dicek sebelum dirakit</dd>
            </div>
          </dl>

          <div className="space-y-2">
            <button type="button" onClick={handleWhatsAppCheckout} className="kss-btn-dark h-12 w-full text-sm">
              <MessageCircle aria-hidden className="h-4 w-4" />
              Pesan paket ini via WhatsApp
            </button>
            <a href={tokopediaUrl} target="_blank" rel="noopener noreferrer" className="kss-btn-tokopedia h-12 w-full text-sm">
              Beli di Tokopedia
              <ExternalLink aria-hidden className="h-4 w-4" />
            </a>
            <PaymentInfo />
          </div>

          <ul className="space-y-2 border-t border-line pt-3 text-body-sm text-zinc-600">
            <li className="flex items-start gap-2">
              <ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
              Garansi resmi toko &amp; distributor Indonesia
            </li>
            <li className="flex items-start gap-2">
              <Clock aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
              Proses Rakit &amp; Test Cepat (Same-Day / 1 Hari)
            </li>
          </ul>
        </aside>
      </div>

      <MobileActionBar hideNear={orderId}>
        <div className="min-w-0">
          <span className="block text-meta text-zinc-600">Total paket</span>
          <Price value={totalBundlePrice} className="text-lg text-ink" />
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={handleWhatsAppCheckout} className="kss-btn-dark h-11 px-4">
            <MessageCircle aria-hidden className="h-4 w-4" />
            Pesan
          </button>
          <a href={tokopediaUrl} target="_blank" rel="noopener noreferrer" className="kss-btn-tokopedia h-11 px-4">
            Tokopedia
          </a>
        </div>
      </MobileActionBar>
    </>
  );
}
