'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Cpu,
  Wrench,
  ArrowRight,
  SlidersHorizontal,
  PhoneCall,
  ShoppingBag,
  MessageSquareCheck,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  Clock,
  Layers,
  Keyboard,
  Mouse,
  Monitor,
  Zap,
  Package,
  Truck,
  BadgeCheck,
  ChevronRight,
  Gamepad2,
  X,
} from 'lucide-react';
import type { PublicPrebuiltPCDTO } from '@/lib/sanitizer';
import type { PublicAccessory, ServicePackage } from '@/lib/types';
import { formatIDR, generateConsultationWAMessage, DEFAULT_WHATSAPP_PHONE } from '@/lib/format';
import { PrebuiltCard } from '@/components/prebuilt/PrebuiltCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useRetailCartStore } from '@/store/useRetailCartStore';

type BudgetFilter = 'all' | 'under-7m' | '7-12m' | '12-20m' | 'above-20m';
type UsageFilter = 'all' | 'gaming-1080p' | 'gaming-1440p' | 'creator' | 'office' | 'sultan-4k';

export interface HomeClientProps {
  prebuilts: PublicPrebuiltPCDTO[];
  accessories: PublicAccessory[];
  services: ServicePackage[];
}

const ACCESSORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  keyboard: Keyboard,
  mouse: Mouse,
  headset: Headphones,
  monitor: Monitor,
  ups: Zap,
  speaker: Headphones,
  webcam: Monitor,
  chair: Package,
  mousepad: Layers,
  other: Package,
};

const CATEGORY_SHORTCUTS = [
  { href: '/paket-rakitan', label: 'Paket Siap Pakai', icon: Sparkles },
  { href: '/simulasi', label: 'Rakit Custom', icon: Cpu },
  { href: '/komponen', label: 'Komponen', icon: Layers },
  { href: '/aksesoris', label: 'Aksesoris', icon: Headphones },
  { href: '/jasa', label: 'Jasa & Servis', icon: Wrench },
  { href: '/cek-pesanan', label: 'Cek Pesanan', icon: Clock },
];

