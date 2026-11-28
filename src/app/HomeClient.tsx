'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MediaImage } from '@/components/ui/MediaImage';
import {
  PcCase,
  Wrench,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  MessageCircle,
  MessageSquareText,
  Check,
  CheckCircle2,
  Clock,
  Store,
  Plus,
  BadgeCheck,
} from 'lucide-react';
import type { PublicPrebuiltPCDTO } from '@/lib/sanitizer';
import type { ServicePackage } from '@/lib/types';
import type { PublicMarketplaceProduct } from '@/lib/marketplace/types';
import {
  generateConsultationWAMessage,
  generateCustomBuildWAMessage,
  DEFAULT_WHATSAPP_PHONE,
} from '@/lib/format';
import { PrebuiltCard } from '@/components/prebuilt/PrebuiltCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Price } from '@/components/ui/Price';
import { useRetailCartStore } from '@/store/useRetailCartStore';

type BudgetFilter = 'all' | 'under-7m' | '7-12m' | '12-20m' | 'above-20m';
type UsageFilter = 'all' | 'gaming-1080p' | 'gaming-1440p' | 'creator' | 'office' | 'sultan-4k';

export interface HomeClientProps {
  prebuilts: PublicPrebuiltPCDTO[];
  topSellers: PublicMarketplaceProduct[];
  services: ServicePackage[];
}

const CATEGORY_SHORTCUTS = [
  { href: '/paket-rakitan', label: 'Paket siap pakai', icon: PcCase },
  { href: '/konsultasi', label: 'Konsultasi rakit', icon: MessageSquareText },
  { href: '/toko', label: 'Toko produk', icon: Store },
  { href: '/jasa', label: 'Jasa & servis', icon: Wrench },
  { href: '/cek-pesanan', label: 'Cek pesanan', icon: Clock },
];

const USAGE_TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'gaming-1080p', label: 'Gaming 1080p' },
  { id: 'gaming-1440p', label: 'Gaming 1440p / 4K' },
  { id: 'creator', label: 'Creator & 3D' },
  { id: 'office', label: 'Office' },
];

const PROCESS_STEPS: Array<[string, string]> = [
  ['Validasi', 'Cek socket, RAM, clearance, dan daya.'],
  ['Rakit', 'Perakitan rapi dengan cable management.'],
  ['Stress test', 'Uji beban CPU/GPU, pantau suhu.'],
  ['Serah terima', 'QC akhir, packing aman, garansi aktif.'],
];

const COMPARISON: Array<[string, string, string]> = [
  ['Harga', 'Satu harga total di awal', 'Total baru diketahui setelah semua part dibeli'],
  ['Perakitan', 'Teknisi KSS + cable management', 'Sendiri atau cari jasa terpisah'],
  ['Pengujian', 'Stress test & QC sebelum serah terima', 'Tidak terjamin'],
  ['Garansi', 'Toko + distributor, klaim dibantu KSS', 'Klaim ke tiap distributor'],
  ['Kompatibilitas', 'Divalidasi sebelum rakit', 'Risiko salah socket, RAM, atau casing'],
];

