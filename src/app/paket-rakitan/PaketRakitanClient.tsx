'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { RotateCcw, MessageCircle } from 'lucide-react';
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

  const usageOptions: Array<[UsageFilter, string]> = [
    ['all', 'Semua'],
    ['gaming-1080p', 'Gaming 1080p'],
    ['gaming-1440p', '1440p / 4K'],
    ['creator', 'Creator & 3D'],
    ['office', 'Office'],
  ];

  const hasActiveFilter =
    selectedUsage !== 'all' ||
    selectedPlatform !== 'all' ||
    selectedBudget !== 'all' ||
    sortBy !== 'featured';

  return (
    <div>
      <PageHeader
        breadcrumb={
          <nav aria-label="Breadcrumb" className="text-body-sm text-zinc-500">
            <Link href="/toko" className="kss-link">
              Toko
            </Link>
            <span aria-hidden className="px-2">›</span>
            <span aria-current="page">Paket PC siap pakai</span>
          </nav>
        }
        eyebrow="Katalog paket PC"
        title="Paket PC rakitan siap pakai"
        description="Part baru bergaransi resmi. Sudah termasuk perakitan, cable management, update BIOS, instalasi OS, dan stress test."
        actions={
          <>
            <Link href="/konsultasi" className="kss-btn-primary">
              Konsultasi budget
            </Link>
            <a
              href={generateCustomBuildWAMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="kss-btn-outline"
            >
              <MessageCircle aria-hidden className="h-4 w-4" />
              Rakit custom via WA
            </a>
          </>
        }
      />

      <div className="sticky top-[57px] z-30 border-b border-zinc-200 bg-white">
        <div className="kss-container flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:gap-4">
          <div
            role="group"
            aria-label="Kebutuhan"
            className="-mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:px-0"
          >
            {usageOptions.map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={selectedUsage === id}
                onClick={() => setSelectedUsage(id)}
                className={`kss-chip ${selectedUsage === id ? 'kss-chip-active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 lg:ml-auto lg:flex lg:w-auto">
            <label htmlFor="f-platform" className="sr-only">
              Platform
            </label>
            <select
              id="f-platform"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as PlatformFilter)}
              className="kss-input h-9 lg:w-36"
            >
              <option value="all">Platform</option>
              <option value="AMD Ryzen">AMD Ryzen</option>
              <option value="Intel Core">Intel Core</option>
            </select>

            <label htmlFor="f-budget" className="sr-only">
              Budget
            </label>
            <select
              id="f-budget"
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value as BudgetFilter)}
              className="kss-input h-9 lg:w-36"
            >
              <option value="all">Budget</option>
              <option value="under-7m">&lt; Rp 7 juta</option>
              <option value="7-12m">Rp 7 - 12 juta</option>
              <option value="12-20m">Rp 12 - 20 juta</option>
              <option value="above-20m">&gt; Rp 20 juta</option>
            </select>

            <label htmlFor="f-sort" className="sr-only">
              Urutkan
            </label>
            <select
              id="f-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="kss-input h-9 lg:w-40"
            >
              <option value="featured">Rekomendasi</option>
              <option value="price-asc">Harga terendah</option>
              <option value="price-desc">Harga tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      <div className="kss-container py-8 lg:py-12">
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-body-sm text-zinc-600" aria-live="polite">
            <span className="kss-num font-semibold text-zinc-950">{filteredPackages.length}</span>{' '}
            paket ditemukan
          </p>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-meta font-medium text-zinc-600 transition-colors hover:text-zinc-950"
            >
              <RotateCcw aria-hidden className="h-3.5 w-3.5" />
              Reset filter
            </button>
          )}
        </div>

        {filteredPackages.length === 0 ? (
          <div className="rounded-md border border-dashed border-zinc-300 bg-white p-12 text-center">
            <p className="text-[15px] font-semibold text-zinc-900">
              Tidak ditemukan paket PC yang cocok dengan filter.
            </p>
            <p className="mt-1 text-body-sm text-zinc-600">
              Coba perluas budget atau konsultasikan spesifikasi custom Anda.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={handleResetFilters} className="kss-btn-dark">
                Reset filter
              </button>
              <Link href="/konsultasi" className="kss-btn-outline">
                Konsultasi custom
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {filteredPackages.map((pkg) => (
              <PrebuiltCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
