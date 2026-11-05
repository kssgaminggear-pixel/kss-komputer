# MASTER BLUEPRINT & EXECUTION ROADMAP — KSS KOMPUTER (WEB & PWA)

Dokumen spesifikasi arsitektur, rincian halaman (Public & Admin), skema database, dan daftar periksa eksekusi bertahap untuk Single-Agent Antigravity. Setiap menyelesaikan satu sub-tugas dan memastikan lolos uji TypeScript (`npx tsc --noEmit`), ubah `[ ]` menjadi `[x]`.

---

## 1. VISI PRODUK & ATURAN BISNIS INTI (CORE BUSINESS RULES)

1. **Modernized Enterkomputer UI:** Kepadatan informasi tinggi dan navigasi secepat kilat ala `enterkomputer.com`, namun diperbarui dengan desain *Bento Grid*, *Dark/Light Slate Theme*, *Instant Search & Filter*, serta tampilan *Mobile-First PWA*.
2. **Zero Part-Price Leak pada Rakitan (System Integrator Mode):**
   - Pada halaman **Katalog Paket PC Rakitan**, **Detail Paket PC**, **Simulasi Rakit PC (`/simulasi`)**, dan **Surat Penawaran (`/penawaran/[code]`)**, sistem **WAJIB MENYEMBUNYIKAN** harga satuan per komponen (`costPrice` maupun `sellPrice` per part).
   - Yang ditampilkan ke konsumen hanyalah **Harga Total Paket PC Siap Pakai** dan **Delta Price (`+ Rp xxx.xxx` / `- Rp xxx.xxx` / `Standar`)** saat konsumen mengganti/meng-upgrade komponen.
3. **Transparansi Harga pada Katalog Eceran & Aksesoris:**
   - Pada halaman **Komponen Eceran (`/komponen`)** dan **Aksesoris (`/aksesoris`)**, sistem menampilkan **Harga Jual Eceran (`retailPrice`)** per item secara normal layaknya toko komputer modern.
4. **Konsultasi Rakitan via WhatsApp & Smart Quotation:**
   - Konsumen dapat mengirim form konsultasi (Budget + Kebutuhan) ke WhatsApp Admin.
   - Admin meracik PC di *Admin Quotation Studio*, dan sistem menerbitkan **Link Web Penawaran & File PDF Resmi** yang berisi daftar spesifikasi lengkap + **1 Harga Total Paket** + tombol Checkout Tokopedia / WhatsApp.

---

## 2. TECH STACK & TOOLS

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript (`strict: true`)
- **Styling & UI:** Tailwind CSS + `shadcn/ui` + `lucide-react` + `framer-motion` (transisi halus)
- **State Management:** `zustand` (persist di `localStorage` untuk Builder, Cart, dan Admin Draft)
- **Database & ORM:** PostgreSQL (Docker / Supabase) + Prisma ORM
- **Form & Validation:** `react-hook-form` + `zod`
- **PDF & Print Engine:** `@react-pdf/renderer` / CSS `@media print` khusus Faktur & Surat Penawaran A4
- **PWA Support:** `manifest.json` + Service Worker untuk instalasi aplikasi di Android/iOS

---

## 3. STRUKTUR DIREKTORI PROYEK (`src/`)

