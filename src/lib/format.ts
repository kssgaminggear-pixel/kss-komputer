import { ProductCategory } from './types';

export const TOKOPEDIA_OFFICIAL_STORE_URL = 'https://tk.tokopedia.com/ZSpeToWkH/';
/** Alias resmi sesuai kontrak bisnis KSS Komputer. */
export const TOKOPEDIA_URL = TOKOPEDIA_OFFICIAL_STORE_URL;
export const DEFAULT_WHATSAPP_PHONE = '6289675437066'; // Nomor CS WhatsApp KSS Komputer
export const DEFAULT_WHATSAPP_DISPLAY = '0896-7543-7066';

/**
 * Format angka ke format mata uang Rupiah Indonesia (Rp 8.500.000)
 */
export function formatIDR(amount: number): string {
  const safeAmount = Math.round(Number(amount) || 0);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(safeAmount);

  return `Rp ${formatted}`;
}

/**
 * Format selisih harga (Delta Pricing) untuk quick upgrader & konfigurator
 * - 0 => '[Termasuk dalam Paket]' atau 'Standar'
 * - > 0 => '+ Rp 450.000'
 * - < 0 => '- Rp 200.000'
 */
export function formatDeltaIDR(diff: number, includeBrackets = false): string {
  const safeDiff = Math.round(Number(diff) || 0);

  if (safeDiff === 0) {
    return includeBrackets ? '[Termasuk Paket]' : 'Termasuk Paket';
  }

  const sign = safeDiff > 0 ? '+ ' : '- ';
  const absAmount = formatIDR(Math.abs(safeDiff));
  const text = `${sign}${absAmount}`;

  return includeBrackets ? `[${text}]` : text;
}

/**
 * Format angka Wattase (contoh: 450W)
 */
export function formatWatt(watt: number): string {
  return `${Math.round(Number(watt) || 0)}W`;
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  cpu: 'Processor (CPU)',
  motherboard: 'Motherboard',
  cooler: 'CPU Cooler',
  ram: 'Memory (RAM)',
  gpu: 'VGA / Kartu Grafis',
  ssd: 'Storage (SSD NVMe)',
  hdd: 'Storage Tambahan (HDD)',
  psu: 'Power Supply (PSU)',
  case: 'Casing PC',
  monitor: 'Monitor',
  peripheral: 'Aksesoris & Peripheral',
};

export interface WhatsAppOrderPayload {
  buildName: string;
  items: {
    category: ProductCategory;
    name: string;
    quantity: number;
  }[];
  totalPrice: number;
  customerName?: string;
  notes?: string;
  isCustomBuild?: boolean;
}

/**
 * Generate tautan WhatsApp checkout resmi KSS Komputer.
 * Sesuai aturan bisnis KSS Komputer:
 * Menampilkan rincian part secara utuh tetapi TIDAK membeberkan harga satuan per part (hanya Total Harga Paket).
 */
