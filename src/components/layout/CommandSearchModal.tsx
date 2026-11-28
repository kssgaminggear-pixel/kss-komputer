'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Search, X, ArrowRight } from 'lucide-react';
import { MediaImage } from '@/components/ui/MediaImage';
import { matchesTokens, normalizeSearch, searchTokens } from '@/lib/marketplace/search';
import type { SearchEntry } from '@/lib/marketplace/types';

export interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: SearchEntry[];
}

const PAGES = [
  { href: '/paket-rakitan', name: 'Paket PC rakitan siap pakai' },
  { href: '/jasa', name: 'Jasa rakit dan servis' },
  { href: '/konsultasi', name: 'Konsultasi budget' },
  { href: '/toko', name: 'Toko produk' },
  { href: '/cek-pesanan', name: 'Cek pesanan' },
];

/** Pencarian lintas situs. Sengaja tanpa harga: indeksnya ikut di setiap halaman. */
export function CommandSearchModal({ isOpen, onClose, products }: CommandSearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset query jika modal ditutup
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setQuery('');
  }

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const index = useMemo(
    () => products.map((entry) => ({ entry, text: normalizeSearch(`${entry.name} ${entry.etalase}`) })),
    [products]
  );

  const tokens = searchTokens(query);
  const pages = PAGES.filter((page) => matchesTokens(normalizeSearch(page.name), tokens));
  const results = index
    .filter((item) => matchesTokens(item.text, tokens))
    .slice(0, tokens.length ? 20 : 6)
    .map((item) => item.entry);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-3 pt-14 sm:pt-20" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cari di situs"
        className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-md border border-zinc-200 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3">
          <Search aria-hidden className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk toko, paket, atau jasa"
            aria-label="Cari produk toko, paket, atau jasa"
            className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-500"
          />
          <button type="button" onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-800" aria-label="Tutup pencarian">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-1">
          {pages.length === 0 && results.length === 0 && (
            <p className="py-12 text-center text-sm text-zinc-500">Tidak ada hasil untuk &quot;{query}&quot;.</p>
          )}

          {pages.length > 0 && (
            <>
              <p className="kss-label px-3 py-2 text-zinc-500">Halaman</p>
              <ul>
                {pages.map((page) => (
                  <li key={page.href}>
                    <Link href={page.href} onClick={onClose} className="flex h-10 items-center justify-between rounded-md px-3 text-sm text-zinc-800 hover:bg-zinc-100">
                      {page.name}
                      <ArrowRight aria-hidden className="h-3.5 w-3.5 text-zinc-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {results.length > 0 && (
            <>
              <p className="kss-label px-3 py-2 text-zinc-500">{tokens.length ? 'Produk toko' : 'Terlaris di toko'}</p>
              <ul>
                {results.map((entry) => (
                  <li key={entry.slug}>
                    <Link href={`/toko/${entry.slug}`} onClick={onClose} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-zinc-100">
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                        <MediaImage src={entry.image} alt="" sizes="40px" className="object-contain" />
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-1 text-sm text-zinc-900">{entry.name}</span>
                        <span className="line-clamp-1 text-meta text-zinc-500">{entry.etalase}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-2 text-meta text-zinc-500">
          <span>Tekan ESC untuk menutup</span>
          <Link
            href={query.trim() ? `/toko?q=${encodeURIComponent(query.trim())}` : '/toko'}
            onClick={onClose}
            className="inline-flex items-center gap-1 font-medium text-zinc-900 hover:underline"
          >
            {query.trim() ? 'Lihat semua hasil di Toko' : 'Buka Toko'} <ArrowRight aria-hidden className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CommandSearchModal;
