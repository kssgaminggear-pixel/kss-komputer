# WORK ORDERS — KSS KOMPUTER
# Instruksi Eksekusi untuk AI Worker Model

> **BACA SELURUH DOKUMEN INI SEBELUM MULAI MENGERJAKAN.**
> Dokumen ini berisi instruksi step-by-step yang HARUS diikuti secara berurutan.
> Setiap keputusan arsitektur sudah diambil. Tugas Anda hanya mengeksekusi.

---

## 0. SETUP SESI (JALANKAN SETIAP AWAL SESI BARU)

```powershell
$env:PATH = "C:\Users\user\nodejs;$env:LOCALAPPDATA\Programs\Git\cmd;$env:PATH"
cd "c:\Users\user\Documents\Kss Komputer"
```

**Verifikasi:**
```powershell
node --version    # v22.x
git --version     # 2.47.x
```

---

## 1. PROTOKOL VALIDASI (WAJIB SETELAH SETIAP BATCH)

Setelah menyelesaikan setiap BATCH pekerjaan, WAJIB jalankan urutan ini:

```powershell
# 1. Type check
.\node_modules\.bin\tsc.cmd --noEmit
# HARUS exit 0, 0 error

# 2. Build
npm run build
# HARUS exit 0

# 3. Update ROADMAP.md — ubah [ ] menjadi [x] untuk item yang selesai

# 4. Commit & Push
git add .
git commit -m "feat: <deskripsi singkat batch>"
git push origin main

# 5. Deploy (token dibaca dari .env.local / environment — JANGAN ditulis di repo)
$env:VERCEL_TOKEN = (Get-Content .env.local | Select-String '^VERCEL_TOKEN=').Line -replace '^VERCEL_TOKEN=', ''
.\node_modules\.bin\vercel.cmd deploy --prod --yes --token $env:VERCEL_TOKEN
```

**DILARANG KERAS:**
- Push jika `tsc --noEmit` masih ada error
- Push jika `npm run build` gagal
- Push kode setengah jadi / placeholder `// TODO`
- Menulis `export const dynamic = 'force-dynamic'` (incompatible dengan `cacheComponents`)

---

## 2. REFERENSI DESIGN SYSTEM (COPY-PASTE)

### 2.1 Palet Warna — WAJIB DIGUNAKAN

```
Background utama:    bg-zinc-50 dark:bg-zinc-950
Background kartu:    bg-white dark:bg-zinc-900
Background surface:  bg-zinc-100 dark:bg-zinc-800/80
Border:              border border-zinc-200 dark:border-zinc-800
Teks utama:          text-zinc-900 dark:text-zinc-100
Teks sekunder:       text-zinc-500 dark:text-zinc-400
Teks kecil:          text-zinc-400 dark:text-zinc-500

CTA Utama (biru):    bg-blue-600 hover:bg-blue-700 text-white
CTA Sekunder (oren): bg-orange-600 hover:bg-orange-700 text-white
CTA WhatsApp:        bg-emerald-600 hover:bg-emerald-700 text-white

Status Ready:        text-emerald-600 bg-emerald-500/10 border-emerald-500/20
Status Limited:      text-amber-600 bg-amber-500/10 border-amber-500/20
Status Out:          text-red-600 bg-red-500/10 border-red-500/20
Status PO:           text-blue-600 bg-blue-500/10 border-blue-500/20

Delta Positif (+):   text-blue-600 dark:text-blue-400
Delta Negatif (-):   text-amber-600 dark:text-amber-400
Delta Termasuk:      text-emerald-600 dark:text-emerald-400
```

### 2.2 Aturan Visual — DILARANG & WAJIB

**DILARANG:**
```
bg-gradient-to-*           ← TIDAK BOLEH gradient
backdrop-blur-xl           ← TIDAK BOLEH blur glass
rounded-2xl / rounded-3xl  ← TIDAK BOLEH bulat besar
rounded-full               ← HANYA untuk dot indicator w-2 h-2
shadow-2xl                 ← TIDAK BOLEH shadow tebal
```

**WAJIB:**
```
Border radius:    rounded-none | rounded-sm | rounded-md (MAKSIMAL)
Border style:     border border-zinc-200 dark:border-zinc-800
Shadow:           shadow-xs | shadow-sm (MAKSIMAL)
Harga & angka:    font-mono tabular-nums tracking-tight
Ikon:             lucide-react, ukuran w-3.5 h-3.5 atau w-4 h-4
```

### 2.3 Template Komponen Harga

```tsx
{/* Harga normal */}
<span className="font-mono tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100 font-bold">
  {formatIDR(price)}
</span>

{/* Delta price positif */}
<span className="font-mono tabular-nums tracking-tight text-blue-600 dark:text-blue-400 text-sm">
  {formatDeltaIDR(delta)}
</span>

{/* Badge status */}
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-bold border
  text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
  Ready
</span>
```

---

## 3. CODE PATTERN TEMPLATES

### 3.1 Template Halaman Publik (Client Component)

```tsx
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { IconName } from 'lucide-react';
import { formatIDR } from '@/lib/format';
import { useHydrated } from '@/lib/useHydrated';

export default function NamaPage() {
  const isHydrated = useHydrated();

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="text-xs text-zinc-400 font-mono">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Beranda</Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100 font-bold">Nama Halaman</span>
      </nav>

      {/* Konten halaman */}
    </div>
  );
}
```

### 3.2 Template Halaman Dinamis dengan Params

```tsx
'use client';

import React, { use, Suspense } from 'react';
import { notFound } from 'next/navigation';

function PageContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  // Cari data berdasarkan slug
  const data = MOCK_DATA.find((d) => d.slug === slug);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* konten */}
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-16 text-center text-xs text-zinc-400 font-mono">Memuat...</div>}>
      <PageContent params={params} />
    </Suspense>
  );
}
```

