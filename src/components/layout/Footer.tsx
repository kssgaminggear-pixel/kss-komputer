import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DEFAULT_WHATSAPP_PHONE, DEFAULT_WHATSAPP_DISPLAY } from '@/lib/format';
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
  ArrowRight,
} from 'lucide-react';

export function Footer() {
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
    <footer className="border-t border-zinc-200 bg-zinc-50 text-zinc-600">
      {/* Value bar */}
      <div className="border-b border-zinc-200">
        <div className="kss-container grid grid-cols-2 gap-4 py-5 md:grid-cols-4">
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
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-orange-500/20 bg-orange-500/10">
                  <Icon className="h-4 w-4 text-orange-500" />
                </span>
                <div>
                  <div className="text-xs font-bold text-zinc-900">{item.title}</div>
                  <div className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
                    {item.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA band */}
      <div className="border-b border-zinc-200">
        <div className="kss-container flex flex-col items-start justify-between gap-3 py-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-black tracking-tight text-zinc-900">
              Butuh bantuan memilih spesifikasi?
            </div>
            <p className="text-xs text-zinc-500">
              Konsultasi gratis dengan teknisi KSS, tanpa harus langsung membeli.
            </p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Link href="/konsultasi" className="kss-btn-primary flex-1 sm:flex-none">
              Konsultasi Budget
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-zinc-800 sm:flex-none"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main columns */}
      <div className="kss-container py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Image
                src="/images/brand/kss-logo-light.png"
                width={32}
                height={32}
                alt="Logo KSS Komputer"
                className="h-8 w-8 rounded-sm"
              />
              <span className="font-mono text-sm font-black tracking-tight text-zinc-900">
                KSS KOMPUTER
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500">
              Custom PC system integrator dan pusat layanan jasa komputer. Paket
              rakitan siap pakai, upgrade terukur, dan servis bergaransi.
            </p>

            <div className="mt-1 flex flex-col gap-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
                <span>Mangga Dua Mall Lt. 4 Blok A No. 12-14, Jakarta Pusat</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                <span>Senin - Sabtu: 09.00 - 18.00 WIB</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                <a
                  href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`}
                  className="font-mono font-medium text-emerald-700 hover:underline"
                >
                  WhatsApp: {DEFAULT_WHATSAPP_DISPLAY}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                <span className="font-mono">sales@ksskomputer.id</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-zinc-900">
              Navigasi Cepat
            </h3>
            <ul className="flex flex-col gap-2 text-xs">
              {[
                { href: '/jasa', label: 'Layanan Jasa & Servis' },
                { href: '/konsultasi', label: 'Konsultasi Budget' },
                { href: '/paket-rakitan', label: 'Paket PC Siap Pakai' },
                { href: '/cek-pesanan', label: 'Cek Status Pengerjaan' },
                { href: '/komponen', label: 'Katalog Komponen' },
                { href: '/aksesoris', label: 'Aksesoris & Gaming Gear' },
                { href: '/tentang-kami', label: 'Tentang KSS Komputer' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-orange-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-zinc-900">
              Distributor Resmi
            </h3>
            <div className="flex flex-col gap-2 text-xs">
              {distributors.map((dist) => (
                <div key={dist.name} className="border-b border-zinc-200/70 pb-1.5">
                  <div className="text-[11px] font-semibold text-zinc-700">
                    {dist.name}
                  </div>
                  <div className="font-mono text-[10px] text-zinc-500">{dist.brands}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-zinc-900">
              Kebijakan &amp; Pembayaran
            </h3>
            <ul className="flex flex-col gap-2 text-xs">
              {[
                'Garansi 1 to 1 Replacement (7 Hari Pertama)',
                'Bebas biaya rakitan dan instalasi OS trial',
                'Dukungan faktur pajak untuk pengadaan kantor',
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <div className="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-700">
                Metode Pembayaran
              </div>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {['BCA', 'Mandiri', 'QRIS', 'Tokopedia', 'Shopee'].map((pay) => (
                  <span
                    key={pay}
                    className="rounded-sm border border-zinc-200 bg-white px-1.5 py-0.5 text-zinc-600"
                  >
                    {pay}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-white px-4 py-3">
        <div className="kss-container flex flex-col items-center justify-between gap-2 text-[11px] text-zinc-500 sm:flex-row">
          <div className="text-center font-mono sm:text-left">
            &copy; {currentYear} KSS Komputer Jakarta. Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span>Garansi Resmi</span>
            <span>&bull;</span>
            <span>Faktur Pajak</span>
            <span>&bull;</span>
            <span className="font-semibold text-emerald-700">Pricelist Terupdate</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
