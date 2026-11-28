import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { RetailCartDrawer } from '@/components/cart/RetailCartDrawer';
import { CsAgent } from '@/components/cs/CsAgent';
import { JsonLd } from '@/components/seo/JsonLd';
import { getMarketplaceEtalase, getSearchEntries } from '@/lib/marketplace/server';
import { getPaketItems } from '@/lib/catalog/server';
import { getPublicServices } from '@/lib/server-catalog';
import { SITE_URL } from '@/lib/constants';
import { organizationSchema, websiteSchema } from '@/lib/seo';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Huruf judul (h1/h2). Variabel, jadi cukup satu berkas.
const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#141414',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Servis, Rakit & Upgrade PC di Mangga Dua Jakarta — KSS Komputer',
  description:
    'Jasa servis, rakit, cleaning, dan upgrade PC di Mangga Dua Jakarta. Paket PC siap pakai dengan satu harga total, plus toko komponen dan aksesori.',
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/icons/kss-192.png',
    apple: '/icons/kss-apple.png',
  },
  keywords: [
    'rakit pc jakarta',
    'kss komputer',
    'rakit pc custom whatsapp',
    'pc gaming mangga dua',
    'konsultasi rakit pc whatsapp',
    'servis komputer mangga dua',
    'pc workstation ryzen 7000',
  ],
  openGraph: {
    title: 'KSS Komputer — Servis, Rakit & Upgrade PC di Jakarta',
    description:
      'Paket PC siap pakai dengan satu harga total, pilihan upgrade, dan layanan jasa komputer bergaransi.',
    images: [
      {
        url: '/images/tokopedia/banner-pc-store.webp',
        width: 700,
        height: 600,
        alt: 'Etalase PC dan gaming gear KSS Komputer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KSS Komputer — Servis, Rakit & Upgrade PC di Jakarta',
    description:
      'Paket PC siap pakai, upgrade terukur, dan jasa servis bergaransi di Mangga Dua, Jakarta.',
    images: ['/images/tokopedia/banner-pc-store.webp'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchEntries = getSearchEntries();
  const paketEntries = getPaketItems().map((item) => ({ slug: item.slug, name: item.name, specs: item.specs.join(' · ') }));
  const serviceEntries = getPublicServices()
    .filter((service) => service.isActive)
    .map((service) => ({ slug: service.slug, name: service.title }));
  const serviceLinks = [
    ...serviceEntries.map((service) => ({ href: `/jasa/${service.slug}`, label: service.name })),
    { href: '/jasa', label: 'Semua layanan' },
    { href: '/konsultasi', label: 'Konsultasi gratis' },
  ];
  const shopLinks = [
    { href: '/paket-rakitan', label: 'Paket PC siap pakai' },
    ...[...getMarketplaceEtalase()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((shelf) => ({ href: `/toko/etalase/${shelf.slug}`, label: shelf.name })),
    { href: '/toko', label: 'Semua produk' },
  ];

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-zinc-900 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <a
          href="#konten"
          className="sr-only rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60]"
        >
          Lewati ke konten
        </a>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Suspense fallback={null}>
          <Navbar
            searchEntries={searchEntries}
            paketEntries={paketEntries}
            serviceEntries={serviceEntries}
            serviceLinks={serviceLinks}
            shopLinks={shopLinks}
          />
        </Suspense>
        <main id="konten" tabIndex={-1} className="flex-1 w-full focus:outline-none">{children}</main>
        <Footer />
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
        <RetailCartDrawer />
        <CsAgent />
      </body>
    </html>
  );
}
