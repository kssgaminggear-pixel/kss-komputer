'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Search,
  LayoutGrid,
  ListFilter,
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
import { TOKOPEDIA_OFFICIAL_STORE_URL, DEFAULT_WHATSAPP_PHONE, generateCustomBuildWAMessage } from '@/lib/format';
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
      <PageHeader
        eyebrow="Katalog Eceran"
        title="Komponen PC & Upgrade"
        description="Daftar komponen bergaransi resmi untuk upgrade maupun rakitan sendiri. Harga dan stok dikonfirmasi lewat WhatsApp."
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
            <a
              href={generateCustomBuildWAMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="kss-btn-outline"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>Rakit via WA</span>
            </a>
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
          <div className="flex min-w-[260px] flex-1 items-center gap-2">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
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
            <span className="hidden font-mono text-meta text-zinc-500 sm:inline">
              {filteredParts.length} item
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
                title="Tampilan kartu"
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
            className="mt-3 text-xs font-bold text-orange-700 underline"
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
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-mono text-micro uppercase">
                <th className="py-2.5 px-3">Brand / SKU</th>
                <th className="py-2.5 px-3">Nama Produk &amp; Spesifikasi</th>
                <th className="py-2.5 px-3 text-center">Distributor</th>
                <th className="py-2.5 px-3 text-center">Garansi</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-mono">
              {filteredParts.map((part) => {
                return (
                  <tr
                    key={part.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                        {part.brand}
                      </span>
                      <span className="text-micro text-zinc-500">{part.sku}</span>
                    </td>

                    <td className="py-2.5 px-3 font-sans font-semibold text-zinc-900 dark:text-zinc-100 max-w-md">
                      <Link href={`/komponen/${part.slug}`} className="hover:text-orange-700 dark:hover:text-orange-400">
                        {part.name}
                      </Link>
                      <div className="font-mono text-micro text-zinc-500 font-normal mt-0.5">
                        {part.wattage}W TDP • {part.category.toUpperCase()}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center text-meta text-zinc-500 whitespace-nowrap">
                      {part.officialDistributor || 'Astrindo/EMD'}
                    </td>

                    <td className="py-2.5 px-3 text-center text-meta text-emerald-700 dark:text-emerald-400 font-bold whitespace-nowrap">
                      {part.warrantyYears} Tahun
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 font-sans">
                        <a
                          href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
                            `Halo KSS Komputer, saya mau tanya harga dan stok: *${part.name}* (${part.sku})`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-emerald-700"
                          title="Tanya harga via WhatsApp"
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
            const isReady = part.stockStatus === 'ready';
            return (
              <article
                key={part.id}
                className="group flex flex-col justify-between rounded-md border border-zinc-200 bg-white p-4 transition-colors duration-150 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-600"
              >
                <div>
                  <div className="mb-1 flex items-center justify-between font-mono text-micro">
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
                      className="transition-colors hover:text-orange-700 dark:hover:text-orange-400"
                    >
                      {part.name}
                    </Link>
                  </h3>

                  <div className="mt-1 font-mono text-micro text-zinc-500">
                    {part.sku} · {part.wattage}W · {part.warrantyYears} Th
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <a
                    href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
                      `Halo KSS Komputer, saya mau tanya harga dan stok: *${part.name}* (${part.sku})`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kss-btn-wa h-9 flex-1 px-2"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>Tanya harga</span>
                  </a>
                  <Link href={`/komponen/${part.slug}`} className="kss-btn-outline h-9 px-3">
                    Detail
                  </Link>
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