### 3.3 Template Zustand Store (dengan persist)

```tsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export interface NamaState {
  items: ItemType[];
  // Actions
  addItem: (item: ItemType) => void;
  removeItem: (id: string) => void;
}

export const useNamaStore = create<NamaState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: ItemType) => {
        set((state) => ({ items: [...state.items, item] }));
      },

      removeItem: (id: string) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },
    }),
    {
      name: 'kss-nama-store-v1',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : memoryStorage
      ),
    }
  )
);
```

### 3.4 Template Komponen Reusable

```tsx
import React from 'react';
import { IconName } from 'lucide-react';

interface NamaProps {
  title: string;
  description?: string;
}

export function NamaComponent({ title, description }: NamaProps) {
  return (
    <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      )}
    </div>
  );
}
```

### 3.5 Template WhatsApp Message Generator

```tsx
export function generateNamaWAMessage(
  phone: string = DEFAULT_WHATSAPP_PHONE,
  payload: { field1: string; field2: number }
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const lines: string[] = [
    `*JUDUL PESAN — KSS KOMPUTER*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `*Field 1:* ${payload.field1}`,
    `*Field 2:* ${formatIDR(payload.field2)}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Mohon info lebih lanjut. Terima kasih!`,
  ];
  const message = lines.join('\n');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
```

---

## 4. BATCH WORK ORDERS

Kerjakan secara BERURUTAN. Setiap batch HARUS lolos validasi sebelum lanjut ke batch berikutnya.

---

### BATCH 1: DATA LAYER COMPLETION (Fase 1.5 – 1.13)

**Tujuan:** Lengkapi semua tipe data, mock data, dan utilitas yang dibutuhkan sebelum membuat halaman baru.

---

#### TASK 1.5 — Tambah tipe `BuildOrderTracking` di `src/lib/types.ts`

Tambahkan di AKHIR file `src/lib/types.ts`:

```typescript
export type TrackingOrderType = 'rakit_custom' | 'rakit_paket' | 'servis' | 'cleaning' | 'upgrade';

export type TrackingStage =
  | 'payment_verified'
  | 'parts_preparation'
  | 'diagnosis'
  | 'assembling'
  | 'cable_management'
  | 'stress_testing'
  | 'qc_final'
  | 'ready_to_pickup'
  | 'completed';

export interface TrackingStageEntry {
  stage: TrackingStage;
  timestamp: string;
  notes?: string;
}

export interface BuildOrderTracking {
  id: string;
  trackingCode: string;          // TRK-KSS-XXX
  customerName: string;
  customerWa: string;
  orderType: TrackingOrderType;
  itemTitle: string;             // "Rakit PC Gaming RTX 4060" / "Deep Cleaning + Repaste"
  currentStage: TrackingStage;
  stageHistory: TrackingStageEntry[];
  estimatedCompletion?: string;  // ISO date string
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

#### TASK 1.6 — Tambah tipe `ServiceBooking` di `src/lib/types.ts`

Tambahkan di AKHIR file, setelah `BuildOrderTracking`:

```typescript
export type ServiceBookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceBooking {
  id: string;
  bookingCode: string;           // SRV-KSS-YYYYMM-XXX
  serviceId: string;             // Referensi ke ServicePackage.id
  customerName: string;
  customerWa: string;
  customerEmail?: string;
  deviceType: string;            // "PC Desktop", "Laptop", "PC Warnet/Lab"
  problemDescription: string;    // Keluhan / kebutuhan detail
  preferredDate?: string;        // ISO date string
  preferredTime?: string;        // "09:00", "14:00"
  status: ServiceBookingStatus;
  adminNotes?: string;
  estimatedCost?: number;
  finalCost?: number;
  createdAt: string;
  updatedAt: string;
}
```

---

#### TASK 1.7 — Tambah tipe `StoreSettings` di `src/lib/types.ts`

Tambahkan di AKHIR file:

```typescript
export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  adminWhatsApp: string;
  technicianWhatsApp: string;
  tokopediaUrl: string;
  defaultAssemblyFee: number;
  defaultMarkupPercent: number;
  warrantyText: string;
  operationalHours: string;      // "Senin - Sabtu, 09:00 - 18:00 WIB"
}
```

---

#### TASK 1.8 — Ekspansi tipe `ServicePackage` di `src/lib/types.ts`

CARI interface `ServicePackage` yang sudah ada dan GANTI SELURUHNYA dengan:

```typescript
export type ServiceCategory =
  | 'rakit_custom'
  | 'deep_cleaning'
  | 'upgrade_ssd'
  | 'upgrade_ram'
  | 'repaste_thermal'
  | 'instalasi_os'
  | 'instalasi_warnet'
  | 'troubleshoot'
  | 'cable_management'
  | 'maintenance';

export interface ServicePackage {
  id: string;
  title: string;
  slug: string;
  category: ServiceCategory;
  price: number;                 // Harga mulai dari
  priceMax?: number;             // Harga sampai (untuk range)
  duration: string;              // "1 - 2 Jam", "Same Day", "1 Hari Kerja"
  description: string;
  features: string[];            // Apa saja yang termasuk
  includes?: string[];           // Detail item yang termasuk
  excludes?: string[];           // Apa yang tidak termasuk / biaya tambahan
  popular?: boolean;
  badge?: string;                // "Paling Dicari", "Best Value", "Promo"
  imageUrl?: string;
  isActive: boolean;
}
```

**PENTING:** Setelah mengubah `ServicePackage`, periksa `MOCK_SERVICES` di `mock-data.ts`. Setiap item HARUS ditambahkan field `category`, `isActive: true`, dan field opsional lainnya agar kompatibel. Lihat TASK 1.10.

---

#### TASK 1.9 — Refactor sanitizer

1. **Rename** file `src/lib/server-dto.ts` → `src/lib/sanitizer.ts`
2. Buka file dan pastikan semua import path tetap benar (tidak perlu berubah karena internal import saja)
3. **Cari** semua file yang mungkin import dari `server-dto` (cari teks `server-dto` di seluruh `src/`). Saat ini TIDAK ADA file yang mengimport, jadi rename saja.

---

#### TASK 1.10 — Ekspansi `src/lib/mock-data.ts`

**A) Update `MOCK_SERVICES` — Ganti seluruh array `MOCK_SERVICES` menjadi 10 item:**

