import React from 'react';
import { DEFAULT_WHATSAPP_DISPLAY } from '@/lib/format';
import { BANK_ACCOUNTS } from '@/lib/payment';

/** Cara bayar singkat di dekat tombol pemesanan. */
export function PaymentInfo() {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-3 text-meta text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <p className="font-semibold text-zinc-900 dark:text-zinc-100">Pembayaran: transfer bank</p>
      <ol className="mt-1 list-decimal space-y-0.5 pl-4">
        <li>Kirim pesanan lewat WhatsApp.</li>
        <li>Tunggu admin mengonfirmasi stok, ongkos kirim, dan total akhir.</li>
        <li>Transfer ke rekening toko, lalu kirim bukti transfer di chat yang sama.</li>
      </ol>
      {BANK_ACCOUNTS.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {BANK_ACCOUNTS.map((account) => (
            <li key={account.number}>
              {account.bank} <span className="kss-num select-all text-zinc-950 dark:text-zinc-100">{account.number}</span> a.n.{' '}
              {account.holder}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2">Nomor rekening diberikan admin lewat WhatsApp toko.</p>
      )}
      <p className="mt-2">
        WhatsApp resmi toko: <span className="kss-num select-all">{DEFAULT_WHATSAPP_DISPLAY}</span>. Jangan transfer ke rekening yang
        dikirim dari nomor lain.
      </p>
    </div>
  );
}
