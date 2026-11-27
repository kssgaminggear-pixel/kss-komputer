import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ChevronRight,
  Package,
  ShieldCheck,
  Truck,
  ExternalLink,
  Layers,
} from 'lucide-react';
import {
  getPublicHardwarePartBySlug,
  getPublicHardwareParts,
  getRelatedPublicHardwareParts,
} from '@/lib/server-catalog';
import { CATEGORY_LABELS, TOKOPEDIA_OFFICIAL_STORE_URL, DEFAULT_WHATSAPP_PHONE, generateCustomBuildWAMessage } from '@/lib/format';

interface KomponenDetailPageProps {
  params: Promise<{ slug: string }>;
}

const SPEC_LABELS: Record<string, string> = {
  socket: 'Socket',
  cores: 'Jumlah Core',
  threads: 'Jumlah Thread',
  baseClockGhz: 'Base Clock (GHz)',
  boostClockGhz: 'Boost Clock (GHz)',
  integratedGpu: 'Integrated GPU',
  chipset: 'Chipset',
  needsBiosUpdateForLatestGen: 'Perlu Update BIOS',
  cpuGenTag: 'Generasi CPU',
  ramType: 'Tipe RAM',
  ramSlots: 'Slot RAM',
  capacityGb: 'Kapasitas (GB)',
  kitConfiguration: 'Konfigurasi Kit',
  speedMhz: 'Kecepatan (MHz)',
  casLatency: 'CAS Latency',
  formFactor: 'Form Factor',
  supportedFormFactors: 'Dukungan Form Factor',
  gpuLengthMm: 'Panjang GPU (mm)',
  maxGpuLengthMm: 'Maks. Panjang GPU (mm)',
  coolerHeightMm: 'Tinggi Cooler (mm)',
  maxCoolerHeightMm: 'Maks. Tinggi Cooler (mm)',
  vramGb: 'VRAM (GB)',
  vramType: 'Tipe VRAM',
  recommendedPsuWatt: 'Rekomendasi PSU (W)',
  storageInterface: 'Interface Storage',
  readSpeedMbps: 'Kecepatan Baca (MB/s)',
  m2Slots: 'Slot M.2',
  psuWattage: 'Daya PSU (W)',
  efficiencyRating: 'Sertifikasi Efisiensi',
  modular: 'Modularitas',
  screenSizeInch: 'Ukuran Layar (inch)',
  resolution: 'Resolusi',
  refreshRateHz: 'Refresh Rate (Hz)',
  panelType: 'Tipe Panel',
};

const STOCK_LABELS: Record<string, string> = {
  ready: 'Ready Stock',
  low: 'Stok Terbatas',
  out_of_stock: 'Stok Habis',
  po: 'Pre-Order',
};

function formatSpecValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
  return String(value);
}

export function generateStaticParams() {
  return getPublicHardwareParts().map((part) => ({ slug: part.slug }));
}

export async function generateMetadata({ params }: KomponenDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const part = getPublicHardwarePartBySlug(slug);

  if (!part) {
    return { title: 'Komponen Tidak Ditemukan — KSS Komputer' };
  }

  return {
    title: `${part.name} - Komponen PC KSS Komputer`,
    description: `${part.brand} ${part.name}. Garansi ${part.warrantyYears} tahun, ${STOCK_LABELS[part.stockStatus] || part.stockStatus}.`,
    alternates: {
      canonical: `/komponen/${part.slug}`,
    },
  };
}

// Detail komponen hanya berisi data statis; tidak perlu validasi instant navigation.
export const instant = false;