```typescript
export const MOCK_SERVICES: ServicePackage[] = [
  {
    id: 'svc-rakit-custom',
    title: 'Rakit PC Custom Full Build',
    slug: 'rakit-pc-custom',
    category: 'rakit_custom',
    price: 150000,
    priceMax: 350000,
    duration: '1 - 3 Hari Kerja',
    description: 'Jasa perakitan PC dari nol sesuai spesifikasi pilihan Anda. Termasuk cable management rapi, stress-test OCCT/FurMark, dan instalasi OS.',
    features: [
      'Perakitan komponen lengkap dari nol',
      'Cable management rapi & bersih',
      'Stress-test hardware OCCT & FurMark 24 jam',
      'Instalasi Windows + driver lengkap',
      'Garansi toko 1 tahun untuk unit rakitan',
    ],
    includes: ['Rakit', 'Cable management', 'Stress-test', 'Instal OS + driver'],
    excludes: ['Harga komponen (terpisah)', 'Lisensi Windows original'],
    popular: true,
    badge: 'Paling Dicari',
    isActive: true,
  },
  {
    id: 'svc-rakit-premium',
    title: 'Rakit PC + Cable Management Premium',
    slug: 'rakit-pc-cable-management-premium',
    category: 'rakit_custom',
    price: 250000,
    priceMax: 500000,
    duration: '2 - 4 Hari Kerja',
    description: 'Paket perakitan premium dengan cable management showcase-level, custom cable sleeves, dan dokumentasi foto build.',
    features: [
      'Semua fitur Rakit Custom Full Build',
      'Cable management showcase-level (foto-ready)',
      'Custom cable routing & tie-wrap rapi',
      'Dokumentasi foto build sebelum & sesudah',
      'Pengaturan BIOS optimal & XMP/EXPO RAM',
    ],
    includes: ['Rakit premium', 'Showcase cable management', 'Foto dokumentasi', 'BIOS tuning'],
    excludes: ['Harga komponen', 'Custom sleeved cables (tersedia terpisah)'],
    badge: 'Premium',
    isActive: true,
  },
  {
    id: 'svc-deep-cleaning',
    title: 'Deep Cleaning & Repaste Thermal',
    slug: 'deep-cleaning-repaste',
    category: 'deep_cleaning',
    price: 150000,
    priceMax: 250000,
    duration: '1 - 2 Jam',
    description: 'Pembersihan menyeluruh komponen PC dari debu, penggantian thermal paste CPU & GPU, dan pengecekan suhu operasional.',
    features: [
      'Bongkar total komponen & casing',
      'Pembersihan debu dengan compressed air & brush',
      'Ganti thermal paste CPU (Arctic MX-6 / Noctua NT-H2)',
      'Ganti thermal paste GPU (opsional)',
      'Tes suhu sebelum & sesudah',
    ],
    includes: ['Bongkar pasang', 'Cleaning', 'Thermal paste CPU', 'Tes suhu'],
    excludes: ['Thermal paste GPU (tambahan Rp 50.000)', 'Ganti thermal pad'],
    popular: true,
    badge: 'Best Value',
    isActive: true,
  },
  {
    id: 'svc-upgrade-ssd',
    title: 'Upgrade SSD NVMe + Migrasi OS',
    slug: 'upgrade-ssd-nvme',
    category: 'upgrade_ssd',
    price: 100000,
    duration: 'Same Day',
    description: 'Pemasangan SSD NVMe baru dan migrasi OS + data dari drive lama tanpa instal ulang.',
    features: [
      'Pemasangan SSD NVMe M.2',
      'Cloning / migrasi OS dari drive lama',
      'Verifikasi boot & performa baca-tulis',
      'Konfigurasi drive lama sebagai storage sekunder',
    ],
    includes: ['Pasang SSD', 'Migrasi OS', 'Verifikasi performa'],
    excludes: ['Harga SSD (beli terpisah atau bawa sendiri)'],
    isActive: true,
  },
  {
    id: 'svc-upgrade-ram',
    title: 'Upgrade / Tambah RAM',
    slug: 'upgrade-tambah-ram',
    category: 'upgrade_ram',
    price: 50000,
    duration: '30 Menit',
    description: 'Pemasangan modul RAM tambahan atau upgrade ke kapasitas lebih besar. Termasuk pengecekan kompatibilitas & aktivasi XMP/EXPO.',
    features: [
      'Pemasangan modul RAM baru',
      'Pengecekan kompatibilitas motherboard',
      'Aktivasi profil XMP / EXPO di BIOS',
      'Stress-test memori (MemTest)',
    ],
    includes: ['Pasang RAM', 'Cek kompatibilitas', 'Setting XMP/EXPO'],
    excludes: ['Harga RAM (beli terpisah atau bawa sendiri)'],
    isActive: true,
  },
  {
    id: 'svc-instalasi-os',
    title: 'Instalasi Ulang OS + Driver + Software',
    slug: 'instalasi-ulang-os',
    category: 'instalasi_os',
    price: 100000,
    priceMax: 150000,
    duration: '1 - 2 Jam',
    description: 'Fresh install Windows 10/11, driver hardware lengkap, dan software esensial sesuai kebutuhan.',
    features: [
      'Fresh install Windows 10 / 11',
      'Instalasi driver chipset, VGA, audio, LAN',
      'Software esensial: browser, Office, WinRAR, dll',
      'Update Windows terbaru',
      'Backup data lama (opsional)',
    ],
    includes: ['Instal OS', 'Driver lengkap', 'Software dasar', 'Windows Update'],
    excludes: ['Lisensi Windows original', 'Lisensi Office', 'Backup data (tambahan Rp 50.000)'],
    isActive: true,
  },
  {
    id: 'svc-troubleshoot',
    title: 'Service & Troubleshoot Hardware',
    slug: 'service-troubleshoot-hardware',
    category: 'troubleshoot',
    price: 100000,
    priceMax: 300000,
    duration: '1 - 3 Hari Kerja',
    description: 'Diagnosis & perbaikan masalah hardware: PC tidak menyala, blue screen, overheat, noise abnormal, dan lain-lain.',
    features: [
      'Diagnosis lengkap hardware & software',
      'Identifikasi komponen bermasalah',
      'Perbaikan / penggantian komponen rusak',
      'Tes stabilitas setelah perbaikan',
      'Laporan diagnosis & rekomendasi',
    ],
    includes: ['Diagnosis', 'Perbaikan', 'Tes stabilitas', 'Laporan'],
    excludes: ['Biaya penggantian komponen (terpisah)', 'Data recovery (layanan terpisah)'],
    isActive: true,
  },
  {
    id: 'svc-instalasi-warnet',
    title: 'Instalasi PC Warnet / Kantor / Lab',
    slug: 'instalasi-warnet-kantor-lab',
    category: 'instalasi_warnet',
    price: 200000,
    priceMax: 500000,
    duration: '1 - 7 Hari Kerja',
    description: 'Layanan rakit, instalasi, dan setup jaringan untuk warnet, kantor, atau laboratorium komputer. Harga per unit.',
    features: [
      'Rakit & instalasi PC (per unit)',
      'Setup jaringan LAN & internet',
      'Instalasi OS & software sesuai kebutuhan',
      'Konfigurasi server (opsional)',
      'Testing konektivitas & performa',
    ],
    includes: ['Rakit per unit', 'Setup jaringan', 'Instal OS & software'],
    excludes: ['Harga komponen & kabel jaringan', 'Konfigurasi server (tambahan)'],
    isActive: true,
  },
  {
    id: 'svc-maintenance',
    title: 'Maintenance Bulanan (Kontrak)',
    slug: 'maintenance-bulanan',
    category: 'maintenance',
    price: 300000,
    priceMax: 1000000,
    duration: 'Kunjungan 1x / Bulan',
    description: 'Paket perawatan rutin bulanan untuk warnet, kantor, atau pengguna pribadi. Termasuk cleaning, update, dan pengecekan kesehatan hardware.',
    features: [
      'Kunjungan teknisi 1x per bulan',
      'Cleaning ringan & cek debu',
      'Update OS & driver',
      'Cek suhu & performa hardware',
      'Laporan kondisi bulanan',
      'Prioritas antrean servis',
    ],
    includes: ['Kunjungan bulanan', 'Cleaning', 'Update', 'Laporan'],
    excludes: ['Penggantian komponen (biaya terpisah)', 'Deep cleaning (paket terpisah)'],
    badge: 'Kontrak',
    isActive: true,
  },
  {
    id: 'svc-konsultasi',
    title: 'Konsultasi & Cek Spesifikasi',
    slug: 'konsultasi-cek-spesifikasi',
    category: 'troubleshoot',
    price: 0,
    duration: '15 - 30 Menit',
    description: 'Konsultasi gratis dengan teknisi KSS Komputer untuk membahas kebutuhan rakit PC, upgrade, atau permasalahan hardware.',
    features: [
      'Konsultasi tatap muka atau via WhatsApp',
      'Rekomendasi spesifikasi sesuai budget',
      'Cek kompatibilitas komponen',
      'Estimasi harga rakitan',
    ],
    includes: ['Konsultasi', 'Rekomendasi', 'Estimasi harga'],
    excludes: ['Jasa pengerjaan (terpisah)'],
    badge: 'GRATIS',
    isActive: true,
  },
];
```