```text
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                        # 1. Homepage (Hero, Quick Budget Filter, Best-Seller Rigs, Accessories, USP)
│   │   ├── paket-rakitan/
│   │   │   ├── page.tsx                    # 2. Katalog Paket PC Rakitan Siap Pakai (Filter Budget, CPU, Resolusi)
│   │   │   └── [slug]/page.tsx             # 3. Detail Paket PC + Quick Spec Upgrader (Delta Price) + FPS Bar
│   │   ├── simulasi/
│   │   │   └── page.tsx                    # 4. Custom PC Configurator (Tanpa Harga Part) + Tab Form Konsultasi WA
│   │   ├── konsultasi/
│   │   │   └── page.tsx                    # 5. Wizard Konsultasi Rakitan by Budget & Kebutuhan (Auto WA Generator)
│   │   ├── komponen/
│   │   │   ├── page.tsx                    # 6. Katalog Komponen Eceran (Dual View: Tabel Enterkomputer Modern & Grid)
│   │   │   └── [slug]/page.tsx             # 7. Detail Komponen Eceran
│   │   ├── aksesoris/
│   │   │   └── page.tsx                    # 8. Katalog Aksesoris & Gaming Gear (Monitor, Mouse, Keyboard, Kursi)
│   │   ├── jasa/
│   │   │   └── page.tsx                    # 9. Katalog Layanan Jasa Service, Cleaning, Rakit & Form Booking WA
│   │   ├── cek-pesanan/
│   │   │   └── page.tsx                    # 10. Tracking Status Rakit PC / Status Servis dengan Kode Resi Internal
│   │   ├── penawaran/
│   │   │   └── [code]/page.tsx             # 11. Halaman Surat Penawaran Resmi (Quotation View & Print-to-PDF)
│   │   └── tentang-kami/
│   │       └── page.tsx                    # 12. Profil KSS Komputer, Lokasi Toko, Garansi & FAQ
│   ├── admin/
│   │   ├── layout.tsx                      # Sidebar Navigasi Admin, Header Status Toko & Quick Actions
│   │   ├── page.tsx                        # A1. Dashboard Overview (Statistik Paket, Kuotasi Aktif, Margin Rata-rata)
│   │   ├── paket-rakitan/
│   │   │   ├── page.tsx                    # A2. Manajemen Paket PC Rakitan (List, Clone, Toggle Aktif, Edit Link Tokopedia)
│   │   │   └── [id]/page.tsx               # A3. Editor Paket PC (Pilih Komponen, Hitung HPP Modal vs Harga Jual Paket)
│   │   ├── komponen/
│   │   │   └── page.tsx                    # A4. Manajemen Komponen Hardware & Spesifikasi Kompatibilitas
│   │   ├── aksesoris/
│   │   │   └── page.tsx                    # A5. Manajemen Katalog Aksesoris & Gaming Gear
│   │   ├── pricing/
│   │   │   └── page.tsx                    # A6. Spreadsheet Bulk Pricing (Modal, Markup %, Harga Ecer, Import/Export CSV)
│   │   ├── quotes/
│   │   │   ├── page.tsx                    # A7. Daftar Penawaran Konsultasi WA (Draft, Terkirim, Deal, Expired)
│   │   │   └── buat/page.tsx               # A8. Quotation Studio (Racik Spek sesuai Budget Konsumen + Cetak Link/PDF)
│   │   ├── jasa-servis/
│   │   │   └── page.tsx                    # A9. Manajemen Paket Jasa & Antrean Pengerjaan Rakit/Servis
│   │   └── pengaturan/
│   │       └── page.tsx                    # A10. Pengaturan Toko (Nomor WA Admin, Link Tokopedia, Biaya Rakit, Kop Surat)
│   └── api/
│       ├── catalog/route.ts                # Endpoint Katalog Terfilter (Sanitized tanpa costPrice)
│       ├── quotes/[code]/route.ts          # Endpoint Pengambilan Data Quotation Publik (Tanpa Harga Per Part)
│       └── admin/export-import/route.ts    # Endpoint Backup/Restore Data Harga CSV/JSON
├── components/
│   ├── layout/                             # Navbar, MegaMenu, MobileBottomNav, Footer, FloatingWAButton
│   ├── home/                               # HeroBanner, BudgetQuickFilter, FeaturedPrebuiltGrid, ServiceHighlights
│   ├── prebuilt/                           # PrebuiltCard, FpsBenchmarkBar, QuickSpecUpgrader, BundleSummaryBox
│   ├── builder/                            # BuilderSlotRow, PartSelectorDrawer, CompatibilityAlert, StickyTelemetryBar
│   ├── retail/                             # HighDensityPartTable, RetailPartGrid, RetailFilterSidebar, RetailCartDrawer
│   ├── quote/                              # QuotationPrintSheet, ConsultationWizardForm
│   └── admin/                              # SpreadsheetPriceTable, MarginSimulatorCard, AdminPartFormModal
├── lib/
│   ├── types.ts                            # Kontrak TypeScript Lengkap
│   ├── format.ts                           # Formatter IDR, Delta Price, Generator Pesan WA & URL Tokopedia
│   ├── compatibility.ts                    # Mesin Validasi Socket, RAM, Dimensi Casing, Wattage & Bottleneck
│   ├── sanitizer.ts                        # Penghapus field costPrice & sellPrice satuan pada payload Rakitan
│   └── mock-data.ts                        # Database Awal (Komponen, Paket PC, Aksesoris, Jasa, Sample Quotes)
└── store/
    ├── useBuilderStore.ts                  # State Simulasi Rakit PC & Quick Upgrader
    ├── useRetailCartStore.ts               # State Keranjang Belanja Komponen Eceran & Aksesoris
    ├── useQuoteStore.ts                    # State Manajemen Surat Penawaran (Quotation)
    └── useAdminStore.ts                    # State Pengaturan Harga, Markup, Katalog & Konfigurasi Toko
```

