'use client';

import React from 'react';
import {
  Printer,
  MessageCircle,
  CheckCircle2,
  Truck,
  FileText,
} from 'lucide-react';
import {
  formatIDR,
  formatWatt,
  DEFAULT_WHATSAPP_PHONE,
  DEFAULT_WHATSAPP_DISPLAY,
} from '@/lib/format';
import { PAYMENT_WA_LINE } from '@/lib/payment';
import { PaymentInfo } from '@/components/payment/PaymentInfo';
import type { PublicQuoteDTO } from '@/lib/sanitizer';

export default function CustomerQuotationContent({ quote }: { quote: PublicQuoteDTO }) {
  const handlePrint = () => {
    window.print();
  };

  const handleConfirmWA = () => {
    const cleanPhone = DEFAULT_WHATSAPP_PHONE.replace(/[^0-9]/g, '');
    const lines = [
      `*KONFIRMASI SURAT PENAWARAN — KSS KOMPUTER*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Halo Teknisi KSS Komputer, saya mau konfirmasi pemesanan rakitan sesuai dokumen penawaran:`,
      `\n📄 *No. Dokumen:* ${quote.quoteCode}`,
      `👤 *Nama Pemesan:* ${quote.customerName}`,
      `💰 *Total Harga Paket:* ${formatIDR(quote.finalBundlePrice)}`,
      `\nSaya setuju dengan rincian spesifikasi tersebut.`,
      PAYMENT_WA_LINE,
      `Terima kasih!`,
    ];

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Action Bar (Hidden on Print) */}
      <div className="rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-orange-700" />
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Surat Penawaran Resmi: {quote.quoteCode}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak PDF</span>
          </button>

          <button
            type="button"
            onClick={handleConfirmWA}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Konfirmasi Pesanan (WA)</span>
          </button>
        </div>
      </div>

      <div className="mb-6 print:hidden">
        <PaymentInfo />
      </div>

      {/* Dokumen Fisik Surat Penawaran (Print-Optimized) */}
      <div className="rounded-md border border-zinc-300 bg-white p-8 sm:p-10 shadow-sm print:border-none print:p-0 print:shadow-none text-zinc-900">
        {/* Kop Surat Resmi KSS Komputer */}
        <div className="border-b-2 border-zinc-900 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-orange-700 text-white font-mono font-bold text-xl tracking-wider">
              KSS
            </div>
            <div>
              <div className="font-mono text-xl font-bold tracking-tight text-zinc-950 uppercase">
                KSS KOMPUTER
              </div>
              <div className="text-xs text-zinc-600">
                Pusat System Integrator &amp; Perakitan PC di Mangga Dua
              </div>
              <div className="text-meta text-zinc-500 font-mono">
                Mangga Dua Orion Dusit Lt 1 No 8, Jakarta • WA: {DEFAULT_WHATSAPP_DISPLAY}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs">
            <span className="inline-block rounded-md bg-zinc-100 border border-zinc-300 px-2 py-0.5 text-micro font-bold uppercase text-zinc-800 mb-1">
              Dokumen Penawaran Resmi
            </span>
            <div className="font-bold text-sm text-zinc-900">{quote.quoteCode}</div>
            <div className="text-zinc-500 text-meta">Tanggal: {quote.createdAt}</div>
          </div>
        </div>

        {/* Info Konsumen & Validitas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 rounded-md bg-zinc-50 border border-zinc-200 text-xs font-mono">
          <div>
            <span className="text-micro text-zinc-500 uppercase block">Ditujukan Kepada:</span>
            <div className="font-bold text-sm text-zinc-900">{quote.customerName}</div>
            <div className="text-zinc-600">{quote.customerWa}</div>
            <div className="text-zinc-500 text-meta mt-1">Kebutuhan: {quote.usageNeed.toUpperCase()}</div>
          </div>

          <div className="sm:text-right">
            <span className="text-micro text-zinc-500 uppercase block">Masa Berlaku Dokumen:</span>
            <div className="font-bold text-zinc-900">Sampai {quote.validUntil}</div>
            <div className="text-zinc-600 text-meta mt-1">
              Estimasi Daya: {formatWatt(quote.totalWattage)} (Min. PSU {quote.recommendedPsuWatt}W)
            </div>
          </div>
        </div>

        {/* Tabel Komponen (ZERO PART-PRICE LEAK: Tanpa harga per part!) */}
        <div className="border border-zinc-300 rounded-md overflow-hidden mb-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-300 font-mono text-micro uppercase text-zinc-700">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3 w-36">Kategori</th>
                <th className="py-2.5 px-3">Rincian Komponen Terpasang</th>
                <th className="py-2.5 px-3 text-center w-24">Kuantitas</th>
                <th className="py-2.5 px-3 text-center w-36">Status Garansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-sans">
              {quote.selectedParts.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-50">
                  <td className="py-2.5 px-3 text-center font-mono text-zinc-500">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-mono text-micro uppercase text-zinc-600 font-bold">
                    {item.category}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900">
                    {item.name}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-zinc-800">
                    {item.quantity} Unit
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-meta text-emerald-700 font-semibold whitespace-nowrap">
                    Resmi Distributor
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Catatan Khusus */}
        {quote.notes && (
          <div className="mb-6 p-3 rounded-md bg-zinc-50 border border-zinc-200 text-xs">
            <span className="font-mono text-micro uppercase font-bold text-zinc-500 block mb-1">
              Catatan &amp; Rekomendasi Teknisi:
            </span>
            <p className="text-zinc-700 leading-relaxed">{quote.notes}</p>
          </div>
        )}

        {/* Rangkuman Harga Total Paket (Siap Pakai) */}
        <div className="border-t-2 border-zinc-900 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="space-y-1 text-xs text-zinc-600">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>Sudah Termasuk Jasa Rakit Rapi &amp; Pengujian Beban 24 Jam</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-orange-700" />
              <span>Gratis Pengemasan Kayu &amp; Asuransi Pengiriman Ekspedisi</span>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono">
            <span className="text-micro text-zinc-500 uppercase block">
              TOTAL HARGA PAKET PENAWARAN
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-zinc-950 tabular-nums">
              {formatIDR(quote.finalBundlePrice)}
            </div>
            <span className="text-meta text-zinc-500">(Nett / Tanpa Biaya Tersembunyi)</span>
          </div>
        </div>

        {/* Tanda Tangan & Konfirmasi */}
        <div className="pt-6 border-t border-zinc-200 grid grid-cols-2 gap-8 text-xs font-mono">
          <div>
            <div className="text-zinc-500 mb-12">Disiapkan Oleh:</div>
            <div className="font-bold text-zinc-900 border-t border-zinc-400 pt-1 w-44">
              Teknisi KSS Komputer
            </div>
            <div className="text-meta text-zinc-500">System Integrator Dept.</div>
          </div>

          <div className="text-right">
            <div className="text-zinc-500 mb-12">Disetujui Oleh:</div>
            <div className="font-bold text-zinc-900 border-t border-zinc-400 pt-1 w-44 ml-auto">
              {quote.customerName}
            </div>
            <div className="text-meta text-zinc-500">Customer</div>
          </div>
        </div>
      </div>
    </div>
  );
}

