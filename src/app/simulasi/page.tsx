'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  Disc3,
  HardDriveDownload,
  HardDrive,
  Zap,
  Box,
  Fan,
  Monitor,
  Sparkles,
  SlidersHorizontal,
  PhoneCall,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  MessageSquareCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Copy,
  Printer,
  Search,
  X,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ProductCategory, HardwarePart, SelectedBuildItem } from '@/lib/types';
import { MOCK_HARDWARE_PARTS, PARTS_BY_ID } from '@/lib/mock-data';
import {
  formatIDR,
  formatDeltaIDR,
  formatWatt,
  generateWhatsAppOrderUrl,
  generateBuildPlainText,
  generateConsultationWAMessage,
  TOKOPEDIA_OFFICIAL_STORE_URL,
  DEFAULT_WHATSAPP_PHONE,
  CATEGORY_LABELS,
} from '@/lib/format';
import { validateBuild, isPartCompatibleWithCurrentBuild, getItemPart } from '@/lib/compatibility';
import { useBuilderStore } from '@/store/useBuilderStore';
import { useHydrated } from '@/lib/useHydrated';

const BUILDER_SLOTS: { category: ProductCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { category: 'cpu', label: 'Processor (CPU)', icon: Cpu },
  { category: 'motherboard', label: 'Motherboard', icon: CircuitBoard },
  { category: 'cooler', label: 'CPU Cooler', icon: Fan },
  { category: 'ram', label: 'Memory (RAM)', icon: MemoryStick },
  { category: 'gpu', label: 'VGA / Kartu Grafis', icon: Disc3 },
  { category: 'ssd', label: 'Storage Utama (SSD NVMe)', icon: HardDriveDownload },
  { category: 'hdd', label: 'Storage Sekunder (HDD / SATA)', icon: HardDrive },
  { category: 'psu', label: 'Power Supply Unit (PSU)', icon: Zap },
  { category: 'case', label: 'Casing PC', icon: Box },
  { category: 'monitor', label: 'Monitor Display (Opsional)', icon: Monitor },
];

