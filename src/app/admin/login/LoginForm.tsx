'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AlertTriangle, KeyRound, Loader2, LockKeyhole } from 'lucide-react';

export function LoginForm({
  nextPath,
  configured,
}: {
  nextPath: string;
  configured: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setError(data.message || 'Gagal masuk. Periksa password Anda.');
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError('Tidak dapat menghubungi server. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="kss-container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-md border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="mb-5 flex items-center gap-2">
          <Image
            src="/images/brand/kss-logo-dark.png"
            alt="KSS Komputer"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Admin Portal
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">KSS Komputer</div>
          </div>
        </div>

        <h1 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          Masuk untuk kelola harga
        </h1>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
          Area ini memuat harga modal dan markup toko. Sesi berlaku 12 jam.
        </p>

        {!configured && (
          <div className="mt-4 flex items-start gap-2 rounded-sm border border-amber-300 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Admin belum dikonfigurasi. Set variabel <code className="font-mono">ADMIN_PASSWORD</code>{' '}
              dan <code className="font-mono">ADMIN_SESSION_SECRET</code> di server.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Password
            </span>
            <div className="relative">
              <LockKeyhole className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={!configured || loading}
                placeholder="••••••••••••"
                className="w-full rounded-sm border border-zinc-300 bg-zinc-50 py-2 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-orange-600 focus:outline-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </label>

          {error && (
            <p className="rounded-sm border border-red-200 bg-red-50 px-2.5 py-2 text-[11px] font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!configured || loading}
            className="kss-btn-primary h-10 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            <span>{loading ? 'Memeriksa…' : 'Masuk'}</span>
          </button>
        </form>

        <p className="mt-4 text-center font-mono text-[10px] text-zinc-400">
          KSS Komputer · akses terbatas
        </p>
      </div>
    </div>
  );
}
