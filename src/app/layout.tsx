import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { RetailCartDrawer } from '@/components/cart/RetailCartDrawer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'KSS Komputer — System Integrator PC Rakitan & Hardware Eceran Jakarta',
  description:
    'Pusat PC rakitan jadi siap pakai (gaming, workstation, office), custom configurator kompatibilitas deterministik, konsultasi budget via WhatsApp, dan hardware eceran bergaransi resmi.',
  manifest: '/manifest.json',
  icons: {
    icon: '/globe.svg',
    apple: '/globe.svg',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans selection:bg-blue-600 selection:text-white pb-14 md:pb-0">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
        <CartDrawer />
        <RetailCartDrawer />
      </body>
    </html>
  );
}
