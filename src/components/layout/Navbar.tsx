'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Cpu,
  Sparkles,
  Layers,
  Wrench,
  ShoppingBag,
  PhoneCall,
  Menu,
  X,
  Clock,
  ShieldCheck,
  ChevronRight,
  Database,
  ExternalLink,
  Headphones,
  ClipboardList,
  MessageSquareCheck,
  Building2,
  MapPin,
} from 'lucide-react';
import { useBuilderStore } from '@/store/useBuilderStore';
import { useRetailCartStore } from '@/store/useRetailCartStore';
import { formatIDR, TOKOPEDIA_OFFICIAL_STORE_URL, DEFAULT_WHATSAPP_PHONE } from '@/lib/format';
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

  const builderPartCount = useBuilderStore((state) => state.getItemCount());
  const builderTotalPrice = useBuilderStore((state) => state.publicTotalPrice);
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
    {
      href: '/simulasi',
      label: 'Rakit PC',
      icon: Cpu,
      badge: isMounted && builderPartCount > 0 ? `${builderPartCount}` : null,
      subBadge: isMounted && builderTotalPrice > 0 ? formatIDR(builderTotalPrice) : null,
    },
    { href: '/paket-rakitan', label: 'Paket Siap Pakai', icon: Sparkles },
    { href: '/cek-pesanan', label: 'Cek Pesanan', icon: ClipboardList },
    { href: '/komponen', label: 'Komponen', icon: Layers },
    { href: '/aksesoris', label: 'Aksesoris', icon: Headphones },
    { href: '/konsultasi', label: 'Konsultasi', icon: MessageSquareCheck, desktopHidden: true },
    { href: '/tentang-kami', label: 'Tentang Kami', icon: Building2, desktopHidden: true },
    { href: '/admin/pricing', label: 'Admin', icon: Database, desktopHidden: true },
  ];

  const isActiveLink = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {/* Utility bar */}
        <div className="hidden border-b border-zinc-100 bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-900/50 sm:block">
          <div className="kss-container flex h-8 items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-blue-600" />
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Mangga Dua Mall, Jakarta</span>
              </span>
              <span className="hidden items-center gap-1 lg:flex">
                <Clock className="h-3 w-3" />
                <span>Senin - Sabtu, 09.00 - 18.00 WIB</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden items-center gap-1 md:flex">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span>Garansi Resmi Distributor</span>
              </span>
              <a
                href={TOKOPEDIA_OFFICIAL_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400"
              >
                <span>Tokopedia</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-zinc-700 transition-colors hover:text-blue-600 dark:text-zinc-300"
              >
                <PhoneCall className="h-3 w-3 text-emerald-500" />
                <span>0812-3456-7890</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div className="kss-container flex h-16 items-center gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 font-mono text-sm font-black tracking-wider text-white">
              KSS
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-mono text-sm font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                KSS KOMPUTER
              </span>
              <span className="mt-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                PC Builder &amp; Hardware
              </span>
            </span>
          </Link>

          <nav className="ml-2 hidden items-center gap-0.5 lg:flex">
            {navLinks.map((item) => {
              if ('desktopHidden' in item && item.desktopHidden) return null;
              const isActive = isActiveLink(item.href);
              const Icon = item.icon;
              const isCompact = 'compact' in item && item.compact;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${isCompact ? 'hidden xl:inline-flex' : 'inline-flex'} items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-2 text-xs font-semibold transition-colors xl:px-2.5 ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="rounded-md bg-blue-600 px-1 font-mono text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 text-xs text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 2xl:w-52 2xl:justify-between"
              title="Cari komponen, paket PC, atau aksesoris (Ctrl+K)"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Search className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden truncate 2xl:inline">Cari part, paket, gear...</span>
              </span>
              <kbd className="hidden rounded border border-zinc-300 bg-white px-1 font-mono text-[10px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 2xl:inline-flex">
                <span>⌘</span>K
              </kbd>
            </button>

            <Link href="/konsultasi" className="kss-btn-primary hidden h-9 px-3 xl:inline-flex">
              <MessageSquareCheck className="h-3.5 w-3.5" />
              <span>Konsultasi</span>
            </Link>

            <button
              type="button"
              onClick={openRetailCart}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              title="Keranjang Belanja Eceran"
            >
              <ShoppingBag className="h-4 w-4" />
              {isMounted && retailCartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 font-mono text-[10px] font-bold text-white">
                  {retailCartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 lg:hidden"
              aria-label="Toggle Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
            <div className="kss-container py-3">
              <nav className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {navLinks.map((item) => {
                  const isActive = isActiveLink(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between rounded-md px-3 py-2.5 text-xs font-semibold ${
                        isActive
                          ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                          : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className="rounded-md bg-blue-600 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <Link href="/konsultasi" className="kss-btn-primary">
                  <MessageSquareCheck className="h-4 w-4" />
                  <span>Konsultasi</span>
                </Link>
                <a
                  href={`https://wa.me/${DEFAULT_WHATSAPP_PHONE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kss-btn-wa"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
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
