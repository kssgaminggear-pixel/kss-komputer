# ROADMAP.md — KSS Komputer V2

> Model bisnis: **Custom PC System Integrator & Pusat Layanan Jasa Komputer**.
> Publik hanya melihat total harga paket dan delta upgrade. Harga satuan part
> dilarang tampil.
>
> Aturan UI: `UI_FIGCRAFT_SKILL.md`. Aturan kerja: `AGENTS.md`.
> Arsitektur: `ARCHITECTURE.md`.

**Progress: 5 / 12 item (41.7%)** — Fase 1 & 2 selesai.

---

## FASE 1 — Kontrak Tipe Data, Kalkulator Markup & Data KSS

- [x] **1.1 `src/lib/types.ts`**
  - `HardwarePart`: `id`, `sku`, `name`, `category`, `brand`, `costPrice`,
    `sellPrice`, `wattage`, `stockStatus`, `specs` (socket, ramType, formFactor,
    gpuLengthMm, maxGpuLengthMm, vramGb, psuWattage).
  - `PrebuiltPackage`: `id`, `slug`, `name`, `tier`, `parts`, `assemblyFee`,
    `customTotalOverride`, `fpsBenchmarks`, `tokopediaUrl`, `highlights`.
  - `ComputerService`: `id`, `slug`, `title`, `category`, `priceStartFrom`,
    `durationEstimate`, `features`, `warrantyInfo`.
- [x] **1.2 `src/lib/format.ts`**
  - `TOKOPEDIA_URL = "https://tk.tokopedia.com/ZSpeToWkH/"`.
  - `formatIDR`, `formatDeltaIDR` (`+ Rp`, `- Rp`, `Termasuk Paket`).
  - `generateWhatsAppBuildOrder` — rincian komponen + total paket, tanpa harga
    satuan.
  - `generateWhatsAppServiceBooking` — booking jasa.
- [x] **1.3 `src/lib/mock-data.ts`**
  - 45+ komponen nyata dengan `costPrice` dan `sellPrice` bermarkup.
  - 6 paket `KSS_PREBUILT_PACKAGES` lengkap dengan FPS benchmark.
  - 4 layanan `KSS_COMPUTER_SERVICES` (rakit, upgrade, cleaning, konsultasi).

---

## FASE 2 — Compatibility Engine & Zustand Stores

- [x] **2.1 `src/lib/compatibility.ts`**
  - `validateBuild(selections | parts)` — socket, RAM, form factor, clearance,
    BIOS, wattage, rekomendasi PSU.
  - `calculatePackageTotal(parts, assemblyFee, globalMarkupPercent)`.
  - `calculatePartDelta(currentPart, candidatePart, globalMarkupPercent)`.
- [x] **2.2 Zustand stores**
  - `useBuilderStore`: slot terpilih, `loadPrebuilt`, `loadPrebuiltPackage`,
    `selectPart`, `strictCompatibilityFilter`, total bundel.
  - `useAdminStore`: markup global, assembly fee, edit cost/sell, profit paket,
    paket kustom (`upsertPackage`, `deletePackage`, `getMergedPackages`).

---

## FASE 3 — Layout Industrial & Homepage High-Conversion

- [ ] **3.1 `Navbar.tsx` & `Footer.tsx`**
  - Top bar status operasional, garansi rakitan, link Tokopedia resmi.
  - Navbar: Paket PC, Custom Configurator, Layanan Jasa, Command Search
    (`Cmd+K`), indikator total rakitan aktif.
- [ ] **3.2 `src/app/page.tsx`**
  - Tactical Split Header: value proposition + filter kebutuhan di kiri,
    Featured Flagship Rig dengan FPS telemetry di kanan.
  - Grid paket dengan Hardware Spec Pill, FPS Telemetry Bar, total harga,
    tombol Kustomisasi dan Tokopedia/WA.
  - Seksi layanan jasa interaktif.

---

## FASE 4 — Katalog Paket Rakitan & Quick-Upgrade

- [ ] **4.1 `src/app/paket-rakitan/page.tsx`**
  - Filter budget (`< 7 jt`, `7–12 jt`, `12–20 jt`, `> 20 jt`), kegunaan
    (Gaming, Editing/Render, Office), platform (AMD Ryzen / Intel Core).
- [ ] **4.2 `src/app/paket-rakitan/[slug]/page.tsx`**
  - Rincian komponen, estimasi daya, FPS.
  - Quick-Upgrade Panel: RAM/SSD/GPU kompatibel, delta harga, total real-time.
  - CTA Checkout Tokopedia & Pesan WhatsApp.

---

## FASE 5 — Custom PC Configurator dengan Delta Pricing

- [ ] **5.1 `src/app/simulasi/page.tsx`**
  - 10 slot komponen.
  - Drawer hanya menampilkan komponen kompatibel + delta tag.
  - Sticky telemetry: kompatibilitas, watt, PSU, biaya rakit, total.
  - Cetak quotation, salin spesifikasi, WhatsApp, link checkout Tokopedia.

---

## FASE 6 — Halaman Jasa & Admin Markup Calculator

- [ ] **6.1 `src/app/jasa/page.tsx`**
  - Katalog layanan, estimasi biaya jasa, form booking WhatsApp.
- [ ] **6.2 `src/app/admin/pricing/page.tsx`**
  - Dashboard spreadsheet: costPrice, markup per komponen/global, assemblyFee,
    estimasi profit per paket, edit link Tokopedia.

---

## Ringkasan Progres

| Fase | Item | Selesai |
|---|---|---|
| 1 | 3 | 3 |
| 2 | 2 | 2 |
| 3 | 2 | 0 |
| 4 | 2 | 0 |
| 5 | 1 | 0 |
| 6 | 2 | 0 |
| **Total** | **12** | **5** |

## Catatan Implementasi

- Fase 1–2 ditambahkan sebagai domain layer v2 tanpa merusak halaman live.
- Migrasi UI ke `PrebuiltPackage`/`ComputerService` dilakukan pada Fase 3–6.
- Setiap fase wajib lulus `npx tsc --noEmit`, `npm run lint`, dan `npm run build`
  sebelum commit.
