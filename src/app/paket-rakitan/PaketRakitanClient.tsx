'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  ShieldCheck,
  RotateCcw,
  MessageSquareCheck,
} from 'lucide-react';
import type { PublicPrebuiltPCDTO } from '@/lib/sanitizer';
import { generateCustomBuildWAMessage } from '@/lib/format';
import { PrebuiltCard } from '@/components/prebuilt/PrebuiltCard';
import { PageHeader } from '@/components/ui/PageHeader';

type BudgetFilter = 'all' | 'under-7m' | '7-12m' | '12-20m' | 'above-20m';
type PlatformFilter = 'all' | 'AMD Ryzen' | 'Intel Core';
type UsageFilter = 'all' | 'gaming-1080p' | 'gaming-1440p' | 'creator' | 'office' | 'sultan-4k';
type SortOption = 'featured' | 'price-asc' | 'price-desc';

export interface PaketRakitanClientProps {
  packages: PublicPrebuiltPCDTO[];
}

export default function PaketRakitanPage({ packages }: PaketRakitanClientProps) {
  const [selectedUsage, setSelectedUsage] = useState<UsageFilter>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformFilter>('all');
  const [selectedBudget, setSelectedBudget] = useState<BudgetFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
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
      const totalPrice = pkg.totalBundlePrice;
      if (selectedBudget === 'under-7m' && totalPrice >= 7000000) return false;
      if (selectedBudget === '7-12m' && (totalPrice < 7000000 || totalPrice > 12000000)) return false;
      if (selectedBudget === '12-20m' && (totalPrice < 12000000 || totalPrice > 20000000)) return false;
      if (selectedBudget === 'above-20m' && totalPrice <= 20000000) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.totalBundlePrice;
      const priceB = b.totalBundlePrice;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      // Default: featured first
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [selectedPlatform, selectedUsage, selectedBudget, sortBy, packages]);

  const handleResetFilters = () => {
    setSelectedUsage('all');
    setSelectedPlatform('all');
    setSelectedBudget('all');
    setSortBy('featured');
  };

  return (
    <div>
      <PageHeader
        eyebrow="Katalog Paket PC"
        title="Paket PC Rakitan Siap Pakai"
        description="Part baru bergaransi resmi, sudah termasuk perakitan, cable management, update BIOS, instalasi OS, dan stress test."
        actions={
          <>
            <Link href="/konsultasi" className="kss-btn-primary">
              Konsultasi Budget
            </Link>
            <a
              href={generateCustomBuildWAMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="kss-btn-outline"
            >
              <MessageSquareCheck className="h-3.5 w-3.5" />
              <span>Rakit Custom via WA</span>
            </a>
          </>
        }
      />

      <div className="kss-container py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
          <span>
            Menampilkan <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{filteredPackages.length}</span> paket
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Garansi toko + distributor
          </span>
        </div>

        {/* Filter Control Bar */}
        <div className="mb-6 space-y-3 rounded-md border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-orange-700 dark:text-orange-400" />
              <span className="text-xs font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
                Filter Spesifikasi &amp; Budget
              </span>
            </div>

            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-orange-700 dark:hover:text-orange-400"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase text-zinc-500">Kebutuhan</label>
              <select
                value={selectedUsage}
                onChange={(e) => setSelectedUsage(e.target.value as UsageFilter)}
                className="kss-input"
              >
                <option value="all">Semua Kebutuhan</option>
                <option value="gaming-1080p">Gaming E-Sports 1080p</option>
                <option value="gaming-1440p">Gaming AAA 1440p / 4K</option>
                <option value="creator">Creator &amp; Rendering 3D</option>
                <option value="office">Office, Kasir &amp; Bisnis</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase text-zinc-500">Platform</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as PlatformFilter)}
                className="kss-input"
              >
                <option value="all">Semua Platform</option>
                <option value="AMD Ryzen">AMD Ryzen</option>
                <option value="Intel Core">Intel Core</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase text-zinc-500">Budget</label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value as BudgetFilter)}
                className="kss-input"
              >
                <option value="all">Semua Budget</option>
                <option value="under-7m">&lt; Rp 7 Juta</option>
                <option value="7-12m">Rp 7 - 12 Juta</option>
                <option value="12-20m">Rp 12 - 20 Juta</option>
                <option value="above-20m">&gt; Rp 20 Juta</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase text-zinc-500">Urutkan</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="kss-input"
              >
                <option value="featured">Rekomendasi</option>
                <option value="price-asc">Harga Terendah</option>
                <option value="price-desc">Harga Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid Paket PC Rakitan */}
        {filteredPackages.length === 0 ? (
          <div className="rounded-md border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Tidak ditemukan paket PC yang cocok dengan filter.
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Coba perluas budget atau konsultasikan spesifikasi custom Anda.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button onClick={handleResetFilters} className="kss-btn-dark">
                Reset Filter
              </button>
              <Link href="/konsultasi" className="kss-btn-outline">
                Konsultasi Custom
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.map((pkg) => (
              <PrebuiltCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