export default async function KomponenDetailPage({ params }: KomponenDetailPageProps) {
  const { slug } = await params;
  const part = getPublicHardwarePartBySlug(slug);

  if (!part) {
    notFound();
  }

  const relatedParts = getRelatedPublicHardwareParts(part);
  const specEntries = Object.entries(part.specs).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  );

  const waUrl = `https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
    `Halo KSS Komputer, saya ingin tanya harga, stok, dan pembelian eceran:\n*${part.name}*\nSKU: ${part.sku}`
  )}`;

  return (
    <div className="kss-container py-8">
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 font-mono text-xs text-zinc-500">
        <Link href="/" className="hover:text-orange-700">Beranda</Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
        <Link href="/komponen" className="hover:text-orange-700">Komponen</Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{part.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="rounded-md border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-zinc-200 bg-zinc-200 sm:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-800">
              {[
                { label: 'Kategori', value: CATEGORY_LABELS[part.category] || part.category },
                {
                  label: 'Platform',
                  value:
                    part.specs.socket ||
                    part.specs.ramType ||
                    part.specs.formFactor ||
                    part.brand,
                },
                { label: 'Daya', value: `${part.wattage}W` },
                { label: 'Garansi', value: `${part.warrantyYears} Tahun` },
              ].map((cell) => (
                <div key={cell.label} className="bg-white p-3">
                  <div className="font-mono text-micro uppercase tracking-wider text-zinc-500">
                    {cell.label}
                  </div>
                  <div className="mt-1 font-mono text-xs font-bold tabular-nums text-zinc-900">
                    {cell.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 font-mono text-micro font-bold uppercase text-orange-700 dark:text-orange-400">
                {CATEGORY_LABELS[part.category] || part.category}
              </span>
              <span
                className={`rounded-md border px-2 py-0.5 font-mono text-micro font-bold ${
                  part.stockStatus === 'ready'
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                }`}
              >
                {STOCK_LABELS[part.stockStatus] || part.stockStatus}
              </span>
              <span className="font-mono text-micro text-zinc-500">{part.brand}</span>
            </div>

            <h1 className="mt-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              {part.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Harga dan stok dikonfirmasi via WhatsApp.
              </span>
              <span className="ml-auto font-mono text-micro text-zinc-500">
                Garansi {part.warrantyYears} tahun
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-500/15 dark:text-emerald-400"
              >
                <Package className="h-3.5 w-3.5" />
                <span>Tanya Stok via WA</span>
              </a>
              <a
                href={TOKOPEDIA_OFFICIAL_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Beli di Tokopedia</span>
              </a>
            </div>
          </div>

          <section className="rounded-md border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              <Layers className="h-4 w-4 text-orange-700 dark:text-orange-400" />
              <span>Spesifikasi Lengkap</span>
            </h2>
            <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {specEntries.map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-4 py-2">
                  <dt className="text-meta font-semibold text-zinc-500 dark:text-zinc-500">
                    {SPEC_LABELS[key] || key}
                  </dt>
                  <dd className="text-right font-mono text-meta font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
                    {formatSpecValue(value)}
                  </dd>
                </div>
              ))}
              <div className="flex items-start justify-between gap-4 py-2">
                <dt className="text-meta font-semibold text-zinc-500 dark:text-zinc-500">
                  Konsumsi Daya
                </dt>
                <dd className="text-right font-mono text-meta font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
                  {part.wattage} W
                </dd>
              </div>
              {part.officialDistributor && (
                <div className="flex items-start justify-between gap-4 py-2">
                  <dt className="text-meta font-semibold text-zinc-500 dark:text-zinc-500">
                    Distributor Resmi
                  </dt>
                  <dd className="text-right font-mono text-meta font-bold text-zinc-900 dark:text-zinc-100">
                    {part.officialDistributor}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {relatedParts.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Komponen {CATEGORY_LABELS[part.category] || part.category} Lainnya
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {relatedParts.map((related) => (
                  <Link
                    key={related.id}
                    href={`/komponen/${related.slug}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white p-3 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-micro uppercase text-zinc-500">
                        {related.brand}
                      </div>
                      <div className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {related.name}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-md border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Ringkasan Produk
            </h2>
            <ul className="space-y-2.5 text-meta text-zinc-600 dark:text-zinc-500">
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>Garansi resmi distributor selama {part.warrantyYears} tahun.</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
                <span>Pengambilan di toko Mangga Dua Mall atau kirim via ekspedisi.</span>
              </li>
              <li className="flex items-start gap-2">
                <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" />
                <span>Stok fisik diperbarui berkala. Konfirmasi via WhatsApp sebelum datang.</span>
              </li>
            </ul>
            <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-micro leading-relaxed text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500">
              SKU: {part.sku}
              <br />
              Diperbarui: {part.updatedAt}
            </div>
          </div>

          <div className="rounded-md border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Cara Pembelian
            </h2>
            <ol className="space-y-2.5">
              {[
                'Konfirmasi harga dan stok via WhatsApp.',
                'Pilih ambil di toko atau kirim via ekspedisi.',
                'Pembayaran transfer, QRIS, atau checkout Tokopedia.',
                'Barang disiapkan, dicek, lalu dikirim/diambil.',
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-2 text-meta text-zinc-600 dark:text-zinc-500">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-zinc-900 font-mono text-micro font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="kss-btn-wa mt-4 h-9 w-full"
            >
              <Package className="h-3.5 w-3.5" />
              <span>Tanya Stok via WA</span>
            </a>
          </div>

          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 text-meta leading-relaxed text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-500">
            Butuh komponen ini dirakit menjadi PC siap pakai?{' '}
            <a
              href={generateCustomBuildWAMessage(undefined, {
                subject: `Rakit PC custom dengan ${part.name}`,
                parts: [{ category: part.category, name: part.name, quantity: 1 }],
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-orange-700 hover:text-orange-800 dark:text-orange-400"
            >
              Konsultasi Rakit via WA
            </a>{' '}
            atau{' '}
            <Link href="/konsultasi" className="font-bold text-emerald-700 hover:text-emerald-700 dark:text-emerald-400">
              konsultasi budget
            </Link>
            .
          </div>
        </aside>
      </div>
    </div>
  );
}
