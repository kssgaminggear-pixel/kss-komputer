import React from 'react';
import Link from 'next/link';
import {
  Clock,
  ShieldCheck,
  PhoneCall,
  ChevronRight,
  Check,
} from 'lucide-react';
import { getPublicServices } from '@/lib/server-catalog';
import { formatIDR, DEFAULT_WHATSAPP_PHONE } from '@/lib/format';

export default function JasaLayananPage() {
  const services = getPublicServices();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4 font-mono">
        <Link href="/" className="hover:text-blue-600">Beranda</Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <span className="text-zinc-900 dark:text-zinc-100 font-semibold">Layanan Jasa &amp; Maintenance</span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                Service &amp; Assembly Center
              </span>
              <span className="text-xs font-mono text-zinc-400">Harco Mangga Dua Mall</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Layanan Jasa Rakit, Maintenance &amp; Troubleshooting PC
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Dikerjakan oleh teknisi bersertifikasi dengan standar kebersihan antistatik, thermal paste grade antariksa (Thermal Grizzly / Arctic MX-4), dan pengujian kestabilan benchmark menyeluruh.
            </p>
          </div>

          <a
            href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=Halo%20Teknisi%20KSS%20Komputer,%20saya%20ingin%20konsultasi%20jadwal%20service/rakit%20PC`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold transition-colors shadow-xs shrink-0"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Chat Langsung Teknisi</span>
          </a>
        </div>
      </div>

      {/* Grid Layanan Jasa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="flex flex-col justify-between rounded-sm border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Durasi: {srv.duration}</span>
                </span>
                {srv.badge && (
                  <span className="rounded-xs bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400">
                    {srv.badge}
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {srv.title}
              </h2>

              <div className="font-mono text-xl font-black text-zinc-900 dark:text-zinc-100 mb-3 tabular-nums">
                {srv.price === 0 ? 'GRATIS (Konsultasi)' : formatIDR(srv.price)}
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                {srv.description}
              </p>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 mb-4">
                <div className="text-[11px] font-mono font-bold uppercase text-zinc-400 mb-2">
                  Cakupan Pekerjaan:
                </div>
                <ul className="space-y-1.5">
                  {srv.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2">
              <Link
                href={`/jasa/${srv.slug}`}
                className="flex items-center justify-center gap-1.5 rounded-sm border border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                <span>Lihat Detail</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}?text=${encodeURIComponent(
                  `Halo KSS Komputer, saya ingin booking layanan: *${srv.title}* (${formatIDR(srv.price)})`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-sm bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 py-2.5 text-xs font-bold transition-colors"
              >
                <PhoneCall className="h-3.5 w-3.5 text-emerald-500" />
                <span>Booking WA</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Jasa */}
      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span>Pertanyaan yang Sering Diajukan</span>
        </h2>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-sm border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
          {[
            {
              q: 'Apakah saya harus membeli komponen di KSS Komputer?',
              a: 'Tidak. Anda boleh membawa komponen sendiri. Kami tetap melakukan pengecekan kompatibilitas dan kondisi fisik sebelum perakitan.',
            },
            {
              q: 'Berapa lama pengerjaan rakit PC?',
              a: 'Rakit standar 1 - 3 hari kerja, tergantung antrean dan ketersediaan komponen. Paket premium 2 - 4 hari kerja karena cable management dan dokumentasi build.',
            },
            {
              q: 'Apakah ada garansi untuk jasa servis?',
              a: 'Ya. Pengerjaan jasa bergaransi toko. Jika keluhan yang sama muncul kembali dalam masa garansi, pengecekan ulang tidak dikenakan biaya jasa.',
            },
            {
              q: 'Bisakah booking di luar jam operasional?',
              a: 'Jadwal normal Senin - Sabtu, 09:00 - 18:00 WIB. Untuk kebutuhan mendesak, silakan chat teknisi via WhatsApp terlebih dahulu.',
            },
            {
              q: 'Apakah data saya aman saat instalasi ulang?',
              a: 'Backup data tersedia sebagai opsi tambahan. Tanpa backup, proses fresh install akan menghapus data pada partisi sistem.',
            },
          ].map((faq) => (
            <details key={faq.q} className="group px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <span>{faq.q}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
        <div className="mt-3 text-center text-[11px] text-zinc-500">
          Butuh layanan lain?{' '}
          <a
            href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            Hubungi teknisi kami langsung via WhatsApp.
          </a>
        </div>
      </section>

      {/* Standar Prosedur Operasional (SOP) Teknisi KSS */}
      <div className="rounded-sm border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h3 className="text-sm font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span>Standar Mutu Layanan Teknisi KSS Komputer</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="p-3 bg-white dark:bg-zinc-950 rounded-sm border border-zinc-200 dark:border-zinc-800">
            <div className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">1. Anti-Static Handling</div>
            <p className="text-[11px] leading-relaxed">
              Peralatan antistatik digunakan untuk melindungi motherboard dan prosesor dari lonjakan listrik statis yang tidak kasat mata.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-zinc-950 rounded-sm border border-zinc-200 dark:border-zinc-800">
            <div className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">2. Thermal Paste Berlisensi</div>
            <p className="text-[11px] leading-relaxed">
              Menggunakan pasta termal resmi Thermal Grizzly Kryonaut atau Arctic MX-4 dengan konduktivitas panas di atas 8.5 W/mK.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-zinc-950 rounded-sm border border-zinc-200 dark:border-zinc-800">
            <div className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">3. Laporan Uji Suhu &amp; Beban</div>
            <p className="text-[11px] leading-relaxed">
              Setelah pengerjaan, unit melalui pengujian Cinebench &amp; Furmark dengan dokumentasi suhu idle dan full load sebelum diserahkan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
