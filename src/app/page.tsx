'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  Wrench,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  PhoneCall,
  ShoppingBag,
  ExternalLink,
  MessageSquareCheck,
  CheckCircle2,
  Gamepad2,
  Layers,
  Monitor,
  Headphones,
  Zap,
} from 'lucide-react';
import { PrebuiltPC, UsageNeedTag } from '@/lib/types';
import { MOCK_PREBUILT_PCS, MOCK_ACCESSORIES, MOCK_SERVICES, PARTS_BY_ID } from '@/lib/mock-data';
import { formatIDR, generateConsultationWAMessage, TOKOPEDIA_OFFICIAL_STORE_URL, DEFAULT_WHATSAPP_PHONE } from '@/lib/format';
import { calculateBundleTotal } from '@/lib/compatibility';
import { PrebuiltCard } from '@/components/prebuilt/PrebuiltCard';
import { useRetailCartStore } from '@/store/useRetailCartStore';
import { useHydrated } from '@/lib/useHydrated';

type BudgetFilter = 'all' | 'under-7m' | '7-12m' | '12-20m' | 'above-20m';
type UsageFilter = 'all' | 'gaming-1080p' | 'gaming-1440p' | 'creator' | 'office' | 'sultan-4k';

export default function HomePage() {
  const isHydrated = useHydrated();
  const addRetailItem = useRetailCartStore((state) => state.addItem);

  // Filter State
  const [selectedUsage, setSelectedUsage] = useState<UsageFilter>('all');
  const [selectedBudget, setSelectedBudget] = useState<BudgetFilter>('all');

  // Consultation Form State
  const [custName, setCustName] = useState('');
  const [custBudget, setCustBudget] = useState(12000000);
  const [custUsage, setCustUsage] = useState('Gaming E-Sports & AAA 1080p');
  const [custPlatform, setCustPlatform] = useState('Bebas (Rekomendasi Teknisi)');
  const [custNotes, setCustNotes] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Filter Paket PC Rakitan
  const filteredPrebuilts = useMemo(() => {
    return MOCK_PREBUILT_PCS.filter((pkg) => {
      // 1. Filter Kebutuhan
      if (selectedUsage !== 'all') {
        if (selectedUsage === 'gaming-1080p' && pkg.categoryTag !== 'gaming-1080p') return false;
        if (selectedUsage === 'gaming-1440p' && pkg.categoryTag !== 'gaming-1440p' && pkg.categoryTag !== 'sultan-4k') return false;
        if (selectedUsage === 'creator' && pkg.categoryTag !== 'creator' && pkg.categoryTag !== 'workstation') return false;
        if (selectedUsage === 'office' && pkg.categoryTag !== 'office') return false;
      }

      // Hitung total harga paket untuk filter budget
      const rawParts = Object.values(pkg.baseParts)
        .map((item) => (item ? PARTS_BY_ID[item.partId] : undefined))
        .filter(Boolean);
      const totalPrice = calculateBundleTotal(rawParts, pkg.assemblyFee);

      // 2. Filter Budget
      if (selectedBudget === 'under-7m' && totalPrice >= 7000000) return false;
      if (selectedBudget === '7-12m' && (totalPrice < 7000000 || totalPrice > 12000000)) return false;
      if (selectedBudget === '12-20m' && (totalPrice < 12000000 || totalPrice > 20000000)) return false;
      if (selectedBudget === 'above-20m' && totalPrice <= 20000000) return false;

      return true;
    });
  }, [selectedUsage, selectedBudget]);

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
    <div className="flex flex-col min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 rounded-sm border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO SECTION (INDUSTRIAL & HIGH CONVERSION) */}
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sisi Kiri: Headline & CTA */}
            <div className="lg:col-span-7 flex flex-col items-start gap-4">
              <div className="inline-flex items-center gap-2 rounded-xs border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                SYSTEM INTEGRATOR &amp; PC BUILDER JAKARTA
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1]">
                PC Rakitan Siap Pakai &amp; Hardware Eceran Bergaransi Resmi.
              </h1>

              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                Dirancang presisi tanpa bottleneck. Seluruh unit dirakit dengan <em>clean cable management</em>, melalui <strong>stress-test 24 jam</strong>, dan dilindungi garansi distributor resmi Indonesia.
              </p>

              {/* 2 CTA Utama */}
              <div className="mt-2 flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <a
                  href="#paket-terlaris"
                  className="flex items-center justify-center gap-2 rounded-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-xs sm:text-sm font-bold transition-colors shadow-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Pilih Paket PC Siap Pakai</span>
                </a>

                <a
                  href="#konsultasi-budget"
                  className="flex items-center justify-center gap-2 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-5 py-3 text-xs sm:text-sm font-bold transition-colors"
                >
                  <PhoneCall className="h-4 w-4 text-emerald-600" />
                  <span>Konsultasi Sesuai Budget (WA)</span>
                </a>
              </div>

              {/* Nilai Tambah Teknis */}
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                <div>
                  <div className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100">100%</div>
                  <div className="text-[11px] text-zinc-500">Garansi Resmi ID</div>
                </div>
                <div>
                  <div className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100">24 Jam</div>
                  <div className="text-[11px] text-zinc-500">Hardware Stress Test</div>
                </div>
                <div>
                  <div className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100">Zero Leak</div>
                  <div className="text-[11px] text-zinc-500">Harga Paket Jelas</div>
                </div>
                <div>
                  <div className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100">1-Day</div>
                  <div className="text-[11px] text-zinc-500">Siap Kirim / Ambil Toko</div>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Live Configurator Quick Telemetry Box */}
            <div className="lg:col-span-5">
              <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
                      Smart PC Configurator
                    </span>
                  </div>
                  <span className="rounded-xs bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Auto-Compatibility
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                  Mau merakit sendiri part per part? Gunakan PC Configurator dengan validasi socket, ukuran dimensi, dan konsumsi Wattage otomatis tanpa membocorkan harga satuan komponen.
                </p>

                <div className="space-y-2 mb-4 font-mono text-xs">
                  <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-2 rounded-xs border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500">Validasi Socket:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">AM4, AM5, LGA1700 Ready</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-2 rounded-xs border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500">Perhitungan Selisih:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">Delta Pricing (+/- IDR)</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-2 rounded-xs border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500">Ekspor Dokumen:</span>
                    <span className="text-zinc-700 dark:text-zinc-300">Print PDF Quotation &amp; WA</span>
                  </div>
                </div>

                <Link
                  href="/simulasi"
                  className="flex items-center justify-center gap-2 w-full rounded-sm bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-xs font-bold transition-colors"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Buka Custom PC Configurator</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PAKET PC RAKITAN TERLARIS SECTION */}
      <section id="paket-terlaris" className="px-4 py-10 sm:px-6 max-w-7xl mx-auto w-full">
        {/* Header Seksi & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Paket Siap Pakai Rekomendasi</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Paket PC Rakitan Terlaris KSS
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Spesifikasi seimbang siap pakai dengan estimasi performa FPS nyata dan 1 Total Harga Paket.
            </p>
          </div>

          <Link
            href="/paket-rakitan"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <span>Lihat Semua Paket ({MOCK_PREBUILT_PCS.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Filter Tab Kebutuhan & Rentang Budget */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
          {/* Filter Kebutuhan */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Semua Kebutuhan' },
              { id: 'gaming-1080p', label: 'Gaming 1080p' },
              { id: 'gaming-1440p', label: 'Gaming 1440p/4K' },
              { id: 'creator', label: 'Creator & 3D' },
              { id: 'office', label: 'Kasir & Office' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedUsage(tab.id as UsageFilter)}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                  selectedUsage === tab.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter Budget */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-400 font-mono text-[11px]">Budget:</span>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value as BudgetFilter)}
              className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-600"
            >
              <option value="all">Semua Budget</option>
              <option value="under-7m">&lt; Rp 7.000.000</option>
              <option value="7-12m">Rp 7 - 12 Juta</option>
              <option value="12-20m">Rp 12 - 20 Juta</option>
              <option value="above-20m">&gt; Rp 20 Juta</option>
            </select>
          </div>
        </div>

        {/* Grid Paket PC */}
        {filteredPrebuilts.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-sm">
            <p className="text-xs text-zinc-500">Tidak ada paket yang sesuai dengan filter yang dipilih.</p>
            <button
              onClick={() => {
                setSelectedUsage('all');
                setSelectedBudget('all');
              }}
              className="mt-2 text-xs font-semibold text-blue-600 underline"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrebuilts.map((pkg) => (
              <PrebuiltCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </section>

      {/* 3. FORM KONSULTASI RAKITAN SESUAI BUDGET (VIA WA) */}
      <section id="konsultasi-budget" className="border-t border-b border-zinc-200 bg-zinc-100/70 dark:border-zinc-800 dark:bg-zinc-900/40 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-sm border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="rounded-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  Konsultasi Gratis Langsung ke Teknisi
                </span>
                <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                  Konsultasi Rakitan PC Sesuai Budget
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Kirimkan kriteria rakitan Anda. Tim spesialis KSS akan meracik spesifikasi paling optimal tanpa bottleneck dan mengirimkan link quotation resmi.
                </p>
              </div>
              <PhoneCall className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0 hidden sm:block" />
            </div>

            <form onSubmit={handleSendConsultation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Konsumen */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nama Lengkap Anda
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bima Satria"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Estimasi Budget */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Batas Budget Rakitan
                    </label>
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 tabular-nums">
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
                    className="w-full accent-blue-600 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-sm cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kebutuhan Utama */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Kebutuhan Utama
                  </label>
                  <select
                    value={custUsage}
                    onChange={(e) => setCustUsage(e.target.value)}
                    className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Gaming E-Sports 1080p (Valorant, CS2, Dota)">Gaming E-Sports 1080p (Valorant, CS2, Dota)</option>
                    <option value="Gaming AAA 1080p / 1440p (Cyberpunk, Black Myth Wukong)">Gaming AAA 1080p / 1440p (Cyberpunk, Wukong)</option>
                    <option value="Editing Video & Desain Grafis (Premiere, After Effects, Photoshop)">Editing Video & Desain Grafis</option>
                    <option value="3D Rendering & Arsitektur (Blender, AutoCAD, SketchUp)">3D Rendering & Arsitektur</option>
                    <option value="Workstation AI / Machine Learning">Workstation AI / Machine Learning</option>
                    <option value="Office, Kasir & Multitasking Ringan">Office, Kasir &amp; Multitasking Ringan</option>
                  </select>
                </div>

                {/* Preferensi Platform */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Preferensi Brand / Platform
                  </label>
                  <select
                    value={custPlatform}
                    onChange={(e) => setCustPlatform(e.target.value)}
                    className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Bebas (Rekomendasi Teknisi KSS)">Bebas (Rekomendasi Terbaik Teknisi KSS)</option>
                    <option value="AMD Ryzen + Radeon GPU">AMD Ryzen + Radeon GPU</option>
                    <option value="AMD Ryzen + NVIDIA GeForce RTX">AMD Ryzen + NVIDIA GeForce RTX</option>
                    <option value="Intel Core + NVIDIA GeForce RTX">Intel Core + NVIDIA GeForce RTX</option>
                  </select>
                </div>
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Catatan Khusus (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sudah punya monitor 144Hz, tolong pilihkan casing warna putih mini ITX..."
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs sm:text-sm font-bold transition-colors shadow-xs"
              >
                <MessageSquareCheck className="h-4 w-4" />
                <span>Kirim Kebutuhan ke WhatsApp Teknisi KSS</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 4. KATALOG AKSESORIS & GEAR PILIHAN (ECERAN RESMI) */}
      <section className="px-4 py-10 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight mb-1">
              <Headphones className="h-3.5 w-3.5" />
              <span>Katalog Eceran &amp; Aksesoris Resmi</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Aksesoris &amp; Gaming Gear Pilihan
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Keyboard, mouse, monitor, dan periferal penunjang produktivitas dengan harga eceran resmi distributor.
            </p>
          </div>

          <Link
            href="/aksesoris"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <span>Lihat Semua Aksesoris ({MOCK_ACCESSORIES.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_ACCESSORIES.slice(0, 4).map((acc) => (
            <div
              key={acc.id}
              className="flex flex-col justify-between rounded-sm border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span className="uppercase">{acc.brand}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{acc.warrantyYears} Th Garansi</span>
                </div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                  {acc.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                    {formatIDR(acc.retailPrice)}
                  </span>
                  {acc.originalPrice && acc.originalPrice > acc.retailPrice && (
                    <span className="font-mono text-[10px] text-zinc-400 line-through tabular-nums">
                      {formatIDR(acc.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                <button
                  onClick={() => {
                    addRetailItem(acc, 1);
                    showToast(`${acc.name} ditambahkan ke keranjang`);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 py-1.5 text-xs font-bold transition-colors"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>+ Keranjang</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. LAYANAN JASA & KEUNGGULAN KSS KOMPUTER */}
      <section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight mb-1">
                <Wrench className="h-3.5 w-3.5" />
                <span>Pusat Service &amp; Maintenance Mangga Dua</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                Layanan Jasa Komputer Profesional
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Mulai dari rakit full custom, cable management estetis, hingga deep cleaning dengan pasta termal premium.
              </p>
            </div>

            <Link
              href="/jasa"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <span>Lihat Detail Biaya Jasa</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_SERVICES.map((srv) => (
              <div
                key={srv.id}
                className="flex flex-col justify-between rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">{srv.duration}</span>
                    {srv.badge && (
                      <span className="rounded-xs bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 text-amber-700 dark:text-amber-400 font-bold">
                        {srv.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                    {srv.title}
                  </h3>

                  <div className="font-mono text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mb-2">
                    {srv.price === 0 ? 'Gratis (Konsultasi)' : formatIDR(srv.price)}
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-3">
                    {srv.description}
                  </p>
                </div>

                <a
                  href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
                    `Halo KSS Komputer, saya ingin booking layanan: *${srv.title}*`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-sm border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors"
                >
                  <PhoneCall className="h-3 w-3 text-emerald-500" />
                  <span>Booking via WhatsApp</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
