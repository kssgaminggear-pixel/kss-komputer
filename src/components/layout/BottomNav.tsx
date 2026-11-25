'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Sparkles,
  Layers,
  ShoppingBag,
  Wrench,
  ClipboardList,
  Menu,
  X,
  Headphones,
  Database,
  MessageSquareCheck,
  Building2,
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
    {
      href: '/',
      label: 'Beranda',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      href: '/jasa',
      label: 'Jasa',
      icon: Wrench,
      isActive: pathname.startsWith('/jasa'),
    },
    {
      href: '/paket-rakitan',
      label: 'Paket',
      icon: Sparkles,
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
    { href: '/paket-rakitan', label: 'Paket Siap Pakai', icon: Sparkles },
    { href: '/konsultasi', label: 'Konsultasi Budget', icon: MessageSquareCheck },
    { href: '/komponen', label: 'Komponen Eceran', icon: Layers },
    { href: '/aksesoris', label: 'Aksesoris & Gear', icon: Headphones },
    { href: '/tentang-kami', label: 'Tentang Kami', icon: Building2 },
    { href: '/admin/pricing', label: 'Admin Portal', icon: Database },
  ];

  return (
    <>
      {isMoreOpen && (
        <div className="md:hidden fixed bottom-14 left-0 right-0 z-40 border-t border-zinc-200 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Menu Lainnya
            </span>
            <button
              type="button"
              onClick={() => setIsMoreOpen(false)}
              className="p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100"
              aria-label="Tutup menu"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {moreItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMoreOpen(false)}
                  className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-[11px] font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <Icon className="h-3.5 w-3.5 text-orange-700 dark:text-orange-400 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setIsMoreOpen(false);
                openRetailCart();
              }}
              className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-[11px] font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="truncate">Keranjang Eceran</span>
              {isHydrated && retailCartCount > 0 && (
                <span className="ml-auto rounded-md bg-emerald-700 px-1 font-mono text-[10px] font-bold text-white">
                  {retailCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-14 items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center h-full py-1 text-[10px] font-medium transition-colors ${
                  item.isActive
                    ? 'text-orange-700 dark:text-orange-400 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="mt-0.5 tracking-tight truncate max-w-[64px]">{item.label}</span>
              </Link>
            );
          })}

          {/* Tombol Menu "Lainnya" */}
          <button
            type="button"
            onClick={() => setIsMoreOpen((prev) => !prev)}
            className={`relative flex flex-col items-center justify-center h-full py-1 text-[10px] font-medium transition-colors ${
              isMoreOpen
                ? 'text-orange-700 dark:text-orange-400 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200'
            }`}
            aria-expanded={isMoreOpen}
          >
            <div className="relative">
              {isMoreOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              {!isMoreOpen && isHydrated && retailCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-700 px-1 text-[9px] font-bold text-white">
                  {retailCartCount}
                </span>
              )}
            </div>
            <span className="mt-0.5 tracking-tight">Lainnya</span>
          </button>
        </div>
      </nav>
    </>
  );
}
