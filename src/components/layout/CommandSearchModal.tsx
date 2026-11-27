'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import type { PartSearchEntry } from '@/lib/types';
import { generateCustomBuildWAMessage } from '@/lib/format';

export interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: PartSearchEntry[];
}

/**
 * Memeriksa apakah suatu produk cocok dengan seluruh token pencarian (multi-token search).
 * Contoh: "am5 ddr5 msi" harus cocok dengan socket AM5, ram DDR5, dan brand MSI.
 */
function matchesSearchTokens(product: PartSearchEntry, tokens: string[]): boolean {
  return tokens.every((token) => product.keywords.includes(token));
}

export function CommandSearchModal({ isOpen, onClose, products }: CommandSearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset query jika modal ditutup
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setQuery('');
    }
  }

  // Fokus input otomatis saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Shortcut keyboard Escape untuk menutup modal
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

  // Multi-token filter
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Tampilkan 8 produk rekomendasi awal saat query kosong
      return products.slice(0, 8);
    }
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    return products.filter((product) => matchesSearchTokens(product, tokens)).slice(0, 20);
  }, [query, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-14 sm:pt-20 bg-black/60 animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-md overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar & Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 gap-3">
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik nama komponen, SKU, socket (AM5, LGA1700), RAM (DDR5)..."
            className="w-full bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 font-mono tracking-tight"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-micro font-mono text-zinc-500 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="sm:hidden text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 p-1"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Filter Info Tag */}
        <div className="px-4 py-1.5 bg-zinc-100/70 dark:bg-zinc-950/40 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-meta text-zinc-500 font-mono">
          <span>
            {query.trim()
              ? `Ditemukan ${searchResults.length} komponen`
              : 'Komponen Unggulan & Ready Stock'}
          </span>
          <span className="hidden sm:inline">Navigasi instan multi-token</span>
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/80 p-1">
          {searchResults.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500 font-mono">
              Tidak ada komponen yang cocok dengan kata kunci &quot;{query}&quot;.
              <div className="text-xs text-zinc-500 mt-1">
                Coba cari berdasarkan socket (contoh: AM5, LGA1700) atau brand (ASUS, MSI, AMD).
              </div>
            </div>
          ) : (
            searchResults.map((product) => {
              return (
                <div
                  key={product.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-2.5 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 rounded-md transition-colors gap-2"
                >
                  {/* Left Column: Product Info & Spec Badges */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-meta text-zinc-500 dark:text-zinc-500 tracking-wider">
                        {product.sku}
                      </span>
                      <span className="text-micro font-mono px-1 py-0.5 bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-md uppercase">
                        {product.brand}
                      </span>
                      {product.stockStatus === 'ready' && (
                        <span className="text-micro font-mono text-emerald-700 dark:text-emerald-400">
                          ● Ready
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/komponen/${product.slug}`}
                      onClick={onClose}
                      className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-orange-700 dark:group-hover:text-orange-400 line-clamp-1 transition-colors"
                    >
                      {product.name}
                    </Link>
                    <div className="mt-1.5">
                      <div className="flex flex-wrap items-center gap-1">
                        {product.specLabels.map((label) => (
                          <span key={label} className="inline-flex items-center px-1.5 py-0.5 text-meta font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-md whitespace-nowrap">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Kolom kanan: aksi cepat. Harga komponen tidak ditampilkan (AGENTS.md §1.1). */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/60">
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Konsultasi rakit custom via WhatsApp */}
                      <a
                        href={generateCustomBuildWAMessage(undefined, {
                          subject: `Rakit PC custom dengan ${product.name}`,
                          parts: [{ category: product.category, name: product.name, quantity: 1 }],
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Konsultasi rakit PC custom dengan komponen ini via WhatsApp"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono font-medium border rounded-md transition-all bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span className="hidden sm:inline">Rakit</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 flex items-center justify-between text-meta font-mono text-zinc-500">
          <div className="flex items-center gap-3">
            <span>Tekan <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md">ESC</kbd> untuk menutup</span>
          </div>
          <Link
            href="/komponen"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-orange-700 dark:text-orange-400 hover:underline"
          >
            Buka Katalog Lengkap <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CommandSearchModal;
