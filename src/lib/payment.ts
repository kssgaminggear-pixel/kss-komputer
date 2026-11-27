/**
 * Pembayaran sementara: pesanan lewat WhatsApp, lalu transfer manual ke rekening toko.
 * Payment gateway menyusul setelah akun Midtrans tersedia.
 */
export interface BankAccount {
  bank: string;
  number: string;
  /** Nama pemilik rekening persis seperti di bank. */
  holder: string;
}

/**
 * Rekening resmi toko. Isi hanya dengan data dari pemilik.
 * Selama kosong, halaman mengarahkan pembeli meminta nomor rekening ke WhatsApp toko.
 */
export const BANK_ACCOUNTS: readonly BankAccount[] = [];

/** Baris yang disertakan di setiap pesan pemesanan WhatsApp. */
export const PAYMENT_WA_LINE =
  'Pembayaran: transfer ke rekening toko. Mohon kirim total akhir dan nomor rekeningnya.';
