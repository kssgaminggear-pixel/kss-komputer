/**
 * Konstanta Global KSS Komputer
 * Single source of truth untuk identitas toko, kontak, dan konfigurasi statis.
 */

export const STORE_NAME = 'KSS Komputer';
export const STORE_TAGLINE = 'Jasa Rakit PC Custom & Service Komputer Profesional';
export const STORE_ADDRESS = 'Mangga Dua Mall, Jakarta, Indonesia';
export const STORE_OPERATIONAL_HOURS = 'Senin - Sabtu, 09:00 - 18:00 WIB';
export const STORE_WARRANTY_TEXT =
  'Garansi resmi distributor + garansi toko KSS Komputer. Stress-tested & QC verified.';

export const ADMIN_WHATSAPP = '6289675437066';
export const TECHNICIAN_WHATSAPP = '6289675437066';
export const TOKOPEDIA_URL = 'https://tk.tokopedia.com/ZSpeToWkH/';
export const SITE_URL = 'https://kss-komputer-seven.vercel.app';

export const DEFAULT_ASSEMBLY_FEE = 150000;
export const DEFAULT_MARKUP_PERCENT = 12;

export const TRACKING_STAGE_LABELS: Record<string, string> = {
  payment_verified: 'Pembayaran Terverifikasi',
  parts_preparation: 'Persiapan Komponen',
  diagnosis: 'Diagnosis & Pengecekan',
  assembling: 'Proses Perakitan / Pengerjaan',
  cable_management: 'Cable Management & Finishing',
  stress_testing: 'Stress Test & QC 24 Jam',
  qc_final: 'Quality Control Final',
  ready_to_pickup: 'Siap Diambil / Dikirim',
  completed: 'Selesai',
};

export const TRACKING_STAGES_ORDER: string[] = [
  'payment_verified',
  'parts_preparation',
  'diagnosis',
  'assembling',
  'cable_management',
  'stress_testing',
  'qc_final',
  'ready_to_pickup',
  'completed',
];

export const SERVICE_DEVICE_TYPES = ['PC Desktop', 'Laptop', 'PC Warnet/Lab'] as const;

export const SERVICE_BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu Konfirmasi',
  confirmed: 'Terkonfirmasi',
  in_progress: 'Sedang Dikerjakan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};