---

## 4. DESAIN SKEMA DATABASE (`prisma/schema.prisma`)

- **HardwarePart (Komponen PC):**
  - `id`, `sku`, `name`, `slug`, `brand`, `category` (CPU, MOBO, RAM, GPU, SSD, HDD, PSU, CASE, COOLER, MONITOR)
  - `costPrice` (Int - Modal Rahasia Admin)
  - `bundleBasePrice` (Int - Harga dasar kalkulasi di dalam rakitan, disembunyikan dari publik)
  - `retailPrice` (Int - Harga jual satuan di halaman `/komponen`)
  - `isRetailSold` (Boolean - Apakah dijual eceran atau khusus stok rakitan)
  - `stockStatus` (READY, LIMITED, PREORDER, OUT_OF_STOCK)
  - `wattage` (Int), `imageUrl`, `tokopediaUrl`
  - `specs` (JSON: socket, chipset, ramType, formFactor, vram, capacityGb, lengthMm, psuTier)

- **PrebuiltPC (Paket PC Rakitan Jadi):**
  - `id`, `code`, `name`, `slug`, `tier` (OFFICE, ESPORTS_1080P, AAA_1080P, CREATOR_1440P, WORKSTATION_4K)
  - `parts` (Relasi/JSON daftar slot -> partId)
  - `upgradeOptions` (JSON daftar opsi upgrade cepat per slot untuk Quick Spec Upgrader)
  - `assemblyFee` (Int), `customMarkupPercent` (Float), `overrideTotalPrice` (Int?)
  - `fpsBenchmarks` (JSON: `[{ game: "Valorant", resolution: "1080p", fps: 320 }, ...]`)
  - `tokopediaUrl`, `isFeatured` (Boolean), `isActive` (Boolean)

- **AccessoryItem (Aksesoris & Gaming Gear):**
  - `id`, `sku`, `name`, `slug`, `category` (KEYBOARD, MOUSE, HEADSET, MONITOR, CHAIR, UPS, WEBCAM, NETWORKING)
  - `costPrice`, `retailPrice`, `stockStatus`, `specsSummary`, `tokopediaUrl`, `imageUrl`

- **ServicePackage (Layanan Jasa):**
  - `id`, `name`, `slug`, `price`, `estimatedDuration`, `description`, `features` (String[])

- **ConsultationQuote (Surat Penawaran Rakitan Konsultasi WA):**
  - `id`, `quoteCode` (Unik: KSS-2026-XXXX), `customerName`, `customerWa`, `customerBudget`, `usageNeed`
  - `selectedParts` (JSON daftar komponen rakitan tanpa menampilkan harga satuan di tampilan publik)
  - `totalCostPrice` (Hanya dilihat Admin), `finalQuotedPrice` (Harga total paket yang tampil ke konsumen)
  - `adminNotes`, `validUntil`, `tokopediaCustomUrl`, `status` (DRAFT, SENT, APPROVED, EXPIRED)

- **BuildOrderTracking (Pelacakan Status Rakit/Servis):**
  - `trackingCode` (TRK-KSS-XXX), `customerName`, `itemTitle`, `currentStage` (PAYMENT_VERIFIED, PARTS_PREPARATION, ASSEMBLING, CABLE_MANAGEMENT, STRESS_TESTING, READY_TO_SHIP), `updatedAt`, `notes`

---

## 5. SPESIFIKASI DETAIL SETIAP HALAMAN PUBLIK (12 HALAMAN)

