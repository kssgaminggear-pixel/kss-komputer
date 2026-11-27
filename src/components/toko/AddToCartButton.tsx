'use client';

import React, { useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import { useRetailCartStore, type RetailCartInput } from '@/store/useRetailCartStore';

export function AddToCartButton({
  product,
  disabled = false,
  className = '',
}: {
  product: RetailCartInput;
  disabled?: boolean;
  className?: string;
}) {
  const addItem = useRetailCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        addItem(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
      aria-label={`Tambah ${product.name} ke keranjang`}
      className={`kss-btn-outline disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {added ? <Check aria-hidden className="h-3.5 w-3.5" /> : <ShoppingBag aria-hidden className="h-3.5 w-3.5" />}
      <span>{added ? 'Ditambahkan' : 'Keranjang'}</span>
    </button>
  );
}
