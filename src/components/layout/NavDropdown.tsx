'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

export interface NavDropdownLink {
  href: string;
  label: string;
}

/** Tombol menu desktop. Tautan selalu ada di HTML; ditutup dengan Esc, klik di luar, atau pindah halaman. */
export function NavDropdown({ label, links, active }: { label: string; links: NavDropdownLink[]; active: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      button.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={`flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-semibold transition-colors ${
          active || open ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink'
        }`}
      >
        {label}
        <ChevronDown aria-hidden className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <ul
        id={panelId}
        hidden={!open}
        className="absolute left-0 top-full z-50 mt-2 max-h-[70vh] w-72 overflow-y-auto rounded-lg border border-line bg-white p-2 shadow-float"
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === link.href ? 'page' : undefined}
              className="flex min-h-10 items-center rounded-md px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-paper aria-[current=page]:bg-paper-deep"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