### 5.1 Homepage (`src/app/page.tsx`)
- **Top Announcement Bar:** Info jam operasional, garansi resmi, & link cepat Tokopedia (`https://tk.tokopedia.com/ZSpeToWkH/`).
- **Sticky Header & Mega Navigation:** Search bar global instan (mencari Paket PC, VGA, Monitor, Aksesoris), shortcut Simulasi Rakit, Konsultasi WA, indikator Keranjang Eceran, dan badge Total Simulasi Aktif.
- **Hero Section Modern:** Split layout—kiri berisi headline *"Rakit PC Siap Pakai Sesuai Budget, Tanpa Pusing Kompatibilitas"* + 2 tombol CTA (*Lihat Paket PC Siap Pakai* & *Konsultasi Budget via WA*); kanan berisi Interactive Rig Showcase Card.
- **Quick Budget & Purpose Selector:** Pill filter interaktif (Di bawah 5 Juta, 5–8 Juta, 8–12 Juta, 12–20 Juta, Sultan >20 Juta | Gaming, Editing/3D, Kasir/Office, Live Streaming).
- **Katalog Paket PC Rakitan Unggulan:** Grid 6 kartu PC jadi berisi badge target resolusi, rangkuman komponen utama (CPU, GPU, RAM, Storage), bar performa FPS, Harga Total Paket Jadi, tombol Upgrade/Kustomisasi, dan tombol Beli via Tokopedia / WA.
- **Banner Konsultasi WA Interaktif:** Seksi khusus untuk pengguna yang punya budget spesifik dan ingin diracikkan langsung oleh teknisi KSS Komputer.
- **Highlight Komponen & Aksesoris Terlaris:** Carousel/Grid Monitor, Gear Gaming, dan komponen upgrade siap beli eceran.
- **Why KSS Komputer (USP Grid):** Garansi Resmi, Stress-Test OCCT/FurMark sebelum dikirim, Cable Management Rapi, Gratis Konsultasi, Packing Kayu Aman.

### 5.2 Katalog Paket PC Rakitan (`src/app/paket-rakitan/page.tsx`)
- **Sidebar / Top Filter Bar:** Filter berdasarkan Rentang Harga, Platform Processor (AMD Ryzen / Intel Core), Seri GPU (RTX, Radeon, Integrated), Kapasitas RAM (16GB, 32GB, 64GB), dan Kegunaan.
- **Sorting:** Termurah, Termahal, Performa FPS Tertinggi, Terlaris.
- **Comparison Drawer (Bandingkan Paket):** Fitur memilih hingga 3 Paket PC untuk dibandingkan berdampingan (Spesifikasi, Estimasi FPS, Wattage, dan Total Harga Paket).

### 5.3 Detail Paket PC & Quick Spec Upgrader (`src/app/paket-rakitan/[slug]/page.tsx`)
- **Galeri & Highlight Rig:** Preview visual casing, badge garansi, estimasi konsumsi daya (Watt), dan skor performa.
- **Daftar Spesifikasi Bawaan (Zero Part-Price):** Menampilkan 8–10 komponen utama yang menyusun PC tersebut lengkap dengan nama seri dan brand, tanpa mencantumkan harga per part.
- **Interactive Quick Spec Upgrader:**
  - Konsumen dapat langsung mengganti RAM, SSD, VGA, Cooler, atau Casing melalui pill/dropdown komponen yang 100% kompatibel.
  - Setiap opsi hanya menampilkan Delta Price (`+ Rp 450.000`, `- Rp 200.000`, atau `Termasuk`).
  - Mengklik opsi langsung memperbarui Harga Total Paket dan bar estimasi FPS secara real-time.
- **Panel Aksi Konversi:** Tombol Pesan Paket Ini via WA (Kirim Rincian Spek & Harga Total), Checkout via Tokopedia, Cetak Lembar Spesifikasi (PDF), dan Buka di Custom Configurator Penuh.

### 5.4 Custom PC Configurator (`src/app/simulasi/page.tsx`)
- **Tabel Slot Rakitan Modern:** 10 baris slot (Processor, Motherboard, CPU Cooler, Memory RAM, SSD Utama, Storage Tambahan, Graphics Card / VGA, Power Supply, Casing PC, Monitor & Gear).
- **Smart Part Selector Drawer:**
  - Ketika pengguna klik "Pilih / Ganti" pada suatu slot, drawer terbuka dan otomatis mengunci/menyembunyikan part yang tidak kompatibel (misal: memilih CPU AM5 otomatis hanya memunculkan Motherboard AM5 dan RAM DDR5).
  - Setiap kandidat part di dalam drawer tidak menampilkan harga eceran, melainkan menampilkan Selisih Harga Paket (`+ Rp xxx.xxx` / `- Rp xxx.xxx`) terhadap konfigurasi saat ini.
