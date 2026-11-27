'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  PcCase,
  Layers,
  ShoppingBag,
  Wrench,
  ClipboardList,
  Menu,
  X,
  Headphones,
  MessageSquareText,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { useRetailCartStore } from '@/store/useRetailCartStore';
import { useHydrated } from '@/lib/useHydrated';

export function BottomNav() {
  const pathname = usePathname();
  const isHydrated = useHydrated();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const retailCartCount = useRetailCartStore((state) => state.getTotalItemsCount());
  const openRetailCart = useRetailCartStore((state) => state.openCart);

  // Tutup panel "Lainnya" saat berpindah halaman
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMoreOpen(false);
  }

  const navItems = [
    { href: '/', label: 'Beranda', icon: Home, isActive: pathname === '/' },
    { href: '/jasa', label: 'Jasa', icon: Wrench, isActive: pathname.startsWith('/jasa') },
    {
      href: '/paket-rakitan',
      label: 'Paket',
      icon: PcCase,
      isActive: pathname.startsWith('/paket-rakitan'),
    },
    {
      href: '/cek-pesanan',
      label: 'Pesanan',
      icon: ClipboardList,
      isActive: pathname.startsWith('/cek-pesanan'),
    },
  ];

  const moreItems = [
    { href: '/konsultasi', label: 'Konsultasi budget', icon: MessageSquareText },
    { href: '/komponen', label: 'Komponen eceran', icon: Layers },
    { href: '/aksesoris', label: 'Aksesoris & gear', icon: Headphones },
    { href: '/tentang-kami', label: 'Tentang kami', icon: Building2 },
  ];

  const itemBase =
    'relative flex flex-col items-center justify-center gap-1 text-[11px] transition-colors duration-150';

  return (
    <>
      {isMoreOpen && (
        <>
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setIsMoreOpen(false)}
            className="fixed inset-0 z-30 bg-zinc-950/40 md:hidden"
          />
          <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-40 border-t border-zinc-200 bg-white motion-safe:animate-sheet-in md:hidden">
            <div className="kss-container flex h-11 items-center justify-between border-b border-zinc-100">
              <span className="kss-label text-zinc-500">Menu lainnya</span>
            </div>
            <nav aria-label="Menu lainnya" className="kss-container divide-y divide-zinc-100">
              {moreItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMoreOpen(false)}
                  className="flex h-12 items-center gap-3 text-[15px] text-zinc-800"
                >
                  <Icon aria-hidden className="h-4 w-4 text-zinc-400" />
                  {label}
                  <ChevronRight aria-hidden className="ml-auto h-4 w-4 text-zinc-300" />
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsMoreOpen(false);
                  openRetailCart();
                }}
                className="flex h-12 w-full items-center gap-3 text-[15px] text-zinc-800"
              >
                <ShoppingBag aria-hidden className="h-4 w-4 text-zinc-400" />
                Keranjang eceran
                {isHydrated && retailCartCount > 0 && (
                  <span className="kss-tag kss-tag-ink ml-auto tabular-nums">{retailCartCount}</span>
                )}
              </button>
            </nav>
          </div>
        </>
      )}

      <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="grid h-14 grid-cols-5">
          {navItems.map(({ href, label, icon: Icon, isActive }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`${itemBase} ${
                isActive ? 'font-semibold text-zinc-950' : 'font-medium text-zinc-500'
              }`}
            >
              {isActive && (
                <span aria-hidden className="absolute inset-x-5 top-0 h-0.5 bg-orange-600" />
              )}
              <Icon
                aria-hidden
                className={`h-5 w-5 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`}
              />
              {label}
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setIsMoreOpen((prev) => !prev)}
            aria-expanded={isMoreOpen}
            className={`${itemBase} ${
              isMoreOpen ? 'font-semibold text-zinc-950' : 'font-medium text-zinc-500'
            }`}
          >
            {isMoreOpen && (
              <span aria-hidden className="absolute inset-x-5 top-0 h-0.5 bg-orange-600" />
            )}
            <span className="relative">
              {isMoreOpen ? (
                <X aria-hidden className="h-5 w-5 text-zinc-950" />
              ) : (
                <Menu aria-hidden className="h-5 w-5 text-zinc-400" />
              )}
              {!isMoreOpen && isHydrated && retailCartCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-xs bg-zinc-900 px-1 font-mono text-[11px] font-semibold tabular-nums text-white">
                  {retailCartCount}
                </span>
              )}
            </span>
            Lainnya
          </button>
        </div>
      </nav>
    </>
  );
}
