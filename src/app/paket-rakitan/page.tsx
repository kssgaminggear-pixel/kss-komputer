'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Layers,
  Cpu,
} from 'lucide-react';
import { PrebuiltPC } from '@/lib/types';
import { MOCK_PREBUILT_PCS, PARTS_BY_ID } from '@/lib/mock-data';
import { calculateBundleTotal } from '@/lib/compatibility';
import { PrebuiltCard } from '@/components/prebuilt/PrebuiltCard';
import { formatIDR } from '@/lib/format';

type BudgetFilter = 'all' | 'under-7m' | '7-12m' | '12-20m' | 'above-20m';
type PlatformFilter = 'all' | 'AMD Ryzen' | 'Intel Core';
type UsageFilter = 'all' | 'gaming-1080p' | 'gaming-1440p' | 'creator' | 'office' | 'sultan-4k';
type SortOption = 'featured' | 'price-asc' | 'price-desc';

export default function PaketRakitanPage() {
  const [selectedUsage, setSelectedUsage] = useState<UsageFilter>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformFilter>('all');
  const [selectedBudget, setSelectedBudget] = useState<BudgetFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Precomputed price map
  const packagePriceMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const pkg of MOCK_PREBUILT_PCS) {
      const rawParts = Object.values(pkg.baseParts)
        .map((item) => (item ? PARTS_BY_ID[item.partId] : undefined))
        .filter(Boolean);
      map.set(pkg.id, calculateBundleTotal(rawParts, pkg.assemblyFee));
    }
    return map;
  }, []);

  const filteredPackages = useMemo(() => {
    return MOCK_PREBUILT_PCS.filter((pkg) => {
      // 1. Filter Platform
      if (selectedPlatform !== 'all' && pkg.platform !== selectedPlatform) {
        return false;
      }

      // 2. Filter Kebutuhan
      if (selectedUsage !== 'all') {
        if (selectedUsage === 'gaming-1080p' && pkg.categoryTag !== 'gaming-1080p') return false;
        if (selectedUsage === 'gaming-1440p' && pkg.categoryTag !== 'gaming-1440p' && pkg.categoryTag !== 'sultan-4k') return false;
        if (selectedUsage === 'creator' && pkg.categoryTag !== 'creator' && pkg.categoryTag !== 'workstation') return false;
        if (selectedUsage === 'office' && pkg.categoryTag !== 'office') return false;
      }

      // 3. Filter Budget
      const totalPrice = packagePriceMap.get(pkg.id) || 0;
      if (selectedBudget === 'under-7m' && totalPrice >= 7000000) return false;
      if (selectedBudget === '7-12m' && (totalPrice < 7000000 || totalPrice > 12000000)) return false;
      if (selectedBudget === '12-20m' && (totalPrice < 12000000 || totalPrice > 20000000)) return false;
      if (selectedBudget === 'above-20m' && totalPrice <= 20000000) return false;

      return true;
    }).sort((a, b) => {
      const priceA = packagePriceMap.get(a.id) || 0;
      const priceB = packagePriceMap.get(b.id) || 0;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      // Default: featured first
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [selectedPlatform, selectedUsage, selectedBudget, sortBy, packagePriceMap]);

  const handleResetFilters = () => {
    setSelectedUsage('all');
    setSelectedPlatform('all');
    setSelectedBudget('all');
    setSortBy('featured');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4 font-mono">
        <Link href="/" className="hover:text-blue-600">Beranda</Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <span className="text-zinc-900 dark:text-zinc-100 font-semibold">Paket PC Rakitan</span>
      </nav>

      {/* Header Banner Teknis */}
      <div className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                System Integrator Catalog
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {filteredPackages.length} Paket Tersedia
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Katalog Paket PC Rakitan Jadi (Siap Pakai)
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Seluruh rakitan menggunakan part 100% baru bergaransi distributor resmi. Sudah termasuk instalasi sistem operasi, perakitan kabel rapi, update BIOS versi stabil, dan pengujian beban berat (*stress test*) selama 24 jam.
            </p>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-3 md:pt-0 md:pl-6 shrink-0">
            <div className="text-left">
              <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                Garansi Toko + Distributor
              </div>
              <div className="text-[11px] text-zinc-500">Bantuan klaim RMA di Harco Mangga Dua</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="rounded-sm border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/80 mb-6 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
              Filter Spesifikasi &amp; Budget
            </span>
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Filter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Filter Kebutuhan */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1 uppercase">Kebutuhan / Resolusi</label>
            <select
              value={selectedUsage}
              onChange={(e) => setSelectedUsage(e.target.value as UsageFilter)}
              className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="all">Semua Kebutuhan</option>
              <option value="gaming-1080p">Gaming E-Sports 1080p</option>
              <option value="gaming-1440p">Gaming AAA 1440p / 4K</option>
              <option value="creator">Creator &amp; Rendering 3D</option>
              <option value="office">Office, Kasir &amp; Bisnis</option>
            </select>
          </div>

          {/* 2. Filter Platform */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1 uppercase">Platform Processor</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as PlatformFilter)}
              className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="all">Semua Platform (AMD &amp; Intel)</option>
              <option value="AMD Ryzen">AMD Ryzen Platform</option>
              <option value="Intel Core">Intel Core Platform</option>
            </select>
          </div>

          {/* 3. Filter Rentang Budget */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1 uppercase">Rentang Budget</label>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value as BudgetFilter)}
              className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="all">Semua Rentang Budget</option>
              <option value="under-7m">&lt; Rp 7.000.000 (Hemat)</option>
              <option value="7-12m">Rp 7 - 12 Juta (Sweetspot)</option>
              <option value="12-20m">Rp 12 - 20 Juta (High-End)</option>
              <option value="above-20m">&gt; Rp 20 Juta (Flagship)</option>
            </select>
          </div>

          {/* 4. Pengurutan */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1 uppercase">Urutkan Berdasarkan</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="featured">Paling Direkomendasikan</option>
              <option value="price-asc">Harga: Termurah ke Termahal</option>
              <option value="price-desc">Harga: Termahal ke Termurah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Paket PC Rakitan */}
      {filteredPackages.length === 0 ? (
        <div className="p-12 text-center rounded-sm border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Tidak ditemukan paket PC yang cocok dengan filter yang Anda tentukan.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Coba pilih kategori budget yang lebih luas atau konsultasikan langsung spesifikasi rakitan custom Anda.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold"
            >
              Reset Semua Filter
            </button>
            <Link
              href="/simulasi"
              className="px-4 py-2 rounded-sm border border-blue-600 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              Rakit Manual di Configurator
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <PrebuiltCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );
}