- **Real-Time Compatibility & Bottleneck Inspector:** Menampilkan status 100% Kompatibel, peringatan ukuran GPU vs Casing, peringatan update BIOS, serta kalkulator Estimated Wattage vs Rekomendasi PSU.
- **Sticky Bottom Telemetry Bar:** Menampilkan Total Komponen Terpilih, Estimasi Daya, Total Harga Paket Rakitan Siap Pakai, tombol Reset, Cetak Penawaran Resmi, dan Kirim ke WA Admin untuk Penawaran Terbaik.

### 5.5 Wizard Konsultasi Rakitan by Budget (`src/app/konsultasi/page.tsx`)
- **Step 1 - Tentukan Budget:** Slider interaktif dan tombol nominal cepat (Rp 4 Juta s/d Rp 50 Juta+).
- **Step 2 - Pilih Kebutuhan Utama:** Multi-select game yang dimainkan (Valorant, CS2, Genshin, Cyberpunk, GTA V) atau software kerja (Premiere Pro, Blender, AutoCAD, Android Studio, Kasir/Office).
- **Step 3 - Preferensi & Kelengkapan:** Pilihan PC Only vs Fullset dengan Monitor & Gear, preferensi warna casing (Black / White / RGB / Minimalis), dan preferensi platform (AMD / Intel / Bebas Rekomendasi Terbaik).
- **Step 4 - Instant Recommendation & WA Dispatch:** Sistem menampilkan 2 Paket PC KSS yang paling mendekati budget tersebut, sekaligus tombol "Minta Racikan Kustom via WhatsApp" dengan pesan terformat otomatis.

### 5.6 Katalog Komponen Eceran (`src/app/komponen/page.tsx` & `[slug]/page.tsx`)
- **Mode Tampilan Ganda (Toggle View):**
  - **Compact Table View (Gaya Enterkomputer Modern):** Baris padat berisi Kode SKU, Nama Komponen, Badge Spesifikasi Kunci, Status Stok, Harga Eceran (`retailPrice`), dan tombol cepat `+ Keranjang`.
  - **Bento Grid View:** Tampilan kartu visual dengan foto produk, spesifikasi, dan harga eceran.
- **Filter Instan Tanpa Reload:** Cari berdasarkan nama/seri, filter Kategori, Brand, Socket, dan Rentang Harga.

### 5.7 Katalog Aksesoris & Gaming Gear (`src/app/aksesoris/page.tsx`)
- Katalog khusus Monitor, Keyboard Mechanical, Mouse Gaming, Headset, Webcam, UPS, dan Kursi Gaming dengan tampilan Harga Eceran Resmi, filter kategori, dan integrasi ke `RetailCartDrawer`.

### 5.8 Halaman Layanan Jasa & Booking (`src/app/jasa/page.tsx`)
- **Katalog paket layanan:** Jasa Rakit Full Custom & Cable Management, Deep Cleaning & Repaste Thermal, Jasa Upgrade & Migrasi OS SSD, Instalasi PC Warnet/Kantor/Lab.
- **Form Booking Jadwal Servis:** Input nama, jenis PC/keluhan, tanggal kedatangan/jemput, dan kirim antrean langsung ke WhatsApp Teknisi.

### 5.9 Halaman Cek Status Rakit & Servis (`src/app/cek-pesanan/page.tsx`)
- Konsumen memasukkan kode resi internal (contoh: `TRK-KSS-001`) untuk melihat progress stepper pengerjaan PC rakitannya (Persiapan Komponen -> Proses Perakitan -> Cable Management -> Stress Test 24 Jam -> Siap Dikirim).

