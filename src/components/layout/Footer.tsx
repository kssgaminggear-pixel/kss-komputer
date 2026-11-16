import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  Wrench,
  Headphones,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  Mail,
} from 'lucide-react';

export function Footer() {
  // Tahun rilis konten — diperbarui manual agar tetap kompatibel dengan `cacheComponents`
  const currentYear = 2026;

  const distributors = [
    { name: 'PT Astrindo Senayasa', brands: 'ASUS, Intel, ASRock' },
    { name: 'PT EMD Pratama', brands: 'AMD, Sapphire' },
    { name: 'PT Nusantara Jaya Teknologi (NJT)', brands: 'Gigabyte, Kingston' },
    { name: 'PT WPG Indonesia', brands: 'Corsair, MSI, Lexar' },
    { name: 'PT Synnex Metrodata', brands: 'Samsung, HP, Dell' },
    { name: 'PT Cahaya Distribusi', brands: 'Thermalright, Tecware' },
  ];

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      {/* 1. HIGHLIGHT SERVICE & VALUE BAR */}
      <div className="border-b border-zinc-200 bg-white py-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="kss-container grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: '100% Garansi Resmi',
              text: 'Semua part bersegel distributor resmi Indonesia.',
            },
            {
              icon: Wrench,
              title: 'Quality Assembly',
              text: 'Cable management rapi, stress test, dan update BIOS.',
            },
            {
              icon: Truck,
              title: 'Packing Aman',
              text: 'Packing kayu dan asuransi pengiriman Nusantara.',
            },
            {
              icon: Headphones,
              title: 'Konsultasi & RMA',
              text: 'Bantuan klaim garansi langsung di Mangga Dua.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10">
                  <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </span>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
                    {item.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CTA BAND */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="kss-container flex flex-col items-start justify-between gap-3 py-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Butuh bantuan memilih spesifikasi?
            </div>
            <p className="text-xs text-zinc-500">
              Konsultasi gratis dengan teknisi KSS, tanpa harus langsung membeli.
            </p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Link href="/konsultasi" className="kss-btn-primary flex-1 sm:flex-none">
              Konsultasi Budget
            </Link>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="kss-btn-outline flex-1 sm:flex-none"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* 3. MAIN FOOTER CONTENT */}
      <div className="kss-container py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Kolom 1: Profil Toko & Kontak */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 font-mono text-xs font-bold tracking-wider text-white">
                KSS
              </div>
              <span className="font-mono text-sm font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                KSS KOMPUTER
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500">
              Toko retail &amp; perakitan komputer spesialis gaming, workstation, dan render
              profesional dengan harga transparan dan kompetitif.
            </p>

            <div className="mt-1 flex flex-col gap-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span>
                  Mangga Dua Mall Lt. 4 Blok A No. 12-14, Sawah Besar, Jakarta Pusat 10730
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span>Senin - Sabtu: 10.00 - 18.00 WIB (Minggu Libur)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <a
                  href="https://wa.me/6281234567890"
                  className="font-mono font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  WhatsApp: 0812-3456-7890
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span className="font-mono">sales@ksskomputer.id</span>
              </div>
            </div>
          </div>

          {/* Kolom 2: Navigasi Sistem */}
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Navigasi Cepat
            </h3>
            <ul className="flex flex-col gap-2 text-xs">
              {[
                { href: '/jasa', label: 'Layanan Jasa & Servis' },
                { href: '/konsultasi', label: 'Konsultasi Budget & Kebutuhan' },
                { href: '/simulasi', label: 'Simulasi Rakitan PC Interaktif' },
                { href: '/paket-rakitan', label: 'Paket PC Siap Pakai (Prebuilt)' },
                { href: '/cek-pesanan', label: 'Cek Status Pengerjaan' },
                { href: '/komponen', label: 'Katalog Komponen Eceran' },
                { href: '/aksesoris', label: 'Aksesoris & Gaming Gear' },
                { href: '/tentang-kami', label: 'Tentang KSS Komputer' },
                { href: '/admin/pricing', label: 'Portal Admin & Update Pricelist' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Partner Distributor Resmi */}
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Distributor Resmi
            </h3>
            <div className="flex flex-col gap-2 text-xs">
              {distributors.map((dist) => (
                <div
                  key={dist.name}
                  className="border-b border-zinc-200/60 pb-1.5 dark:border-zinc-800/60"
                >
                  <div className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                    {dist.name}
                  </div>
                  <div className="font-mono text-[10px] text-zinc-500">{dist.brands}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Kolom 4: Syarat Garansi & Pembayaran */}
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Kebijakan &amp; Pembayaran
            </h3>
            <ul className="flex flex-col gap-2 text-xs">
              {[
                'Garansi 1 to 1 Replacement (7 Hari Pertama Toko)',
                'Bebas biaya rakitan dan instalasi OS trial',
                'Dukungan faktur pajak untuk pengadaan kantor (PT/CV)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <div className="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Metode Pembayaran
              </div>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {['BCA Transfer', 'Mandiri', 'QRIS', 'Tokopedia', 'Shopee'].map((pay) => (
                  <span
                    key={pay}
                    className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    {pay}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SUB-FOOTER BOTTOM BAR */}
      <div className="border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="kss-container flex flex-col items-center justify-between gap-2 text-[11px] text-zinc-500 sm:flex-row">
          <div className="text-center font-mono sm:text-left">
            &copy; {currentYear} KSS Komputer Jakarta. Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span>Garansi Resmi</span>
            <span>&bull;</span>
            <span>Faktur Pajak</span>
            <span>&bull;</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Pricelist Terupdate
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