**B) Tambahkan `MOCK_BUILD_TRACKINGS` setelah `MOCK_SERVICES`:**

```typescript
export const MOCK_BUILD_TRACKINGS: BuildOrderTracking[] = [
  {
    id: 'trk-001',
    trackingCode: 'TRK-KSS-001',
    customerName: 'Ahmad Fauzi',
    customerWa: '6281234567890',
    orderType: 'rakit_custom',
    itemTitle: 'Rakit PC Gaming Ryzen 5 7500F + RTX 4060',
    currentStage: 'stress_testing',
    stageHistory: [
      { stage: 'payment_verified', timestamp: '2026-11-10T09:00:00Z', notes: 'Pembayaran via BCA confirmed' },
      { stage: 'parts_preparation', timestamp: '2026-11-10T14:00:00Z', notes: 'Semua komponen tersedia di gudang' },
      { stage: 'assembling', timestamp: '2026-11-11T10:00:00Z' },
      { stage: 'cable_management', timestamp: '2026-11-11T15:00:00Z', notes: 'Custom cable routing selesai' },
      { stage: 'stress_testing', timestamp: '2026-11-12T09:00:00Z', notes: 'OCCT 24 jam sedang berjalan' },
    ],
    estimatedCompletion: '2026-11-13',
    createdAt: '2026-11-10',
    updatedAt: '2026-11-12',
  },
  {
    id: 'trk-002',
    trackingCode: 'TRK-KSS-002',
    customerName: 'Budi Santoso',
    customerWa: '6281298765432',
    orderType: 'servis',
    itemTitle: 'Deep Cleaning + Repaste Thermal — PC Desktop',
    currentStage: 'completed',
    stageHistory: [
      { stage: 'payment_verified', timestamp: '2026-11-08T10:00:00Z' },
      { stage: 'diagnosis', timestamp: '2026-11-08T11:00:00Z', notes: 'Suhu CPU idle 85°C, thermal paste kering' },
      { stage: 'assembling', timestamp: '2026-11-08T13:00:00Z', notes: 'Cleaning selesai, repaste Arctic MX-6' },
      { stage: 'qc_final', timestamp: '2026-11-08T15:00:00Z', notes: 'Suhu setelah repaste: idle 42°C, load 68°C' },
      { stage: 'completed', timestamp: '2026-11-08T16:00:00Z', notes: 'Sudah diambil customer' },
    ],
    createdAt: '2026-11-08',
    updatedAt: '2026-11-08',
  },
  {
    id: 'trk-003',
    trackingCode: 'TRK-KSS-003',
    customerName: 'Dewi Putri',
    customerWa: '6281355556666',
    orderType: 'upgrade',
    itemTitle: 'Upgrade SSD NVMe 1TB + Migrasi OS — Laptop ASUS',
    currentStage: 'assembling',
    stageHistory: [
      { stage: 'payment_verified', timestamp: '2026-11-12T09:00:00Z' },
      { stage: 'parts_preparation', timestamp: '2026-11-12T10:00:00Z', notes: 'SSD Lexar NM790 1TB ready' },
      { stage: 'assembling', timestamp: '2026-11-12T14:00:00Z', notes: 'Proses cloning OS ke SSD baru' },
    ],
    estimatedCompletion: '2026-11-12',
    createdAt: '2026-11-12',
    updatedAt: '2026-11-12',
  },
];
```