### 5.10 Halaman Surat Penawaran Resmi (`src/app/penawaran/[code]/page.tsx`)
- Halaman khusus yang diakses konsumen dari link yang dikirim Admin melalui WhatsApp.
- Menampilkan Kop Resmi KSS Komputer, Informasi Konsumen, Nomor Kuotasi, Masa Berlaku, Tabel Daftar Spesifikasi Lengkap (Tanpa Kolom Harga Satuan Part), Rincian Garansi & Bonus Rakit, serta 1 Kotak Harga Total Penawaran Paket.
- Dilengkapi tombol Cetak / Download PDF (A4 Clean Layout), Setujui & Pesan via WhatsApp, dan Beli via Link Tokopedia Khusus.

---

## 6. SPESIFIKASI DETAIL PANEL ADMIN (`/admin` - 10 SUB-MODUL)

- **`/admin` (Dashboard Command Center):**
  - Ringkasan metrik bisnis: Total Paket PC Aktif, Total Komponen, Rata-rata Margin Profit Rakitan (% dan Rp), Daftar Kuotasi Konsultasi WA Terbaru, dan Peringatan Stok Komponen Menipis.
- **`/admin/paket-rakitan` & `/admin/paket-rakitan/[id]` (Prebuilt PC Manager):**
  - CRUD Paket PC Rakitan, fitur Clone Paket, atur komponen penyusun, lihat perbandingan Total Modal (HPP) vs Harga Jual Bundel vs Profit Bersih, serta edit URL Tokopedia per paket.
- **`/admin/komponen` (Hardware Part Inventory):**
  - CRUD Komponen PC, atur spesifikasi kompatibilitas (socket, ramType, wattage, lengthMm), status stok, dan toggle apakah part boleh dijual eceran (`isRetailSold`).
- **`/admin/aksesoris` (Accessories Manager):**
  - CRUD Aksesoris & Monitor beserta harga modal dan harga jual eceran.
- **`/admin/pricing` (Spreadsheet Bulk Pricing & Markup Panel):**
  - Tabel interaktif bergaya Excel untuk mengedit cepat `costPrice` (Modal), `sellPrice` (Harga Dasar Rakitan), `retailPrice` (Harga Ecer), pengaturan Global Markup %, Biaya Rakit Default, serta tombol Export/Import CSV/JSON.
- **`/admin/quotes` & `/admin/quotes/buat` (WA Consultation Quotation Studio):**
  - Alat kerja utama Admin saat membalas chat WA konsumen:
    - Input Nama Konsumen, Nomor WA, dan Target Budget (misal: Rp 11.500.000).
    - Pilih komponen per slot dengan indikator kompatibilitas otomatis.
    - Panel Kalkulator Rahasia Admin: Menampilkan Total Modal Asli, Saran Harga Jual, input Diskon/Harga Deal Final, dan Keuntungan Bersih (Profit Rp & %).
    - Klik *"Terbitkan Link & PDF Penawaran"*: Menghasilkan kode unik `/penawaran/KSS-XXXX` dan tombol sekali klik untuk mengirim pesan balasan WhatsApp ke konsumen berisi link penawaran tersebut.
- **`/admin/jasa-servis` (Service & Assembly Tracker):**
  - Kelola daftar harga jasa dan update status pengerjaan rakitan konsumen (`TRK-KSS-XXX`).
- **`/admin/pengaturan` (Store Configuration):**
  - Atur Nomor WhatsApp Admin/Teknisi, Link Toko Tokopedia Utama, Catatan Garansi pada Kaki Surat Penawaran, dan PIN/Password akses Admin.

---

## 7. CHECKLIST EKSEKUSI BERTAHAP (FASE 1 S/D FASE 10)

### FASE 1: Fondasi Tipe Data, Kalkulator Markup & Database Komprehensif
- [x] **1.1 Buat `src/lib/types.ts` dasar** (`HardwarePart`, `PrebuiltPC`, `ServicePackage`).
- [x] **1.2 Buat `src/lib/format.ts` dasar** (`formatIDR`, `formatDeltaIDR`, generator WA dasar).
- [x] **1.3 Buat `src/lib/mock-data.ts` dasar** (45+ part, 6 paket PC, 4 layanan jasa).
- [ ] **1.4 Ekspansi `src/lib/types.ts` & `src/lib/sanitizer.ts`:**
  - Tambahkan kontrak `AccessoryItem`, `ConsultationQuote`, `BuildOrderTracking`, `StoreSettings`, serta properti `retailPrice`, `isRetailSold`, dan `stockStatus` pada `HardwarePart`.
  - Buat fungsi `sanitizePrebuiltForPublic()` di `src/lib/sanitizer.ts` agar harga modal (`costPrice`) dan harga per part rakitan tidak pernah terekspos ke komponen publik.
