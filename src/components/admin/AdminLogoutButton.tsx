'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.replace('/admin/login');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="ml-auto inline-flex items-center gap-1.5 rounded-sm border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-bold text-zinc-600 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-red-900 dark:hover:text-red-400"
    >
      <LogOut className="h-3 w-3" />
      {loading ? 'Keluar…' : 'Keluar'}
    </button>
  );
}