**C) Tambahkan `MOCK_SERVICE_BOOKINGS` setelah `MOCK_BUILD_TRACKINGS`:**

```typescript
export const MOCK_SERVICE_BOOKINGS: ServiceBooking[] = [
  {
    id: 'bk-001',
    bookingCode: 'SRV-KSS-202611-001',
    serviceId: 'svc-deep-cleaning',
    customerName: 'Rina Marlina',
    customerWa: '6281377778888',
    deviceType: 'PC Desktop',
    problemDescription: 'PC sudah 2 tahun tidak pernah dibersihkan, suhu tinggi saat gaming.',
    preferredDate: '2026-11-18',
    preferredTime: '10:00',
    status: 'confirmed',
    estimatedCost: 200000,
    createdAt: '2026-11-14',
    updatedAt: '2026-11-14',
  },
  {
    id: 'bk-002',
    bookingCode: 'SRV-KSS-202611-002',
    serviceId: 'svc-rakit-custom',
    customerName: 'Joko Widodo',
    customerWa: '6281399990000',
    deviceType: 'PC Desktop',
    problemDescription: 'Mau rakit PC gaming budget 12 jutaan untuk Valorant & Genshin 1080p max.',
    preferredDate: '2026-11-20',
    status: 'pending',
    createdAt: '2026-11-15',
    updatedAt: '2026-11-15',
  },
  {
    id: 'bk-003',
    bookingCode: 'SRV-KSS-202611-003',
    serviceId: 'svc-instalasi-warnet',
    customerName: 'CV Maju Jaya',
    customerWa: '6281311112222',
    customerEmail: 'admin@majujaya.co.id',
    deviceType: 'PC Warnet/Lab',
    problemDescription: 'Setup 20 unit PC warnet gaming, termasuk jaringan LAN dan server diskless.',
    preferredDate: '2026-11-25',
    status: 'confirmed',
    estimatedCost: 4000000,
    adminNotes: 'Project besar, perlu 1 minggu pengerjaan. Sudah survey lokasi.',
    createdAt: '2026-11-13',
    updatedAt: '2026-11-14',
  },
];
```

**D) Tambahkan import dan lookup maps. Di ATAS file, tambahkan import:**

```typescript
import { ..., BuildOrderTracking, ServiceBooking } from './types';
```

**Di BAWAH file (setelah semua array), tambahkan:**

```typescript
export const SERVICES_BY_ID = Object.fromEntries(MOCK_SERVICES.map((s) => [s.id, s]));
export const TRACKINGS_BY_CODE = Object.fromEntries(MOCK_BUILD_TRACKINGS.map((t) => [t.trackingCode, t]));
```

**E) Tambahkan 2 sample `ConsultationQuote` tambahan ke `MOCK_CONSULTATION_QUOTES`** (array sudah ada, tambahkan 2 item lagi dengan quoteCode `KSS-Q-202611-002` dan `KSS-Q-202611-003`).

---

#### TASK 1.11 — Tambah WA generators di `src/lib/format.ts`

Tambahkan di AKHIR file:

```typescript
export interface ServiceBookingWAPayload {
  serviceTitle: string;
  customerName: string;
  deviceType: string;
  problemDescription: string;
  preferredDate?: string;
  preferredTime?: string;
}

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
```

---

#### TASK 1.12 — Buat `src/lib/constants.ts`

Buat file BARU:

```typescript
export const STORE_NAME = 'KSS Komputer';
export const STORE_TAGLINE = 'Jasa Rakit PC Custom & Service Komputer Profesional';
export const STORE_ADDRESS = 'Jakarta, Indonesia';
export const STORE_OPERATIONAL_HOURS = 'Senin - Sabtu, 09:00 - 18:00 WIB';
export const STORE_WARRANTY_TEXT = 'Garansi resmi distributor + garansi toko KSS Komputer. Stress-tested & QC verified.';

export const ADMIN_WHATSAPP = '6281234567890';
export const TECHNICIAN_WHATSAPP = '6281234567890';
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
```