- [ ] **1.5 Ekspansi `src/lib/mock-data.ts` & `src/lib/format.ts`:**
  - Tambahkan 20+ item `AccessoryItem` (Monitor, Keyboard, Mouse, Headset, Kursi Gaming, UPS), 3 sample `ConsultationQuote` (`KSS-2026-001`, dll), dan 3 sample `BuildOrderTracking` (`TRK-KSS-001`, dll).
  - Tambahkan formatter `generateConsultationWAMessage()`, `generateRetailCartWAMessage()`, dan `generateQuoteShareWAMessage()`.

---

### FASE 2: Compatibility Engine & Zustand Multi-Store Architecture
- [x] **2.1 Buat `src/lib/compatibility.ts`** (Validasi socket, RAM, form factor, dimensi GPU, Wattage, `calculateBundleTotal`).
- [x] **2.2 Buat `src/store/useBuilderStore.ts`** (State simulasi rakit PC & delta price).
- [x] **2.3 Buat `src/store/useAdminStore.ts`** (State markup, assembly fee, dan edit harga).
- [ ] **2.4 Buat `src/store/useRetailCartStore.ts` & `src/store/useQuoteStore.ts`:**
  - `useRetailCartStore`: State keranjang belanja eceran & aksesoris (`items`, `addItem`, `removeItem`, `updateQty`, `clearCart`, `getTotalRetailPrice`).
  - `useQuoteStore`: State CRUD Surat Penawaran Konsultasi WA (`quotes`, `createQuote`, `updateQuoteStatus`, `getQuoteByCode`) dan pelacakan status rakit (`trackings`, `updateTrackingStage`).

---

### FASE 3: Layout Global Modern, Navigasi Mega-Menu, PWA & Homepage
- [ ] **3.1 Buat `src/components/layout/Navbar.tsx`, `MobileBottomNav.tsx`, `RetailCartDrawer.tsx` & `Footer.tsx`:**
  - Header modern berdensitas tinggi dengan Global Search Modal, indikator Simulasi Aktif, Drawer Keranjang Eceran, pintasan Tokopedia Resmi, dan Bottom Navigation Bar untuk perangkat mobile.
  - Buat `public/manifest.json` untuk dukungan instalasi PWA.
- [ ] **3.2 Buat `src/app/page.tsx` (High-Conversion Homepage):**
  - Implementasikan Hero Section, Quick Budget & Need Filter, Grid Paket PC Rakitan Terlaris (dengan FPS Benchmark Bar & harga bundel), Banner Konsultasi WA, Katalog Aksesoris Pilihan, dan seksi Keunggulan KSS Komputer.

---

### FASE 4: Katalog Paket Rakitan, Perbandingan Rig & Halaman Quick Spec Upgrader
- [ ] **4.1 Buat `src/app/paket-rakitan/page.tsx`:**
  - Katalog lengkap Paket PC Siap Pakai dengan filter multi-dimensi (Budget, Platform CPU, Seri GPU, Resolusi) serta fitur Compare Drawer (Bandingkan hingga 3 PC).
- [ ] **4.2 Buat `src/app/paket-rakitan/[slug]/page.tsx`:**
  - Halaman detail Paket PC (tanpa menampilkan harga satuan part) lengkap dengan fitur Quick Spec Upgrader (ganti RAM/SSD/GPU/Casing dengan tampilan Delta Price `+ Rp xxx.xxx`), visualisasi FPS, tombol Pesan via WA, Beli di Tokopedia, dan lanjut ke Simulasi Penuh.

---

### FASE 5: Custom PC Configurator (`/simulasi`) & Wizard Konsultasi Budget (`/konsultasi`)
- [ ] **5.1 Buat `src/app/simulasi/page.tsx` beserta `BuilderSlotRow.tsx` & `PartSelectorDrawer.tsx`:**
  - Antarmuka simulasi rakit PC 10 slot yang mengunci pilihan pada komponen yang kompatibel, hanya menampilkan Delta Price di dalam drawer, dilengkapi indikator Bottleneck/Wattage dan Sticky Telemetry Bar (Total Harga Bundel + Cetak PDF + Kirim WA).