export function generateWhatsAppOrderUrl(
  phone: string = DEFAULT_WHATSAPP_PHONE,
  payload: WhatsAppOrderPayload
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const lines: string[] = [
    `*HALO KSS KOMPUTER, SAYA MAU PESAN PC RAKITAN:*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `*Paket / Konfigurasi:* ${payload.buildName}`,
  ];

  if (payload.customerName) {
    lines.push(`*Nama Pemesan:* ${payload.customerName}`);
  }

  lines.push(`\n*RINCIAN SPESIFIKASI RAKITAN:*`);

  payload.items.forEach((item, idx) => {
    const catLabel = CATEGORY_LABELS[item.category] || item.category;
    const qtyStr = item.quantity > 1 ? ` (${item.quantity}x)` : '';
    lines.push(`${idx + 1}. *${catLabel}*: ${item.name}${qtyStr}`);
  });

  lines.push(`\n*STATUS UNIT:*`);
  lines.push(`✓ Sudah Dirakit Rapi (Clean Cable Management)`);
  lines.push(`✓ Lulus Stress-Test Hardware 24 Jam`);
  lines.push(`✓ Garansi Resmi Distributor & Garansi Toko`);

  if (payload.notes) {
    lines.push(`\n*Catatan Khusus:* ${payload.notes}`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`*TOTAL HARGA PAKET: ${formatIDR(payload.totalPrice)}*`);
  lines.push(`\nMohon info ketersediaan stok & jadwal perakitan/pengiriman. Terima kasih!`);

  const message = lines.join('\n');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Format teks spesifikasi untuk disalin ke clipboard (Discord / Forum / Catatan)
 */
export function generateBuildPlainText(
  buildName: string,
  items: { category: ProductCategory; name: string; quantity: number }[],
  totalPrice: number,
  totalWattage: number
): string {
  const lines: string[] = [
    `=== SPESIFIKASI PC RAKITAN KSS KOMPUTER ===`,
    `Paket / Nama: ${buildName}`,
    `Estimasi Total Daya: ${formatWatt(totalWattage)}`,
    `------------------------------------------`,
  ];

  items.forEach((item) => {
    const catLabel = CATEGORY_LABELS[item.category] || item.category;
    const qtyStr = item.quantity > 1 ? ` [${item.quantity}x]` : '';
    lines.push(`- ${catLabel}: ${item.name}${qtyStr}`);
  });

  lines.push(`------------------------------------------`);
  lines.push(`TOTAL HARGA RAKITAN: ${formatIDR(totalPrice)} (Siap Pakai)`);
  lines.push(`Toko Resmi Tokopedia: ${TOKOPEDIA_OFFICIAL_STORE_URL}`);
  lines.push(`==========================================`);

  return lines.join('\n');
}

export interface ConsultationWAPayload {
  customerName?: string;
  budget: number;
  usageNeed: string;
  brandPreference?: string;
  targetResolution?: string;
  notes?: string;
}

/**
 * Generate tautan WhatsApp konsultasi rakitan PC berdasarkan budget & kebutuhan
 */
export function generateConsultationWAMessage(
  phone: string = DEFAULT_WHATSAPP_PHONE,
  payload: ConsultationWAPayload
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const lines: string[] = [
    `*HALO TEKNISI KSS KOMPUTER, SAYA MAU KONSULTASI RAKITAN PC:*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
  ];

  if (payload.customerName) {
    lines.push(`*Nama Konsumen:* ${payload.customerName}`);
  }

  lines.push(`*Estimasi Budget:* ${formatIDR(payload.budget)}`);
  lines.push(`*Kebutuhan Utama:* ${payload.usageNeed}`);

  if (payload.brandPreference) {
    lines.push(`*Preferensi Platform:* ${payload.brandPreference}`);
  }

  if (payload.targetResolution) {
    lines.push(`*Target Resolusi / Monitor:* ${payload.targetResolution}`);
  }

  if (payload.notes) {
    lines.push(`*Catatan Khusus:* ${payload.notes}`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`Mohon dibuatkan rekomendasi racikan spesifikasi terbaik & seimbang di budget tersebut. Terima kasih!`);

  const message = lines.join('\n');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Payload untuk booking jasa servis via WhatsApp
 */
export interface ServiceBookingWAPayload {
  serviceTitle: string;
  customerName: string;
  deviceType: string;
  problemDescription: string;
  preferredDate?: string;
  preferredTime?: string;
}

/**
 * Generate tautan WhatsApp booking jasa servis / jadwal teknisi
 */
export function generateServiceBookingWAMessage(
  phone: string = DEFAULT_WHATSAPP_PHONE,
  payload: ServiceBookingWAPayload
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const lines: string[] = [
    `*BOOKING JASA SERVIS — KSS KOMPUTER*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `*Layanan:* ${payload.serviceTitle}`,
    `*Nama:* ${payload.customerName}`,
    `*Tipe Perangkat:* ${payload.deviceType}`,
    `*Keluhan / Kebutuhan:*`,
    payload.problemDescription,
  ];
  if (payload.preferredDate) {
    lines.push(`*Tanggal Pilihan:* ${payload.preferredDate}`);
  }
  if (payload.preferredTime) {
    lines.push(`*Jam Pilihan:* ${payload.preferredTime}`);
  }
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`Mohon konfirmasi jadwal & estimasi biaya. Terima kasih!`);
  const message = lines.join('\n');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate tautan WhatsApp checkout keranjang eceran (komponen & aksesoris)
 */
export function generateRetailCartWAMessage(
  phone: string = DEFAULT_WHATSAPP_PHONE,
  items: { name: string; quantity: number; unitPrice: number }[],
  totalPrice: number,
  customerName?: string
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const lines: string[] = [
    `*PESANAN KOMPONEN / AKSESORIS — KSS KOMPUTER*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
  ];
  if (customerName) lines.push(`*Nama:* ${customerName}`);
  lines.push(`*Daftar Barang:*`);
  items.forEach((item, i) => {
    lines.push(`${i + 1}. ${item.name} (${item.quantity}x) — ${formatIDR(item.unitPrice * item.quantity)}`);
  });
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`*TOTAL: ${formatIDR(totalPrice)}*`);
  lines.push(`Mohon info ketersediaan stok & ongkir. Terima kasih!`);
  const message = lines.join('\n');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate tautan WhatsApp untuk membagikan surat penawaran resmi ke konsumen
 */
export function generateQuoteShareWAMessage(
  phone: string,
  quoteCode: string,
  customerName: string,
  finalPrice: number,
  siteUrl: string = 'https://kss-komputer-seven.vercel.app'
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const lines: string[] = [
    `*SURAT PENAWARAN RESMI — KSS KOMPUTER*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Halo ${customerName}, berikut surat penawaran rakitan PC Anda:`,
    ``,
    `📄 *No. Dokumen:* ${quoteCode}`,
    `💰 *Total Harga Paket:* ${formatIDR(finalPrice)}`,
    `🔗 *Lihat Detail:* ${siteUrl}/penawaran/${quoteCode}`,
    ``,
    `Silakan buka link di atas untuk melihat rincian spesifikasi lengkap.`,
    `Klik tombol "Setujui & Pesan" jika cocok. Terima kasih!`,
  ];
  const message = lines.join('\n');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Pesan pemesanan paket rakitan jadi.
 * WAJIB: hanya total harga paket yang dicantumkan, bukan harga satuan komponen.
 */
export function generateWhatsAppBuildOrder(
  packageName: string,
  partsList: { name: string; quantity: number }[],
  totalPrice: number,
  notes?: string,
  phone: string = DEFAULT_WHATSAPP_PHONE
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const lines: string[] = [
    '*PEMESANAN PAKET PC RAKITAN — KSS KOMPUTER*',
    '━━━━━━━━━━━━━━━━━━━━━━━━━',
    `*Paket:* ${packageName}`,
    '',
    '*Rincian Komponen:*',
    ...partsList.map(
      (part, index) =>
        `${index + 1}. ${part.name}${part.quantity > 1 ? ` (${part.quantity}x)` : ''}`
    ),
    '━━━━━━━━━━━━━━━━━━━━━━━━━',
    `*Total Harga Paket:* ${formatIDR(totalPrice)}`,
    'Sudah termasuk perakitan, cable management, stress test, dan garansi toko.',
  ];

  if (notes?.trim()) {
    lines.push('', `*Catatan:* ${notes.trim()}`);
  }

  lines.push('', 'Mohon konfirmasi ketersediaan unit dan jadwal pengerjaan. Terima kasih!');

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Pesan booking layanan jasa komputer.
 */
export function generateWhatsAppServiceBooking(
  serviceTitle: string,
  pcSpecs: string,
  issueNotes: string,
  phone: string = DEFAULT_WHATSAPP_PHONE
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const lines: string[] = [
    '*BOOKING JASA KOMPUTER — KSS KOMPUTER*',
    '━━━━━━━━━━━━━━━━━━━━━━━━━',
    `*Layanan:* ${serviceTitle}`,
    `*Spesifikasi / Perangkat:* ${pcSpecs}`,
    '*Keluhan / Kebutuhan:*',
    issueNotes.trim() || '-',
    '━━━━━━━━━━━━━━━━━━━━━━━━━',
    'Mohon konfirmasi jadwal dan estimasi biaya. Terima kasih!',
  ];

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
}
