'use client';

import React, { useState } from 'react';
import { Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import type { PublicHardwarePart } from '@/lib/types';
import { useRetailCartStore } from '@/store/useRetailCartStore';

export function KomponenDetailActions({ part }: { part: PublicHardwarePart }) {
  const addItem = useRetailCartStore((state) => state.addItem);
  const openCart = useRetailCartStore((state) => state.openCart);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(part, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] font-bold uppercase tracking-tight text-zinc-500">
          Jumlah
        </span>
        <div className="inline-flex items-center rounded-md border border-zinc-300 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Kurangi jumlah"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-9 text-center font-mono text-xs font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(20, value + 1))}
            className="p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Tambah jumlah"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleAdd}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs font-bold text-white transition-colors ${
            added ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-orange-700 hover:bg-orange-800'
          }`}
        >
          {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          <span>{added ? 'Masuk Keranjang' : 'Tambah ke Keranjang'}</span>
        </button>

        <button
          type="button"
          onClick={openCart}
          className="flex items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-2.5 text-xs font-bold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <span>Lihat Keranjang</span>
        </button>
      </div>
    </div>
  );
}
