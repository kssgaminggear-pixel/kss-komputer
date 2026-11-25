# ROADMAP.md — KSS Komputer V2

> Model bisnis: **Custom PC System Integrator & Pusat Layanan Jasa Komputer**.
> Publik hanya melihat total harga paket dan delta upgrade. Harga satuan part
> dilarang tampil.
>
> Aturan UI: `UI_FIGCRAFT_SKILL.md`. Aturan kerja: `AGENTS.md`.
> Arsitektur: `ARCHITECTURE.md`.

**Progress: 21 / 21 item (100%)** — Fase 1–4 dan 6–8 selesai. Fase 5 (simulator)
dibatalkan: rakit custom kini ditangani via WhatsApp.

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
  - `useAdminStore`: markup global, assembly fee, edit cost/sell, profit paket,
    paket kustom (`upsertPackage`, `deletePackage`, `getMergedPackages`).
  - `useBuilderStore` dihapus bersama simulator; rakit custom via WhatsApp.

---

## FASE 3 — Layout Industrial & Homepage High-Conversion

- [x] **3.1 `Navbar.tsx` & `Footer.tsx`**
  - Top bar status operasional, garansi rakitan, link Tokopedia resmi.
  - Navbar: Paket PC, Layanan Jasa, Command Search (`Cmd+K`), keranjang eceran.
- [x] **3.2 `src/app/page.tsx`**
  - Tactical Split Header: value proposition + filter kebutuhan di kiri,
    Featured Flagship Rig dengan FPS telemetry di kanan.
  - Grid paket dengan Hardware Spec Pill, FPS Telemetry Bar, total harga,
    tombol konsultasi upgrade via WhatsApp dan Tokopedia.
  - Seksi layanan jasa interaktif.

---

## FASE 4 — Katalog Paket Rakitan & Quick-Upgrade

- [x] **4.1 `src/app/paket-rakitan/page.tsx`**
  - Filter budget (`< 7 jt`, `7–12 jt`, `12–20 jt`, `> 20 jt`), kegunaan
    (Gaming, Editing/Render, Office), platform (AMD Ryzen / Intel Core).
- [x] **4.2 `src/app/paket-rakitan/[slug]/page.tsx`**
  - Rincian komponen, estimasi daya, FPS.
  - Quick-Upgrade Panel: RAM/SSD/GPU kompatibel, delta harga, total real-time.
  - CTA Checkout Tokopedia & Pesan WhatsApp.

---

## FASE 5 — ~~Custom PC Configurator~~ (DIBATALKAN)

- ~~5.1 `src/app/simulasi/page.tsx`~~
- Alasan bisnis: rakit PC custom ditangani langsung oleh teknisi via WhatsApp.
  Route `/simulasi` dihapus dan diarahkan permanen ke `/paket-rakitan`.
  Semua CTA memakai `generateCustomBuildWAMessage()`.

---

## FASE 6 — Halaman Jasa & Admin Markup Calculator

- [x] **6.1 `src/app/jasa/page.tsx`**
  - Katalog layanan, estimasi biaya jasa, form booking WhatsApp.
- [x] **6.2 `src/app/admin/pricing/page.tsx`**
  - Dashboard spreadsheet: costPrice, markup per komponen/global, assemblyFee,
    estimasi profit per paket, edit link Tokopedia.

---

## FASE 7 — SEO, QA & Price Guard

- [x] **7.1 `src/lib/seo.ts` + `src/components/seo/JsonLd.tsx`**
  - Schema Organization/ComputerStore, WebSite, Product (total paket), Service,
    BreadcrumbList, dan FAQPage.
- [x] **7.2 `src/app/sitemap.ts`, `src/app/robots.ts`, `not-found`, `error`, `loading`**
  - Sitemap 76 URL, robots memblokir /admin, /api, /penawaran.
- [x] **7.3 Canonical + Open Graph**
  - Canonical eksplisit untuk semua halaman statis dan detail paket/jasa/komponen.
- [x] **7.4 FAQ bersama `src/lib/faq.ts`**
  - Teks FAQ yang tampil identik dengan FAQPage JSON-LD.
- [x] **7.5 Vitest + CI**
  - 51 test: pricing, delta, kompatibilitas, sanitizer DTO, CS price guard,
    stream guard, parser SSE, dan auth admin.
- [x] **7.6 `scripts/check-price-leak.mjs`**
  - Gagal bila bundle client memuat nominal `costPrice`/`sellPrice`.
  - Halaman admin dipisah menjadi Server Component + client component agar
    katalog modal tidak ikut chunk publik.
- [x] **7.7 Auth admin**
  - `src/proxy.ts` mengunci `/admin/*` dan `/api/admin/*`.
  - Login HMAC cookie 12 jam, rate limit 5 percobaan / 5 menit, fail closed.
- [x] **7.8 Streaming CS Agent**
  - `/api/cs` mendukung SSE (`delta`, `done`, `error`) dengan fallback JSON.
  - `createStreamGuard()` menahan teks per kalimat agar harga part terpotong
    antar-chunk tetap diredaksi; `src/lib/sse.ts` dipakai server dan widget.
  - Widget menampilkan balasan bertahap dengan kursor, tetap punya fallback
    WhatsApp saat stream gagal, dan tidak merender tombol CS saat offline.

---

## FASE 8 — QA Responsif & Aksesibilitas

- [x] **8.1 Audit responsif 390–1440 px**
  - 10 halaman × 4 viewport (390/768/1024/1440), nol horizontal overflow,
    nol error console.
- [x] **8.2 Lighthouse & perbaikan aksesibilitas**
  - Kontras teks dinaikkan, label form/id ditambahkan, select diberi
    `aria-label`, dan nama aksesibel tombol CS diselaraskan.
  - Skor aksesibilitas 1.0 di home dan paket-detail (sebelumnya 0.86/0.96).

---

## Ringkasan Progres

| Fase | Item | Selesai |
|---|---|---|
| 1 | 3 | 3 |
| 2 | 2 | 2 |
| 3 | 2 | 2 |
| 4 | 2 | 2 |
| 5 | 0 (dibatalkan) | 0 |
| 6 | 2 | 2 |
| 7 | 8 | 8 |
| 8 | 2 | 2 |
| **Total** | **21** | **21** |

## Catatan Implementasi

- Fase 1–2 ditambahkan sebagai domain layer v2 tanpa merusak halaman live.
- Migrasi UI ke `PrebuiltPackage`/`ComputerService` dilakukan pada Fase 3–6.
- Fase 5 dibatalkan; simulator dan `useBuilderStore` sudah dihapus.
- Setiap fase wajib lulus `npx tsc --noEmit`, `npm run lint`, `npm run test`,
  `npm run build`, dan `npm run check:price` sebelum commit.

### Status per 2026-11-26

- Seluruh halaman publik sudah live di
  `https://kss-komputer-seven.vercel.app`.
- Checklist Fase 3–6 menandai **migrasi ke domain v2** (data `PrebuiltPackage` /
  `ComputerService`), bukan pembuatan halaman dari nol.
- Rakit custom diarahkan ke WhatsApp; tidak ada route `/simulasi` maupun API
  estimasi publik. `/simulasi` melakukan redirect permanen ke `/paket-rakitan`.
- Sumber desain FigCraft native ada di `design/figcraft/`; skill OpenCode di
  `.opencode/skills/figcraft/`.
- Harga satuan komponen: 0 kebocoran di chunk publik (diverifikasi).