export default function SimulasiPage() {
  const isHydrated = useHydrated();
  const [activeTab, setActiveTab] = useState<'builder' | 'consultation'>('builder');

  // Zustand Store
  const selections = useBuilderStore((state) => state.selections);
  const selectPart = useBuilderStore((state) => state.selectPart);
  const removePart = useBuilderStore((state) => state.removePart);
  const clearAll = useBuilderStore((state) => state.clearAll);
  const customBuildName = useBuilderStore((state) => state.customBuildName);
  const setCustomBuildName = useBuilderStore((state) => state.setCustomBuildName);
  const getDeltaPrice = useBuilderStore((state) => state.getDeltaPrice);
  const getTotalPrice = useBuilderStore((state) => state.getTotalPrice);
  const strictFilterEnabled = useBuilderStore((state) => state.strictFilterEnabled);
  const toggleStrictFilter = useBuilderStore((state) => state.toggleStrictFilter);

  // Active Drawer State for Part Selection
  const [activeDrawerCategory, setActiveDrawerCategory] = useState<ProductCategory | null>(null);
  const [drawerSearchQuery, setDrawerSearchQuery] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Consultation Form State
  const [custName, setCustName] = useState('');
  const [custBudget, setCustBudget] = useState(12000000);
  const [custUsage, setCustUsage] = useState('Gaming E-Sports & AAA 1080p');
  const [custPlatform, setCustPlatform] = useState('Bebas (Rekomendasi Teknisi KSS)');
  const [custNotes, setCustNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Compatibility Engine Report
  const compatibilityReport = useMemo(() => {
    return validateBuild(selections);
  }, [selections]);

  const totalPrice = isHydrated ? getTotalPrice() : 0;

  // Selected item list flat
  const selectedItemsFlat = useMemo(() => {
    const list: { category: ProductCategory; part: HardwarePart; quantity: number }[] = [];
    for (const slot of BUILDER_SLOTS) {
      const items = selections[slot.category] || [];
      for (const item of items) {
        const part = getItemPart(item);
        if (part) {
          list.push({ category: slot.category, part, quantity: item.quantity });
        }
      }
    }
    return list;
  }, [selections]);

  // Candidate parts for active drawer
  const drawerCandidateParts = useMemo(() => {
    if (!activeDrawerCategory) return [];

    let candidates = MOCK_HARDWARE_PARTS.filter(
      (p) => p.category === activeDrawerCategory
    );

    // Filter kompatibilitas otomatis jika strict filter aktif
    if (strictFilterEnabled) {
      candidates = candidates.filter((p) =>
        isPartCompatibleWithCurrentBuild(p, selections).compatible
      );
    }

    // Search query
    if (drawerSearchQuery.trim()) {
      const q = drawerSearchQuery.toLowerCase();
      candidates = candidates.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    return candidates;
  }, [activeDrawerCategory, strictFilterEnabled, drawerSearchQuery, selections]);

  // Handlers
  const handleOpenDrawer = (category: ProductCategory) => {
    setActiveDrawerCategory(category);
    setDrawerSearchQuery('');
  };

  const handleSelectDrawerPart = (part: HardwarePart) => {
    if (!activeDrawerCategory) return;
    selectPart(activeDrawerCategory, part, 1);
    setActiveDrawerCategory(null);
    showToast(`${part.name} berhasil dipasang.`);
  };

  const handleCopySpecs = () => {
    const text = generateBuildPlainText(
      customBuildName || 'Custom PC Rig KSS',
      selectedItemsFlat.map((item) => ({
        category: item.category,
        name: item.part.name,
        quantity: item.quantity,
      })),
      totalPrice,
      compatibilityReport.totalWattage
    );
    navigator.clipboard.writeText(text);
    showToast('Spesifikasi berhasil disalin ke clipboard!');
  };

  const handleWhatsAppCheckout = () => {
    const url = generateWhatsAppOrderUrl(DEFAULT_WHATSAPP_PHONE, {
      buildName: customBuildName || 'Custom PC Rig KSS',
      items: selectedItemsFlat.map((item) => ({
        category: item.category,
        name: item.part.name,
        quantity: item.quantity,
      })),
      totalPrice,
      isCustomBuild: true,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConsultationSubmit = (e: React.FormEvent) => {
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 rounded-sm border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4 font-mono print:hidden">
        <Link href="/" className="hover:text-blue-600">Beranda</Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <span className="text-zinc-900 dark:text-zinc-100 font-semibold">Simulasi &amp; PC Configurator</span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs mb-6 print:border-none print:p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                Interactive PC Configurator
              </span>
              <span className="rounded-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Zero Part-Price Leak
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Simulasi Rakitan &amp; Konsultasi Budget
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Rancang spesifikasi PC impian Anda dengan validasi kompatibilitas soket, slot RAM, dan daya PSU otomatis. Harga satuan dirahasiakan, hanya menampilkan total rakitan siap pakai dan selisih upgrade (*Delta Pricing*).
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center rounded-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-1 shrink-0 print:hidden">
            <button
              onClick={() => setActiveTab('builder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold transition-colors ${
                activeTab === 'builder'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Rakit Manual</span>
            </button>
            <button
              onClick={() => setActiveTab('consultation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold transition-colors ${
                activeTab === 'consultation'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
              <span>Konsultasi Budget (WA)</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'consultation' ? (
        /* TAB 2: FORM KONSULTASI RAKITAN BY BUDGET (VIA WA) */
        <div className="rounded-sm border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <PhoneCall className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Form Konsultasi Budget ke Teknisi KSS
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
            Tidak yakin komponen apa yang paling cocok untuk game atau software Anda? Masukkan estimasi budget di bawah, dan teknisi kami akan menyusunkan konfigurasi paling seimbang tanpa bottleneck.
          </p>

          <form onSubmit={handleConsultationSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Batas Maksimal Budget
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
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Kebutuhan Penggunaan Utama
                </label>
                <select
                  value={custUsage}
                  onChange={(e) => setCustUsage(e.target.value)}
                  className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
                >
                  <option value="Gaming E-Sports 1080p (Valorant, CS2, Dota)">Gaming E-Sports 1080p (Valorant, CS2, Dota)</option>
                  <option value="Gaming AAA 1080p / 1440p (Cyberpunk, Black Myth Wukong)">Gaming AAA 1080p / 1440p (Cyberpunk, Wukong)</option>
                  <option value="Editing Video & Desain Grafis (Premiere, After Effects, Photoshop)">Editing Video &amp; Desain Grafis</option>
                  <option value="3D Rendering & Arsitektur (Blender, AutoCAD, SketchUp)">3D Rendering &amp; Arsitektur</option>
                  <option value="Workstation AI / Machine Learning">Workstation AI / Machine Learning</option>
                  <option value="Office, Kasir & Multitasking Ringan">Office, Kasir &amp; Multitasking Ringan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Preferensi Platform Processor
                </label>
                <select
                  value={custPlatform}
                  onChange={(e) => setCustPlatform(e.target.value)}
                  className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
                >
                  <option value="Bebas (Rekomendasi Teknisi KSS)">Bebas (Rekomendasi Terbaik Teknisi KSS)</option>
                  <option value="AMD Ryzen Platform">AMD Ryzen Platform</option>
                  <option value="Intel Core Platform">Intel Core Platform</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Catatan Khusus (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Sudah punya monitor 144Hz, butuh casing warna putih, ingin SSD kapasitas 1TB..."
                value={custNotes}
                onChange={(e) => setCustNotes(e.target.value)}
                className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs sm:text-sm font-bold transition-colors shadow-xs"
            >
              <MessageSquareCheck className="h-4 w-4" />
              <span>Kirimkan ke WhatsApp Konsultasi KSS</span>
            </button>
          </form>
        </div>
      ) : (
        /* TAB 1: CUSTOM PC CONFIGURATOR (ZERO PART LEAK) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Baris Slot Komponen */}
          <div className="lg:col-span-8 space-y-4">
            {/* Toolbar Konfigurator */}
            <div className="rounded-sm border border-zinc-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <span className="text-xs font-mono text-zinc-400">Nama Rakitan:</span>
                <input
                  type="text"
                  value={customBuildName}
                  onChange={(e) => setCustomBuildName(e.target.value)}
                  placeholder="Custom PC Rig KSS"
                  className="rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:border-blue-600 flex-1 max-w-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleStrictFilter}
                  className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold border transition-colors ${
                    strictFilterEnabled
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-zinc-300 dark:border-zinc-700 text-zinc-500'
                  }`}
                  title="Otomatis hanya tampilkan komponen yang kompatibel di drawer"
                >
                  Filter Kompatibel: {strictFilterEnabled ? 'ON' : 'OFF'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Kosongkan seluruh komponen rakitan?')) {
                      clearAll();
                      showToast('Seluruh komponen berhasil dikosongkan.');
                    }
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-red-600 p-1"
                  title="Reset Semua Slot"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* List Slot Hardware */}
            <div className="rounded-sm border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {BUILDER_SLOTS.map((slot) => {
                const Icon = slot.icon;
                const selectedList = selections[slot.category] || [];
                const currentItem = selectedList[0];
                const part = getItemPart(currentItem);

                return (
                  <div key={slot.category} className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    {/* Icon & Label Kategori */}
                    <div className="flex items-center gap-3 w-40 sm:w-48 shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {slot.label}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 uppercase">
                          {slot.category}
                        </div>
                      </div>
                    </div>

                    {/* Status Terpasang / Part Info (ZERO PART LEAK) */}
                    <div className="flex-1 min-w-0 px-2">
                      {part ? (
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {part.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-zinc-500">
                            <span>{part.sku}</span>
                            <span>•</span>
                            <span>{part.wattage}W</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{part.warrantyYears} Th Garansi</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 italic">
                          Belum ada komponen dipilih
                        </span>
                      )}
                    </div>

                    {/* Tombol Aksi Slot */}
                    <div className="flex items-center gap-2 shrink-0 print:hidden">
                      {part ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(slot.category)}
                            className="px-2.5 py-1.5 rounded-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors"
                          >
                            Ganti Part
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              removePart(slot.category, 0);
                              showToast(`${part.name} dilepas dari slot.`);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                            title="Lepas Komponen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(slot.category)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Pilih Komponen</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kolom Kanan: Sticky Telemetry & Checkout Box */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/90 shadow-sm space-y-4">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight block">
                  Total Harga Rakitan (Siap Pakai)
                </span>
                <div className="font-mono text-2xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums mt-0.5">
                  {formatIDR(totalPrice)}
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                  Termasuk Jasa Rakit Rapi &amp; Pengujian Beban 24 Jam
                </span>
              </div>

              {/* Status Kompatibilitas Engine */}
              <div className="rounded-sm p-3 border text-xs space-y-1.5 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Kompatibilitas:</span>
                  {compatibilityReport.isCompatible ? (
                    <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      100% Kompatibel
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-bold text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      Ada Ketidakcocokan
                    </span>
                  )}
                </div>

                {/* Issues List */}
                {compatibilityReport.issues.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
                    {compatibilityReport.issues.map((iss) => (
                      <div
                        key={iss.id}
                        className={`text-[11px] p-2 rounded-xs flex items-start gap-1.5 ${
                          iss.severity === 'error'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">{iss.title}</div>
                          <div className="text-[10px] leading-tight mt-0.5">{iss.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Telemetry Wattage */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xs border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500">Estimasi TDP Daya:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {formatWatt(compatibilityReport.totalWattage)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xs border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500">Rekomendasi PSU:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    Min. {compatibilityReport.recommendedPsuWatt}W
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 print:hidden">
                <button
                  type="button"
                  onClick={handleWhatsAppCheckout}
                  disabled={selectedItemsFlat.length === 0}
                  className="flex items-center justify-center gap-2 w-full rounded-sm bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white py-3 text-xs font-bold transition-colors shadow-xs"
                >
                  <MessageSquareCheck className="h-4 w-4" />
                  <span>Konsultasi &amp; Pesan via WhatsApp</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopySpecs}
                    disabled={selectedItemsFlat.length === 0}
                    className="flex items-center justify-center gap-1.5 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                    title="Salin teks spesifikasi rakitan"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin Spek</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    disabled={selectedItemsFlat.length === 0}
                    className="flex items-center justify-center gap-1.5 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                    title="Cetak Surat Penawaran Resmi PDF"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Cetak PDF</span>
                  </button>
                </div>

                <a
                  href={TOKOPEDIA_OFFICIAL_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full rounded-sm bg-[#03AC0E] hover:bg-[#02950c] text-white py-2.5 text-xs font-bold transition-colors shadow-xs"
                >
                  <span>Request Link Checkout Tokopedia</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER PEMILIH KOMPONEN (ZERO PART LEAK: HANYA DELTA PRICING) */}
      {activeDrawerCategory && (
        <div className="fixed inset-0 z-50 flex justify-end print:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={() => setActiveDrawerCategory(null)}
          />

          <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl dark:bg-zinc-950 dark:border-l dark:border-zinc-800">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
                  Pilih {CATEGORY_LABELS[activeDrawerCategory] || activeDrawerCategory}
                </h3>
              </div>
              <button
                onClick={() => setActiveDrawerCategory(null)}
                className="rounded-sm p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Bar in Drawer */}
            <div className="p-3 border-b border-zinc-100 dark:border-zinc-900">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari brand, nama part, atau SKU..."
                  value={drawerSearchQuery}
                  onChange={(e) => setDrawerSearchQuery(e.target.value)}
                  className="w-full rounded-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Part List with DELTA PRICING (Zero leak: Tidak ada harga satuan mentah) */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900 p-2">
              {drawerCandidateParts.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  Tidak ditemukan komponen yang kompatibel dengan rakitan saat ini.
                </div>
              ) : (
                drawerCandidateParts.map((candidate) => {
                  const delta = getDeltaPrice(activeDrawerCategory, candidate);
                  const isCurrent = selections[activeDrawerCategory]?.[0]?.part?.id === candidate.id;

                  return (
                    <div
                      key={candidate.id}
                      onClick={() => handleSelectDrawerPart(candidate)}
                      className={`p-3 rounded-sm flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-blue-50/60 dark:bg-blue-950/30 border border-blue-500/30'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/80'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="rounded-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 font-mono text-[9px] uppercase text-zinc-500">
                            {candidate.brand}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400 truncate">
                            {candidate.sku}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                          {candidate.name}
                        </h4>
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                          <span>{candidate.wattage}W TDP</span>
                          <span>•</span>
                          <span>Garansi {candidate.warrantyYears} Th</span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{candidate.stockStatus}</span>
                        </div>
                      </div>

                      {/* DELTA BADGE ONLY (ZERO PART-PRICE LEAK) */}
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block font-mono text-xs font-bold px-2 py-1 rounded-xs tabular-nums ${
                            delta === 0
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                              : delta > 0
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {formatDeltaIDR(delta, true)}
                        </span>
                        {isCurrent && (
                          <span className="block text-[10px] font-semibold text-blue-600 mt-1">
                            (Sedang Terpasang)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
