'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Headphones,
  Keyboard,
  Mouse,
  Monitor,
  Zap,
  Armchair,
  Search,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  LayoutGrid,
  ListFilter,
} from 'lucide-react';
import { AccessoryCategory, AccessoryItem } from '@/lib/types';
import { MOCK_ACCESSORIES } from '@/lib/mock-data';
import { formatIDR, TOKOPEDIA_OFFICIAL_STORE_URL, DEFAULT_WHATSAPP_PHONE } from '@/lib/format';
import { useRetailCartStore } from '@/store/useRetailCartStore';

const ACC_CATEGORIES: { id: AccessoryCategory | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'Semua Aksesoris', icon: Headphones },
  { id: 'keyboard', label: 'Mechanical Keyboard', icon: Keyboard },
  { id: 'mouse', label: 'Gaming Mouse', icon: Mouse },
  { id: 'headset', label: 'Gaming Headset', icon: Headphones },
  { id: 'monitor', label: 'Monitor Display', icon: Monitor },
  { id: 'ups', label: 'UPS & Stabilizer', icon: Zap },
];

export default function AksesorisPage() {
  const [selectedCat, setSelectedCat] = useState<AccessoryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const addRetailItem = useRetailCartStore((state) => state.addItem);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const filteredAccessories = useMemo(() => {
    return MOCK_ACCESSORIES.filter((item) => {
      if (selectedCat !== 'all' && item.category !== selectedCat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCat, searchQuery]);

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
        <span className="text-zinc-900 dark:text-zinc-100 font-semibold">Aksesoris &amp; Gaming Gear</span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                Peripherals &amp; Gear
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {filteredAccessories.length} Gear Tersedia
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Aksesoris, Monitor &amp; Gaming Gear Resmi
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Lengkapi setup PC rakitan Anda dengan keyboard mechanical custom, mouse wireless esports ultralight, monitor Fast IPS 180Hz, hingga UPS penstabil daya bergaransi resmi.
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

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {ACC_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCat === cat.id;
          const count =
            cat.id === 'all'
              ? MOCK_ACCESSORIES.length
              : MOCK_ACCESSORIES.filter((p) => p.category === cat.id).length;

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

      {/* Filter & View Controls */}
      <div className="rounded-sm border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/80 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari keyboard, mouse, monitor, atau SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-sm p-0.5 bg-zinc-50 dark:bg-zinc-950">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-xs transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-700'
            }`}
            title="Tampilan Grid"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-xs transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-700'
            }`}
            title="Tampilan Tabel Rapat"
          >
            <ListFilter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Items Display */}
      {filteredAccessories.length === 0 ? (
        <div className="p-12 text-center rounded-sm border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Tidak ada gear yang cocok dengan pencarian Anda.
          </p>
          <button
            onClick={() => {
              setSelectedCat('all');
              setSearchQuery('');
            }}
            className="mt-3 text-xs font-bold text-blue-600 underline"
          >
            Reset Pencarian
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAccessories.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-sm border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span className="uppercase font-bold text-zinc-600 dark:text-zinc-300">{item.brand}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{item.warrantyYears} Th Garansi</span>
                </div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                  {item.name}
                </h3>
                <div className="mt-1 text-[10px] font-mono text-zinc-400 truncate">
                  SKU: {item.sku}
                </div>

                {item.features && item.features.length > 0 && (
                  <ul className="mt-2 text-[10px] text-zinc-500 space-y-0.5">
                    {item.features.slice(0, 2).map((feat, i) => (
                      <li key={i} className="truncate">• {feat}</li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                    {formatIDR(item.retailPrice)}
                  </span>
                  {item.originalPrice && item.originalPrice > item.retailPrice && (
                    <span className="font-mono text-[10px] text-zinc-400 line-through tabular-nums">
                      {formatIDR(item.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                <button
                  onClick={() => {
                    addRetailItem(item, 1);
                    showToast(`${item.name} dimasukkan ke keranjang`);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 py-1.5 text-xs font-bold transition-colors"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>+ Keranjang</span>
                </button>
                <a
                  href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
                    `Halo KSS Komputer, saya mau order gear: *${item.name}* (${item.sku})`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-sm border border-zinc-200 dark:border-zinc-700 text-emerald-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  title="Order via WhatsApp"
                >
                  <PhoneCall className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-sm border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3">Brand / SKU</th>
                <th className="py-2.5 px-3">Nama Produk</th>
                <th className="py-2.5 px-3 text-center">Distributor</th>
                <th className="py-2.5 px-3 text-center">Garansi</th>
                <th className="py-2.5 px-3 text-right">Harga Eceran</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-mono">
              {filteredAccessories.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{item.brand}</span>
                    <span className="text-[10px] text-zinc-400">{item.sku}</span>
                  </td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-zinc-900 dark:text-zinc-100 max-w-sm">
                    {item.name}
                  </td>
                  <td className="py-2.5 px-3 text-center text-zinc-500 whitespace-nowrap text-[11px]">
                    {item.officialDistributor || 'Resmi ID'}
                  </td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap text-[11px]">
                    {item.warrantyYears} Tahun
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap tabular-nums">
                    {formatIDR(item.retailPrice)}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        addRetailItem(item, 1);
                        showToast(`${item.name} dimasukkan ke keranjang`);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-sans text-[11px] font-bold"
                    >
                      <ShoppingBag className="h-3 w-3" />
                      <span>+ Keranjang</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
