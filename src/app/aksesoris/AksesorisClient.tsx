'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Headphones,
  Keyboard,
  Mouse,
  Monitor,
  Zap,
  Search,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  PhoneCall,
  LayoutGrid,
  ListFilter,
} from 'lucide-react';
import { AccessoryCategory, PublicAccessory } from '@/lib/types';
import { formatIDR, TOKOPEDIA_OFFICIAL_STORE_URL, DEFAULT_WHATSAPP_PHONE } from '@/lib/format';
import { useRetailCartStore } from '@/store/useRetailCartStore';
import { PageHeader } from '@/components/ui/PageHeader';

const ACC_CATEGORIES: { id: AccessoryCategory | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'Semua Aksesoris', icon: Headphones },
  { id: 'keyboard', label: 'Mechanical Keyboard', icon: Keyboard },
  { id: 'mouse', label: 'Gaming Mouse', icon: Mouse },
  { id: 'headset', label: 'Gaming Headset', icon: Headphones },
  { id: 'monitor', label: 'Monitor Display', icon: Monitor },
  { id: 'ups', label: 'UPS & Stabilizer', icon: Zap },
];

export interface AksesorisClientProps {
  accessories: PublicAccessory[];
}

export default function AksesorisPage({ accessories }: AksesorisClientProps) {
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
    return accessories.filter((item) => {
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
  }, [selectedCat, searchQuery, accessories]);

  return (
    <div>
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <PageHeader
        eyebrow="Peripherals & Gear"
        title="Aksesoris & Gaming Gear"
        description="Keyboard, mouse, monitor, headset, dan UPS bergaransi resmi. Harga eceran transparan, siap kirim atau ambil di toko."
        actions={
          <>
            <a
              href={TOKOPEDIA_OFFICIAL_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="kss-btn-primary"
            >
              <span>Tokopedia Resmi</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link href="/komponen" className="kss-btn-outline">
              Lihat Komponen
            </Link>
          </>
        }
      />

      <div className="kss-container py-8">
        {/* Category pills */}
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
          {ACC_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCat === cat.id;
            const count =
              cat.id === 'all'
                ? accessories.length
                : accessories.filter((p) => p.category === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-orange-700 text-white'
                    : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
                <span
                  className={`ml-0.5 rounded-md px-1 font-mono text-micro ${
                    isSelected
                      ? 'bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900'
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter & view controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari keyboard, mouse, monitor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="kss-input pl-8"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-meta text-zinc-500 sm:inline">
              {filteredAccessories.length} item
            </span>
            <div className="flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-950">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-orange-700 shadow-xs dark:bg-zinc-800 dark:text-orange-400'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
                title="Tampilan grid"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-orange-700 shadow-xs dark:bg-zinc-800 dark:text-orange-400'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
                title="Tampilan tabel"
              >
                <ListFilter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

      {/* Items Display */}
      {filteredAccessories.length === 0 ? (
        <div className="p-12 text-center rounded-md border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Tidak ada gear yang cocok dengan pencarian Anda.
          </p>
          <button
            onClick={() => {
              setSelectedCat('all');
              setSearchQuery('');
            }}
            className="mt-3 text-xs font-bold text-orange-700 underline"
          >
            Reset Pencarian
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAccessories.map((item) => {
            const hasDiscount = Boolean(item.originalPrice && item.originalPrice > item.retailPrice);
            const isReady = item.stockStatus === 'ready';
            return (
              <article
                key={item.id}
                className="group flex flex-col justify-between rounded-md border border-zinc-200 bg-white p-4 transition-colors duration-150 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-600"
              >
                <div>
                  <div className="mb-1 flex items-center justify-between font-mono text-micro">
                    <span className="font-bold uppercase text-zinc-500">{item.brand}</span>
                    <span
                      className={`rounded-md border px-1.5 py-0.5 font-semibold ${
                        isReady
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {isReady ? 'Ready' : item.stockStatus === 'po' ? 'Pre-Order' : 'Terbatas'}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-xs font-bold leading-snug text-zinc-900 dark:text-zinc-100">
                    {item.name}
                  </h3>

                  <div className="mt-1 truncate font-mono text-micro text-zinc-500">
                    {item.sku} · {item.warrantyYears} Th Garansi
                  </div>

                  {item.features && item.features.length > 0 && (
                    <ul className="mt-2 space-y-0.5 text-micro text-zinc-500">
                      {item.features.slice(0, 2).map((feat, i) => (
                        <li key={i} className="truncate">• {feat}</li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="kss-price text-base text-orange-700 dark:text-orange-400">
                      {formatIDR(item.retailPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="font-mono text-micro text-zinc-500 line-through tabular-nums">
                        {formatIDR(item.originalPrice!)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      addRetailItem(item, 1);
                      showToast(`${item.name} dimasukkan ke keranjang`);
                    }}
                    className="kss-btn-primary h-9 flex-1 px-2"
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
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-emerald-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    title="Order via WhatsApp"
                  >
                    <PhoneCall className="h-4 w-4" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-mono text-micro uppercase">
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
                    <span className="text-micro text-zinc-500">{item.sku}</span>
                  </td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-zinc-900 dark:text-zinc-100 max-w-sm">
                    {item.name}
                  </td>
                  <td className="py-2.5 px-3 text-center text-zinc-500 whitespace-nowrap text-meta">
                    {item.officialDistributor || 'Resmi ID'}
                  </td>
                  <td className="py-2.5 px-3 text-center text-emerald-700 dark:text-emerald-400 font-bold whitespace-nowrap text-meta">
                    {item.warrantyYears} Tahun
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span className="kss-price text-sm text-orange-700 dark:text-orange-400">
                      {formatIDR(item.retailPrice)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        addRetailItem(item, 1);
                        showToast(`${item.name} dimasukkan ke keranjang`);
                      }}
                      className="inline-flex h-8 items-center gap-1 rounded-md bg-orange-700 px-2.5 font-sans text-meta font-bold text-white transition-colors hover:bg-orange-800"
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
        </div>
      )}
      </div>
    </div>
  );
}
