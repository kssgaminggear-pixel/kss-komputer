# MASTER BLUEPRINT & EXECUTION ROADMAP — KSS KOMPUTER

> **Versi:** 2.0 · **Terakhir diperbarui:** 2026-11-06
> **Stack:** Next.js 16.4 · React 19 · TypeScript `strict` · Tailwind CSS 4 · Zustand · Prisma · PostgreSQL
> **Deployment:** Vercel (CLI) → `https://kss-komputer-seven.vercel.app`
> **Repo:** `github.com/kssgaminggear-pixel/kss-komputer`

Dokumen ini adalah **single source of truth** untuk arsitektur, spesifikasi fitur, dan checklist eksekusi proyek KSS Komputer.
Setiap sub-tugas yang selesai dan lolos `tsc --noEmit` + `npm run build` → ubah `[ ]` → `[x]`.

---

## DAFTAR ISI

1. [Visi Produk & Aturan Bisnis](#1-visi-produk--aturan-bisnis-inti)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Struktur Direktori](#3-struktur-direktori-proyek)
4. [Skema Database](#4-skema-database)
5. [Halaman Publik (12 Halaman)](#5-spesifikasi-halaman-publik-12-halaman)
6. [Admin Panel (10 Sub-Modul)](#6-spesifikasi-admin-panel-10-sub-modul)
7. [Checklist Eksekusi (Fase 0–11)](#7-checklist-eksekusi)
8. [Deployment & CI/CD Rules](#8-deployment--cicd-rules)

---

## 1. VISI PRODUK & ATURAN BISNIS INTI

### 1.1 Identitas Produk

**KSS Komputer** adalah toko komputer modern (System Integrator) berbasis Jakarta yang menjual:
- **PC Rakitan Siap Pakai** (Prebuilt)
- **Jasa Perakitan Custom & Servis**
- **Komponen PC Eceran & Aksesoris Gaming Gear**

Tampilan web mengusung estetika **Industrial Modern** — kepadatan informasi tinggi ala `enterkomputer.com` yang diperbarui dengan desain *Bento Grid*, *Dark/Light Slate Theme*, *Instant Search & Filter*, serta *Mobile-First PWA*.

### 1.2 Aturan Bisnis Utama

| # | Aturan | Penjelasan |
|---|--------|------------|
| **B1** | **Zero Part-Price Leak** | Pada halaman Paket Rakitan, Detail Paket, Simulasi Rakit (`/simulasi`), dan Surat Penawaran (`/penawaran/[code]`) — harga satuan per komponen (`costPrice` / `sellPrice`) **WAJIB DISEMBUNYIKAN**. Hanya tampil **Harga Total Paket** dan **Delta Price** (`+Rp`, `-Rp`, `Standar`). |
| **B2** | **Transparansi Harga Eceran** | Pada Katalog Komponen (`/komponen`) dan Aksesoris (`/aksesoris`) — tampilkan `retailPrice` per item secara normal. |
| **B3** | **Delta Pricing** | Saat konsumen upgrade/downgrade part pada konfigurator → tampilkan selisih harga terhadap part bawaan: `[Termasuk]` · `[+ Rp 650.000]` · `[- Rp 250.000]` |
| **B4** | **Konsultasi via WhatsApp** | Konsumen kirim form konsultasi (Budget + Kebutuhan) → Admin racik PC di *Quotation Studio* → terbitkan Link Web Penawaran & PDF berisi spek lengkap + 1 Harga Total + tombol Checkout Tokopedia / WA. |
| **B5** | **Multi-Channel** | Tokopedia: `https://tk.tokopedia.com/ZSpeToWkH/` · WhatsApp Admin: auto-format pesan rapi. |

---

## 2. TECH STACK & DEPENDENCIES

### 2.1 Core Stack

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

### 2.2 DX & Production Tooling

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

## 3. STRUKTUR DIREKTORI PROYEK

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
│   │   ├── page.tsx                        # 1. Homepage
│   │   ├── paket-rakitan/
│   │   │   ├── page.tsx                    # 2. Katalog Paket PC Rakitan
│   │   │   └── [slug]/page.tsx             # 3. Detail Paket + Quick Spec Upgrader
│   │   ├── simulasi/
│   │   │   └── page.tsx                    # 4. Custom PC Configurator
│   │   ├── konsultasi/
│   │   │   └── page.tsx                    # 5. Wizard Konsultasi Budget
│   │   ├── komponen/
│   │   │   ├── page.tsx                    # 6. Katalog Komponen Eceran
│   │   │   └── [slug]/page.tsx             # 7. Detail Komponen
│   │   ├── aksesoris/
│   │   │   └── page.tsx                    # 8. Katalog Aksesoris & Gaming Gear
│   │   ├── jasa/
│   │   │   └── page.tsx                    # 9. Katalog Jasa & Form Booking WA
│   │   ├── cek-pesanan/
│   │   │   └── page.tsx                    # 10. Tracking Status Rakit/Servis
│   │   ├── penawaran/
│   │   │   └── [code]/page.tsx             # 11. Surat Penawaran (Quotation View & Print)
│   │   └── tentang-kami/
│   │       └── page.tsx                    # 12. Profil Toko, Garansi, FAQ
│   │
│   ├── admin/
│   │   ├── layout.tsx                      # Admin Shell (Sidebar, Header, Auth Gate)
│   │   ├── page.tsx                        # A1. Dashboard Overview
│   │   ├── paket-rakitan/
│   │   │   ├── page.tsx                    # A2. Manajemen Paket PC
│   │   │   └── [id]/page.tsx               # A3. Editor Paket PC
│   │   ├── komponen/
│   │   │   └── page.tsx                    # A4. Manajemen Komponen
│   │   ├── aksesoris/
│   │   │   └── page.tsx                    # A5. Manajemen Aksesoris
│   │   ├── pricing/
│   │   │   └── page.tsx                    # A6. Spreadsheet Bulk Pricing
│   │   ├── quotes/
│   │   │   ├── page.tsx                    # A7. Daftar Penawaran
│   │   │   └── buat/page.tsx               # A8. Quotation Studio
│   │   ├── jasa-servis/
│   │   │   └── page.tsx                    # A9. Manajemen Jasa & Antrean
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
│   ├── home/                               # HeroBanner, BudgetQuickFilter, FeaturedGrid, ServiceHighlights
│   ├── prebuilt/                           # PrebuiltCard, FpsBenchmarkBar, QuickSpecUpgrader, BundleSummaryBox
│   ├── builder/                            # BuilderSlotRow, PartSelectorDrawer, CompatibilityAlert, StickyTelemetryBar
│   ├── retail/                             # HighDensityPartTable, RetailPartGrid, RetailFilterSidebar
│   ├── quote/                              # QuotationPrintSheet, ConsultationWizardForm
│   ├── admin/                              # SpreadsheetPriceTable, MarginSimulator, AdminPartFormModal
│   └── shared/                             # EmptyState, Skeleton, ErrorFallback, SEOHead, PriceTag, StatusBadge
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

## 4. SKEMA DATABASE

### 4.1 Entity-Relationship

```
HardwarePart ──< PrebuiltPCItem >── PrebuiltPC
AccessoryItem
ServicePackage
ConsultationQuote
BuildOrderTracking
AdminSetting
```

### 4.2 Model Detail (`prisma/schema.prisma`)

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

**ServicePackage** — Layanan Jasa:
- `id`, `name`, `slug`, `price`, `estimatedDuration`, `description`, `features[]`

**ConsultationQuote** — Surat Penawaran:
- `id`, `quoteCode` (KSS-Q-YYYYMM-XXX), `customerName`, `customerWa`, `budget`, `usageNeed`
- `selectedParts` (JSON — daftar komponen tanpa harga per part di tampilan publik)
- `totalCostPrice` (Hanya admin), `finalBundlePrice` (Tampil ke konsumen)
- `adminNotes`, `validUntil`, `status`: DRAFT, SENT, APPROVED, EXPIRED

**BuildOrderTracking** — Pelacakan Rakit/Servis:
- `trackingCode` (TRK-KSS-XXX), `customerName`, `itemTitle`
- `currentStage`: PAYMENT_VERIFIED → PARTS_PREPARATION → ASSEMBLING → CABLE_MANAGEMENT → STRESS_TESTING → READY_TO_SHIP
- `updatedAt`, `notes`

**AdminSetting** — Konfigurasi Toko:
- `key` (Unique), `value` (String)
- Keys: `adminWhatsApp`, `tokopediaUrl`, `assemblyFee`, `defaultMarkup`, `warrantyText`, `storeName`

---

## 5. SPESIFIKASI HALAMAN PUBLIK (12 HALAMAN)

### P1 — Homepage (`/`)
- **Announcement Bar:** Jam operasional, garansi, link Tokopedia.
- **Sticky Header + Mega Nav:** Global search (Ctrl+K), badge Simulasi Aktif, badge Keranjang Eceran.
- **Hero Section:** Split layout — headline + 2 CTA (*Lihat Paket Siap Pakai* & *Konsultasi via WA*) + Interactive Rig Showcase.
- **Quick Budget & Purpose Filter:** Pill interaktif: < 5 Jt, 5–8 Jt, 8–12 Jt, 12–20 Jt, > 20 Jt | Gaming, Editing, Office, Streaming.
- **Grid Paket Unggulan:** 6 kartu PC — badge resolusi, spek utama, FPS bar, Harga Total, tombol Upgrade & Beli.
- **Banner Konsultasi WA:** Seksi CTA untuk konsultasi budget kustom.
- **Carousel Aksesoris Terlaris:** Monitor, Gear Gaming, komponen upgrade siap beli eceran.
- **USP Grid:** Garansi Resmi, Stress-Test, Cable Management, Gratis Konsultasi, Packing Kayu.

### P2 — Katalog Paket PC Rakitan (`/paket-rakitan`)
- **Filter:** Rentang Harga, Platform CPU (AMD/Intel), Seri GPU, RAM, Kegunaan.
- **Sorting:** Termurah, Termahal, FPS Tertinggi, Terlaris.
- **Compare Drawer:** Pilih hingga 3 paket untuk perbandingan berdampingan.

### P3 — Detail Paket + Quick Spec Upgrader (`/paket-rakitan/[slug]`)
- Galeri visual casing, badge garansi, konsumsi daya.
- Daftar 8–10 komponen — **tanpa harga per part** (Zero Part-Price Leak).
- **Quick Spec Upgrader:** Ganti RAM/SSD/GPU/Cooler → Delta Price real-time.
- Panel Aksi: Pesan via WA, Checkout Tokopedia, Cetak PDF, Buka di Simulasi Penuh.

### P4 — Custom PC Configurator (`/simulasi`)
- **10 Slot Rakitan:** CPU, Mobo, Cooler, RAM, SSD, HDD, GPU, PSU, Case, Monitor.
- **Part Selector Drawer:** Auto-filter kompatibel, tampil Delta Price saja.
- **Real-Time Telemetry:** Compatibility status, wattage calculator, bottleneck alert.
- **Sticky Bar:** Total Komponen, Est. Watt, Harga Bundel, Reset, Cetak, Kirim WA.

### P5 — Wizard Konsultasi Budget (`/konsultasi`)
- **Step 1:** Slider budget (Rp 4 Jt – 50 Jt+).
- **Step 2:** Multi-select game/software (Valorant, Premiere Pro, AutoCAD, dll).
- **Step 3:** PC Only / Fullset, warna casing, platform preference.
- **Step 4:** 2 rekomendasi paket terdekat + tombol "Minta Racikan Kustom via WA".

### P6 — Katalog Komponen Eceran (`/komponen`)
- **Toggle View:** Compact Table (gaya Enterkomputer) vs Bento Grid.
- **Filter:** Kategori, Brand, Socket, Rentang Harga.
- Tampil `retailPrice`, status stok, tombol `+ Keranjang`.

### P7 — Detail Komponen Eceran (`/komponen/[slug]`)
- Foto produk, spesifikasi lengkap, status stok, harga eceran.
- Related parts, tombol beli eceran / tambah ke keranjang.

### P8 — Katalog Aksesoris (`/aksesoris`)
- Monitor, Keyboard, Mouse, Headset, Webcam, UPS, Kursi Gaming.
- Filter kategori, `retailPrice`, integrasi `RetailCartDrawer`.

### P9 — Katalog Jasa & Booking (`/jasa`)
- Paket layanan: Rakit Custom, Deep Cleaning, Upgrade OS/SSD, Instalasi Warnet/Kantor.
- Form Booking → kirim ke WhatsApp Teknisi.

### P10 — Tracking Status Rakit/Servis (`/cek-pesanan`)
- Input kode resi `TRK-KSS-XXX` → stepper progress:
  Persiapan Komponen → Perakitan → Cable Management → Stress Test → Siap Kirim.

### P11 — Surat Penawaran Resmi (`/penawaran/[code]`)
- Kop resmi KSS Komputer, info konsumen, nomor kuotasi, masa berlaku.
- Tabel spek lengkap — **TANPA kolom harga per part** — 1 boks Harga Total.
- Print-to-PDF (A4 clean layout), Setujui via WA, Beli via Tokopedia.

### P12 — Tentang Kami (`/tentang-kami`)
- Profil toko, lokasi (embed Google Maps), garansi, FAQ accordion.

---

## 6. SPESIFIKASI ADMIN PANEL (10 SUB-MODUL)

| Kode | Route | Deskripsi |
|------|-------|-----------|
| **A1** | `/admin` | Dashboard — Total Paket Aktif, Total Komponen, Avg Margin %, Kuotasi Terbaru, Stok Menipis. |
| **A2** | `/admin/paket-rakitan` | List paket PC — Clone, Toggle Aktif, Edit Link Tokopedia. |
| **A3** | `/admin/paket-rakitan/[id]` | Editor paket — Pilih komponen, HPP Modal vs Harga Jual vs Profit. |
| **A4** | `/admin/komponen` | CRUD Komponen, spesifikasi kompatibilitas, toggle `isRetailAvailable`. |
| **A5** | `/admin/aksesoris` | CRUD Aksesoris, harga modal vs harga jual eceran. |
| **A6** | `/admin/pricing` | Spreadsheet bulk pricing — `costPrice`, `retailPrice`, Markup %, Import/Export CSV. |
| **A7** | `/admin/quotes` | Daftar penawaran WA — Draft, Terkirim, Deal, Expired. |
| **A8** | `/admin/quotes/buat` | Quotation Studio — Racik spek, kalkulator HPP vs Harga Jual vs Margin, generate link & PDF. |
| **A9** | `/admin/jasa-servis` | Harga jasa + update status pengerjaan (`TRK-KSS-XXX`). |
| **A10** | `/admin/pengaturan` | Nomor WA, Link Tokopedia, Biaya Rakit, Kop Surat, PIN Admin. |

---

## 7. CHECKLIST EKSEKUSI

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
- [ ] **1.5** Tambahkan tipe `BuildOrderTracking` di `types.ts` (stage enum: PAYMENT_VERIFIED → READY_TO_SHIP)
- [ ] **1.6** Tambahkan tipe `StoreSettings` di `types.ts` (adminWhatsApp, tokopediaUrl, assemblyFee, defaultMarkup, warrantyText)
- [ ] **1.7** Refactor sanitizer: rename `server-dto.ts` → `sanitizer.ts`, pastikan `sanitizePrebuiltForPublic()` dan `sanitizeQuoteForPublic()` diimpor dan digunakan di halaman publik yang relevan
- [ ] **1.8** Ekspansi `mock-data.ts`: tambah 12+ aksesoris (total 20+), 2 tambahan sample `ConsultationQuote`, 3 sample `BuildOrderTracking`
- [ ] **1.9** Tambahkan `generateRetailCartWAMessage()` dan `generateQuoteShareWAMessage()` di `format.ts` (pindahkan logic yang saat ini inline)
- [ ] **1.10** Buat `src/lib/constants.ts` — Centralize WA number, Tokopedia URL, store name, warranty text
- [ ] **1.11** Buat `src/lib/utils.ts` — `cn()` (clsx+twMerge), `slugify()`, `debounce()`, `clamp()`

---

### FASE 2 — State Management (Zustand Stores)

- [x] **2.1** `useBuilderStore.ts` — Full PC builder state, delta pricing, build code export/import, subtotal, wattage
- [x] **2.2** `useAdminStore.ts` — Global markup%, assembly fee, price overrides, bulk markup, profit calculator
- [x] **2.3** `useRetailCartStore.ts` — Keranjang eceran (HardwarePart + AccessoryItem), WA checkout URL
- [x] **2.4** `useQuoteStore.ts` — CRUD surat penawaran, auto-generate quoteCode
- [x] **2.5** `useCartStore.ts` — Builder cart (add/remove/update, bulk add from builder)
- [x] **2.6** `useCompareStore.ts` — Bandingkan hingga 4 produk
- [x] **2.7** `useHydrated.ts` — SSR-safe hydration hook via `useSyncExternalStore`

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
- [ ] **3.9** Install & setup `shadcn/ui` — Init CLI, tambahkan komponen: Button, Dialog, Sheet, DropdownMenu, Tabs, Badge, Skeleton, Tooltip, Command, Separator
- [ ] **3.10** Install `next-themes` — Buat `ThemeProvider` wrapper di root layout, toggle Dark/Light di Navbar
- [ ] **3.11** Install `sonner` — Tambahkan `<Toaster />` di root layout, gunakan `toast()` untuk feedback aksi
- [ ] **3.12** Buat shared components di `src/components/shared/`:
  - `EmptyState.tsx` — Ilustrasi + pesan + CTA saat data kosong
  - `Skeleton.tsx` — Skeleton loader variants (card, table row, detail page)
  - `PriceTag.tsx` — Reusable price display (`font-mono tabular-nums`)
  - `StatusBadge.tsx` — Badge stok (Ready/Limited/PO/Out of Stock)
  - `ErrorFallback.tsx` — Error boundary fallback component
- [ ] **3.13** Buat global error handling files:
  - `src/app/not-found.tsx` — Custom 404 page
  - `src/app/error.tsx` — Global error boundary (client component)
  - `src/app/loading.tsx` — Root loading skeleton
- [ ] **3.14** Setup `next/font` — Inter (body) + JetBrains Mono (prices, specs, codes)
- [ ] **3.15** Buat `FloatingWAButton.tsx` — Floating WhatsApp CTA button (fixed bottom-right)
- [ ] **3.16** Update PWA manifest dengan ikon PNG 192x192 & 512x512 (bukan placeholder SVG)

---

### FASE 4 — Homepage & Halaman Utama Publik

- [x] **4.1** Homepage (`/`) — Hero, Budget Filter, Featured Prebuilts, Konsultasi WA, Aksesoris, USP Grid
- [x] **4.2** Katalog Paket Rakitan (`/paket-rakitan`) — Filter multi-dimensi + sorting
- [x] **4.3** Detail Paket + Quick Spec Upgrader (`/paket-rakitan/[slug]`) — Delta Price, FPS bar, WA/Tokopedia CTA
- [x] **4.4** Custom PC Configurator (`/simulasi`) — 10 slot, compatibility engine, delta pricing, sticky telemetry
- [x] **4.5** `PrebuiltCard.tsx` — Card component (specs, bundle price, WA link, Tokopedia link)
- [x] **4.6** `FilterSidebar.tsx`, `ProductRowPricelist.tsx`, `SpecBadges.tsx` — Catalog filter & display components
- [ ] **4.7** Implementasi Compare Drawer UI di `/paket-rakitan` — hubungkan dengan `useCompareStore` (store ada, UI belum terhubung)
- [ ] **4.8** Buat `/konsultasi` — Wizard 4 langkah (Budget Slider → Game/Software Select → Preferensi → Rekomendasi + WA Dispatch)

---

### FASE 5 — Katalog Eceran, Aksesoris & Layanan

- [x] **5.1** Katalog Komponen Eceran (`/komponen`) — Dual view (Table/Grid), filter, `retailPrice`, keranjang
- [x] **5.2** Katalog Aksesoris (`/aksesoris`) — Category tabs, search, grid/table view, retail cart
- [x] **5.3** Katalog Jasa & Booking (`/jasa`) — Paket layanan + WA contact
- [ ] **5.4** Detail Komponen Eceran (`/komponen/[slug]`) — Halaman detail produk lengkap (foto, spek, stok, related parts, tambah keranjang)

---

### FASE 6 — Tracking, Penawaran & Profil Toko

- [x] **6.1** Surat Penawaran (`/penawaran/[code]`) — Kop resmi, tabel spek, 1 Harga Total, Print PDF, WA confirm
- [ ] **6.2** Tracking Status Rakit/Servis (`/cek-pesanan`) — Input kode `TRK-KSS-XXX`, stepper progress 5 tahap
- [ ] **6.3** Tentang Kami (`/tentang-kami`) — Profil toko, lokasi (Google Maps embed), garansi, FAQ accordion

---

### FASE 7 — Admin Panel Core

- [ ] **7.1** Admin Layout (`/admin/layout.tsx`) — Sidebar navigasi, header status toko, PIN/password gate
- [ ] **7.2** Dashboard (`/admin`) — Metrik bisnis: Total Paket Aktif, Total Komponen, Avg Margin, Kuotasi Terbaru, Stok Alert
- [x] **7.3** Admin Pricing (`/admin/pricing`) — Global markup slider, assembly fee, per-part price editing, bulk apply
- [x] **7.4** Admin Quotes List (`/admin/quotes`) — Create, list, delete, update status quotation

---

### FASE 8 — Admin Panel Extended

- [ ] **8.1** Quotation Studio (`/admin/quotes/buat`) — Form lengkap: input konsumen, part picker per slot, kalkulator HPP vs Harga Jual vs Margin, generate link `/penawaran/[code]` + WA dispatch
- [ ] **8.2** Manajemen Paket PC (`/admin/paket-rakitan`) — List paket, Clone, Toggle Aktif, Edit Link Tokopedia
- [ ] **8.3** Editor Paket PC (`/admin/paket-rakitan/[id]`) — Pilih komponen per slot, HPP Modal vs Harga Jual Bundel vs Profit
- [ ] **8.4** Manajemen Komponen (`/admin/komponen`) — CRUD hardware parts, spesifikasi kompatibilitas, toggle `isRetailAvailable`
- [ ] **8.5** Manajemen Aksesoris (`/admin/aksesoris`) — CRUD aksesoris, harga modal vs jual eceran
- [ ] **8.6** Jasa & Antrean Servis (`/admin/jasa-servis`) — Harga jasa, update status `TRK-KSS-XXX`
- [ ] **8.7** Pengaturan Toko (`/admin/pengaturan`) — Nomor WA, Link Tokopedia, Biaya Rakit, Kop Surat, PIN Admin

---

### FASE 9 — SEO, Performance & PWA

- [ ] **9.1** `generateMetadata` pada semua halaman publik (title, description, openGraph, twitter card)
- [ ] **9.2** `src/app/sitemap.ts` — Dynamic sitemap (semua slug paket, komponen, aksesoris)
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
- [ ] **11.2** Finalisasi `prisma/schema.prisma` — Semua model, relasi, index, enum
- [ ] **11.3** Setup database PostgreSQL (Supabase) + `.env` connection string
- [ ] **11.4** `prisma migrate dev` — Generate & apply initial migration
- [ ] **11.5** `prisma/seed.ts` — Jalankan seeder, populasi data awal dari `mock-data.ts`
- [ ] **11.6** Migrasi semua halaman dari mock data → Prisma queries (server components)
- [ ] **11.7** `.env.example` — Dokumentasi semua environment variables yang dibutuhkan
- [ ] **11.8** Final TypeScript audit: `tsc --noEmit` = 0 errors
- [ ] **11.9** Final build audit: `npm run build` = sukses, semua routes generated
- [ ] **11.10** Production deploy & smoke test seluruh halaman publik + admin

---

## 8. DEPLOYMENT & CI/CD RULES

### 8.1 Pre-Push Checklist (Wajib)

```
1. ✅ tsc --noEmit       → 0 errors
2. ✅ npm run build       → Exit 0, semua routes generated
3. ✅ Checklist ROADMAP   → Sub-tugas yang dikerjakan sudah [x]
4. ✅ No WIP / half-done  → Tidak ada fitur setengah jadi
```

### 8.2 Deploy Command

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

### 8.3 Environment Variables

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
| 1 | Data Layer | 11 | 4 | 7 |
| 2 | State Management | 7 | 7 | 0 |
| 3 | Layout & Shared | 16 | 8 | 8 |
| 4 | Homepage & Publik Utama | 8 | 6 | 2 |
| 5 | Eceran, Aksesoris, Jasa | 4 | 3 | 1 |
| 6 | Tracking, Penawaran, Profil | 3 | 1 | 2 |
| 7 | Admin Core | 4 | 2 | 2 |
| 8 | Admin Extended | 7 | 0 | 7 |
| 9 | SEO, Performance, PWA | 8 | 0 | 8 |
| 10 | API Routes | 4 | 0 | 4 |
| 11 | Database & Final QA | 10 | 0 | 10 |
| **TOTAL** | | **86** | **35** | **51** |

> **Progress: 35 / 86 (40.7%)**
