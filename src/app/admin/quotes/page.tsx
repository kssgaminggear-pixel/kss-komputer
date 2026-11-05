'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Send,
  Printer,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  PhoneCall,
  SlidersHorizontal,
  DollarSign,
  Copy,
} from 'lucide-react';
import { useQuoteStore } from '@/store/useQuoteStore';
import { MOCK_HARDWARE_PARTS } from '@/lib/mock-data';
import { ProductCategory, HardwarePart, UsageNeedTag } from '@/lib/types';
import { formatIDR, DEFAULT_WHATSAPP_PHONE } from '@/lib/format';
import { useHydrated } from '@/lib/useHydrated';

const ESSENTIAL_SLOTS: { category: ProductCategory; label: string }[] = [
  { category: 'cpu', label: 'Processor (CPU)' },
  { category: 'motherboard', label: 'Motherboard' },
  { category: 'cooler', label: 'Cooler CPU' },
  { category: 'ram', label: 'Memory (RAM)' },
  { category: 'gpu', label: 'VGA / Kartu Grafis' },
  { category: 'ssd', label: 'Storage (SSD NVMe)' },
  { category: 'psu', label: 'Power Supply (PSU)' },
  { category: 'case', label: 'Casing PC' },
];

export default function AdminQuotesPage() {
  const isHydrated = useHydrated();
  const quotes = useQuoteStore((state) => state.quotes);
  const createQuote = useQuoteStore((state) => state.createQuote);
  const deleteQuote = useQuoteStore((state) => state.deleteQuote);
  const updateQuoteStatus = useQuoteStore((state) => state.updateQuoteStatus);

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [custName, setCustName] = useState('');
  const [custWa, setCustWa] = useState('');
  const [budget, setBudget] = useState(12000000);
  const [usageNeed, setUsageNeed] = useState<UsageNeedTag>('gaming');
  const [notes, setNotes] = useState('');
  const [selectedParts, setSelectedParts] = useState<Record<ProductCategory, string>>({
    cpu: 'cpu-r5-7500f',
    motherboard: 'mobo-b650m-hdv',
    cooler: 'cooler-ag400',
    ram: 'ram-ddr5-32-6000',
    gpu: 'gpu-rtx-4060',
    ssd: 'ssd-lexar-nm790-1tb',
    psu: 'psu-corsair-cx650',
    case: 'case-paradox-cube',
  } as Record<ProductCategory, string>);

  const [assemblyFee, setAssemblyFee] = useState(150000);
  const [customFinalPrice, setCustomFinalPrice] = useState<number | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Hitung modal asli toko untuk komponen yang dipilih
  const totalCost = Object.entries(selectedParts).reduce((sum, [, partId]) => {
    const part = MOCK_HARDWARE_PARTS.find((p) => p.id === partId);
    return sum + (part?.costPrice || 0);
  }, 0);

  // Hitung harga normal bermarkup
  const normalSellPrice = Object.entries(selectedParts).reduce((sum, [, partId]) => {
    const part = MOCK_HARDWARE_PARTS.find((p) => p.id === partId);
    return sum + (part?.sellPrice || 0);
  }, 0) + assemblyFee;

  const finalPrice = customFinalPrice !== null ? customFinalPrice : normalSellPrice;
  const netProfit = finalPrice - totalCost;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const partsList = Object.entries(selectedParts).map(([cat, partId]) => {
      const part = MOCK_HARDWARE_PARTS.find((p) => p.id === partId);
      return {
        category: cat as ProductCategory,
        partId,
        name: part?.name || 'Komponen Ready',
        quantity: 1,
        wattage: part?.wattage || 0,
      };
    });

    const totalWattage = partsList.reduce((acc, p) => acc + (p.wattage || 0), 0) + 30;
    const recommendedPsuWatt = Math.round((totalWattage * 1.35) / 50) * 50;

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 10);

    const newQ = createQuote({
      customerName: custName.trim(),
      customerWa: custWa.trim(),
      budget,
      usageNeed,
      selectedParts: partsList,
      assemblyFee,
      finalBundlePrice: finalPrice,
      totalWattage,
      recommendedPsuWatt,
      notes: notes.trim() || undefined,
      validUntil: validUntilDate.toISOString().split('T')[0],
    });

    setIsCreating(false);
    showToast(`Surat Penawaran ${newQ.quoteCode} berhasil dibuat!`);
  };

  const handleSendWA = (quote: typeof quotes[0]) => {
    const cleanPhone = quote.customerWa.replace(/[^0-9]/g, '');
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ksskomputer.com';
    const quoteUrl = `${origin}/penawaran/${quote.quoteCode}`;

    const lines: string[] = [
      `*SURAT PENAWARAN RESMI PC RAKITAN — KSS KOMPUTER*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Halo Kak *${quote.customerName}*, terima kasih telah berkonsultasi dengan teknisi kami.`,
      `\nBerikut kami lampirkan dokumen spesifikasi dan penawaran resmi sesuai budget Anda:`,
      `\n📄 *Kode Penawaran:* ${quote.quoteCode}`,
      `💰 *Total Harga Paket:* ${formatIDR(quote.finalBundlePrice)} (Sudah termasuk rakit & test)`,
      `⏳ *Masa Berlaku:* Hingga ${quote.validUntil}`,
      `\n👉 *Lihat Rincian Spek & Cetak Dokumen:*`,
      quoteUrl,
      `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Semua part 100% baru bergaransi resmi distributor. Mohon konfirmasi jika ada komponen yang ingin disesuaikan kembali. Terima kasih!`,
    ];

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    updateQuoteStatus(quote.id, 'sent');
  };

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
        <Link href="/admin/pricing" className="hover:text-blue-600">Admin Portal</Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <span className="text-zinc-900 dark:text-zinc-100 font-semibold">WA Consultation Quotation Maker</span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                Admin Quotation Generator
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {quotes.length} Dokumen Penawaran
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Generator Surat Penawaran Konsultasi WhatsApp
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Ketika konsumen meminta rakitan di WhatsApp dengan budget tertentu, buatkan penawaran resmi di sini. Anda dapat melihat modal riil toko dan menentukan harga paket final, lalu kirim link penawaran resmi langsung ke WA konsumen.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 rounded-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold transition-colors shadow-xs shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>{isCreating ? 'Tutup Form' : '+ Buat Penawaran Baru'}</span>
          </button>
        </div>
      </div>

      {/* Form Pembuatan Penawaran Baru */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="rounded-sm border border-blue-500/30 bg-blue-500/5 p-6 mb-8 space-y-6 dark:bg-blue-950/10"
        >
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span>Formulir Racikan Surat Penawaran Konsumen</span>
            </h2>
            <span className="text-xs font-mono text-blue-600 font-bold">Auto Code Generated</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Nama Konsumen
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Bima Satria"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                No. WhatsApp Konsumen
              </label>
              <input
                type="text"
                required
                placeholder="0812xxxxxxxx"
                value={custWa}
                onChange={(e) => setCustWa(e.target.value)}
                className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Budget Target Konsumen
              </label>
              <input
                type="number"
                step={500000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Slot Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Pilih Komponen Racikan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ESSENTIAL_SLOTS.map((slot) => {
                const candidates = MOCK_HARDWARE_PARTS.filter((p) => p.category === slot.category);
                return (
                  <div key={slot.category} className="space-y-1">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase">{slot.label}</span>
                    <select
                      value={selectedParts[slot.category] || ''}
                      onChange={(e) =>
                        setSelectedParts((prev) => ({ ...prev, [slot.category]: e.target.value }))
                      }
                      className="w-full rounded-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
                    >
                      {candidates.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kalkulasi Profit & Penetapan Harga Final */}
          <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            <div className="font-mono text-xs">
              <span className="text-zinc-400 block">Total Modal Toko:</span>
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
                {formatIDR(totalCost)}
              </span>
            </div>

            <div className="font-mono text-xs">
              <span className="text-zinc-400 block">Harga Normal + Rakit:</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {formatIDR(normalSellPrice)}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-0.5">
                Harga Final Penawaran (IDR):
              </label>
              <input
                type="number"
                step={50000}
                value={finalPrice}
                onChange={(e) => setCustomFinalPrice(Number(e.target.value))}
                className="w-full rounded-sm border border-blue-500 bg-blue-50/20 dark:bg-blue-950/30 px-2 py-1 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums"
              />
            </div>

            <div className="font-mono text-xs">
              <span className="text-zinc-400 block">Estimasi Net Profit Toko:</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatIDR(netProfit)} (
                {totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-sm border border-zinc-300 dark:border-zinc-700 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-sm bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
            >
              Simpan &amp; Terbitkan Penawaran
            </button>
          </div>
        </form>
      )}

      {/* Tabel Riwayat Dokumen Penawaran */}
      <div className="rounded-sm border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-mono text-[11px] uppercase">
              <th className="py-2.5 px-3">Kode Penawaran</th>
              <th className="py-2.5 px-3">Nama Konsumen &amp; WA</th>
              <th className="py-2.5 px-3">Target Budget</th>
              <th className="py-2.5 px-3 text-right">Harga Paket Penawaran</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-center">Aksi Dokumen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-mono">
            {quotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="py-3 px-3 whitespace-nowrap">
                  <span className="font-bold text-blue-600 dark:text-blue-400 block">
                    {quote.quoteCode}
                  </span>
                  <span className="text-[10px] text-zinc-400">Dibuat: {quote.createdAt}</span>
                </td>

                <td className="py-3 px-3 font-sans whitespace-nowrap">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{quote.customerName}</div>
                  <div className="font-mono text-[11px] text-zinc-500">{quote.customerWa}</div>
                </td>

                <td className="py-3 px-3 whitespace-nowrap tabular-nums text-zinc-500">
                  {formatIDR(quote.budget)}
                </td>

                <td className="py-3 px-3 text-right whitespace-nowrap font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {formatIDR(quote.finalBundlePrice)}
                </td>

                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase ${
                      quote.status === 'accepted'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : quote.status === 'sent'
                        ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {quote.status}
                  </span>
                </td>

                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5 font-sans">
                    <button
                      type="button"
                      onClick={() => handleSendWA(quote)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors"
                      title="Kirim Link Penawaran Resmi via WhatsApp"
                    >
                      <Send className="h-3 w-3" />
                      <span>Kirim WA</span>
                    </button>

                    <Link
                      href={`/penawaran/${quote.quoteCode}`}
                      target="_blank"
                      className="p-1 rounded-sm border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      title="Buka Lembar Penawaran Resmi"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus surat penawaran ${quote.quoteCode}?`)) {
                          deleteQuote(quote.id);
                          showToast('Penawaran dihapus.');
                        }
                      }}
                      className="p-1 rounded-sm text-zinc-400 hover:text-red-500"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
