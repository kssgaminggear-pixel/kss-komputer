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
  Cpu,
  CircuitBoard,
  MemoryStick,
  Disc3,
  HardDriveDownload,
  Zap,
  Box,
  Fan,
  PhoneCall,
} from 'lucide-react';
import { PublicHardwarePart, ProductCategory } from '@/lib/types';
import { formatIDR, TOKOPEDIA_OFFICIAL_STORE_URL, DEFAULT_WHATSAPP_PHONE } from '@/lib/format';
import { useRetailCartStore } from '@/store/useRetailCartStore';
import { PageHeader } from '@/components/ui/PageHeader';

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

export interface KomponenClientProps {
  parts: PublicHardwarePart[];
}

export default function KomponenEceranPage({ parts }: KomponenClientProps) {
  const [selectedCat, setSelectedCat] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
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
    parts.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [parts]);

  // Filtered Parts
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
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
  }, [selectedCat, selectedBrand, searchQuery, parts]);

  return (
    <div>
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <PageHeader
        eyebrow="Katalog Eceran"
        title="Komponen PC & Upgrade"
        description="Harga eceran resmi distributor, stok fisik, dan garansi resmi. Cocok untuk upgrade maupun rakitan sendiri."
        actions={
          <>
            <a
              href={TOKOPEDIA_OFFICIAL_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="kss-btn-dark"
            >
              <span>Tokopedia Resmi</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link href="/simulasi" className="kss-btn-outline">
              Rakit di Simulasi
            </Link>
          </>
        }
      />

      <div className="kss-container py-8">
        {/* Category pills */}
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORY_ITEMS.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCat === cat.id;
            const count =
              cat.id === 'all'
                ? parts.length
                : parts.filter((p) => p.category === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
                <span
                  className={`ml-0.5 rounded-md px-1 font-mono text-[10px] ${
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
          <div className="flex min-w-[260px] flex-1 items-center gap-2">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nama, SKU, atau chipset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="kss-input pl-8"
              />
            </div>

            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="kss-input w-auto"
            >
              <option value="all">Semua Brand</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] text-zinc-400 sm:inline">
              {filteredParts.length} item
            </span>
            <div className="flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-950">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-xs dark:bg-zinc-800 dark:text-blue-400'
                    : 'text-zinc-400 hover:text-zinc-700'
                }`}
                title="Tampilan kartu"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-xs dark:bg-zinc-800 dark:text-blue-400'
                    : 'text-zinc-400 hover:text-zinc-700'
                }`}
                title="Tampilan tabel"
              >
                <ListFilter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

      {/* Main Content Area */}
      {filteredParts.length === 0 ? (
        <div className="p-12 text-center rounded-md border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
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
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="overflow-x-auto">
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
                const retailPrice = part.retailPrice;
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
                      <Link href={`/komponen/${part.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                        {part.name}
                      </Link>
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

                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className="kss-price text-sm text-blue-600 dark:text-blue-400">
                        {formatIDR(retailPrice)}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            addRetailItem(part, 1);
                            showToast(`${part.name} dimasukkan ke keranjang`);
                          }}
                          className="inline-flex h-8 items-center gap-1 rounded-md bg-zinc-900 px-2.5 text-[11px] font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
                          className="p-1 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-emerald-600"
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
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredParts.map((part) => {
            const retailPrice = part.retailPrice;
            const CategoryIcon = CATEGORY_ITEMS.find((c) => c.id === part.category)?.icon || Box;
            const isReady = part.stockStatus === 'ready';
            return (
              <article
                key={part.id}
                className="group flex flex-col justify-between rounded-md border border-zinc-200 bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
              >
                <div>
                  <div className="mb-3 flex h-20 items-center justify-center rounded-md border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                    <CategoryIcon className="h-7 w-7 text-zinc-300 dark:text-zinc-700" />
                  </div>

                  <div className="mb-1 flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold uppercase text-zinc-500">{part.brand}</span>
                    <span
                      className={`rounded-md border px-1.5 py-0.5 font-semibold ${
                        isReady
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {isReady ? 'Ready' : part.stockStatus === 'po' ? 'Pre-Order' : 'Terbatas'}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-xs font-bold leading-snug text-zinc-900 dark:text-zinc-100">
                    <Link
                      href={`/komponen/${part.slug}`}
                      className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {part.name}
                    </Link>
                  </h3>

                  <div className="mt-1 font-mono text-[10px] text-zinc-400">
                    {part.sku} · {part.wattage}W · {part.warrantyYears} Th
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="kss-price text-base text-blue-600 dark:text-blue-400">
                      {formatIDR(retailPrice)}
                    </span>
                    {part.originalPrice && part.originalPrice > retailPrice && (
                      <span className="font-mono text-[10px] text-zinc-400 line-through tabular-nums">
                        {formatIDR(part.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      addRetailItem(part, 1);
                      showToast(`${part.name} ditambahkan ke keranjang`);
                    }}
                    className="kss-btn-dark h-9 flex-1 px-2"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>+ Keranjang</span>
                  </button>
                  <Link href={`/komponen/${part.slug}`} className="kss-btn-outline h-9 px-3">
                    Detail
                  </Link>
                  <a
                    href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
                      `Halo KSS Komputer, saya mau tanya part eceran: *${part.name}*`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-emerald-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    title="Order via WA"
                  >
                    <PhoneCall className="h-4 w-4" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