export default function HomeClient({ prebuilts, topSellers, services }: HomeClientProps) {
  const addRetailItem = useRetailCartStore((state) => state.addItem);

  const [selectedUsage, setSelectedUsage] = useState<UsageFilter>('all');
  const [selectedBudget, setSelectedBudget] = useState<BudgetFilter>('all');

  const [custName, setCustName] = useState('');
  const [custBudget, setCustBudget] = useState(12000000);
  const [custUsage, setCustUsage] = useState('Gaming E-Sports & AAA 1080p');
  const [custPlatform, setCustPlatform] = useState('Bebas (Rekomendasi Teknisi)');
  const [custNotes, setCustNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredPrebuilts = useMemo(() => {
    return prebuilts.filter((pkg) => {
      if (selectedUsage !== 'all') {
        if (selectedUsage === 'gaming-1080p' && pkg.categoryTag !== 'gaming-1080p') return false;
        if (selectedUsage === 'gaming-1440p' && pkg.categoryTag !== 'gaming-1440p' && pkg.categoryTag !== 'sultan-4k') return false;
        if (selectedUsage === 'creator' && pkg.categoryTag !== 'creator' && pkg.categoryTag !== 'workstation') return false;
        if (selectedUsage === 'office' && pkg.categoryTag !== 'office') return false;
      }

      const totalPrice = pkg.totalBundlePrice;
      if (selectedBudget === 'under-7m' && totalPrice >= 7000000) return false;
      if (selectedBudget === '7-12m' && (totalPrice < 7000000 || totalPrice > 12000000)) return false;
      if (selectedBudget === '12-20m' && (totalPrice < 12000000 || totalPrice > 20000000)) return false;
      if (selectedBudget === 'above-20m' && totalPrice <= 20000000) return false;

      return true;
    });
  }, [selectedUsage, selectedBudget, prebuilts]);

  const featured = prebuilts.find((pkg) => pkg.featured) || prebuilts[0];

  const handleSendConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    const url = generateConsultationWAMessage(DEFAULT_WHATSAPP_PHONE, {
      customerName: custName.trim() || undefined,
      budget: custBudget,
      usageNeed: custUsage,
      brandPreference: custPlatform,
      notes: custNotes.trim() || undefined,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex min-h-screen flex-col">
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-sm border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-[13px] font-medium text-white"
        >
          <CheckCircle2 aria-hidden className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HERO */}
      <section className="kss-chapter-dark border-b border-zinc-800">
        <div className="kss-container grid grid-cols-1 gap-8 pb-10 pt-4 sm:pt-8 lg:grid-cols-12 lg:gap-12 lg:py-16">
          {/* Foto */}
          <figure className="relative order-first overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 lg:order-2 lg:col-span-7">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[480px]">
              <MediaImage
                src="/images/tokopedia/banner-pc-store.webp"
                alt="Etalase PC rakitan KSS Komputer di Mangga Dua Mall"
                lcp
                sizes="(max-width: 1024px) 100vw, 720px"
                className="object-cover object-center"
              />
            </div>
            <span aria-hidden className="absolute left-0 top-0 h-3 w-3 bg-orange-500" />
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 sm:left-4 sm:top-4">
              <span className="kss-tag kss-tag-on-dark">
                <BadgeCheck aria-hidden className="h-3 w-3 text-emerald-400" />
                Official Store
              </span>
              <span className="kss-tag kss-tag-on-dark tabular-nums">4.9 · 33 rb terjual</span>
            </div>
            {featured && (
              <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 border-t border-zinc-800 bg-zinc-950 px-4 py-3 sm:px-5 sm:py-4">
                <div className="min-w-0">
                  <div className="kss-label text-zinc-400">Paket unggulan</div>
                  <Link
                    href={`/paket-rakitan/${featured.slug}`}
                    className="mt-1 block truncate text-[14px] font-semibold text-zinc-50 transition-colors hover:text-orange-400"
                  >
                    {featured.name}
                  </Link>
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                  <div className="text-right">
                    <div className="kss-label hidden text-zinc-400 sm:block">Total paket</div>
                    <Price value={featured.totalBundlePrice} className="text-base text-zinc-50 sm:text-lg" />
                  </div>
                  <Link
                    href={`/paket-rakitan/${featured.slug}`}
                    aria-label={`Detail ${featured.name}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-zinc-700 text-zinc-100 transition-colors hover:border-zinc-400 hover:bg-zinc-900"
                  >
                    <ArrowUpRight aria-hidden className="h-4 w-4" />
                  </Link>
                </div>
              </figcaption>
            )}
          </figure>

          {/* Copy */}
          <div className="flex flex-col justify-center lg:order-1 lg:col-span-5">
            <p className="kss-eyebrow text-orange-400">
              <span aria-hidden className="h-1.5 w-1.5 bg-orange-500" />
              System integrator · Mangga Dua Mall
            </p>
            <h1 className="mt-4 text-h1 text-balance text-zinc-50">
              PC rakitan siap pakai. Satu harga, sudah diuji.
            </h1>
            <p className="mt-4 max-w-[52ch] text-body text-pretty text-zinc-400">
              Pilih paket jadi atau konsultasikan racikan sendiri. Setiap unit divalidasi
              kompatibilitasnya, dirakit rapi, di-stress test, dan bergaransi resmi distributor.
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              <a href="#paket-terlaris" className="kss-btn-primary h-11 px-5 text-sm">
                Lihat paket siap pakai
                <ArrowRight aria-hidden className="h-4 w-4" />
              </a>
              <Link href="/konsultasi" className="kss-btn-outline-dark h-11 px-5 text-sm">
                <MessageSquareText aria-hidden className="h-4 w-4" />
                Konsultasi budget
              </Link>
            </div>
            <dl className="kss-grid-hairline-dark mt-8 grid-cols-2 sm:grid-cols-4">
              {[
                { label: 'Garansi', value: 'Resmi' },
                { label: 'Stress test', value: '24 jam' },
                { label: 'Harga', value: '1 total' },
                { label: 'Siap ambil', value: 'Same day' },
              ].map((s) => (
                <div key={s.label} className="px-3 py-3">
                  <dt className="kss-label text-zinc-400">{s.label}</dt>
                  <dd className="mt-1 font-mono text-[14px] font-semibold tabular-nums text-zinc-50">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* PINTASAN KATEGORI */}
      <nav aria-label="Pintasan kategori" className="border-b border-zinc-200 bg-white">
        <div className="kss-container">
          <ul className="-mx-4 flex divide-x divide-zinc-200 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-6 lg:border-x lg:border-zinc-200">
            {CATEGORY_SHORTCUTS.map(({ href, label, icon: Icon }) => (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  className="group flex h-12 items-center gap-2 whitespace-nowrap px-4 text-[13px] font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50 hover:text-zinc-950"
                >
                  <Icon
                    aria-hidden
                    className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-orange-600"
                  />
                  {label}
                  <ChevronRight aria-hidden className="ml-auto hidden h-3.5 w-3.5 text-zinc-300 lg:block" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* JASA */}
      <section className="kss-section">
        <div className="kss-container">
          <SectionHeader
            eyebrow="Layanan teknisi"
            title="Jasa rakit, servis & maintenance"
            description="Dikerjakan teknisi KSS dengan standar QC dan garansi pengerjaan."
            action={{ href: '/jasa', label: 'Semua layanan' }}
          />
          <ul
            className={
              services.slice(0, 4).length === 4
                ? 'kss-grid-hairline sm:grid-cols-2 lg:grid-cols-4'
                : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
            }
          >
            {services.slice(0, 4).map((srv) => (
              <li key={srv.id} className={services.slice(0, 4).length === 4 ? '' : 'kss-card'}>
                <Link
                  href={`/jasa/${srv.slug}`}
                  className="group flex h-full flex-col p-5 transition-colors duration-150 hover:bg-zinc-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="kss-label text-zinc-500">{srv.duration}</span>
                    {srv.badge && <span className="kss-tag kss-tag-ink">{srv.badge}</span>}
                  </div>
                  <h3 className="mt-6 text-title text-zinc-950">{srv.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-body-sm text-zinc-600">{srv.description}</p>
                  <div className="mt-auto flex items-end justify-between pt-6">
                    <div>
                      <div className="kss-label text-zinc-500">Biaya jasa</div>
                      {srv.price === 0 ? (
                        <span className="kss-price text-lg text-zinc-950">Gratis</span>
                      ) : (
                        <Price value={srv.price} className="text-lg text-zinc-950" />
                      )}
                    </div>
                    <ArrowUpRight
                      aria-hidden
                      className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-orange-600"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PAKET */}
      <section id="paket-terlaris" className="kss-section-alt scroll-mt-20">
        <div className="kss-container">
          <SectionHeader
            eyebrow="Paket siap pakai"
            title="Paket PC rakitan terlaris"
            description="Spesifikasi seimbang, estimasi FPS nyata, dan satu harga total siap pakai."
            action={{ href: '/paket-rakitan', label: `Semua paket (${prebuilts.length})` }}
          />

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              role="group"
              aria-label="Filter kebutuhan"
              className="-mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
            >
              {USAGE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={selectedUsage === tab.id}
                  onClick={() => setSelectedUsage(tab.id as UsageFilter)}
                  className={`kss-chip ${selectedUsage === tab.id ? 'kss-chip-active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <select
              aria-label="Filter budget paket"
              value={selectedBudget}
              onChange={(event) => setSelectedBudget(event.target.value as BudgetFilter)}
              className="kss-input sm:w-48"
            >
              <option value="all">Semua budget</option>
              <option value="under-7m">&lt; Rp 7.000.000</option>
              <option value="7-12m">Rp 7 - 12 juta</option>
              <option value="12-20m">Rp 12 - 20 juta</option>
              <option value="above-20m">&gt; Rp 20 juta</option>
            </select>
          </div>

          {filteredPrebuilts.length === 0 ? (
            <div className="rounded-md border border-dashed border-zinc-300 bg-white p-10 text-center">
              <p className="text-body-sm text-zinc-600">Tidak ada paket yang sesuai filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedUsage('all');
                  setSelectedBudget('all');
                }}
                className="kss-btn-outline mt-4"
              >
                Reset filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {filteredPrebuilts.map((pkg) => (
                <PrebuiltCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* KONSULTASI */}
      <section id="konsultasi-budget" className="kss-section scroll-mt-20">
        <div className="kss-container grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="kss-eyebrow">
              <span aria-hidden className="h-1.5 w-1.5 bg-orange-600" />
              Konsultasi gratis
            </p>
            <h2 className="mt-3 text-h2 text-balance text-zinc-950">Belum yakin spesifikasinya?</h2>
            <p className="mt-3 max-w-[48ch] text-body text-zinc-600">
              Kirim budget dan kebutuhan Anda. Teknisi KSS menyusun racikan paling seimbang,
              lalu mengirim penawaran resmi dengan satu harga total.
            </p>
            <ul className="mt-6 divide-y divide-zinc-200 border-y border-zinc-200">
              {[
                'Tanpa biaya konsultasi',
                'Rekomendasi bebas bottleneck',
                'Penawaran resmi, satu harga total',
                'Bisa lanjut rakit atau beli komponen saja',
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 py-3 text-body-sm text-zinc-800">
                  <Check aria-hidden className="h-4 w-4 shrink-0 text-zinc-900" />
                  {t}
                </li>
              ))}
            </ul>
            <a
              href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="kss-link mt-5 inline-flex items-center gap-2 text-body-sm"
            >
              <MessageCircle aria-hidden className="h-4 w-4" />
              Butuh jawaban cepat? Chat teknisi
            </a>
          </div>

          <form onSubmit={handleSendConsultation} className="kss-card space-y-4 p-5 sm:p-6 lg:col-span-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cust-name" className="kss-field-label">
                  Nama
                </label>
                <input
                  id="cust-name"
                  type="text"
                  required
                  placeholder="Nama lengkap"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="kss-input"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <label htmlFor="cust-budget" className="kss-field-label mb-0">
                    Budget
                  </label>
                  <Price value={custBudget} className="text-[14px] text-zinc-950" />
                </div>
                <input
                  id="cust-budget"
                  type="range"
                  min={4000000}
                  max={50000000}
                  step={500000}
                  value={custBudget}
                  onChange={(e) => setCustBudget(Number(e.target.value))}
                  className="h-10 w-full accent-orange-700"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cust-usage" className="kss-field-label">
                Kebutuhan utama
              </label>
              <select
                id="cust-usage"
                value={custUsage}
                onChange={(e) => setCustUsage(e.target.value)}
                className="kss-input"
              >
                <option value="Gaming E-Sports 1080p (Valorant, CS2, Dota)">Gaming E-Sports 1080p</option>
                <option value="Gaming AAA 1080p / 1440p (Cyberpunk, Black Myth Wukong)">Gaming AAA 1080p / 1440p</option>
                <option value="Editing Video & Desain Grafis (Premiere, After Effects, Photoshop)">Editing Video &amp; Desain</option>
                <option value="3D Rendering & Arsitektur (Blender, AutoCAD, SketchUp)">3D Rendering &amp; Arsitektur</option>
                <option value="Workstation AI / Machine Learning">Workstation AI</option>
                <option value="Office, Kasir & Multitasking Ringan">Office &amp; Kasir</option>
              </select>
            </div>

            <div>
              <label htmlFor="cust-platform" className="kss-field-label">
                Preferensi platform
              </label>
              <select
                id="cust-platform"
                value={custPlatform}
                onChange={(e) => setCustPlatform(e.target.value)}
                className="kss-input"
              >
                <option value="Bebas (Rekomendasi Teknisi KSS)">Bebas (rekomendasi teknisi)</option>
                <option value="AMD Ryzen + Radeon GPU">AMD Ryzen + Radeon</option>
                <option value="AMD Ryzen + NVIDIA GeForce RTX">AMD Ryzen + NVIDIA RTX</option>
                <option value="Intel Core + NVIDIA GeForce RTX">Intel Core + NVIDIA RTX</option>
              </select>
            </div>

            <div>
              <label htmlFor="cust-notes" className="kss-field-label">
                Catatan (opsional)
              </label>
              <input
                id="cust-notes"
                type="text"
                placeholder="Contoh: sudah punya monitor 144Hz, ingin casing putih"
                value={custNotes}
                onChange={(e) => setCustNotes(e.target.value)}
                className="kss-input"
              />
            </div>

            <button type="submit" className="kss-btn-wa h-11 w-full text-sm">
              <MessageCircle aria-hidden className="h-4 w-4" />
              Kirim ke WhatsApp teknisi
            </button>
          </form>
        </div>
      </section>

      {/* TERLARIS DI TOKO */}
      <section className="kss-section-alt">
        <div className="kss-container">
          <SectionHeader
            eyebrow="Toko resmi"
            title="Terlaris di toko"
            description="Produk toko KSS di Tokopedia yang paling banyak terjual."
            action={{ href: '/toko', label: 'Lihat semua produk' }}
          />

          <ul className="grid grid-cols-1 border-t border-zinc-200 md:grid-cols-2 md:gap-x-10">
            {topSellers.map((item) => (
              <li key={item.id} className="flex items-center gap-4 border-b border-zinc-200 py-4">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-zinc-100">
                  <MediaImage src={item.image} alt="" sizes="48px" className="object-contain" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[14px] font-medium text-zinc-900">
                    <Link href={`/toko/${item.slug}`} className="hover:underline">{item.name}</Link>
                  </h3>
                  <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                    <Price value={item.priceIdr} className="text-[14px] text-zinc-950" />
                    <span className="kss-num text-meta text-zinc-500">{item.soldLabel} terjual</span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={item.stock === 'out_of_stock'}
                  aria-label={`Tambah ${item.name} ke keranjang`}
                  onClick={() => {
                    addRetailItem({
                      id: item.id,
                      slug: item.slug,
                      name: item.name,
                      unitPrice: item.priceIdr,
                      tokopediaUrl: item.tokopediaUrl,
                    });
                    showToast(`${item.name} ditambahkan ke keranjang`);
                  }}
                  className="kss-icon-btn hover:bg-zinc-900 hover:text-white disabled:opacity-40"
                >
                  <Plus aria-hidden className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* KENAPA KSS */}
      <section className="kss-section">
        <div className="kss-container">
          <SectionHeader
            eyebrow="Kenapa KSS"
            title="Standar toko, bukan rakitan amatir"
            description="Kualitas dan garansi yang bisa ditagih setelah pembelian."
          />

          <div className="grid grid-cols-1 overflow-hidden rounded-md border border-zinc-200 bg-white lg:grid-cols-12">
            <div className="relative aspect-[4/3] border-b border-zinc-200 bg-zinc-100 lg:col-span-4 lg:aspect-auto lg:border-b-0 lg:border-r">
              <MediaImage
                src="/images/tokopedia/package-esports-case.webp"
                alt="Unit PC rakitan KSS setelah QC"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
            </div>
            <div className="p-5 sm:p-8 lg:col-span-8">
              <p className="kss-eyebrow">Proses rakitan KSS</p>
              <h3 className="mt-2 text-h3 text-zinc-950">Tidak ada unit keluar tanpa diuji.</h3>
              <ol className="mt-6 grid grid-cols-1 border-t border-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
                {PROCESS_STEPS.map(([t, d], i) => (
                  <li
                    key={t}
                    className="border-b border-zinc-200 py-4 sm:pr-4 lg:border-b-0 lg:border-r lg:px-4 lg:first:pl-0 lg:last:border-r-0"
                  >
                    <span className="kss-num text-micro font-semibold text-orange-700">0{i + 1}</span>
                    <div className="mt-2 text-[14px] font-semibold text-zinc-950">{t}</div>
                    <p className="mt-1 text-body-sm text-zinc-600">{d}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <a
                  href={generateCustomBuildWAMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kss-btn-dark"
                >
                  <MessageCircle aria-hidden className="h-4 w-4" />
                  Konsultasi rakit via WA
                </a>
                <Link href="/paket-rakitan" className="kss-btn-outline">
                  Lihat paket siap pakai
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-h3 text-zinc-950">Paket KSS vs beli part &amp; rakit sendiri</h3>
            <div role="table" className="mt-4 border-t-2 border-zinc-900 text-body-sm">
              <div
                role="row"
                className="hidden grid-cols-[180px_1fr_1fr] gap-6 border-b border-zinc-200 py-3 sm:grid"
              >
                <span role="columnheader" className="kss-label text-zinc-500">Aspek</span>
                <span role="columnheader" className="kss-label text-zinc-950">Paket rakitan KSS</span>
                <span role="columnheader" className="kss-label text-zinc-500">Rakit sendiri</span>
              </div>
              {COMPARISON.map(([a, k, s]) => (
                <div
                  role="row"
                  key={a}
                  className="grid grid-cols-1 gap-x-6 gap-y-1 border-b border-zinc-200 py-3 sm:grid-cols-[180px_1fr_1fr]"
                >
                  <span role="rowheader" className="kss-label text-zinc-500 sm:pt-0.5">{a}</span>
                  <span role="cell" className="flex gap-2 font-medium text-zinc-950">
                    <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    {k}
                  </span>
                  <span role="cell" className="text-zinc-500">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
