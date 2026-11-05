'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Sparkles,
  Cpu,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { useBuilderStore } from '@/store/useBuilderStore';
import { useRetailCartStore } from '@/store/useRetailCartStore';
import { useHydrated } from '@/lib/useHydrated';

export function BottomNav() {
  const pathname = usePathname();
  const isHydrated = useHydrated();

  const builderCount = useBuilderStore((state) => state.getItemCount());
  const retailCartCount = useRetailCartStore((state) => state.getTotalItemsCount());
  const openRetailCart = useRetailCartStore((state) => state.openCart);

  const navItems = [
    {
      href: '/',
      label: 'Beranda',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      href: '/paket-rakitan',
      label: 'Paket PC',
      icon: Sparkles,
      isActive: pathname.startsWith('/paket-rakitan'),
    },
    {
      href: '/simulasi',
      label: 'Simulasi',
      icon: Cpu,
      badge: isHydrated && builderCount > 0 ? builderCount : null,
      isActive: pathname.startsWith('/simulasi'),
    },
    {
      href: '/komponen',
      label: 'Komponen',
      icon: Layers,
      isActive: pathname.startsWith('/komponen') || pathname.startsWith('/aksesoris'),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center h-full py-1 text-[10px] font-medium transition-colors ${
                item.isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5 tracking-tight truncate max-w-[64px]">{item.label}</span>
            </Link>
          );
        })}

        {/* Tombol Keranjang Eceran */}
        <button
          type="button"
          onClick={openRetailCart}
          className="relative flex flex-col items-center justify-center h-full py-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5" />
            {isHydrated && retailCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white">
                {retailCartCount}
              </span>
            )}
          </div>
          <span className="mt-0.5 tracking-tight">Keranjang</span>
        </button>
      </div>
    </nav>
  );
}