---

#### TASK 1.13 — Buat `src/lib/utils.ts`

Buat file BARU:

```typescript
/**
 * Utility: className merger (clsx alternative ringan)
 * Gunakan: cn('base-class', condition && 'conditional-class', 'always-class')
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Utility: Generate URL-safe slug dari string Indonesia
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Utility: Clamp angka dalam range min-max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Utility: Debounce function (untuk search input)
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

---

**SETELAH TASK 1.5 – 1.13 selesai:**
1. Jalankan `.\node_modules\.bin\tsc.cmd --noEmit` — perbaiki error jika ada
2. Jalankan `npm run build` — harus sukses
3. Update ROADMAP.md: centang item 1.5 sampai 1.13
4. Commit: `git commit -m "feat(data): complete data layer — types, mock data, format utils, constants (Fase 1.5-1.13)"`
5. Push & Deploy

---

### BATCH 2: SERVICE STORE + NAVBAR RESTRUKTUR (Fase 2.8 + 3.9)

#### TASK 2.8 — Buat `src/store/useServiceStore.ts`

Gunakan template store di Section 3.3. State yang dibutuhkan:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BuildOrderTracking, ServiceBooking, ServiceBookingStatus, TrackingStage } from '../lib/types';
import { MOCK_BUILD_TRACKINGS, MOCK_SERVICE_BOOKINGS } from '../lib/mock-data';

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export interface ServiceState {
  trackings: BuildOrderTracking[];
  bookings: ServiceBooking[];

  // Tracking Actions
  getTrackingByCode: (code: string) => BuildOrderTracking | undefined;
  updateTrackingStage: (id: string, stage: TrackingStage, notes?: string) => void;

  // Booking Actions
  createBooking: (input: Omit<ServiceBooking, 'id' | 'bookingCode' | 'status' | 'createdAt' | 'updatedAt'>) => ServiceBooking;
  updateBookingStatus: (id: string, status: ServiceBookingStatus, adminNotes?: string) => void;
  deleteBooking: (id: string) => void;
  getBookingById: (id: string) => ServiceBooking | undefined;
}

export const useServiceStore = create<ServiceState>()(
  persist(
    (set, get) => ({
      trackings: MOCK_BUILD_TRACKINGS,
      bookings: MOCK_SERVICE_BOOKINGS,

      getTrackingByCode: (code: string) => {
        const clean = code.trim().toUpperCase();
        return get().trackings.find((t) => t.trackingCode.toUpperCase() === clean);
      },

      updateTrackingStage: (id: string, stage: TrackingStage, notes?: string) => {
        set((state) => ({
          trackings: state.trackings.map((t) =>
            t.id === id
              ? {
                  ...t,
                  currentStage: stage,
                  stageHistory: [
                    ...t.stageHistory,
                    { stage, timestamp: new Date().toISOString(), notes },
                  ],
                  updatedAt: new Date().toISOString().split('T')[0],
                }
              : t
          ),
        }));
      },

      createBooking: (input) => {
        const now = new Date();
        const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const bookingCode = `SRV-KSS-${yearMonth}-${randomSuffix}`;
        const id = `bk-${Date.now()}`;
        const dateStr = now.toISOString().split('T')[0];

        const newBooking: ServiceBooking = {
          ...input,
          id,
          bookingCode,
          status: 'pending',
          createdAt: dateStr,
          updatedAt: dateStr,
        };

        set((state) => ({ bookings: [newBooking, ...state.bookings] }));
        return newBooking;
      },

      updateBookingStatus: (id: string, status: ServiceBookingStatus, adminNotes?: string) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, status, adminNotes: adminNotes ?? b.adminNotes, updatedAt: new Date().toISOString().split('T')[0] } : b
          ),
        }));
      },

      deleteBooking: (id: string) => {
        set((state) => ({ bookings: state.bookings.filter((b) => b.id !== id) }));
      },

      getBookingById: (id: string) => {
        return get().bookings.find((b) => b.id === id);
      },
    }),
    {
      name: 'kss-service-store-v1',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : memoryStorage
      ),
    }
  )
);
```

---

#### TASK 3.9 — Restruktur Navbar Menu Order

Buka `src/components/layout/Navbar.tsx`. Cari array/daftar menu navigasi dan ubah urutannya menjadi:

```
1. Jasa & Servis     → /jasa
2. Rakit PC          → /simulasi
3. Paket Siap Pakai  → /paket-rakitan
4. Cek Pesanan       → /cek-pesanan
5. Komponen          → /komponen
6. Aksesoris         → /aksesoris
```

Juga ubah di `src/components/layout/BottomNav.tsx` — menu bawah mobile:

```
1. Beranda (Home icon)     → /
2. Jasa (Wrench icon)      → /jasa
3. Rakit (Cpu icon)        → /simulasi
4. Pesanan (ClipboardList) → /cek-pesanan
5. Lainnya (Menu icon)     → toggle menu
```

---

**VALIDASI BATCH 2:** tsc → build → commit `"feat(store): add useServiceStore + restructure navbar menu order (Fase 2.8, 3.9)"` → push → deploy

---

### BATCH 3: HALAMAN JASA & SERVIS (Fase 4) ⭐ PRIORITAS TERTINGGI

**Ini adalah batch terpenting.** Mengubah identitas website dari toko online menjadi bengkel servis profesional.

#### TASK 4.1 — Rombak Homepage (`src/app/page.tsx`)

**GANTI SELURUH** isi `src/app/page.tsx` dengan layout service-first:

