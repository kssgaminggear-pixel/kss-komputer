import React from 'react';
import { formatIDR } from '@/lib/format';

export function Price({ value, className = '' }: { value: number; className?: string }) {
  const digits = formatIDR(value).replace(/^Rp\s*/u, '');
  return (
    <span className={`kss-price inline-flex items-baseline gap-[0.25em] ${className}`}>
      <span className="text-[0.6em] font-medium opacity-60">Rp</span>
      <span>{digits}</span>
    </span>
  );
}
