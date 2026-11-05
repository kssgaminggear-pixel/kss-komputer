'use client';

import React, { useEffect, useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ExternalLink, ArrowRight, MessageSquareCheck } from 'lucide-react';
import { useRetailCartStore } from '@/store/useRetailCartStore';
import { formatIDR, TOKOPEDIA_OFFICIAL_STORE_URL } from '@/lib/format';
import { useHydrated } from '@/lib/useHydrated';

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
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-zinc-950 dark:border-l dark:border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
              Keranjang Eceran &amp; Aksesoris
            </h2>
            <span className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              {totalCount} item
            </span>
          </div>
          <button
            onClick={closeCart}
            className="rounded-sm p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
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
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Keranjang belanja eceran masih kosong
              </p>
              <p className="mt-1 text-[11px] text-zinc-400">
                Jelajahi halaman Komponen &amp; Aksesoris untuk menambahkan barang.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 text-[9px] font-mono text-zinc-500 uppercase">
                      {item.brand}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 truncate">{item.sku}</span>
                  </div>
                  <h3 className="mt-0.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                    {item.name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                      {formatIDR(item.unitPrice)}
                    </span>
                    {item.originalPrice && item.originalPrice > item.unitPrice && (
                      <span className="font-mono text-[10px] text-zinc-400 line-through tabular-nums">
                        {formatIDR(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                    title="Hapus"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-sm overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
          <div className="border-t border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="mb-3 space-y-2">
              <input
                type="text"
                placeholder="Nama Anda (Opsional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-sm border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
              />
              <input
                type="text"
                placeholder="Catatan pesanan / pertanyaan stok..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-sm border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-xs font-medium text-zinc-500">Subtotal Belanja:</span>
              <span className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {formatIDR(totalPrice)}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleCheckoutWA}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <MessageSquareCheck className="h-4 w-4" />
                Checkout Pesanan via WhatsApp
              </button>

              <div className="flex gap-2">
                <a
                  href={TOKOPEDIA_OFFICIAL_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-zinc-200 bg-white px-3 py-2 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
                  Buka Tokopedia Resmi
                </a>
                <button
                  onClick={clearCart}
                  className="rounded-sm border border-zinc-200 bg-white px-3 py-2 text-[11px] font-medium text-zinc-500 hover:text-red-600 dark:border-zinc-800 dark:bg-zinc-900"
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
