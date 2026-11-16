'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  ClipboardList,
  Search,
  CheckCircle2,
  Circle,
  Loader2,
  PhoneCall,
  Package,
  Wrench,
  CalendarClock,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { useHydrated } from '@/lib/useHydrated';
import { BuildOrderTracking } from '@/lib/types';
import { TRACKING_STAGES_ORDER, TRACKING_STAGE_LABELS, TECHNICIAN_WHATSAPP } from '@/lib/constants';
import { formatDateID } from '@/lib/utils';

const ORDER_TYPE_LABELS: Record<string, string> = {
  rakit_custom: 'Rakit PC Custom',
  rakit_paket: 'Rakit Paket Siap Pakai',
  servis: 'Servis & Perbaikan',
  cleaning: 'Deep Cleaning',
  upgrade: 'Upgrade Hardware',
};

function TrackingStatusContent({ trackings }: { trackings: BuildOrderTracking[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHydrated = useHydrated();

  const initialCode = (searchParams.get('code') ?? '').trim().toUpperCase();
  const [inputCode, setInputCode] = useState(searchParams.get('code') ?? '');
  const [searchedCode, setSearchedCode] = useState(initialCode);

  const tracking = useMemo(() => {
    if (!searchedCode) return undefined;
    return trackings.find((t) => t.trackingCode.toUpperCase() === searchedCode);
  }, [trackings, searchedCode]);

  const stages = useMemo(() => {
    if (!tracking) return TRACKING_STAGES_ORDER;
    const needsDiagnosis =
      ['servis', 'upgrade', 'cleaning'].includes(tracking.orderType) ||
      tracking.stageHistory.some((entry) => entry.stage === 'diagnosis');
    return TRACKING_STAGES_ORDER.filter((stage) => stage !== 'diagnosis' || needsDiagnosis);
  }, [tracking]);

  const currentStageIndex = tracking ? stages.indexOf(tracking.currentStage) : -1;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    setSearchedCode(clean);
    router.replace(clean ? `/cek-pesanan?code=${encodeURIComponent(clean)}` : '/cek-pesanan');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6 font-mono">
        <Link href="/" className="hover:text-blue-600">
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <span className="text-zinc-900 dark:text-zinc-100 font-semibold">Cek Pesanan</span>
      </nav>

      {/* Header */}
      <div className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
            Tracking Pengerjaan
          </span>
          <span className="text-xs font-mono text-zinc-400">TRK-KSS-XXX</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          Cek Status Rakit &amp; Servis PC Anda
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          Masukkan kode resi internal yang diberikan teknisi KSS Komputer untuk melihat progres pengerjaan
          secara real-time — dari verifikasi pembayaran sampai unit siap diambil.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={inputCode}
              onChange={(event) => setInputCode(event.target.value)}
              placeholder="Contoh: TRK-KSS-001"
              aria-label="Kode resi pengerjaan"
              className="w-full rounded-sm border border-zinc-300 bg-white py-2.5 pl-9 pr-3 font-mono text-xs uppercase tracking-wide text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold transition-colors"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Cek Status</span>
          </button>
        </form>
        <p className="mt-2 text-[11px] text-zinc-400 font-mono">
          Kode contoh untuk demo: TRK-KSS-001, TRK-KSS-002, TRK-KSS-003
        </p>
      </div>

      {/* Hasil */}
      {!isHydrated ? (
        <div className="rounded-sm border border-zinc-200 bg-white p-8 text-center text-xs text-zinc-400 font-mono dark:border-zinc-800 dark:bg-zinc-900/60">
          Memuat data pengerjaan...
        </div>
      ) : !searchedCode ? (
        <div className="rounded-sm border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <AlertCircle className="mx-auto h-6 w-6 text-zinc-400 mb-2" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Belum ada kode resi yang dicek. Masukkan kode resi di atas untuk melihat progres pengerjaan.
          </p>
        </div>
      ) : !tracking ? (
        <div className="rounded-sm border border-red-500/20 bg-red-500/5 p-6 dark:bg-red-500/10">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-red-700 dark:text-red-300">
                Kode resi tidak ditemukan
              </div>
              <p className="mt-1 text-xs text-red-600/80 dark:text-red-300/80">
                Kode <span className="font-mono font-bold">{searchedCode}</span> tidak terdaftar. Periksa
                kembali kode resi atau hubungi teknisi kami via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ringkasan Order */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Kode Resi
                </span>
                <span className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {tracking.trackingCode}
                </span>
              </div>

              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                {tracking.itemTitle}
              </h2>

              <div className="mt-3 flex flex-col gap-2 text-xs">
                <div className="flex items-start gap-2">
                  <Package className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {ORDER_TYPE_LABELS[tracking.orderType] ?? tracking.orderType}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Wrench className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-600 dark:text-zinc-400">{tracking.customerName}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarClock className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Estimasi selesai: {formatDateID(tracking.estimatedCompletion)}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Update terakhir: {formatDateID(tracking.updatedAt)}
                  </span>
                </div>
              </div>

              {tracking.adminNotes && (
                <div className="mt-4 rounded-sm border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Catatan Teknisi
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {tracking.adminNotes}
                  </p>
                </div>
              )}

              <a
                href={`https://wa.me/${TECHNICIAN_WHATSAPP}?text=${encodeURIComponent(
                  `Halo Teknisi KSS Komputer, saya ingin menanyakan progres pengerjaan dengan kode resi *${tracking.trackingCode}* (${tracking.itemTitle}). Terima kasih!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition-colors"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Hubungi Teknisi via WA</span>
              </a>
            </div>
          </div>

          {/* Stepper Pengerjaan */}
          <div className="lg:col-span-2 rounded-sm border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-4">
              Progres Pengerjaan
            </h3>

            <ol className="relative">
              {stages.map((stage, index) => {
                const entry = tracking.stageHistory.find((item) => item.stage === stage);
                const isDone = index < currentStageIndex;
                const isActive = index === currentStageIndex;
                const isPending = index > currentStageIndex;

                return (
                  <li key={stage} className="relative flex gap-3 pb-5 last:pb-0">
                    {/* Garis penghubung */}
                    {index < stages.length - 1 && (
                      <span
                        aria-hidden="true"
                        className={`absolute left-[9px] top-5 bottom-0 w-px ${
                          isDone ? 'bg-emerald-500/40' : 'bg-zinc-200 dark:bg-zinc-800'
                        }`}
                      />
                    )}

                    {/* Ikon status */}
                    <span className="relative z-10 flex h-[19px] w-[19px] shrink-0 items-center justify-center">
                      {isDone ? (
                        <CheckCircle2 className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" />
                      ) : isActive ? (
                        <Loader2 className="h-[18px] w-[18px] animate-spin text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Circle
                          className={`h-[18px] w-[18px] ${
                            isPending ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-400'
                          }`}
                        />
                      )}
                    </span>

                    {/* Konten stage */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            isDone
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : isActive
                                ? 'text-blue-700 dark:text-blue-400'
                                : 'text-zinc-400 dark:text-zinc-500'
                          }`}
                        >
                          {TRACKING_STAGE_LABELS[stage] ?? stage}
                        </span>
                        {isActive && (
                          <span className="rounded-sm border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-blue-600 dark:text-blue-400">
                            Sedang Dikerjakan
                          </span>
                        )}
                        {entry?.timestamp && (
                          <span className="font-mono text-[10px] text-zinc-400">
                            {formatDateID(entry.timestamp)}
                          </span>
                        )}
                      </div>
                      {entry?.notes && (
                        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CekPesananClient({ trackings }: { trackings: BuildOrderTracking[] }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-xs text-zinc-400 font-mono">
          Memuat halaman tracking...
        </div>
      }
    >
      <TrackingStatusContent trackings={trackings} />
    </Suspense>
  );
}