export default function HomeClient({ prebuilts, accessories, services }: HomeClientProps) {
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
        <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HERO */}
      <section className="border-b border-zinc-800 bg-zinc-950">
        <div className="kss-container py-10 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="flex flex-col items-start gap-4 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-md border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-tight text-orange-400">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                System Integrator &amp; PC Builder Jakarta
              </div>

              <h1 className="text-3xl font-black leading-[1.08] tracking-tight text-zinc-50 sm:text-4xl lg:text-5xl">
                PC Rakitan Siap Pakai,<br className="hidden sm:block" /> Harga Jelas &amp; Bergaransi.
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
                Pilih paket siap pakai atau rakit sendiri. Semua unit melalui validasi
                kompatibilitas, cable management rapi, stress test, dan garansi resmi
                distributor.
              </p>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <a href="#paket-terlaris" className="kss-btn-primary h-11 px-5 text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Lihat Paket Siap Pakai</span>
                </a>
                <Link
                  href="/konsultasi"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-5 text-sm font-bold text-zinc-100 transition-colors hover:bg-zinc-800"
                >
                  <MessageSquareCheck className="h-4 w-4 text-emerald-400" />
                  <span>Konsultasi Budget</span>
                </Link>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 border-t border-zinc-800 pt-4 sm:grid-cols-4">
                {[
                  { value: '100%', label: 'Garansi Resmi' },
                  { value: '24 Jam', label: 'Stress Test' },
                  { value: '1 Harga', label: 'Tanpa Part Leak' },
                  { value: 'Same Day', label: 'Siap Ambil' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-mono text-sm font-black tracking-tight text-zinc-100">
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-zinc-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured flagship */}
            <div className="lg:col-span-5">
              {featured && (
                <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-emerald-400">
                      Featured Rig
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500">
                      {featured.platform} · {featured.targetResolution}
                    </span>
                  </div>

                  <h2 className="text-lg font-black tracking-tight text-zinc-50">
                    <Link href={`/paket-rakitan/${featured.slug}`} className="hover:text-orange-400">
                      {featured.name}
                    </Link>
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {featured.parts.slice(0, 4).map((item) => (
                      <span
                        key={item.partId}
                        className="inline-flex items-center rounded-sm border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300"
                      >
                        {item.category}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2 rounded-md border border-zinc-800 bg-zinc-950 p-3">
                    {featured.estimatedFps.slice(0, 3).map((bench, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[11px] text-zinc-400">{bench.game}</span>
                          <span className="font-mono text-xs font-bold tabular-nums text-zinc-100">
                            ~{bench.fps} FPS
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden bg-zinc-800">
                          <div
                            className="h-full bg-orange-500"
                            style={{ width: `${Math.min(100, (bench.fps / 300) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-end justify-between border-t border-zinc-800 pt-3">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-tight text-zinc-500">
                        Harga Siap Pakai
                      </div>
                      <div className="kss-price text-xl text-zinc-50">
                        {formatIDR(featured.totalBundlePrice)}
                      </div>
                    </div>
                    <Link href={`/paket-rakitan/${featured.slug}`} className="kss-btn-primary h-9 px-3">
                      <span>Detail</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY SHORTCUTS */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="kss-container flex gap-2 overflow-x-auto py-3">
          {CATEGORY_SHORTCUTS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex shrink-0 items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-[11px] font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                <Icon className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* SERVICES */}
      <section className="kss-container py-10 sm:py-12">
        <SectionHeader
          eyebrow="Layanan Teknisi"
          title="Jasa Rakit, Servis & Maintenance"
          description="Dikerjakan teknisi KSS dengan standar QC dan garansi pengerjaan."
          action={{ href: '/jasa', label: 'Lihat Semua Layanan' }}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 4).map((srv) => (
            <article
              key={srv.id}
              className="group flex flex-col justify-between rounded-md border border-zinc-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-500/10">
                    <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </span>
                  {srv.badge && (
                    <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-amber-700 dark:text-amber-400">
                      {srv.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold leading-snug text-zinc-900 dark:text-zinc-100">
                  {srv.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {srv.description}
                </p>

                <div className="mt-3 flex items-end justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <span className="font-mono text-sm font-black text-zinc-900 dark:text-zinc-100">
                    {srv.price === 0 ? 'GRATIS' : formatIDR(srv.price)}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">{srv.duration}</span>
                </div>
              </div>

              <Link href={`/jasa/${srv.slug}`} className="kss-btn-outline mt-3 h-9 px-2">
                <span>Lihat Detail</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* PREBUILTS */}
      <section id="paket-terlaris" className="border-y border-zinc-200 bg-zinc-50/70 py-10 dark:border-zinc-800 dark:bg-zinc-900/30 sm:py-12">
        <div className="kss-container">
          <SectionHeader
            eyebrow="Paket Siap Pakai"
            title="Paket PC Rakitan Terlaris"
            description="Spesifikasi seimbang, estimasi FPS nyata, dan satu harga total siap pakai."
            action={{ href: '/paket-rakitan', label: `Lihat Semua Paket (${prebuilts.length})` }}
          />

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'gaming-1080p', label: 'Gaming 1080p' },
                { id: 'gaming-1440p', label: 'Gaming 1440p / 4K' },
                { id: 'creator', label: 'Creator & 3D' },
                { id: 'office', label: 'Office' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedUsage(tab.id as UsageFilter)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selectedUsage === tab.id
                      ? 'bg-orange-600 text-white'
                      : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <select
              value={selectedBudget}
              onChange={(event) => setSelectedBudget(event.target.value as BudgetFilter)}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 focus:border-orange-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <option value="all">Semua Budget</option>
              <option value="under-7m">&lt; Rp 7.000.000</option>
              <option value="7-12m">Rp 7 - 12 Juta</option>
              <option value="12-20m">Rp 12 - 20 Juta</option>
              <option value="above-20m">&gt; Rp 20 Juta</option>
            </select>
          </div>

          {filteredPrebuilts.length === 0 ? (
            <div className="rounded-md border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
              <p className="text-xs text-zinc-500">Tidak ada paket yang sesuai filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedUsage('all');
                  setSelectedBudget('all');
                }}
                className="mt-2 text-xs font-semibold text-orange-600 underline"
              >
                Reset filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrebuilts.map((pkg) => (
                <PrebuiltCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CONSULTATION */}
      <section id="konsultasi-budget" className="kss-container py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-6 rounded-md border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div>
            <div className="kss-eyebrow mb-2">
              <PhoneCall className="h-3.5 w-3.5" />
              <span>Konsultasi Gratis</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              Belum yakin spesifikasinya?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Kirim budget dan kebutuhan Anda. Teknisi KSS akan menyusun racikan paling
              seimbang, lalu mengirimkan tautan penawaran resmi.
            </p>

            <ul className="mt-5 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              {[
                'Tanpa biaya konsultasi',
                'Rekomendasi bebas bottleneck',
                'Penawaran resmi dengan satu harga total',
                'Bisa lanjut rakit atau beli komponen saja',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="font-mono text-[10px] uppercase tracking-tight text-zinc-400">
                Butuh jawaban cepat?
              </div>
              <a
                href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Chat teknisi via WhatsApp</span>
              </a>
            </div>
          </div>

          <form onSubmit={handleSendConsultation} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
                  Nama
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="kss-input"
                />
              </div>

              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
                    Budget
                  </label>
                  <span className="font-mono text-[11px] font-bold tabular-nums text-orange-600 dark:text-orange-400">
                    {formatIDR(custBudget)}
                  </span>
                </div>
                <input
                  type="range"
                  min={4000000}
                  max={50000000}
                  step={500000}
                  value={custBudget}
                  onChange={(e) => setCustBudget(Number(e.target.value))}
                  className="mt-2 w-full accent-orange-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
                Kebutuhan Utama
              </label>
              <select
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
              <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
                Preferensi Platform
              </label>
              <select
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
              <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
                Catatan (opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: sudah punya monitor 144Hz, ingin casing putih"
                value={custNotes}
                onChange={(e) => setCustNotes(e.target.value)}
                className="kss-input"
              />
            </div>

            <button type="submit" className="kss-btn-wa h-11 w-full text-sm">
              <MessageSquareCheck className="h-4 w-4" />
              <span>Kirim ke WhatsApp Teknisi</span>
            </button>
          </form>
        </div>
      </section>

      {/* ACCESSORIES */}
      <section className="border-y border-zinc-200 bg-zinc-50/70 py-10 dark:border-zinc-800 dark:bg-zinc-900/30 sm:py-12">
        <div className="kss-container">
          <SectionHeader
            eyebrow="Katalog Eceran"
            title="Aksesoris & Gaming Gear"
            description="Harga eceran resmi distributor, stok fisik, dan garansi resmi."
            action={{ href: '/aksesoris', label: `Lihat Semua (${accessories.length})` }}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {accessories.slice(0, 4).map((acc) => {
              const Icon = ACCESSORY_ICONS[acc.category] || Package;
              const hasDiscount = Boolean(acc.originalPrice && acc.originalPrice > acc.retailPrice);
              return (
                <article
                  key={acc.id}
                  className="group flex flex-col justify-between rounded-md border border-zinc-200 bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
                >
                  <div>
                    <div className="mb-3 flex h-24 items-center justify-center rounded-md border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                      <Icon className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                    </div>

                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="font-bold uppercase text-zinc-500">{acc.brand}</span>
                      {hasDiscount && (
                        <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-1 py-0.2 font-bold text-amber-700 dark:text-amber-400">
                          Promo
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1 line-clamp-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {acc.name}
                    </h3>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="kss-price text-sm text-orange-600 dark:text-orange-400">
                        {formatIDR(acc.retailPrice)}
                      </span>
                      {hasDiscount && (
                        <span className="font-mono text-[10px] text-zinc-400 line-through tabular-nums">
                          {formatIDR(acc.originalPrice!)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      addRetailItem(acc, 1);
                      showToast(`${acc.name} ditambahkan ke keranjang`);
                    }}
                    className="kss-btn-dark mt-3 h-9"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Tambah ke Keranjang</span>
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY KSS */}
      <section className="kss-container py-10 sm:py-12">
        <SectionHeader
          eyebrow="Kenapa KSS"
          title="Standar Toko, Bukan Rakitan Amatir"
          description="Kualitas dan garansi yang bisa ditagih setelah pembelian."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BadgeCheck, title: 'Part Resmi', text: 'Bersegel distributor resmi Indonesia.' },
            { icon: Wrench, title: 'Rakit Rapi', text: 'Cable management dan QC sebelum serah terima.' },
            { icon: Gamepad2, title: 'Stress Test', text: 'Uji beban CPU/GPU dan pemantauan suhu.' },
            { icon: Truck, title: 'Packing Aman', text: 'Packing kayu dan asuransi pengiriman.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-md border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10">
                  <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </span>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{item.text}</p>
              </div>
            );
          })}
        </div>

        {/* KSS vs beli part sendiri */}
        <div className="mt-8 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800 md:grid md:grid-cols-2">
          <div className="bg-white p-5 dark:bg-zinc-900/60">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-sm bg-orange-600 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
                Rekomendasi
              </span>
              <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                Paket Rakitan KSS
              </span>
            </div>
            <ul className="space-y-2.5">
              {[
                'Satu harga total, tanpa menghitung part satu per satu',
                'Dirakit teknisi + cable management rapi',
                'Stress test dan QC sebelum serah terima',
                'Garansi toko + distributor, klaim dibantu KSS',
                'Konsultasi dan upgrade terukur setelah pembelian',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[11px] text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950 md:border-l md:border-t-0">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-sm border border-zinc-300 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-zinc-500 dark:border-zinc-700">
                Pembanding
              </span>
              <span className="text-sm font-black text-zinc-600 dark:text-zinc-400">
                Beli Part &amp; Rakit Sendiri
              </span>
            </div>
            <ul className="space-y-2.5">
              {[
                'Harga part terpisah, total baru diketahui di akhir',
                'Rakit sendiri atau cari jasa tambahan',
                'Belum tentu lolos stress test dan QC',
                'Klaim garansi masing-masing distributor',
                'Risiko salah socket, RAM, atau ukuran casing',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-900 p-6 text-white dark:border-zinc-800 sm:flex-row">
          <div>
            <div className="text-base font-black tracking-tight">Siap mulai merakit?</div>
            <p className="text-xs text-zinc-300">
              Gunakan konfigurator untuk melihat kompatibilitas dan total harga siap pakai.
            </p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Link href="/simulasi" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-white px-4 text-xs font-bold text-zinc-900 hover:bg-zinc-100 sm:flex-none">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Buka Simulasi</span>
            </Link>
            <Link href="/paket-rakitan" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-zinc-700 px-4 text-xs font-bold text-white hover:bg-zinc-800 sm:flex-none">
              <span>Paket Siap Pakai</span>
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono text-zinc-400">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Garansi Resmi</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Senin - Sabtu 09.00 - 18.00</span>
          <span className="flex items-center gap-1"><PhoneCall className="h-3 w-3" /> 0812-3456-7890</span>
        </div>
      </section>
    </div>
  );
}