**Urutan seksi dari atas ke bawah:**
1. Hero section — headline "Jasa Rakit PC Custom & Service Komputer Profesional", 2 CTA: [Konsultasi Rakit via WA] dan [Booking Servis]
2. Service Showcase Grid — 6 kartu dari `MOCK_SERVICES` (ambil 6 yang `popular` atau pertama), masing-masing dengan ikon, nama, harga `mulai dari Rp xxx`, dan tombol Booking WA
3. Quick Budget Strip — pill filter <5jt, 5-8jt, 8-12jt, 12-20jt, >20jt yang memfilter `MOCK_PREBUILT_PCS`
4. Paket Rakitan Populer — Grid 4-6 `PrebuiltCard` (sudah ada komponen ini)
5. Tracking CTA Banner — input field TRK-KSS-XXX + tombol Cek yang navigate ke `/cek-pesanan?code=xxx`
6. USP Grid — 6 kartu keunggulan (Garansi, Stress-Test, Cable Management, Konsultasi Gratis, Packing Aman, Teknisi Berpengalaman)
7. Carousel Aksesoris — ambil dari `MOCK_ACCESSORIES`, tampilkan ringkas (posisi bawah/sekunder)

**Import yang dibutuhkan:**
```tsx
import { MOCK_SERVICES, MOCK_PREBUILT_PCS, MOCK_ACCESSORIES, PARTS_BY_ID } from '@/lib/mock-data';
import { formatIDR, generateServiceBookingWAMessage, generateConsultationWAMessage } from '@/lib/format';
```

**Gunakan desain system dari Section 2.** Semua kartu harus `rounded-sm border border-zinc-200 dark:border-zinc-800`.

---

#### TASK 4.2 — Buat Hub Layanan Jasa (`src/app/jasa/page.tsx`)

**GANTI SELURUH** isi file yang sudah ada dengan halaman hub jasa lengkap:

- Breadcrumb: Beranda / Jasa & Servis
- Hero section kecil: "Layanan Jasa Komputer Profesional"
- Grid semua `MOCK_SERVICES` (10 kartu) — masing-masing berisi:
  - Ikon berdasarkan category (gunakan lucide icons: `Wrench` untuk rakit, `Sparkles` untuk cleaning, `HardDrive` untuk upgrade, dll)
  - Judul, deskripsi 1 baris, badge jika ada
  - Harga: `Mulai dari {formatIDR(price)}` atau `{formatIDR(price)} — {formatIDR(priceMax)}`
  - Estimasi waktu
  - 2 tombol: [Lihat Detail → /jasa/{slug}] dan [Booking via WA]
- FAQ accordion (5-6 pertanyaan umum: proses pengerjaan, garansi, estimasi waktu, apakah bisa bawa komponen sendiri, apakah bisa antar-jemput)

---

#### TASK 4.3 — Buat Detail Layanan Jasa (`src/app/jasa/[slug]/page.tsx`)

Buat file BARU `src/app/jasa/[slug]/page.tsx` menggunakan template halaman dinamis (Section 3.2):

- Cari data dari `MOCK_SERVICES.find(s => s.slug === slug)`
- Layout:
  - Breadcrumb: Beranda / Jasa & Servis / {title}
  - Header dengan judul, badge, harga, estimasi waktu
  - Deskripsi lengkap
  - 2 kolom: "Yang Termasuk" (features + includes) dan "Tidak Termasuk / Biaya Tambahan" (excludes)
  - **Form Booking Jasa:** Nama, No. WA, Tipe Perangkat (select: PC Desktop / Laptop / PC Warnet), Keluhan/Kebutuhan (textarea), Tanggal & Jam Pilihan → tombol kirim yang memanggil `generateServiceBookingWAMessage()` dan `window.open(url)`
  - Related services (3 kartu layanan lain)

---

#### TASK 4.4 — Buat Tracking Status (`src/app/cek-pesanan/page.tsx`)

Buat file BARU:

- Input field untuk kode resi (default dari URL search param `?code=` jika ada)
- Tombol "Cek Status"
- Jika ditemukan: tampilkan stepper visual dengan stages dari `TRACKING_STAGES_ORDER` di constants
  - Stage yang sudah lewat: hijau dengan centang
  - Stage aktif: biru pulsing
  - Stage belum: abu-abu
  - Setiap stage tampilkan timestamp dan notes jika ada
- Info: nama customer, deskripsi order, tipe order, estimasi selesai
- Tombol "Hubungi Teknisi via WA"
- Jika tidak ditemukan: tampilkan pesan "Kode resi tidak ditemukan"

**Gunakan `useServiceStore().getTrackingByCode(code)`** untuk mencari data.

---

#### TASK 4.5 — Buat Service Components

Buat file `src/components/service/ServiceCard.tsx`:

```tsx
import React from 'react';
import Link from 'next/link';
import { Wrench, Sparkles, HardDrive, Monitor, Settings, Server } from 'lucide-react';
import { ServicePackage } from '@/lib/types';
import { formatIDR } from '@/lib/format';

const CATEGORY_ICONS: Record<string, React.ComponentType<{className?: string}>> = {
  rakit_custom: Wrench,
  deep_cleaning: Sparkles,
  upgrade_ssd: HardDrive,
  upgrade_ram: HardDrive,
  repaste_thermal: Sparkles,
  instalasi_os: Monitor,
  instalasi_warnet: Server,
  troubleshoot: Settings,
  cable_management: Wrench,
  maintenance: Settings,
};

interface ServiceCardProps {
  service: ServicePackage;
  onBookingClick?: () => void;
}

export function ServiceCard({ service, onBookingClick }: ServiceCardProps) {
  const Icon = CATEGORY_ICONS[service.category] || Wrench;
  const priceText = service.priceMax
    ? `${formatIDR(service.price)} — ${formatIDR(service.priceMax)}`
    : service.price === 0
    ? 'GRATIS'
    : `Mulai ${formatIDR(service.price)}`;

  return (
    <div className="rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-col gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-sm bg-blue-600/10 border border-blue-600/20">
            <Icon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{service.title}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{service.duration}</p>
          </div>
        </div>
        {service.badge && (
          <span className="shrink-0 px-2 py-0.5 rounded-sm text-[10px] font-bold border text-blue-600 bg-blue-500/10 border-blue-500/20">
            {service.badge}
          </span>
        )}
      </div>

      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{service.description}</p>

      <div className="font-mono tabular-nums tracking-tight text-sm font-bold text-zinc-900 dark:text-zinc-100">
        {priceText}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-1">
        <Link
          href={`/jasa/${service.slug}`}
          className="flex-1 text-center px-3 py-1.5 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors"
        >
          Detail
        </Link>
        <button
          type="button"
          onClick={onBookingClick}
          className="flex-1 text-center px-3 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
        >
          Booking WA
        </button>
      </div>
    </div>
  );
}
```

