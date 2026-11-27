'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  PcCase,
  Layers,
  Wrench,
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
  ArrowUpRight,
  Headphones,
  ClipboardList,
  MessageSquareText,
  MessageCircle,
  Building2,
  MapPin,
} from 'lucide-react';
import { useRetailCartStore } from '@/store/useRetailCartStore';
import {
  TOKOPEDIA_OFFICIAL_STORE_URL,
  DEFAULT_WHATSAPP_PHONE,
  DEFAULT_WHATSAPP_DISPLAY,
} from '@/lib/format';
import { CommandSearchModal } from '@/components/layout/CommandSearchModal';
import { useHydrated } from '@/lib/useHydrated';
import type { PublicHardwarePart } from '@/lib/types';

export interface NavbarProps {
  searchProducts: PublicHardwarePart[];
}

export function Navbar({ searchProducts }: NavbarProps) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMounted = useHydrated();

  // Reset mobile menu saat pathname berubah
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  const retailCartCount = useRetailCartStore((state) => state.getTotalItemsCount());
  const openRetailCart = useRetailCartStore((state) => state.openCart);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { href: '/jasa', label: 'Jasa & Servis', icon: Wrench },
    { href: '/paket-rakitan', label: 'Paket Siap Pakai', icon: PcCase },
    { href: '/cek-pesanan', label: 'Cek Pesanan', icon: ClipboardList },
    { href: '/komponen', label: 'Komponen', icon: Layers },
    { href: '/aksesoris', label: 'Aksesoris', icon: Headphones },
    { href: '/konsultasi', label: 'Konsultasi', icon: MessageSquareText, desktopHidden: true },
    { href: '/tentang-kami', label: 'Tentang Kami', icon: Building2, desktopHidden: true },
  ];

  const isActiveLink = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <>
      {/* Top bar: tidak sticky */}
      <div className="hidden bg-zinc-950 text-zinc-400 sm:block">
        <div className="kss-container flex h-8 items-center justify-between font-mono text-micro">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-zinc-200">
              <MapPin aria-hidden className="h-3 w-3 text-orange-500" />
              Mangga Dua Mall, Jakarta
            </span>
            <span className="hidden lg:inline">Sen–Sab · 09.00–18.00 WIB</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden md:inline">Garansi resmi distributor</span>
            <a
              href={TOKOPEDIA_OFFICIAL_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-zinc-200 transition-colors hover:text-white"
            >
              <span aria-hidden className="h-1.5 w-1.5 bg-tokopedia-brand" />
              Tokopedia Official
              <ArrowUpRight aria-hidden className="h-3 w-3" />
            </a>
            <a
              href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tabular-nums text-zinc-200 transition-colors hover:text-white"
            >
              WA {DEFAULT_WHATSAPP_DISPLAY}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
        <div className="kss-container flex h-14 items-center gap-4 xl:gap-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label="KSS Komputer — Beranda"
          >
            <Image
              src="/images/brand/kss-logo-light.png"
              width={32}
              height={32}
              alt=""
              className="h-8 w-8 rounded-xs"
              priority
            />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-[15px] font-bold tracking-[-0.02em] text-zinc-950">
                KSS Komputer
              </span>
              <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-zinc-500">
                PC Builder · Mangga Dua
              </span>
            </span>
          </Link>

          <nav aria-label="Navigasi utama" className="hidden h-full items-stretch lg:flex">
            {navLinks
              .filter((item) => !('desktopHidden' in item && item.desktopHidden))
              .map((item) => {
                const active = isActiveLink(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center whitespace-nowrap px-3 text-[13px] font-medium transition-colors duration-150 ${
                      active ? 'text-zinc-950' : 'text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span
                        aria-hidden
                        className="absolute inset-x-3 -bottom-px h-0.5 bg-orange-600"
                      />
                    )}
                  </Link>
                );
              })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Cari (Ctrl+K)"
              className="flex h-9 w-9 items-center justify-center gap-2 rounded-sm border border-zinc-300 bg-white text-zinc-500 transition-colors hover:border-zinc-900 hover:text-zinc-900 xl:w-60 xl:justify-between xl:px-3"
            >
              <span className="flex items-center gap-2">
                <Search aria-hidden className="h-4 w-4" />
                <span className="hidden text-[13px] xl:inline">Cari paket, part, gear</span>
              </span>
              <kbd className="hidden rounded-xs border border-zinc-200 bg-zinc-50 px-1.5 font-mono text-[11px] text-zinc-500 xl:inline">
                Ctrl K
              </kbd>
            </button>

            <Link href="/konsultasi" className="kss-btn-dark hidden h-9 px-3 xl:inline-flex">
              Konsultasi
            </Link>

            <button
              type="button"
              onClick={openRetailCart}
              aria-label={`Keranjang eceran${retailCartCount ? `, ${retailCartCount} item` : ''}`}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-sm border border-zinc-300 bg-white text-zinc-800 transition-colors hover:border-zinc-900"
            >
              <ShoppingBag aria-hidden className="h-4 w-4" />
              {isMounted && retailCartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-xs bg-zinc-900 px-1 font-mono text-[11px] font-semibold tabular-nums text-white">
                  {retailCartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-zinc-300 bg-white text-zinc-800 transition-colors hover:border-zinc-900 lg:hidden"
              aria-label="Buka menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X aria-hidden className="h-4 w-4" />
              ) : (
                <Menu aria-hidden className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-zinc-200 bg-white lg:hidden">
            <nav aria-label="Menu" className="kss-container divide-y divide-zinc-100">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = isActiveLink(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex h-12 items-center gap-3 text-[15px] ${
                      active ? 'font-semibold text-zinc-950' : 'text-zinc-700'
                    }`}
                  >
                    <Icon
                      aria-hidden
                      className={`h-4 w-4 ${active ? 'text-orange-600' : 'text-zinc-400'}`}
                    />
                    {item.label}
                    <ChevronRight aria-hidden className="ml-auto h-4 w-4 text-zinc-300" />
                  </Link>
                );
              })}
            </nav>
            <div className="kss-container grid grid-cols-2 gap-2 border-t border-zinc-200 py-3">
              <Link href="/konsultasi" className="kss-btn-primary">
                Konsultasi
              </Link>
              <a
                href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="kss-btn-wa"
              >
                <MessageCircle aria-hidden className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>

      <CommandSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={searchProducts}
      />
    </>
  );
}
