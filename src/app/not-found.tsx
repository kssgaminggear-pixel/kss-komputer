import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="kss-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-zinc-200 bg-white text-orange-700">
        <Compass className="h-6 w-6" />
      </div>
      <div className="mt-4 font-mono text-micro font-bold uppercase tracking-wider text-orange-700">
        Error 404
      </div>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-zinc-600">
        Alamat yang Anda buka sudah dipindahkan atau tidak pernah ada. Paket PC,
        layanan jasa, dan katalog komponen tetap bisa diakses dari beranda.
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link href="/" className="kss-btn-primary h-10 px-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <Link
          href="/paket-rakitan"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-xs font-bold text-zinc-800 transition-colors hover:bg-zinc-100"
        >
          Lihat Paket Rakitan
        </Link>
      </div>
    </div>
  );
}
