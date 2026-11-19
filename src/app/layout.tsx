import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { RetailCartDrawer } from '@/components/cart/RetailCartDrawer';
import { CsAgent } from '@/components/cs/CsAgent';
import { JsonLd } from '@/components/seo/JsonLd';
import { getPublicHardwareParts } from '@/lib/server-catalog';
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

export const viewport: Viewport = {
  themeColor: '#ea580c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'KSS Komputer — System Integrator PC Rakitan & Hardware Eceran Jakarta',
  description:
    'Pusat PC rakitan jadi siap pakai (gaming, workstation, office), custom configurator kompatibilitas deterministik, konsultasi budget via WhatsApp, dan hardware eceran bergaransi resmi.',
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
    'simulasi rakitan pc',
    'pc gaming mangga dua',
    'konsultasi rakit pc whatsapp',
    'hardware eceran resmi',
    'pc workstation ryzen 7000',
  ],
  openGraph: {
    title: 'KSS Komputer — Paket PC Rakitan & Jasa Servis Jakarta',
    description:
      'Paket PC siap pakai dengan satu harga total, upgrade berbasis delta, dan layanan jasa komputer bergaransi.',
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
    title: 'KSS Komputer — Paket PC Rakitan & Jasa Servis Jakarta',
    description:
      'Paket PC siap pakai, upgrade terukur, dan jasa servis bergaransi di Mangga Dua Mall.',
    images: ['/images/tokopedia/banner-pc-store.webp'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchProducts = getPublicHardwareParts();

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans selection:bg-orange-600 selection:text-white pb-14 md:pb-0">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Suspense fallback={null}>
          <Navbar searchProducts={searchProducts} />
        </Suspense>
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
        <CartDrawer />
        <RetailCartDrawer />
        <CsAgent />
      </body>
    </html>
  );
}
