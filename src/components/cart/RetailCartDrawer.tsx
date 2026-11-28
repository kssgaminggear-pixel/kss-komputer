'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { useRetailCartStore } from '@/store/useRetailCartStore';
import { formatIDR, TOKOPEDIA_OFFICIAL_STORE_URL } from '@/lib/format';
import { useHydrated } from '@/lib/useHydrated';
import { PaymentInfo } from '@/components/payment/PaymentInfo';

export function RetailCartDrawer() {
  const isHydrated = useHydrated();
  const isOpen = useRetailCartStore((state) => state.isOpen);
  const items = useRetailCartStore((state) => state.items);
  const closeCart = useRetailCartStore((state) => state.closeCart);
  const updateQuantity = useRetailCartStore((state) => state.updateQuantity);
  const removeItem = useRetailCartStore((state) => state.removeItem);
  const clearCart = useRetailCartStore((state) => state.clearCart);
  const getTotalPrice = useRetailCartStore((state) => state.getTotalPrice);
  const getTotalItemsCount = useRetailCartStore((state) => state.getTotalItemsCount);
  const generateWhatsAppCheckoutUrl = useRetailCartStore((state) => state.generateWhatsAppCheckoutUrl);

  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  // Fokus pindah ke tombol tutup saat panel dibuka, lalu kembali ke pemicunya.
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    return () => trigger?.focus();
  }, [isOpen]);

  const panel = useRef<HTMLDivElement>(null);

  // Tab berputar di dalam panel selama keranjang terbuka.
  useEffect(() => {
    if (!isOpen) return;
    const keepFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !panel.current) return;
      const items = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])'
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const outside = !panel.current.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', keepFocus);
    return () => window.removeEventListener('keydown', keepFocus);
  }, [isOpen]);

  // Close with Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  if (!isHydrated || !isOpen) return null;

  const totalPrice = getTotalPrice();
  const totalCount = getTotalItemsCount();

  const handleCheckoutWA = () => {
    if (items.length === 0) return;
    const url = generateWhatsAppCheckoutUrl(undefined, customerName.trim() || undefined, notes.trim() || undefined);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang toko"
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ShoppingBag aria-hidden className="h-5 w-5 text-ink" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Keranjang toko
            </h2>
            <span className="rounded-full border border-line bg-paper px-2 py-0.5 text-meta font-semibold text-ink">
              {totalCount} item
            </span>
          </div>
          <button
            ref={closeButton}
            type="button"
            aria-label="Tutup keranjang"
            onClick={closeCart}
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            title="Tutup (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900 px-4 py-2">
          {items.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-2 h-10 w-10 text-zinc-300 dark:text-zinc-700" />
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500">
                Keranjang belanja eceran masih kosong
              </p>
              <p className="mt-1 text-meta text-zinc-500">
                Buka halaman Toko untuk menambahkan barang.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="mt-0.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                    {item.name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-xs font-bold text-orange-700 dark:text-orange-400 tabular-nums">
                      {formatIDR(item.unitPrice)}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                    title="Hapus"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout */}
        {items.length > 0 && (
          <div className="max-h-[65vh] overflow-y-auto border-t border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="mb-3 space-y-2">
              <input
                type="text"
                placeholder="Nama Anda (Opsional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-orange-600"
              />
              <input
                type="text"
                placeholder="Catatan pesanan / pertanyaan stok..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-orange-600"
              />
            </div>

            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-xs font-medium text-zinc-500">Subtotal Belanja:</span>
              <span className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {formatIDR(totalPrice)}
              </span>
            </div>

            <div className="mb-3">
              <PaymentInfo />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleCheckoutWA}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 hover:bg-zinc-700 px-4 py-2.5 text-xs font-bold text-white transition-colors shadow-xs"
              >
                <MessageCircle className="h-4 w-4" />
                Checkout Pesanan via WhatsApp
              </button>

              <div className="flex gap-2">
                <a
                  href={TOKOPEDIA_OFFICIAL_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-2 text-meta font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-700" />
                  Buka Tokopedia
                </a>
                <button
                  onClick={clearCart}
                  className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-meta font-medium text-zinc-500 hover:text-red-600 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  Kosongkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