- [ ] **5.2 Buat `src/app/konsultasi/page.tsx`:**
  - Wizard interaktif 4 langkah bagi konsumen untuk memilih budget, memilih game/software kerja, melihat rekomendasi paket otomatis, dan mengirim format konsultasi detail ke WhatsApp Admin.

---

### FASE 6: Katalog Komponen Eceran (`/komponen`) & Aksesoris (`/aksesoris`)
- [ ] **6.1 Buat `src/app/komponen/page.tsx` & `src/app/komponen/[slug]/page.tsx`:**
  - Katalog komponen dengan toggle High-Density Table View (Gaya Enterkomputer Modern) dan Bento Grid View, filter kategori/socket/brand, menampilkan Harga Eceran (`retailPrice`), status stok, dan tombol tambah ke Keranjang Eceran.
- [ ] **6.2 Buat `src/app/aksesoris/page.tsx`:**
  - Katalog Monitor, Gaming Gear, dan Aksesoris komputer dengan filter cepat dan checkout keranjang eceran ke WhatsApp / Tokopedia.

---

### FASE 7: Layanan Jasa (`/jasa`), Cek Status Rakit (`/cek-pesanan`) & Profil Toko (`/tentang-kami`)
- [ ] **7.1 Buat `src/app/jasa/page.tsx`:**
  - Katalog layanan jasa rakit, maintenance, cleaning, dan form interaktif booking jadwal servis via WhatsApp.
- [ ] **7.2 Buat `src/app/cek-pesanan/page.tsx` & `src/app/tentang-kami/page.tsx`:**
  - Halaman pelacakan progress rakitan/servis menggunakan kode `TRK-KSS-XXX` dan halaman informasi garansi, alamat toko, serta FAQ KSS Komputer.

---

### FASE 8: Sistem Surat Penawaran Resmi (`/penawaran/[code]`) & Print-to-PDF Engine
- [ ] **8.1 Buat `src/app/penawaran/[code]/page.tsx`:**
  - Halaman Surat Penawaran (Quotation) profesional dengan stylesheet cetak A4 (`@media print`), menampilkan kop KSS Komputer, rincian komponen lengkap tanpa harga per part, hanya 1 Harga Total Paket Penawaran, masa berlaku, QR/Link Tokopedia, dan tombol konfirmasi WA.

---

### FASE 9: Ekosistem Admin Panel Lengkap (`/admin/*`)
- [ ] **9.1 Buat `src/app/admin/layout.tsx` & `src/app/admin/page.tsx`:**
  - Layout dashboard admin dengan sidebar navigasi lengkap dan ringkasan metrik bisnis, profit margin, serta kuotasi aktif.
- [ ] **9.2 Buat `/admin/quotes/page.tsx` & `/admin/quotes/buat/page.tsx` (WA Quotation Studio):**
  - Studio peracik penawaran untuk merespons konsultasi WA konsumen: pilih part, pantau HPP Modal vs Harga Jual Paket vs Margin Profit secara real-time, generate kode `/penawaran/[code]`, dan kirim link ke WA konsumen.
- [ ] **9.3 Buat `/admin/pricing/page.tsx`, `/admin/paket-rakitan/page.tsx`, `/admin/komponen/page.tsx` & `/admin/pengaturan/page.tsx`:**
  - Spreadsheet Bulk Pricing editor (`costPrice`, `sellPrice`, `retailPrice`, Markup %, Import/Export JSON/CSV), manajemen paket PC jadi, manajemen antrean servis, dan konfigurasi nomor WA / link Tokopedia toko.

---

### FASE 10: Skema Database Produksi (Prisma + PostgreSQL) & Final QA
- [ ] **10.1 Buat `prisma/schema.prisma`, `prisma/seed.ts` & API Route Sanitizer:**
  - Siapkan skema database PostgreSQL produksi beserta script seeder dan endpoint API yang terproteksi.
- [ ] **10.2 Final Audit & Type-Safety Verification:**
  - Jalankan `npx tsc --noEmit` dan pastikan 0 error di seluruh halaman publik maupun admin.
