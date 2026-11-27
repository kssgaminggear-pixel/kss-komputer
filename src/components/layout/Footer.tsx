import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, MessageCircle } from 'lucide-react';
import { DEFAULT_WHATSAPP_PHONE, DEFAULT_WHATSAPP_DISPLAY } from '@/lib/format';
import { STORE_OPERATIONAL_HOURS } from '@/lib/constants';

const DISTRIBUTORS = [
  { name: 'PT Astrindo Senayasa', brands: 'ASUS, Intel, ASRock' },
  { name: 'PT EMD Pratama', brands: 'AMD, Sapphire' },
  { name: 'PT Nusantara Jaya Teknologi (NJT)', brands: 'Gigabyte, Kingston' },
  { name: 'PT WPG Indonesia', brands: 'Corsair, MSI, Lexar' },
  { name: 'PT Synnex Metrodata', brands: 'Samsung, HP, Dell' },
  { name: 'PT Cahaya Distribusi', brands: 'Thermalright, Tecware' },
];

const FOOTER_LINKS = [
  { href: '/jasa', label: 'Layanan jasa & servis' },
  { href: '/konsultasi', label: 'Konsultasi budget' },
  { href: '/paket-rakitan', label: 'Paket PC siap pakai' },
  { href: '/cek-pesanan', label: 'Cek status pengerjaan' },
  { href: '/komponen', label: 'Katalog komponen' },
  { href: '/aksesoris', label: 'Aksesoris & gaming gear' },
  { href: '/tentang-kami', label: 'Tentang KSS Komputer' },
];

const POLICIES = [
  'Garansi 1 to 1 replacement (7 hari pertama)',
  'Bebas biaya rakitan dan instalasi OS trial',
  'Dukungan faktur pajak untuk pengadaan kantor',
];

export function Footer() {
  const currentYear = 2026;

  const contact: Array<[string, React.ReactNode]> = [
    ['Alamat', 'Mangga Dua Mall Lt. 4 Blok A No. 12-14, Jakarta Pusat'],
    ['Jam', STORE_OPERATIONAL_HOURS],
    [
      'WhatsApp',
      <a
        key="wa"
        href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`}
        className="kss-num transition-colors hover:text-white"
      >
        {DEFAULT_WHATSAPP_DISPLAY}
      </a>,
    ],
    [
      'Email',
      <a
        key="mail"
        href="mailto:sales@ksskomputer.id"
        className="kss-num transition-colors hover:text-white"
      >
        sales@ksskomputer.id
      </a>,
    ],
  ];

  return (
    <footer className="kss-chapter-dark">
      {/* CTA band */}
      <div className="border-b border-zinc-800">
        <div className="kss-container flex flex-col gap-6 py-12 lg:flex-row lg:items-end lg:justify-between lg:py-16">
          <div className="max-w-xl">
            <p className="kss-eyebrow text-orange-400">
              <span aria-hidden className="h-1.5 w-1.5 bg-orange-500" />
              Konsultasi gratis
            </p>
            <h2 className="mt-3 text-h2 text-balance text-zinc-50">
              Butuh bantuan memilih spesifikasi?
            </h2>
            <p className="mt-2 text-body text-zinc-400">
              Ngobrol dengan teknisi KSS, tanpa harus langsung membeli.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link href="/konsultasi" className="kss-btn-primary h-11 px-5 text-sm">
              Konsultasi budget
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <a
              href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="kss-btn-inverse h-11 px-5 text-sm"
            >
              <MessageCircle aria-hidden className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Kolom */}
      <div className="kss-container grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2.5">
            <span className="rounded-xs bg-white p-1">
              <Image
                src="/images/brand/kss-logo-light.png"
                width={28}
                height={28}
                alt=""
                className="h-7 w-7"
              />
            </span>
            <span className="text-[15px] font-bold tracking-[-0.02em] text-zinc-50">
              KSS Komputer
            </span>
          </div>
          <p className="mt-4 max-w-[40ch] text-body-sm text-zinc-400">
            System integrator PC rakitan &amp; pusat jasa komputer. Paket siap pakai, upgrade
            terukur, servis bergaransi.
          </p>
          <dl className="mt-6 space-y-3 text-body-sm">
            {contact.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[80px_1fr] gap-3">
                <dt className="kss-label pt-0.5 text-zinc-400">{k}</dt>
                <dd className="text-zinc-200">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-2">
          <h3 className="kss-label text-zinc-400">Navigasi</h3>
          <ul className="mt-4 space-y-2.5 text-body-sm">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-zinc-300 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="kss-label text-zinc-400">Distributor resmi</h3>
          <ul className="mt-4 divide-y divide-zinc-900 border-y border-zinc-900">
            {DISTRIBUTORS.map((d) => (
              <li key={d.name} className="py-2.5">
                <div className="text-body-sm text-zinc-200">{d.name}</div>
                <div className="font-mono text-micro text-zinc-400">{d.brands}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="kss-label text-zinc-400">Kebijakan</h3>
          <ul className="mt-4 space-y-2.5 text-body-sm text-zinc-300">
            {POLICIES.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <h3 className="kss-label mt-8 text-zinc-400">Pembayaran</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['BCA', 'Mandiri', 'QRIS', 'Tokopedia', 'Shopee'].map((p) => (
              <span key={p} className="kss-tag kss-tag-on-dark">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800">
        <div className="kss-container flex flex-col gap-2 py-4 font-mono text-micro text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {currentYear} KSS Komputer · Jakarta</span>
          <span>Garansi resmi · Faktur pajak</span>
        </div>
      </div>
    </footer>
  );
}
