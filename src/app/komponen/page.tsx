'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Search,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Cpu,
  CircuitBoard,
  MemoryStick,
  Disc3,
  HardDriveDownload,
  Zap,
  Box,
  Fan,
  Monitor,
  PhoneCall,
  RotateCcw,
} from 'lucide-react';
import { ProductCategory, HardwarePart } from '@/lib/types';
import { MOCK_HARDWARE_PARTS } from '@/lib/mock-data';
import { formatIDR, CATEGORY_LABELS, TOKOPEDIA_OFFICIAL_STORE_URL, DEFAULT_WHATSAPP_PHONE } from '@/lib/format';
import { useRetailCartStore } from '@/store/useRetailCartStore';

const CATEGORY_ITEMS: { id: ProductCategory | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'Semua Komponen', icon: Layers },
  { id: 'cpu', label: 'Processor', icon: Cpu },
  { id: 'motherboard', label: 'Motherboard', icon: CircuitBoard },
  { id: 'gpu', label: 'VGA / Kartu Grafis', icon: Disc3 },
  { id: 'ram', label: 'RAM', icon: MemoryStick },
  { id: 'ssd', label: 'SSD NVMe', icon: HardDriveDownload },
  { id: 'psu', label: 'Power Supply', icon: Zap },
  { id: 'cooler', label: 'Cooler', icon: Fan },
  { id: 'case', label: 'Casing', icon: Box },
];

export default function KomponenEceranPage() {
  const [selectedCat, setSelectedCat] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const addRetailItem = useRetailCartStore((state) => state.addItem);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Distinct Brands
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    MOCK_HARDWARE_PARTS.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, []);

  // Filtered Parts
  const filteredParts = useMemo(() => {
    return MOCK_HARDWARE_PARTS.filter((part) => {
      if (selectedCat !== 'all' && part.category !== selectedCat) return false;
      if (selectedBrand !== 'all' && part.brand !== selectedBrand) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          part.name.toLowerCase().includes(q) ||
          part.sku.toLowerCase().includes(q) ||
          part.brand.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCat, selectedBrand, searchQuery]);

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
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4 font-mono">
        <Link href="/" className="hover:text-blue-600">Beranda</Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <span className="text-zinc-900 dark:text-zinc-100 font-semibold">Katalog Komponen Eceran</span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                Retail Hardware Catalog
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {filteredParts.length} Komponen Tersedia
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Katalog Komponen Lepas &amp; Upgrade Eceran
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Daftar harga eceran resmi komponen komputer Indonesia (Modern Enterkomputer). Seluruh part bersegel distributor resmi (Astrindo, EMD, NJT, WPG) dengan garansi replace toko KSS di Harco Mangga Dua.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={TOKOPEDIA_OFFICIAL_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-sm bg-[#03AC0E] hover:bg-[#02950c] text-white px-3 py-2 text-xs font-bold transition-colors shadow-xs"
            >
              <span>Tokopedia Resmi</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {CATEGORY_ITEMS.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCat === cat.id;
          const count =
            cat.id === 'all'
              ? MOCK_HARDWARE_PARTS.length
              : MOCK_HARDWARE_PARTS.filter((p) => p.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
              <span
                className={`ml-1 text-[10px] font-mono px-1 rounded-xs ${
                  isSelected ? 'bg-blue-700 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & View Mode Controls */}
      <div className="rounded-sm border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/80 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          {/* Instant Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari nama komponen, SKU, atau chipset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Filter Brand */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="rounded-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
          >
            <option value="all">Semua Brand ({availableBrands.length})</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-sm p-0.5 bg-zinc-50 dark:bg-zinc-950">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-xs transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-700'
            }`}
            title="Tampilan Tabel Rapat (Enterkomputer Style)"
          >
            <ListFilter className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-xs transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-700'
            }`}
            title="Tampilan Kartu Grid"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredParts.length === 0 ? (
        <div className="p-12 text-center rounded-sm border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Tidak ditemukan komponen yang cocok dengan pencarian Anda.
          </p>
          <button
            onClick={() => {
              setSelectedCat('all');
              setSelectedBrand('all');
              setSearchQuery('');
            }}
            className="mt-3 text-xs font-bold text-blue-600 underline"
          >
            Reset Pencarian
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW (ENTERKOMPUTER REIMAGINED: RAPAT, CEPAT & JELAS) */
        <div className="rounded-sm border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3">Brand / SKU</th>
                <th className="py-2.5 px-3">Nama Produk &amp; Spesifikasi</th>
                <th className="py-2.5 px-3 text-center">Distributor</th>
                <th className="py-2.5 px-3 text-center">Garansi</th>
                <th className="py-2.5 px-3 text-right">Harga Eceran Resmi</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-mono">
              {filteredParts.map((part) => {
                const retailPrice = part.retailPrice || part.sellPrice;
                return (
                  <tr
                    key={part.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                        {part.brand}
                      </span>
                      <span className="text-[10px] text-zinc-400">{part.sku}</span>
                    </td>

                    <td className="py-2.5 px-3 font-sans font-semibold text-zinc-900 dark:text-zinc-100 max-w-md">
                      <div>{part.name}</div>
                      <div className="font-mono text-[10px] text-zinc-400 font-normal mt-0.5">
                        {part.wattage}W TDP • {part.category.toUpperCase()}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center text-[11px] text-zinc-500 whitespace-nowrap">
                      {part.officialDistributor || 'Astrindo/EMD'}
                    </td>

                    <td className="py-2.5 px-3 text-center text-[11px] text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                      {part.warrantyYears} Tahun
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap tabular-nums">
                      {formatIDR(retailPrice)}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            addRetailItem(part, 1);
                            showToast(`${part.name} dimasukkan ke keranjang`);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-[11px] font-bold transition-colors"
                          title="Tambahkan ke Keranjang Eceran"
                        >
                          <ShoppingBag className="h-3 w-3" />
                          <span>+ Keranjang</span>
                        </button>

                        <a
                          href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
                            `Halo KSS Komputer, saya mau order eceran: *${part.name}* (${part.sku}) dengan harga ${formatIDR(
                              retailPrice
                            )}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-sm border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-emerald-600"
                          title="Chat Pembelian via WhatsApp"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParts.map((part) => {
            const retailPrice = part.retailPrice || part.sellPrice;
            return (
              <div
                key={part.id}
                className="flex flex-col justify-between rounded-sm border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                    <span className="uppercase font-bold text-zinc-600 dark:text-zinc-300">{part.brand}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{part.warrantyYears} Th Garansi</span>
                  </div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                    {part.name}
                  </h3>
                  <div className="mt-1 text-[10px] font-mono text-zinc-400">
                    SKU: {part.sku} • {part.wattage}W TDP
                  </div>
                  <div className="mt-2 font-mono text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                    {formatIDR(retailPrice)}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                  <button
                    onClick={() => {
                      addRetailItem(part, 1);
                      showToast(`${part.name} ditambahkan ke keranjang`);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 py-1.5 text-xs font-bold transition-colors"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>+ Keranjang</span>
                  </button>
                  <a
                    href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
                      `Halo KSS Komputer, saya mau tanya part eceran: *${part.name}*`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-sm border border-zinc-200 dark:border-zinc-700 text-emerald-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="Order via WA"
                  >
                    <PhoneCall className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
