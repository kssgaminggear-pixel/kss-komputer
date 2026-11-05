'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Database,
  Save,
  Download,
  Upload,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { MOCK_HARDWARE_PARTS } from '@/lib/mock-data';
import { ProductCategory, HardwarePart } from '@/lib/types';
import { formatIDR } from '@/lib/format';
import { useHydrated } from '@/lib/useHydrated';

export default function AdminPricingPage() {
  const isHydrated = useHydrated();

  // Admin store
  const globalMarkupPercent = useAdminStore((state) => state.globalMarkupPercent);
  const defaultAssemblyFee = useAdminStore((state) => state.defaultAssemblyFee);
  const priceOverrides = useAdminStore((state) => state.priceOverrides);
  const setGlobalMarkupPercent = useAdminStore((state) => state.setGlobalMarkupPercent);
  const setDefaultAssemblyFee = useAdminStore((state) => state.setDefaultAssemblyFee);
  const updatePartPrice = useAdminStore((state) => state.updatePartPrice);
  const bulkApplyMarkupToAll = useAdminStore((state) => state.bulkApplyMarkupToAll);
  const resetPriceOverrides = useAdminStore((state) => state.resetPriceOverrides);
  const getEffectivePartPrices = useAdminStore((state) => state.getEffectivePartPrices);

  // Local state
  const [markupInput, setMarkupInput] = useState(globalMarkupPercent);
  const [feeInput, setFeeInput] = useState(defaultAssemblyFee);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<ProductCategory | 'all'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleApplyMarkup = () => {
    bulkApplyMarkupToAll(markupInput, MOCK_HARDWARE_PARTS);
    showToast(`Markup ${markupInput}% berhasil diterapkan ke seluruh komponen.`);
  };

  const handleSaveAssemblyFee = () => {
    setDefaultAssemblyFee(feeInput);
    showToast(`Biaya rakit standar diperbarui menjadi ${formatIDR(feeInput)}.`);
  };

  const handlePartPriceChange = (
    partId: string,
    field: 'cost' | 'sell',
    newVal: number
  ) => {
    const current = priceOverrides[partId] || {
      costPrice: MOCK_HARDWARE_PARTS.find((p) => p.id === partId)?.costPrice || 0,
      sellPrice: MOCK_HARDWARE_PARTS.find((p) => p.id === partId)?.sellPrice || 0,
    };

    if (field === 'cost') {
      updatePartPrice(partId, newVal, current.sellPrice);
    } else {
      updatePartPrice(partId, current.costPrice, newVal);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const data = JSON.stringify(priceOverrides, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kss-pricing-overrides-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File JSON berhasil diekspor.');
  };

  // Filter Parts
  const filteredParts = useMemo(() => {
    return MOCK_HARDWARE_PARTS.filter((part) => {
      if (selectedCat !== 'all' && part.category !== selectedCat) return false;
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
  }, [selectedCat, searchQuery]);

  // Overall Statistics
  const stats = useMemo(() => {
    let totalCost = 0;
    let totalSell = 0;

    for (const part of MOCK_HARDWARE_PARTS) {
      const prices = getEffectivePartPrices(part);
      totalCost += prices.costPrice;
      totalSell += prices.sellPrice;
    }

    const totalProfit = totalSell - totalCost;
    const avgMargin = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    return { totalCost, totalSell, totalProfit, avgMargin };
  }, [priceOverrides, getEffectivePartPrices]);

  if (!isHydrated) return null;

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
        <span className="text-zinc-900 dark:text-zinc-100 font-semibold">Admin Portal Pricing</span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-xs bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-red-600 dark:text-red-400 uppercase">
                Owner Only • Confidential
              </span>
              <span className="text-xs font-mono text-zinc-400">Database Margin &amp; Cost Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Admin Spreadsheet: Modal, Markup &amp; Harga Rakitan
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Atur harga modal riil distributor (`costPrice`), tetapkan markup margin toko, dan kelola harga bundel rakitan secara langsung. Data ini dirahasiakan dan tidak pernah bocor ke antarmuka publik.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin/quotes"
              className="flex items-center gap-1.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-bold transition-colors shadow-xs"
            >
              <span>Quotation Maker</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-sm border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs font-mono">
          <span className="text-[11px] text-zinc-400 uppercase">Rata-rata Margin Markup:</span>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {stats.avgMargin.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-sm border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs font-mono">
          <span className="text-[11px] text-zinc-400 uppercase">Akumulasi Modal ({MOCK_HARDWARE_PARTS.length} SKU):</span>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1 tabular-nums">
            {formatIDR(stats.totalCost)}
          </div>
        </div>
        <div className="rounded-sm border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs font-mono">
          <span className="text-[11px] text-zinc-400 uppercase">Akumulasi Nilai Jual:</span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {formatIDR(stats.totalSell)}
          </div>
        </div>
        <div className="rounded-sm border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs font-mono">
          <span className="text-[11px] text-zinc-400 uppercase">Estimasi Laba Kotor Toko:</span>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1 tabular-nums">
            {formatIDR(stats.totalProfit)}
          </div>
        </div>
      </div>

      {/* Global Control Toolbar */}
      <div className="rounded-sm border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/80 mb-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Form Quick Markup Massal */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Set Markup Global (%):</span>
            <input
              type="number"
              min={0}
              max={100}
              value={markupInput}
              onChange={(e) => setMarkupInput(Number(e.target.value))}
              className="w-20 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1 text-xs font-mono text-zinc-900 dark:text-zinc-100"
            />
            <button
              onClick={handleApplyMarkup}
              className="px-3 py-1 rounded-sm bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
            >
              Terapkan ke Semua Part
            </button>
          </div>

          {/* Form Biaya Rakit Standar */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Biaya Rakit Standar (IDR):</span>
            <input
              type="number"
              step={25000}
              value={feeInput}
              onChange={(e) => setFeeInput(Number(e.target.value))}
              className="w-32 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1 text-xs font-mono text-zinc-900 dark:text-zinc-100"
            />
            <button
              onClick={handleSaveAssemblyFee}
              className="px-3 py-1 rounded-sm bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold transition-colors"
            >
              Simpan Biaya
            </button>
          </div>

          {/* Export / Reset Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => {
                if (confirm('Reset seluruh modifikasi harga kembali ke default mock-data?')) {
                  resetPriceOverrides();
                  showToast('Modifikasi harga berhasil direset.');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari SKU atau nama komponen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value as ProductCategory | 'all')}
            className="rounded-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
          >
            <option value="all">Semua Kategori</option>
            <option value="cpu">CPU</option>
            <option value="motherboard">Motherboard</option>
            <option value="gpu">GPU</option>
            <option value="ram">RAM</option>
            <option value="ssd">SSD</option>
            <option value="psu">PSU</option>
            <option value="case">Case</option>
            <option value="cooler">Cooler</option>
          </select>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="rounded-sm border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-mono text-[11px] uppercase">
              <th className="py-2.5 px-3">SKU &amp; Brand</th>
              <th className="py-2.5 px-3">Nama Produk</th>
              <th className="py-2.5 px-3 text-right">Modal Distributor (`costPrice`)</th>
              <th className="py-2.5 px-3 text-right">Harga Jual Rakitan (`sellPrice`)</th>
              <th className="py-2.5 px-3 text-right">Estimasi Profit</th>
              <th className="py-2.5 px-3 text-center">Margin (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-mono">
            {filteredParts.map((part) => {
              const prices = getEffectivePartPrices(part);
              const isModified = !!priceOverrides[part.id];

              return (
                <tr
                  key={part.id}
                  className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                    isModified ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{part.sku}</span>
                    <span className="text-[10px] text-zinc-400">{part.brand}</span>
                  </td>

                  <td className="py-2 px-3 font-sans font-semibold text-zinc-900 dark:text-zinc-100 max-w-sm">
                    <div className="truncate">{part.name}</div>
                  </td>

                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <input
                      type="number"
                      step={10000}
                      value={prices.costPrice}
                      onChange={(e) => handlePartPriceChange(part.id, 'cost', Number(e.target.value))}
                      className="w-28 text-right rounded-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 tabular-nums focus:border-blue-600 focus:outline-none"
                    />
                  </td>

                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <input
                      type="number"
                      step={10000}
                      value={prices.sellPrice}
                      onChange={(e) => handlePartPriceChange(part.id, 'sell', Number(e.target.value))}
                      className="w-28 text-right rounded-xs border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 tabular-nums focus:border-blue-600 focus:outline-none"
                    />
                  </td>

                  <td className="py-2 px-3 text-right whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatIDR(prices.profit)}
                  </td>

                  <td className="py-2 px-3 text-center whitespace-nowrap tabular-nums">
                    <span
                      className={`px-1.5 py-0.5 rounded-xs text-[11px] font-bold ${
                        prices.marginPercent >= 15
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : prices.marginPercent >= 10
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {prices.marginPercent.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
