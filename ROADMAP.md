# MASTER BLUEPRINT & EXECUTION ROADMAP — KSS KOMPUTER

> **Versi:** 3.0 · **Terakhir diperbarui:** 2026-11-15
> **Stack:** Next.js 16.4 · React 19 · TypeScript `strict` · Tailwind CSS 4 · Zustand · Prisma · PostgreSQL
> **Deployment:** Vercel (CLI) → `https://kss-komputer-seven.vercel.app`
> **Repo:** `github.com/kssgaminggear-pixel/kss-komputer`

Dokumen ini adalah **single source of truth** untuk arsitektur, spesifikasi fitur, dan checklist eksekusi proyek KSS Komputer.
Setiap sub-tugas yang selesai dan lolos `tsc --noEmit` + `npm run build` → ubah `[ ]` → `[x]`.

---

## DAFTAR ISI

1. [Visi Produk & Identitas Bisnis](#1-visi-produk--identitas-bisnis)
2. [Aturan Bisnis Inti](#2-aturan-bisnis-inti)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Struktur Direktori](#4-struktur-direktori-proyek)
5. [Skema Database](#5-skema-database)
6. [Halaman Publik (12 Halaman)](#6-spesifikasi-halaman-publik-12-halaman)
7. [Admin Panel (10 Sub-Modul)](#7-spesifikasi-admin-panel-10-sub-modul)
8. [Checklist Eksekusi (Fase 0–11)](#8-checklist-eksekusi)
9. [Deployment & CI/CD Rules](#9-deployment--cicd-rules)

---

## 1. VISI PRODUK & IDENTITAS BISNIS

### 1.1 Identitas Utama

**KSS Komputer** adalah **bengkel komputer & jasa rakit PC profesional** berbasis Jakarta. Website dan PWA ini menampilkan identitas sebagai **Service Center** terlebih dahulu, baru kemudian sebagai toko komponen & aksesoris.

**Hierarki Prioritas Bisnis (Urut dari Paling Utama):**

```
1. 🛠️  JASA SERVIS & MAINTENANCE
       Rakit PC Custom, Deep Cleaning, Upgrade SSD/RAM, Instalasi Warnet/Lab,
       Service & Troubleshoot, Repaste Thermal, Cable Management

2. ⚙️  CUSTOM PC BUILDER & KONSULTASI
       Simulasi Rakit PC, Konsultasi Budget via WhatsApp,
       Quotation Studio (Admin → Surat Penawaran Resmi)

3. 📦  PAKET PC RAKITAN SIAP PAKAI
       Pre-configured rigs (Office, Gaming, Creator, Workstation)
       dengan Quick Spec Upgrader & Delta Pricing

4. 🔧  KATALOG KOMPONEN ECERAN & AKSESORIS (Pendukung)
       Penjualan part lepasan & gaming gear — fitur pelengkap,
       BUKAN tampilan dominan homepage
```

### 1.2 Tagline & Positioning

- **Tagline Utama:** *"Jasa Rakit PC Custom & Service Komputer Profesional — Garansi Toko, Stress-Tested, Siap Pakai"*
- **Positioning:** Bukan sekadar toko online komponen. KSS Komputer adalah **mitra teknisi** yang meracikkan, merakit, merawat, dan memperbaiki PC pelanggan.
- **Tone:** Profesional, teknis, terpercaya — bukan marketplace impersonal.

### 1.3 Tampilan & Estetika

Estetika **Industrial Modern** — kepadatan informasi tinggi ala `enterkomputer.com` yang diperbarui dengan desain *Bento Grid*, *Dark/Light Slate Theme*, *Instant Search & Filter*, serta tampilan *Mobile-First PWA*.

---

## 2. ATURAN BISNIS INTI

| # | Aturan | Penjelasan |
|---|--------|------------|
| **B1** | **Service-First Homepage** | Saat pengunjung membuka website, yang pertama terlihat adalah **layanan jasa** (Rakit, Servis, Cleaning, Upgrade) dan **ajakan konsultasi WhatsApp**, bukan katalog produk. |
| **B2** | **Zero Part-Price Leak** | Pada halaman Paket Rakitan, Detail Paket, Simulasi Rakit (`/simulasi`), dan Surat Penawaran (`/penawaran/[code]`) — harga satuan per komponen (`costPrice` / `sellPrice`) **WAJIB DISEMBUNYIKAN**. Hanya tampil **Harga Total Paket** dan **Delta Price** (`+Rp`, `-Rp`, `Standar`). |
| **B3** | **Transparansi Harga Eceran** | Pada Katalog Komponen (`/komponen`) dan Aksesoris (`/aksesoris`) — tampilkan `retailPrice` per item secara normal. Halaman ini bersifat **pendukung**, bukan halaman utama. |
| **B4** | **Delta Pricing** | Saat konsumen upgrade/downgrade part pada konfigurator → tampilkan selisih harga terhadap part bawaan: `[Termasuk]` · `[+ Rp 650.000]` · `[- Rp 250.000]` |
| **B5** | **Konsultasi via WhatsApp** | Konsumen kirim form konsultasi (Budget + Kebutuhan) → Admin racik PC di *Quotation Studio* → terbitkan Link Web Penawaran & PDF berisi spek lengkap + 1 Harga Total + tombol Checkout Tokopedia / WA. |
| **B6** | **Booking Jasa via WhatsApp** | Konsumen bisa langsung booking jadwal servis, rakit, atau cleaning melalui form yang auto-generate pesan WhatsApp terformat ke teknisi KSS. |
| **B7** | **Tracking Pengerjaan** | Setiap order rakit/servis mendapat kode resi internal (`TRK-KSS-XXX`) yang bisa dicek progress pengerjaannya secara real-time di website. |
| **B8** | **Multi-Channel** | Tokopedia: `https://tk.tokopedia.com/ZSpeToWkH/` · WhatsApp Admin: auto-format pesan rapi. |

---

## 3. TECH STACK & DEPENDENCIES

### 3.1 Core Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | Next.js 16.4 (App Router, Turbopack, `cacheComponents`) |
| **UI Library** | React 19.3 + TypeScript 5 (`strict: true`) |
| **Styling** | Tailwind CSS 4 + `@tailwindcss/turbopack` |
| **Component Kit** | `shadcn/ui` (Radix primitives) + `lucide-react` |
| **Motion** | `framer-motion` (transisi halus, page transitions) |
| **State** | `zustand` (persist `localStorage` — Builder, Cart, Admin Draft) |
| **Database** | PostgreSQL (Supabase) + Prisma ORM |
| **Form + Validation** | `react-hook-form` + `zod` |
| **PDF Engine** | `@react-pdf/renderer` + CSS `@media print` (Faktur & Surat Penawaran A4) |

### 3.2 DX & Production Tooling

| Kategori | Paket |
|----------|-------|
| **Theme** | `next-themes` (dark/light toggle, `class` strategy) |
| **Toast** | `sonner` (notifikasi non-blocking) |
| **URL State** | `nuqs` (search params as state — filter, sort, view mode) |
| **SEO** | `generateMetadata` + `sitemap.ts` + `robots.ts` + Open Graph |
| **Image** | `next/image` (`sizes`, `priority` LCP, WebP auto) |
| **Font** | `next/font/google` (Inter + JetBrains Mono — zero CLS) |
| **PWA** | `manifest.json` + Service Worker (offline shell) |
| **Lint** | ESLint 9 + `eslint-config-next` |
| **Env** | `.env.example` + validasi runtime via `zod` |
| **Bundle** | `@next/bundle-analyzer` (audit dependency bloat) |
| **Deploy** | Vercel CLI (`vercel deploy --prod`) |

---

## 4. STRUKTUR DIREKTORI PROYEK

```text
src/
├── app/
│   ├── layout.tsx                          # Root Layout (ThemeProvider, Navbar, BottomNav, Footer, Toaster)
│   ├── globals.css                         # Tailwind directives + CSS custom properties
│   ├── not-found.tsx                       # 404 Global
│   ├── error.tsx                           # Error Boundary Global (client)
│   ├── loading.tsx                         # Root Loading Skeleton
│   ├── sitemap.ts                          # Dynamic XML Sitemap
│   ├── robots.ts                           # Robots.txt Generator
│   ├── manifest.ts                         # PWA Web Manifest (dynamic)
│   │
│   ├── (public)/
│   │   ├── page.tsx                        # 1. Homepage (Service-First: Jasa → Rakit → Paket → Katalog)
│   │   ├── jasa/
│   │   │   ├── page.tsx                    # 2. Hub Layanan Jasa (Servis, Rakit, Cleaning, Upgrade)
│   │   │   └── [slug]/page.tsx             # 3. Detail Jasa + Form Booking WA
│   │   ├── simulasi/
│   │   │   └── page.tsx                    # 4. Custom PC Configurator (Tanpa Harga Part)
│   │   ├── konsultasi/
│   │   │   └── page.tsx                    # 5. Wizard Konsultasi Rakit & Servis by Budget
│   │   ├── cek-pesanan/
│   │   │   └── page.tsx                    # 6. Tracking Status Rakit/Servis (TRK-KSS-XXX)
│   │   ├── paket-rakitan/
│   │   │   ├── page.tsx                    # 7. Katalog Paket PC Rakitan Siap Pakai
│   │   │   └── [slug]/page.tsx             # 8. Detail Paket + Quick Spec Upgrader
│   │   ├── penawaran/
│   │   │   └── [code]/page.tsx             # 9. Surat Penawaran Resmi (Quotation View & Print)
│   │   ├── komponen/
│   │   │   ├── page.tsx                    # 10. Katalog Komponen Eceran (Pendukung)
│   │   │   └── [slug]/page.tsx             # 11. Detail Komponen Eceran
│   │   ├── aksesoris/
│   │   │   └── page.tsx                    # 12. Katalog Aksesoris & Gaming Gear (Pendukung)
│   │   └── tentang-kami/
│   │       └── page.tsx                    # 13. Profil Toko, Lokasi, Garansi, FAQ
│   │
│   ├── admin/
│   │   ├── layout.tsx                      # Admin Shell (Sidebar, Header, Auth Gate)
│   │   ├── page.tsx                        # A1. Dashboard Overview
│   │   ├── jasa-servis/
│   │   │   └── page.tsx                    # A2. Manajemen Jasa, Antrean & Tracking Pengerjaan
│   │   ├── quotes/
│   │   │   ├── page.tsx                    # A3. Daftar Penawaran
│   │   │   └── buat/page.tsx               # A4. Quotation Studio
│   │   ├── paket-rakitan/
│   │   │   ├── page.tsx                    # A5. Manajemen Paket PC
│   │   │   └── [id]/page.tsx               # A6. Editor Paket PC
│   │   ├── komponen/
│   │   │   └── page.tsx                    # A7. Manajemen Komponen
│   │   ├── aksesoris/
│   │   │   └── page.tsx                    # A8. Manajemen Aksesoris
│   │   ├── pricing/
│   │   │   └── page.tsx                    # A9. Spreadsheet Bulk Pricing
│   │   └── pengaturan/
│   │       └── page.tsx                    # A10. Pengaturan Toko
│   │
│   └── api/
│       ├── catalog/route.ts                # GET Katalog (sanitized, tanpa costPrice)
│       ├── quotes/[code]/route.ts          # GET Quotation Publik
│       └── admin/export-import/route.ts    # POST/GET Backup/Restore CSV/JSON
│
├── components/
│   ├── ui/                                 # shadcn/ui primitives (Button, Dialog, Sheet, etc.)
│   ├── layout/                             # Navbar, MegaMenu, MobileBottomNav, Footer, FloatingWAButton
│   ├── home/                               # HeroBanner, ServiceShowcase, BudgetQuickFilter, FeaturedGrid
│   ├── service/                            # ServiceCard, ServiceHubGrid, BookingForm, TrackingStepper
│   ├── prebuilt/                           # PrebuiltCard, FpsBenchmarkBar, QuickSpecUpgrader, BundleSummaryBox
│   ├── builder/                            # BuilderSlotRow, PartSelectorDrawer, CompatibilityAlert, StickyTelemetryBar
│   ├── retail/                             # HighDensityPartTable, RetailPartGrid, RetailFilterSidebar
│   ├── quote/                              # QuotationPrintSheet, ConsultationWizardForm
│   ├── admin/                              # SpreadsheetPriceTable, MarginSimulator, AdminPartFormModal
│   └── shared/                             # EmptyState, Skeleton, ErrorFallback, PriceTag, StatusBadge
│
├── hooks/                                  # Custom React hooks (useMediaQuery, useDebounce, useClickOutside)
│
├── lib/
│   ├── types.ts                            # Kontrak TypeScript lengkap
│   ├── format.ts                           # formatIDR, formatDeltaIDR, WA message generators
│   ├── compatibility.ts                    # Validasi Socket, RAM, GPU, Wattage, Bottleneck
│   ├── sanitizer.ts                        # Strip costPrice/sellPrice dari payload publik
│   ├── mock-data.ts                        # Data seed (Parts, Paket, Aksesoris, Jasa, Quotes, Tracking)
│   ├── constants.ts                        # URL Tokopedia, nomor WA, config statis
│   └── utils.ts                            # cn(), slugify(), clamp(), debounce()
│
└── store/
    ├── useBuilderStore.ts                  # State Simulasi Rakit PC
    ├── useRetailCartStore.ts               # State Keranjang Eceran
    ├── useQuoteStore.ts                    # State Surat Penawaran
    ├── useAdminStore.ts                    # State Harga & Konfigurasi Admin
    ├── useCartStore.ts                     # State Builder Cart
    └── useCompareStore.ts                  # State Bandingkan Paket PC
```

---

## 5. SKEMA DATABASE

### 5.1 Entity-Relationship

```
HardwarePart ──< PrebuiltPCItem >── PrebuiltPC
AccessoryItem
ServicePackage ──< ServiceBooking
ConsultationQuote
BuildOrderTracking
AdminSetting
```

### 5.2 Model Detail (`prisma/schema.prisma`)

**ServicePackage** — Paket Layanan Jasa ⭐ (Model Utama):
- `id`, `name`, `slug`, `category` (RAKIT_CUSTOM, DEEP_CLEANING, UPGRADE_SSD, UPGRADE_RAM, REPASTE_THERMAL, INSTALASI_OS, INSTALASI_WARNET, TROUBLESHOOT, CABLE_MANAGEMENT, MAINTENANCE)
- `price` (Int — Harga mulai dari)
- `priceMax` (Int? — Harga sampai, untuk range)
- `estimatedDuration` (String — "1-2 Jam", "Same Day", "1 Hari Kerja")
- `description`, `features[]`, `includes[]` (apa saja yang termasuk)
- `excludes[]` (apa yang tidak termasuk / biaya tambahan)
- `popular` (Boolean), `badge` (String? — "Paling Dicari", "Best Value")
- `imageUrl`, `isActive` (Boolean)
- `bookings` → relasi `ServiceBooking[]`

**ServiceBooking** — Booking Jasa Servis (Model Baru):
- `id`, `bookingCode` (SRV-KSS-YYYYMM-XXX)
- `serviceId` → relasi `ServicePackage`
- `customerName`, `customerWa`, `customerEmail?`
- `deviceType` (String — "PC Desktop", "Laptop", "PC Warnet/Lab")
- `problemDescription` (Text — Keluhan / kebutuhan detail)
- `preferredDate` (DateTime?), `preferredTime` (String?)
- `status`: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED → CANCELLED
- `adminNotes`, `estimatedCost` (Int?), `finalCost` (Int?)
- `createdAt`, `updatedAt`

**BuildOrderTracking** — Pelacakan Rakit/Servis:
- `trackingCode` (TRK-KSS-XXX), `customerName`, `customerWa`
- `orderType`: RAKIT_CUSTOM, RAKIT_PAKET, SERVIS, CLEANING, UPGRADE
- `itemTitle` (Deskripsi singkat: "Rakit PC Gaming RTX 4060" / "Deep Cleaning + Repaste")
- `currentStage`: PAYMENT_VERIFIED → PARTS_PREPARATION → ASSEMBLING → CABLE_MANAGEMENT → STRESS_TESTING → QC_FINAL → READY_TO_PICKUP → COMPLETED
- `stageHistory` (JSON: `[{ stage, timestamp, notes }]`)
- `estimatedCompletion` (DateTime?)
- `updatedAt`, `notes`

**HardwarePart** — Komponen PC:
- `id`, `sku`, `name`, `slug`, `brand`
- `category`: CPU, MOBO, RAM, GPU, SSD, HDD, PSU, CASE, COOLER, MONITOR
- `costPrice` (Int — Modal rahasia admin)
- `bundleBasePrice` (Int — Harga kalkulasi dalam rakitan, tersembunyi)
- `retailPrice` (Int — Harga jual eceran di `/komponen`)
- `isRetailAvailable` (Boolean — Dijual eceran atau khusus stok rakitan)
- `stockStatus`: READY, LOW, OUT_OF_STOCK, PO
- `wattage`, `imageUrl`, `tokopediaUrl`
- `specs` (JSON: socket, chipset, ramType, formFactor, vram, capacityGb, lengthMm, psuTier)

**PrebuiltPC** — Paket PC Rakitan:
- `id`, `code`, `name`, `slug`
- `tier`: OFFICE, ESPORTS_1080P, AAA_1080P, CREATOR_1440P, WORKSTATION_4K
- `parts` → relasi `PrebuiltPCItem` (slot → partId)
- `upgradeOptions` (JSON — opsi upgrade per slot)
- `assemblyFee`, `customMarkupPercent`, `overrideTotalPrice`
- `fpsBenchmarks` (JSON: `[{ game, resolution, fps }]`)
- `tokopediaUrl`, `isFeatured`, `isActive`

**AccessoryItem** — Aksesoris & Gaming Gear:
- `id`, `sku`, `name`, `slug`, `brand`
- `category`: KEYBOARD, MOUSE, HEADSET, MONITOR, CHAIR, WEBCAM, UPS, SPEAKER
- `costPrice`, `retailPrice`, `stockStatus`, `specsSummary`, `tokopediaUrl`, `imageUrl`

**ConsultationQuote** — Surat Penawaran:
- `id`, `quoteCode` (KSS-Q-YYYYMM-XXX), `customerName`, `customerWa`, `budget`, `usageNeed`
- `selectedParts` (JSON — daftar komponen tanpa harga per part di tampilan publik)
- `totalCostPrice` (Hanya admin), `finalBundlePrice` (Tampil ke konsumen)
- `adminNotes`, `validUntil`, `status`: DRAFT, SENT, APPROVED, EXPIRED

**AdminSetting** — Konfigurasi Toko:
- `key` (Unique), `value` (String)
- Keys: `adminWhatsApp`, `technicianWhatsApp`, `tokopediaUrl`, `assemblyFee`, `defaultMarkup`, `warrantyText`, `storeName`, `storeAddress`, `operationalHours`

---

## 6. SPESIFIKASI HALAMAN PUBLIK (13 HALAMAN)

> **Prinsip Navigasi:** Urutan menu navigasi mencerminkan prioritas bisnis.
> `Beranda` → `Jasa & Servis` → `Rakit PC` → `Paket Siap Pakai` → `Cek Pesanan` → `Komponen` → `Aksesoris` → `Tentang Kami`

---

### P1 — Homepage (`/`) ⭐ SERVICE-FIRST LAYOUT

Homepage dirancang agar pengunjung **langsung melihat layanan jasa** sebagai identitas utama KSS Komputer.

**Layout atas → bawah:**

1. **Announcement Bar:** Jam operasional bengkel, status antrean hari ini, link Tokopedia.
2. **Sticky Header + Navigation:** Urutan menu: Jasa & Servis → Rakit PC → Paket Siap Pakai → Cek Pesanan → Komponen → Aksesoris.
3. **Hero Section (Service-Focused):**
   - Headline: *"Jasa Rakit PC Custom & Service Komputer Profesional"*
   - Subheadline: *"Rakit sesuai budget, dirakit rapi, stress-tested 24 jam, garansi toko."*
   - 2 CTA Utama: **[Konsultasi Rakit PC via WA]** & **[Booking Servis / Cleaning]**
   - Visual: Foto bengkel / proses perakitan / workstation teknisi.
4. **Service Showcase Grid (Seksi Dominan):** 🔥
   - Grid 6 kartu layanan utama dengan ikon, deskripsi singkat, harga mulai dari, dan tombol **Booking via WA**:
     - Rakit PC Custom & Cable Management
     - Deep Cleaning & Repaste Thermal
     - Upgrade SSD / RAM
     - Instalasi OS & Software
     - Service & Troubleshoot Hardware
     - Instalasi Warnet / Kantor / Lab
5. **Quick Budget Configurator Strip:**
   - *"Punya budget? Kami racikkan."* — Pill filter cepat: <5 Jt, 5-8 Jt, 8-12 Jt, 12-20 Jt, >20 Jt
   - Menampilkan 2-3 paket rakitan terdekat + tombol "Minta Racikan Kustom via WA"
6. **Paket PC Rakitan Populer (Grid Ringkas):**
   - 4-6 kartu paket PC siap pakai — badge resolusi, spek utama, FPS bar, Harga Total.
   - **Bukan seksi dominan** — melengkapi layanan rakit di atas.
7. **Tracking CTA Banner:**
   - *"Sudah order? Cek progress pengerjaan PC kamu."*
   - Input field kode resi `TRK-KSS-XXX` + tombol Cek.
8. **Trust & Credibility (USP Grid):**
   - Garansi Resmi Distributor, Stress-Test OCCT/FurMark 24 Jam, Cable Management Rapi, Gratis Konsultasi, Packing Kayu Aman, Teknisi Berpengalaman.
9. **Katalog Aksesoris Pilihan (Carousel Kecil):**
   - Highlight produk eceran terlaris — Monitor, Gear Gaming. Posisi paling bawah (sekunder).

---

### P2 — Hub Layanan Jasa (`/jasa`) ⭐ HALAMAN PRIORITAS UTAMA

Halaman utama yang memperkenalkan seluruh layanan KSS Komputer sebagai bengkel profesional.

- **Hero Jasa:** Headline "Layanan Jasa Komputer Profesional" + foto bengkel.
- **Kategori Layanan Grid (Expanded):**
  - Setiap layanan memiliki kartu besar berisi:
    - Ikon + Nama Layanan
    - Deskripsi singkat (1-2 kalimat)
    - Harga: "Mulai dari Rp xxx.xxx" atau range "Rp xxx.xxx — Rp xxx.xxx"
    - Estimasi waktu pengerjaan
    - Badge: "Paling Dicari" / "Best Value" / "Promo"
    - Tombol **[Booking Jadwal via WA]** dan **[Lihat Detail]**
  - Minimal 8-10 paket layanan:
    1. Rakit PC Custom Full (dari nol) — mulai Rp 150.000
    2. Rakit PC + Cable Management Premium — mulai Rp 250.000
    3. Deep Cleaning & Repaste Thermal — Rp 150.000
    4. Upgrade SSD NVMe + Migrasi OS — mulai Rp 100.000
    5. Upgrade / Tambah RAM — mulai Rp 50.000
    6. Instalasi Ulang OS + Driver + Software — Rp 100.000
    7. Service & Troubleshoot Hardware — mulai Rp 100.000
    8. Instalasi Warnet / Kantor / Lab (per unit) — mulai Rp 200.000
    9. Maintenance Bulanan (kontrak) — mulai Rp 300.000/bulan
    10. Konsultasi & Cek Spesifikasi — GRATIS
- **FAQ Jasa:** Accordion dengan pertanyaan umum tentang proses pengerjaan, garansi, estimasi waktu, dll.
- **CTA Footer:** "Butuh layanan lain? Hubungi teknisi kami langsung via WhatsApp."

### P3 — Detail Layanan Jasa (`/jasa/[slug]`) (Baru)

- Deskripsi lengkap layanan, apa saja yang termasuk & tidak termasuk.
- Galeri foto proses pengerjaan (before/after).
- Estimasi waktu, harga detail (range jika ada).
- **Form Booking Jasa:** Nama, No. WA, Jenis PC/Laptop, Keluhan/Kebutuhan, Pilih Tanggal & Waktu → auto-generate pesan WA terformat ke teknisi.
- Related services (cross-sell layanan lain).

### P4 — Custom PC Configurator (`/simulasi`)
- **10 Slot Rakitan:** CPU, Mobo, Cooler, RAM, SSD, HDD, GPU, PSU, Case, Monitor.
- **Part Selector Drawer:** Auto-filter kompatibel, tampil Delta Price saja.
- **Real-Time Telemetry:** Compatibility status, wattage calculator, bottleneck alert.
- **Sticky Bar:** Total Komponen, Est. Watt, Harga Bundel, Reset, Cetak, Kirim WA.
- **Tab Konsultasi WA** terhubung di halaman yang sama.

### P5 — Wizard Konsultasi Budget (`/konsultasi`)
- **Step 1:** Pilih tujuan: Rakit PC Baru / Upgrade PC Lama / Konsultasi Servis.
- **Step 2:** Slider budget (Rp 4 Jt – 50 Jt+) atau deskripsi masalah (untuk servis).
- **Step 3:** Multi-select game/software/kebutuhan.
- **Step 4:** Preferensi (platform, warna, fullset/PC only).
- **Step 5:** Rekomendasi 2 paket terdekat + tombol "Minta Racikan Kustom via WA" atau "Booking Servis via WA".

### P6 — Tracking Status Pengerjaan (`/cek-pesanan`) ⭐ PENTING UNTUK SERVIS

- Input kode resi `TRK-KSS-XXX` → stepper progress visual:
  ```
  ✅ Pembayaran Terverifikasi
  → ⚙️ Persiapan Komponen / Diagnosis
  → 🔧 Proses Perakitan / Pengerjaan
  → 🔌 Cable Management / Finishing
  → 🔥 Stress Test & QC 24 Jam
  → ✅ Siap Diambil / Dikirim
  → ✅ Selesai
  ```
- Informasi: Nama customer, deskripsi order, estimasi selesai, catatan teknisi.
- Tombol "Hubungi Teknisi via WA" jika ada pertanyaan.

### P7 — Katalog Paket PC Rakitan (`/paket-rakitan`)
- **Filter:** Rentang Harga, Platform CPU (AMD/Intel), Seri GPU, RAM, Kegunaan.
- **Sorting:** Termurah, Termahal, FPS Tertinggi, Terlaris.
- **Compare Drawer:** Pilih hingga 3 paket untuk perbandingan berdampingan.
- **CTA:** Setiap paket mengarahkan ke pemesanan via WA atau kustomisasi di Simulasi.

### P8 — Detail Paket + Quick Spec Upgrader (`/paket-rakitan/[slug]`)
- Galeri visual casing, badge garansi, konsumsi daya.
- Daftar 8–10 komponen — **tanpa harga per part** (Zero Part-Price Leak).
- **Quick Spec Upgrader:** Ganti RAM/SSD/GPU/Cooler → Delta Price real-time.
- Panel Aksi: Pesan via WA, Checkout Tokopedia, Cetak PDF, Buka di Simulasi Penuh.

### P9 — Surat Penawaran Resmi (`/penawaran/[code]`)
- Kop resmi KSS Komputer, info konsumen, nomor kuotasi, masa berlaku.
- Tabel spek lengkap — **TANPA kolom harga per part** — 1 boks Harga Total.
- Print-to-PDF (A4 clean layout), Setujui via WA, Beli via Tokopedia.

### P10 — Katalog Komponen Eceran (`/komponen`) — Pendukung
- **Toggle View:** Compact Table (gaya Enterkomputer) vs Bento Grid.
- **Filter:** Kategori, Brand, Socket, Rentang Harga.
- Tampil `retailPrice`, status stok, tombol `+ Keranjang`.

### P11 — Detail Komponen Eceran (`/komponen/[slug]`) — Pendukung
- Foto produk, spesifikasi lengkap, status stok, harga eceran.
- Related parts, tombol beli eceran / tambah ke keranjang.

### P12 — Katalog Aksesoris (`/aksesoris`) — Pendukung
- Monitor, Keyboard, Mouse, Headset, Webcam, UPS, Kursi Gaming.
- Filter kategori, `retailPrice`, integrasi `RetailCartDrawer`.

### P13 — Tentang Kami (`/tentang-kami`)
- Profil KSS Komputer sebagai **bengkel rakit & servis** (bukan sekadar toko online).
- Foto bengkel, tim teknisi, workstation.
- Lokasi (Google Maps embed), jam operasional.
- Garansi toko, prosedur klaim.
- FAQ accordion.

---

## 7. SPESIFIKASI ADMIN PANEL (10 SUB-MODUL)

| Kode | Route | Deskripsi |
|------|-------|-----------|
| **A1** | `/admin` | Dashboard — Antrean Servis Hari Ini, Jumlah Order Aktif, Total Jasa Bulan Ini, Kuotasi Terbaru, Stok Menipis. |
| **A2** | `/admin/jasa-servis` | ⭐ Manajemen Jasa — CRUD paket layanan, antrean booking, update status tracking `TRK-KSS-XXX`, riwayat pengerjaan. |
| **A3** | `/admin/quotes` | Daftar penawaran WA — Draft, Terkirim, Deal, Expired. |
| **A4** | `/admin/quotes/buat` | Quotation Studio — Racik spek, kalkulator HPP vs Harga Jual vs Margin, generate link & PDF. |
| **A5** | `/admin/paket-rakitan` | List paket PC — Clone, Toggle Aktif, Edit Link Tokopedia. |
| **A6** | `/admin/paket-rakitan/[id]` | Editor paket — Pilih komponen, HPP Modal vs Harga Jual vs Profit. |
| **A7** | `/admin/komponen` | CRUD Komponen, spesifikasi kompatibilitas, toggle `isRetailAvailable`. |
| **A8** | `/admin/aksesoris` | CRUD Aksesoris, harga modal vs harga jual eceran. |
| **A9** | `/admin/pricing` | Spreadsheet bulk pricing — `costPrice`, `retailPrice`, Markup %, Import/Export CSV. |
| **A10** | `/admin/pengaturan` | Nomor WA Admin & Teknisi, Link Tokopedia, Biaya Rakit, Kop Surat, Jam Operasional, PIN Admin. |

---

## 8. CHECKLIST EKSEKUSI

### STATUS LEGEND

```
[x] = Selesai dan lolos tsc + build
[ ] = Belum dikerjakan
```

---

### FASE 0 — Project Bootstrap & Tooling ✅

- [x] **0.1** Inisialisasi Next.js 16.4 + TypeScript strict + Tailwind CSS 4 + Turbopack
- [x] **0.2** Setup Git repo (`kssgaminggear-pixel/kss-komputer`) + Vercel project
- [x] **0.3** Codify `AGENT_RULES.md` (CI/CD rules, Anti-AI-Slop design system)
- [x] **0.4** Initial deploy ke Vercel — verifikasi HTTP 200

---

### FASE 1 — Data Layer: Types, Format, Mock Data, Sanitizer

- [x] **1.1** `src/lib/types.ts` — Kontrak `HardwarePart`, `PrebuiltPC`, `PrebuiltPCItem`, `ServicePackage`, `AccessoryItem`, `ConsultationQuote`
- [x] **1.2** `src/lib/format.ts` — `formatIDR`, `formatDeltaIDR`, `formatWatt`, `generateWhatsAppOrderUrl`, `generateBuildPlainText`, `generateConsultationWAMessage`
- [x] **1.3** `src/lib/mock-data.ts` — 45+ hardware parts, 6 prebuilt PCs, 4 services, 8 aksesoris, 1 sample quote
- [x] **1.4** `src/lib/compatibility.ts` — Validasi socket, RAM type, form factor, GPU length, cooler height, wattage, bottleneck, `calculateBundleTotal`, `calculateDeltaPrice`
- [ ] **1.5** Tambahkan tipe `BuildOrderTracking` di `types.ts` (stage enum, stageHistory, orderType: RAKIT/SERVIS/CLEANING/UPGRADE)
- [ ] **1.6** Tambahkan tipe `ServiceBooking` di `types.ts` (bookingCode, deviceType, problemDescription, preferredDate, status)
- [ ] **1.7** Tambahkan tipe `StoreSettings` di `types.ts` (adminWhatsApp, technicianWhatsApp, tokopediaUrl, operationalHours)
- [ ] **1.8** Ekspansi `ServicePackage` di `types.ts` — Tambah field: `category`, `priceMax`, `includes[]`, `excludes[]`, `imageUrl`, `isActive`
- [ ] **1.9** Refactor sanitizer: rename `server-dto.ts` → `sanitizer.ts`, pastikan `sanitizePrebuiltForPublic()` dan `sanitizeQuoteForPublic()` diimpor dan digunakan di halaman publik yang relevan
- [ ] **1.10** Ekspansi `mock-data.ts`: tambah 10 paket jasa (total 10+), 12+ aksesoris (total 20+), 2 tambahan `ConsultationQuote`, 3 sample `BuildOrderTracking`, 3 sample `ServiceBooking`
- [ ] **1.11** Tambahkan `generateServiceBookingWAMessage()`, `generateRetailCartWAMessage()`, `generateQuoteShareWAMessage()` di `format.ts`
- [ ] **1.12** Buat `src/lib/constants.ts` — Centralize WA number (admin + teknisi), Tokopedia URL, store name, warranty text, operational hours
- [ ] **1.13** Buat `src/lib/utils.ts` — `cn()` (clsx+twMerge), `slugify()`, `debounce()`, `clamp()`

---

### FASE 2 — State Management (Zustand Stores)

- [x] **2.1** `useBuilderStore.ts` — Full PC builder state, delta pricing, build code export/import, subtotal, wattage
- [x] **2.2** `useAdminStore.ts` — Global markup%, assembly fee, price overrides, bulk markup, profit calculator
- [x] **2.3** `useRetailCartStore.ts` — Keranjang eceran (HardwarePart + AccessoryItem), WA checkout URL
- [x] **2.4** `useQuoteStore.ts` — CRUD surat penawaran, auto-generate quoteCode
- [x] **2.5** `useCartStore.ts` — Builder cart (add/remove/update, bulk add from builder)
- [x] **2.6** `useCompareStore.ts` — Bandingkan hingga 4 produk
- [x] **2.7** `useHydrated.ts` — SSR-safe hydration hook via `useSyncExternalStore`
- [ ] **2.8** Buat `useServiceStore.ts` — State booking jasa, antrean servis, tracking order (CRUD ServiceBooking, updateTrackingStage, getTrackingByCode)

---

### FASE 3 — Global Layout, Navigasi & Shared Components

- [x] **3.1** `Navbar.tsx` — Desktop nav + mobile hamburger, Ctrl+K search shortcut, builder badge, retail cart badge
- [x] **3.2** `BottomNav.tsx` — Mobile bottom navigation bar
- [x] **3.3** `Footer.tsx` — Multi-column footer
- [x] **3.4** `CartDrawer.tsx` — Slide-over drawer untuk builder cart
- [x] **3.5** `CommandSearchModal.tsx` — Ctrl+K fuzzy search modal
- [x] **3.6** `RetailCartDrawer.tsx` — Drawer keranjang eceran + WA checkout
- [x] **3.7** Root `layout.tsx` — Wrapping Navbar + BottomNav dalam `<Suspense>`
- [x] **3.8** `public/manifest.json` — PWA manifest dasar
- [ ] **3.9** Restruktur Navbar — Urutan menu: Jasa & Servis → Rakit PC → Paket Siap Pakai → Cek Pesanan → Komponen → Aksesoris
- [ ] **3.10** Install & setup `shadcn/ui` — Init CLI, tambahkan komponen: Button, Dialog, Sheet, DropdownMenu, Tabs, Badge, Skeleton, Tooltip, Command, Separator, Accordion
- [ ] **3.11** Install `next-themes` — Buat `ThemeProvider` wrapper di root layout, toggle Dark/Light di Navbar
- [ ] **3.12** Install `sonner` — Tambahkan `<Toaster />` di root layout, gunakan `toast()` untuk feedback aksi
- [ ] **3.13** Buat shared components di `src/components/shared/`:
  - `EmptyState.tsx` — Ilustrasi + pesan + CTA saat data kosong
  - `Skeleton.tsx` — Skeleton loader variants (card, table row, detail page)
  - `PriceTag.tsx` — Reusable price display (`font-mono tabular-nums`)
  - `StatusBadge.tsx` — Badge stok & status pengerjaan
  - `ErrorFallback.tsx` — Error boundary fallback component
  - `TrackingStepper.tsx` — Stepper visual progress pengerjaan rakit/servis
- [ ] **3.14** Buat global error handling files:
  - `src/app/not-found.tsx` — Custom 404 page
  - `src/app/error.tsx` — Global error boundary (client component)
  - `src/app/loading.tsx` — Root loading skeleton
- [ ] **3.15** Setup `next/font` — Inter (body) + JetBrains Mono (prices, specs, codes)
- [ ] **3.16** Buat `FloatingWAButton.tsx` — Floating WhatsApp CTA button (fixed bottom-right) — ke teknisi
- [ ] **3.17** Update PWA manifest dengan ikon PNG 192x192 & 512x512 (bukan placeholder SVG)

---

### FASE 4 — Halaman Jasa & Servis (PRIORITAS UTAMA) ⭐

- [ ] **4.1** Rombak Homepage (`/`) → Layout service-first sesuai spec P1:
  - Hero section fokus jasa rakit & servis (bukan katalog produk)
  - Service Showcase Grid (6 kartu layanan) sebagai seksi dominan
  - Quick Budget Strip, Paket Rakitan Populer (ringkas), Tracking CTA, USP Grid
  - Katalog eceran/aksesoris dipindah ke posisi bawah (sekunder)
- [ ] **4.2** Buat Hub Layanan Jasa (`/jasa`) → Halaman penuh sesuai spec P2:
  - Grid 8-10 kartu layanan dengan harga, estimasi waktu, badge
  - FAQ jasa accordion
  - CTA booking WhatsApp per layanan
- [ ] **4.3** Buat Detail Layanan Jasa (`/jasa/[slug]`) sesuai spec P3:
  - Deskripsi lengkap, includes/excludes, galeri, harga detail
  - Form Booking Jasa → auto-generate pesan WA ke teknisi
  - Related services cross-sell
- [ ] **4.4** Buat Tracking Status Pengerjaan (`/cek-pesanan`) sesuai spec P6:
  - Input kode resi `TRK-KSS-XXX`
  - Stepper progress visual 7 tahap
  - Info customer, deskripsi order, estimasi selesai, catatan teknisi
  - Tombol "Hubungi Teknisi via WA"
- [ ] **4.5** Buat `src/components/service/`:
  - `ServiceCard.tsx` — Kartu layanan (ikon, nama, harga, badge, CTA)
  - `ServiceHubGrid.tsx` — Grid responsif kartu layanan
  - `BookingForm.tsx` — Form booking jasa → WA generator
  - `TrackingStepper.tsx` — Visual stepper progress pengerjaan (jika belum di shared)

---

### FASE 5 — Custom Builder, Konsultasi & Penawaran

- [x] **5.1** Custom PC Configurator (`/simulasi`) — 10 slot, compatibility engine, delta pricing, sticky telemetry
- [x] **5.2** Surat Penawaran (`/penawaran/[code]`) — Kop resmi, tabel spek, 1 Harga Total, Print PDF, WA confirm
- [ ] **5.3** Buat Wizard Konsultasi (`/konsultasi`) — Expanded 5 langkah:
  - Step 1: Pilih tujuan (Rakit Baru / Upgrade / Servis)
  - Step 2: Budget slider atau deskripsi masalah
  - Step 3: Game/software/kebutuhan
  - Step 4: Preferensi
  - Step 5: Rekomendasi + WA dispatch

---

### FASE 6 — Paket Rakitan & Katalog Eceran (Pendukung)

- [x] **6.1** Katalog Paket Rakitan (`/paket-rakitan`) — Filter multi-dimensi + sorting
- [x] **6.2** Detail Paket + Quick Spec Upgrader (`/paket-rakitan/[slug]`) — Delta Price, FPS bar, WA/Tokopedia CTA
- [x] **6.3** `PrebuiltCard.tsx` — Card component (specs, bundle price, WA link, Tokopedia link)
- [x] **6.4** `FilterSidebar.tsx`, `ProductRowPricelist.tsx`, `SpecBadges.tsx` — Catalog filter & display components
- [x] **6.5** Katalog Komponen Eceran (`/komponen`) — Dual view (Table/Grid), filter, `retailPrice`, keranjang
- [x] **6.6** Katalog Aksesoris (`/aksesoris`) — Category tabs, search, grid/table view, retail cart
- [ ] **6.7** Detail Komponen Eceran (`/komponen/[slug]`) — Halaman detail produk lengkap
- [ ] **6.8** Implementasi Compare Drawer UI di `/paket-rakitan` — hubungkan dengan `useCompareStore`
- [ ] **6.9** Buat Tentang Kami (`/tentang-kami`) — Profil bengkel, foto tim, lokasi, garansi, FAQ

---

### FASE 7 — Admin Panel Core ⭐

- [ ] **7.1** Admin Layout (`/admin/layout.tsx`) — Sidebar navigasi, header status toko, PIN/password gate
- [ ] **7.2** Dashboard (`/admin`) — Metrik dominan: Antrean Servis Hari Ini, Order Aktif, Total Jasa Bulan Ini, Kuotasi Terbaru, Stok Alert
- [ ] **7.3** Admin Jasa & Servis (`/admin/jasa-servis`) — CRUD paket layanan, antrean booking, update status tracking `TRK-KSS-XXX`, riwayat pengerjaan (MODUL ADMIN PALING PENTING)
- [x] **7.4** Admin Pricing (`/admin/pricing`) — Global markup slider, assembly fee, per-part price editing, bulk apply
- [x] **7.5** Admin Quotes List (`/admin/quotes`) — Create, list, delete, update status quotation

---

### FASE 8 — Admin Panel Extended

- [ ] **8.1** Quotation Studio (`/admin/quotes/buat`) — Form lengkap: input konsumen, part picker per slot, kalkulator HPP vs Harga Jual vs Margin, generate link `/penawaran/[code]` + WA dispatch
- [ ] **8.2** Manajemen Paket PC (`/admin/paket-rakitan`) — List paket, Clone, Toggle Aktif, Edit Link Tokopedia
- [ ] **8.3** Editor Paket PC (`/admin/paket-rakitan/[id]`) — Pilih komponen per slot, HPP Modal vs Harga Jual Bundel vs Profit
- [ ] **8.4** Manajemen Komponen (`/admin/komponen`) — CRUD hardware parts, spesifikasi kompatibilitas, toggle `isRetailAvailable`
- [ ] **8.5** Manajemen Aksesoris (`/admin/aksesoris`) — CRUD aksesoris, harga modal vs jual eceran
- [ ] **8.6** Pengaturan Toko (`/admin/pengaturan`) — Nomor WA Admin & Teknisi, Link Tokopedia, Biaya Rakit, Kop Surat, Jam Operasional, PIN Admin

---

### FASE 9 — SEO, Performance & PWA

- [ ] **9.1** `generateMetadata` pada semua halaman publik (title, description, openGraph, twitter card)
- [ ] **9.2** `src/app/sitemap.ts` — Dynamic sitemap (semua slug paket, komponen, jasa, aksesoris)
- [ ] **9.3** `src/app/robots.ts` — Allow public routes, disallow `/admin/*`
- [ ] **9.4** `next/image` audit — Semua `<img>` diganti `<Image>` dengan `sizes`, `priority` pada LCP, WebP auto
- [ ] **9.5** Suspense boundaries & loading states — `loading.tsx` per route segment dengan skeleton
- [ ] **9.6** Service Worker — Offline shell, cache static assets, offline fallback page
- [ ] **9.7** Bundle analysis — Jalankan `@next/bundle-analyzer`, identifikasi & eliminasi dependency bloat
- [ ] **9.8** Core Web Vitals audit — LCP < 2.5s, FID < 100ms, CLS < 0.1

---

### FASE 10 — API Routes & Data Sanitization

- [ ] **10.1** `src/app/api/catalog/route.ts` — GET endpoint katalog terfilter, sanitize `costPrice` dari response
- [ ] **10.2** `src/app/api/quotes/[code]/route.ts` — GET quotation publik, strip harga per part
- [ ] **10.3** `src/app/api/admin/export-import/route.ts` — POST/GET backup & restore data (CSV/JSON), admin-only
- [ ] **10.4** Implement sanitizer usage: semua halaman publik yang menampilkan data rakitan harus melewati `sanitizePrebuiltForPublic()` — tidak ada direct access ke raw data dengan `costPrice`

---

### FASE 11 — Database Produksi & Final QA

- [ ] **11.1** Install `prisma` + `@prisma/client` sebagai dependency
- [ ] **11.2** Finalisasi `prisma/schema.prisma` — Tambahkan model `ServiceBooking` dan `BuildOrderTracking`, update `ServicePackage`
- [ ] **11.3** Setup database PostgreSQL (Supabase) + `.env` connection string
- [ ] **11.4** `prisma migrate dev` — Generate & apply initial migration
- [ ] **11.5** `prisma/seed.ts` — Jalankan seeder, populasi data awal dari `mock-data.ts`
- [ ] **11.6** Migrasi semua halaman dari mock data → Prisma queries (server components)
- [ ] **11.7** `.env.example` — Dokumentasi semua environment variables yang dibutuhkan
- [ ] **11.8** Final TypeScript audit: `tsc --noEmit` = 0 errors
- [ ] **11.9** Final build audit: `npm run build` = sukses, semua routes generated
- [ ] **11.10** Production deploy & smoke test seluruh halaman publik + admin

---

## 9. DEPLOYMENT & CI/CD RULES

### 9.1 Pre-Push Checklist (Wajib)

```
1. ✅ tsc --noEmit       → 0 errors
2. ✅ npm run build       → Exit 0, semua routes generated
3. ✅ Checklist ROADMAP   → Sub-tugas yang dikerjakan sudah [x]
4. ✅ No WIP / half-done  → Tidak ada fitur setengah jadi
```

### 9.2 Deploy Command

```bash
# Set PATH (per session)
$env:PATH = "C:\Users\user\nodejs;$env:LOCALAPPDATA\Programs\Git\cmd;$env:PATH"

# Type check → Build → Commit → Push → Deploy
.\node_modules\.bin\tsc.cmd --noEmit
npm run build
git add .
git commit -m "feat: <deskripsi>"
git push origin main
.\node_modules\.bin\vercel.cmd deploy --prod --yes --token <VERCEL_TOKEN>
```

### 9.3 Environment Variables

| Variable | Scope | Deskripsi |
|----------|-------|-----------|
| `DATABASE_URL` | Server | PostgreSQL connection string |
| `NEXT_PUBLIC_SITE_URL` | Public | Base URL produksi |
| `ADMIN_PIN` | Server | PIN akses admin panel |
| `VERCEL_TOKEN` | CI/CD | Token deploy Vercel |

---

## PROGRESS SUMMARY

| Fase | Judul | Total | Selesai | Sisa |
|------|-------|-------|---------|------|
| 0 | Project Bootstrap | 4 | 4 | 0 |
| 1 | Data Layer | 13 | 4 | 9 |
| 2 | State Management | 8 | 7 | 1 |
| 3 | Layout & Shared | 17 | 8 | 9 |
| 4 | Jasa & Servis ⭐ | 5 | 0 | 5 |
| 5 | Builder, Konsultasi, Penawaran | 3 | 2 | 1 |
| 6 | Paket Rakitan & Katalog | 9 | 6 | 3 |
| 7 | Admin Core | 5 | 2 | 3 |
| 8 | Admin Extended | 6 | 0 | 6 |
| 9 | SEO, Performance, PWA | 8 | 0 | 8 |
| 10 | API Routes | 4 | 0 | 4 |
| 11 | Database & Final QA | 10 | 0 | 10 |
| **TOTAL** | | **92** | **33** | **59** |

> **Progress: 33 / 92 (35.9%)**
>
> **Prioritas Eksekusi Berikutnya:**
> Fase 1 (sisa) → Fase 3 (sisa) → **Fase 4 (Jasa & Servis ⭐)** → Fase 5 → Fase 7 → sisanya