---

**VALIDASI BATCH 3:** tsc → build → commit `"feat(pages): service-first homepage + jasa hub + detail jasa + tracking (Fase 4)"` → push → deploy

---

### BATCH 4-8: TERSEDIA DI ROADMAP.md

Setelah Batch 1-3 selesai dan tervalidasi, lanjutkan mengerjakan Fase 5-11 sesuai urutan di [ROADMAP.md](./ROADMAP.md). Pola kerjanya sama:
1. Baca spesifikasi halaman dari ROADMAP.md Section 6 dan 7
2. Gunakan code pattern templates dari Section 3 dokumen ini
3. Ikuti design system dari Section 2
4. Validasi dengan protokol di Section 1

---

## 5. ATURAN MUTLAK UNTUK AI WORKER

1. **JANGAN PERNAH** menulis `// TODO`, `// ...rest`, atau kode placeholder
2. **JANGAN PERNAH** menggunakan gradient, blur glass, rounded-2xl/3xl, shadow-2xl
3. **JANGAN PERNAH** menampilkan `costPrice` atau `sellPrice` per part di halaman publik rakitan
4. **JANGAN PERNAH** push jika tsc atau build gagal
5. **JANGAN PERNAH** menulis `export const dynamic = 'force-dynamic'` (gunakan `<Suspense>` sebagai gantinya)
6. **SELALU** gunakan `font-mono tabular-nums tracking-tight` untuk harga dan angka teknis
7. **SELALU** gunakan `useHydrated()` hook di client components yang mengakses Zustand store
8. **SELALU** wrap komponen yang menggunakan `usePathname()` atau `use(params)` dalam `<Suspense>`
9. **SELALU** jalankan tsc + build sebelum commit
10. **SELALU** update checklist di ROADMAP.md setelah menyelesaikan task
11. **SATU BATCH per sesi kerja.** Jangan loncat. Batch 1 → 2 → 3 berurutan.
12. **Baca AGENT_RULES.md** untuk aturan design system lengkap sebelum menulis JSX

---

## 6. QUICK REFERENCE: FILE YANG SUDAH ADA

```
✅ ADA & LENGKAP (jangan buat ulang, cukup modifikasi jika diminta):
  src/lib/types.ts          — tambah tipe baru di akhir file
  src/lib/format.ts         — tambah fungsi baru di akhir file
  src/lib/mock-data.ts      — update/tambah data
  src/lib/compatibility.ts  — JANGAN UBAH
  src/lib/useHydrated.ts    — JANGAN UBAH
  src/store/useBuilderStore.ts    — JANGAN UBAH
  src/store/useAdminStore.ts      — JANGAN UBAH
  src/store/useRetailCartStore.ts — JANGAN UBAH
  src/store/useQuoteStore.ts      — JANGAN UBAH
  src/store/useCartStore.ts       — JANGAN UBAH
  src/store/useCompareStore.ts    — JANGAN UBAH
  src/components/layout/Navbar.tsx       — modifikasi urutan menu (Task 3.9)
  src/components/layout/BottomNav.tsx    — modifikasi urutan menu (Task 3.9)
  src/components/layout/Footer.tsx       — JANGAN UBAH
  src/components/layout/CartDrawer.tsx   — JANGAN UBAH
  src/components/layout/CommandSearchModal.tsx — JANGAN UBAH
  src/components/cart/RetailCartDrawer.tsx — JANGAN UBAH
  src/components/prebuilt/PrebuiltCard.tsx — JANGAN UBAH
  src/components/catalog/* — JANGAN UBAH
  src/app/layout.tsx         — JANGAN UBAH (kecuali tambah provider/toaster nanti)
  src/app/simulasi/page.tsx  — JANGAN UBAH
  src/app/komponen/page.tsx  — JANGAN UBAH
  src/app/aksesoris/page.tsx — JANGAN UBAH
  src/app/paket-rakitan/page.tsx       — JANGAN UBAH
  src/app/paket-rakitan/[slug]/page.tsx — JANGAN UBAH
  src/app/penawaran/[code]/page.tsx    — JANGAN UBAH
  src/app/admin/pricing/page.tsx       — JANGAN UBAH
  src/app/admin/quotes/page.tsx        — JANGAN UBAH

⚠️ HARUS DIMODIFIKASI:
  src/lib/server-dto.ts     → RENAME ke src/lib/sanitizer.ts (Task 1.9)
  src/app/page.tsx          → GANTI SELURUH isi (Task 4.1)
  src/app/jasa/page.tsx     → GANTI SELURUH isi (Task 4.2)

🆕 HARUS DIBUAT BARU:
  src/lib/constants.ts       (Task 1.12)
  src/lib/utils.ts           (Task 1.13)
  src/store/useServiceStore.ts (Task 2.8)
  src/app/jasa/[slug]/page.tsx (Task 4.3)
  src/app/cek-pesanan/page.tsx (Task 4.4)
  src/components/service/ServiceCard.tsx (Task 4.5)
```
