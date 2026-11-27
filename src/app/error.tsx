'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';
import { DEFAULT_WHATSAPP_PHONE } from '@/lib/format';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Biarkan terlihat di console produksi untuk korelasi dengan log server.
    console.error('[kss] render error', error);
  }, [error]);

  return (
    <div className="kss-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="mt-4 font-mono text-micro font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
        Gagal memuat
      </div>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        Halaman ini gagal dimuat
      </h1>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-zinc-600 dark:text-zinc-500">
        Data paket atau layanan tidak sempat termuat. Coba muat ulang halaman.
        Kalau masih gagal, tim KSS siap membantu lewat WhatsApp.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-micro text-zinc-500">
          Kode laporan: {error.digest}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={reset} className="kss-btn-primary h-10 px-4">
          <RefreshCw className="h-4 w-4" />
          <span>Coba Lagi</span>
        </button>
        <a
          href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-xs font-bold text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <MessageCircle className="h-4 w-4 text-emerald-500" />
          <span>Chat Teknisi</span>
        </a>
      </div>
    </div>
  );
}
