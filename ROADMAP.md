# ROADMAP.md — KSS Komputer v4 (Web visual-first + Aplikasi HP)

> Model bisnis: **Custom PC System Integrator & Pusat Layanan Jasa Komputer**
> (Mangga Dua Mall, Jakarta).
>
> Harga publik hanya: **total harga paket**, **harga jasa**, dan **harga produk eceran
> `/toko`** (harga normal toko, tanpa harga coret). Harga satuan part paket dan
> selisih/delta upgrade **tidak** ditampilkan. Pembayaran: WhatsApp + transfer manual
> (rekening belum ditetapkan); Midtrans menyusul. Total paket saat ini masih data contoh
> dan sengaja dibiarkan oleh pemilik.
>
> Dokumen terkait: `CLAUDE.md` (aturan kerja), `AGENTS.md` (aturan bisnis),
> `DESIGN.md` + `src/app/globals.css` (visual v2), `docs/ASSET_PLAN.md` (aset gambar),
> `CHANGELOG.md` (riwayat perubahan).

**Status per 2026-11-28:** fondasi web, katalog paket, jasa, Toko (1.169 produk, 671
tampil) dan sinkron harian sudah live. Fokus berikutnya: **Pilar V — redesign web
visual-first** (MVP Go-Live), lalu fondasi backend dan aplikasi HP.

---

## 0. Cara memakai dokumen ini

- Centang `[x]` hanya setelah Quality Gate milestone lulus, dan catat di `CHANGELOG.md`
  `[Unreleased]` pada commit yang sama.
- Setiap milestone punya: **Tujuan**, **Deliverables**, **Quality Gate**, **Delegasi**.
- Delegasi model: **Opus** = arsitektur, kontrak, rancangan UI, review akhir;
  **Sonnet** = implementasi web/mobile, perbaikan tsc/lint/build; **Haiku** = pencarian,
  boilerplate, data contoh, dokumentasi berulang.

### 0.1 Quality Gate standar

| Kode | Isi | Kapan |
|---|---|---|
| **QG-W** | `npx tsc --noEmit` 0 error · `npm run lint` 0 error · `npm test` hijau · `npm run build` sukses · `npm run check:price` lulus | Semua milestone yang menyentuh kode |
| **QG-V** | Visual Audit Playwright (§0.2) lulus di 390×844 dan 1440×900 | Semua milestone UI publik |
| **QG-A** | Lighthouse a11y ≥ 0,95 di halaman yang diubah; nol horizontal overflow 390–1440 px; target sentuh ≥ 44 px | Milestone UI |
| **QG-M** | Mobile MCP di emulator Android + simulator iOS: layar utama terbuka, semua gambar termuat, tidak ada dinding teks, alur utama selesai | Milestone aplikasi HP |
| **QG-B** | Tidak ada harga satuan part/delta di HTML, payload RSC, JSON API, maupun bundle aplikasi | Semua milestone yang menyentuh data paket |

### 0.2 Visual Audit (cara mengukur "dominan gambar")

Skrip Playwright `tests/visual/visual-audit.spec.ts` (dibuat di V0.3), dijalankan
`npm run audit:visual`, keluaran JSON di `test-results/visual/` (tidak di-commit).

1. **Rasio cakupan visual (VCR).** Pada tiap fold (desktop 3 fold, mobile 4 fold), ambil
   titik sampel tiap 8 px CSS. Titik dihitung *visual* bila tumpukan
   `document.elementsFromPoint()` memuat `img` (sudah termuat, `naturalWidth > 0`),
   `picture`, `video`, `canvas`, `svg` ≥ 64×64 px, atau elemen ber-`data-visual`.
   Area navbar/bottom-nav sticky dikeluarkan dari penyebut. Teks yang menumpang di atas
   foto tetap dihitung visual. VCR = titik visual ÷ seluruh titik.
2. **Target VCR per jenis halaman.**

   | Jenis | Route | Target |
   |---|---|---|
   | Etalase | `/`, `/paket-rakitan`, `/toko`, `/toko/etalase/[slug]`, `/galeri` | rata-rata ≥ 65 % (sasaran 75 %); fold pertama ≥ 70 % |
   | Detail | `/paket-rakitan/[slug]`, `/toko/[slug]`, `/jasa/[slug]` | fold pertama ≥ 55 % desktop, ≥ 50 % mobile |
   | Informasi | `/jasa`, `/tentang-kami` | rata-rata ≥ 45 % |
   | Transaksi | `/konsultasi`, `/cek-pesanan`, `/penawaran/[code]`, `/admin/*` | dikecualikan dari VCR; tetap wajib cek gambar |

3. **Anti dinding teks.** Gagal bila ada blok teks terlihat > 300 karakter di luar
   `details`, tab panel, dialog, atau drawer; peringatan bila paragraf > 3 baris di mobile.
4. **Kesehatan gambar.** Setelah gulir penuh: semua `img` `complete` dan `naturalWidth > 0`;
   nol respons 4xx/5xx untuk `/_next/image` dan `/images/`; `naturalWidth ≥ 0,75 ×
   lebar render × DPR` (gagal) dan ≥ 0,9 (peringatan) untuk mendeteksi foto pecah; setiap
   gambar konten punya `alt`; CLS < 0,1.
5. **Bukti.** Screenshot per fold disimpan sebagai artefak CI, bukan di repo.

---

## A. Rekam jejak (selesai)

Ringkasan dicocokkan dengan kode dan `git log` per 2026-11-28, bukan klaim dokumen lama.
Detail per commit: `CHANGELOG.md`.

### FASE 1 — Kontrak tipe, kalkulator harga, data KSS ✅

- [x] 1.1 `src/lib/types.ts`: `HardwarePart`, `PrebuiltPackage`, `ComputerService`,
  DTO publik tanpa field harga part.
- [x] 1.2 `src/lib/format.ts`: format Rupiah, generator pesan WhatsApp (paket, jasa,
  rakit custom). `formatDeltaIDR` dihapus di PR #13.
- [x] 1.3 `src/lib/mock-data.ts`: katalog internal, 6 paket, 4 layanan (data contoh).

### FASE 2 — Compatibility engine & store ✅

- [x] 2.1 `src/lib/compatibility.ts`: validasi socket/RAM/form factor/clearance/PSU,
  total paket. Total publik dihitung di `sanitizer.ts` (server); `server-pricing.ts`
  belum dipakai (utang teknis, lihat P1).
- [x] 2.2 `useAdminStore` (kalkulator admin lokal di browser), `useRetailCartStore`,
  `useQuoteStore`. Simulator dan `useBuilderStore` dihapus.

### FASE 3 — Layout & beranda ✅

- [x] 3.1 Navbar, Footer, BottomNav, Command Search.
- [x] 3.2 Beranda: hero foto, paket terlaris, jasa, konsultasi, terlaris Toko, proses QC.

### FASE 4 — Katalog paket ✅

- [x] 4.1 `/paket-rakitan` dengan filter budget/kegunaan/platform.
- [x] 4.2 `/paket-rakitan/[slug]`: rincian komponen tanpa harga, estimasi daya & FPS,
  opsi upgrade yang hanya mengubah **total** (selisih per komponen tidak ditampilkan
  sejak PR #13), CTA WhatsApp & Tokopedia.

### FASE 5 — ~~Custom PC configurator~~ (dibatalkan)

- Rakit custom ditangani teknisi via WhatsApp; `/simulasi` redirect permanen ke
  `/paket-rakitan`.

### FASE 6 — Jasa & admin ✅

- [x] 6.1 `/jasa`, `/jasa/[slug]`, form booking WhatsApp.
- [x] 6.2 `/admin/pricing` dan `/admin/quotes` (perubahan tersimpan lokal di browser
  admin; penyimpanan server menyusul di P2).

### FASE 7 — SEO, test, price guard, auth admin, CS ✅

- [x] 7.1 JSON-LD (Organization/ComputerStore, WebSite, Product total paket, Service,
  Breadcrumb, FAQPage), sitemap, robots, canonical, Open Graph.
- [x] 7.2 Vitest + CI: kini 77 test di 11 berkas (pricing, kompatibilitas, sanitizer,
  CS guard, SSE, auth admin, marketplace, sinkron, proxy CS).
- [x] 7.3 `scripts/check-price-leak.mjs` (diperketat di PR #6).
- [x] 7.4 Area admin terkunci sesi bertanda tangan (`src/proxy.ts`).
- [x] 7.5 CS agent 24 jam dengan streaming SSE dan sanitasi harga.

### FASE 8 — Responsif & aksesibilitas ✅

- [x] 8.1 Audit 390/768/1024/1440 tanpa horizontal overflow.
- [x] 8.2 Kontras dan label form diperbaiki (a11y 1,0 di beranda & detail paket saat itu).

### FASE 9 — Observability & delivery ✅

- [x] 9.1 `GET /api/health`.
- [x] 9.2 Workflow uptime 15 menit (issue otomatis).
- [x] 9.3 Auto-deploy produksi setelah job verify lulus.

### FASE 10 — Visual v2 "Lembar spesifikasi bengkel" ✅ (PR #1, #2)

- [x] 10.1 Token baru di `globals.css`, skala tipografi, kelas `kss-*`, radius maks 6 px,
  komponen `Price`.
- [x] 10.2 Navbar, Footer, BottomNav, beranda, kartu paket, `/paket-rakitan`, tentang kami.
- [x] 10.3 Sapuan halaman sisa (ukuran teks min 11 px, tombol WA ink, tanpa `Sparkles`).
  Catatan: sisa kelas `dark:` gaya lama masih ada di `/jasa`, `/jasa/[slug]`,
  `/konsultasi`, `/cek-pesanan`, `/paket-rakitan/[slug]` (dibersihkan di Pilar V).

### FASE 11 — Toko (marketplace sendiri) & sinkron harian ✅ (PR #4–#9)

- [x] 11.1 Scraper katalog toko sendiri (`tools/tokopedia-scraper`), dijalankan pemilik.
- [x] 11.2 Harga satuan komponen dihapus dari seluruh data publik; `/komponen` &
  `/aksesoris` diganti `/toko` (redirect permanen).
- [x] 11.3 `/toko`, `/toko/[slug]`, `/toko/etalase/[slug]`, keranjang eceran ke WhatsApp,
  banner promo, 33 etalase.
- [x] 11.4 Sinkron harian dengan ambang pengaman + validator; foto utama 600 px WebP.

### FASE 12 — Harga & pembayaran disederhanakan ✅ (PR #10–#13)

- [x] 12.1 Toko memakai harga normal (tanpa harga coret Tokopedia).
- [x] 12.2 Pembayaran diarahkan ke WhatsApp + transfer manual (`PaymentInfo`).
- [x] 12.3 Pengerasan proxy CS dan pembersihan detail infrastruktur dari dokumentasi.
- [x] 12.4 Detail paket hanya menampilkan total harga PC.

---

## B. Audit visual 2026-11-28 (dasar Pilar V)

Bukti diambil dari kode (`grep`) dan inventaris aset (`docs/ASSET_PLAN.md` §1).
VCR belum diukur (alat dibuat di V0.3); penilaian di bawah kualitatif.

| Route | Temuan | Bukti |
|---|---|---|
| `/` | Hero memakai foto 700×600 yang dirender hingga ±720 px CSS; di layar DPR 2 butuh ±1.440 px sehingga pecah. Seksi jasa = 4 tile teks tanpa gambar. Konsultasi = form penuh. "Terlaris di toko" berupa daftar teks dengan thumbnail 48 px. Seksi "Kenapa KSS" memakai potongan 240×300 yang dibesarkan ke kolom 4:3 (lebar penuh di mobile). | `HomeClient.tsx` baris 145–155, 257–275, 373, 505–521, 568 |
| `/paket-rakitan` | Kartu paket didominasi tag, spec, FPS, harga; foto hanya 96×120 px (±10 % area kartu). | `PrebuiltCard.tsx` baris 82–90 |
| `/paket-rakitan/[slug]` | Satu foto 80–112 px, tanpa galeri/zoom; daftar spesifikasi, FPS, dan upgrader panjang; 58 kelas `dark:` gaya lama; judul Title Case dan `text-xs`. | `PaketDetailClient.tsx` baris 163–186, 235–241, 311–346 |
| `/toko` | Paling visual: grid 2/3/4 kolom, foto 1:1. Namun dua tombol penuh per kartu memakan ±30 % tinggi kartu; banner promo tinggal satu (satu sudah kedaluwarsa). | `ProductCard.tsx`, `TokoCatalog.tsx` baris 199, `data/marketplace/banners.json` |
| `/toko/[slug]` | Satu foto maks 600 px, tanpa galeri/zoom; deskripsi hanya ada di 60 dari 1.169 produk. | `toko/[slug]/page.tsx` baris 98–112 |
| `/toko/etalase/[slug]` | Tidak ada sampul visual etalase. | `toko/etalase/[slug]/page.tsx` |
| `/jasa`, `/jasa/[slug]` | Nol gambar; ikon + teks; 32 dan 43 kelas `dark:`. | `jasa/page.tsx`, `jasa/[slug]/page.tsx` |
| `/tentang-kami` | Nol gambar; slot foto bengkel/teknisi (DESIGN.md §6) masih kosong. | `tentang-kami/page.tsx` |
| `/konsultasi` | Wizard 5 langkah tanpa gambar; 72 kelas `dark:`. | `KonsultasiClient.tsx` |
| Global | `next.config.ts` belum punya blok `images` (qualities/formats/localPatterns); tidak ada `placeholder`/`blurDataURL`; fallback = ikon `Package` di kotak abu; tidak ada komponen galeri/lightbox; belum ada Playwright. | `next.config.ts`, `ProductCard.tsx` baris 40 |
| Aset | 671 foto Toko (1 per produk, ≤ 600 px, 20 MB di git); foto paket asli hanya 700×700; nol foto bengkel, proses, hasil rakitan. | `docs/ASSET_PLAN.md` §1 |

---

## C. PRIORITAS MVP VISUAL / GO-LIVE — Pilar V "Visual-first & image-dominant"

Semua milestone tetap dalam Visual v2: hero & footer `bg-zinc-950`, satu aksi
orange-700 per layar, WhatsApp tombol ink, hijau `#00803F` hanya Tokopedia, radius maks
6 px, tanpa gradient/blur/shadow besar/emoji/`Sparkles`, angka lewat `Price`, kelas `kss-*`.
Overlay teks di atas foto = panel solid `bg-zinc-950` (opasitas penuh atau `/90`) tanpa
blur, bukan gradient.

Prinsip komposisi (selaras skill ui-ux-pro-max yang cocok dengan v2: pola *Feature-Rich
Showcase*, *Bento Box Grid*, *Portfolio Grid* untuk lookbook; aturan `image-dimension`,
`lazy-load-below-fold`, `progressive-loading`, `primary-action`, `content-priority`,
`touch-target-size`). Gaya yang disarankan skill untuk e-commerce/gaming (glassmorphism,
aurora, neon, 3D) **ditolak** karena melanggar v2.

| Pola | Spesifikasi |
|---|---|
| Hero | Full-bleed foto (desktop 16:9, mobile 4:5 via `<picture>`), panel copy solid di kiri bawah, satu CTA orange + satu tombol ink WhatsApp |
| Bento grid | `kss-grid-hairline` dengan sel bergambar 1:1 dan 2:1; label mono + judul pendek di atas foto; tanpa shadow |
| Kartu paket | Foto 4:3 ≥ 60 % tinggi kartu; maks 3 spec pill; `Price` total; satu tombol |
| Kartu produk Toko | Foto 1:1 ≥ 65 % tinggi kartu; judul 2 baris; `Price`; aksi sekunder jadi ikon (`aria-label`) |
| Galeri detail | Foto utama 1:1 + strip thumbnail; lightbox dengan zoom (pinch di mobile, klik/tombol di desktop, `Esc` menutup, fokus terjebak) |
| Spesifikasi panjang | Tab/accordion (`details`/`summary` atau komponen ber-ARIA); ringkasan 3–5 spec pill di atas |
| Micro-copy | Paragraf ≤ 2 kalimat; manfaat jadi baris ikon 16–20 px inline (lihat keputusan pemilik K-1) |

### V0 — Fondasi media & pengukuran

**Tujuan:** setiap gambar punya ukuran nyata, placeholder, fallback, dan bisa diukur.
**Delegasi:** Opus (kontrak manifest & komponen) · Sonnet (implementasi) · Haiku (isi alt text awal).

- [ ] V0.1 Blok `images` di `next.config.ts`: `qualities`, `localPatterns: /images/**`,
  `minimumCacheTTL`; `formats` AVIF menunggu keputusan K-2. Rujuk docs Next 16 lokal.
- [ ] V0.2 Komponen `MediaFrame` / `ProductImage` (Server Component bila bisa): rasio
  tetap, `sizes` wajib, `placeholder` dari manifest, fallback berjenjang
  (`docs/ASSET_PLAN.md` §4.5). Hapus fallback ikon `Package`.
- [ ] V0.3 Visual Audit Playwright (§0.2) + skrip `audit:visual` (instal `@playwright/test`
  atas persetujuan pemilik); baseline VCR semua route dicatat di PR.
- [ ] V0.4 Skrip `scripts/media/build.mjs` + `src/lib/media/manifest.json`
  (lebar/tinggi/blur/kind). `products.json` menyimpan `width`/`height` foto.
- [ ] V0.5 Ganti satu-satunya LCP per halaman ke `loading="eager"` + `fetchPriority="high"`
  (tanpa `priority` yang deprecated).

**Quality Gate:** QG-W · semua `img` lulus kesehatan gambar §0.2.4 · tidak ada kotak kosong
saat file gambar sengaja dihapus (uji fallback).

### V1 — Beranda visual-first

**Tujuan:** beranda terasa etalase foto, bukan brosur teks.
**Delegasi:** Opus (wireframe & urutan seksi) · Sonnet (implementasi).

- [ ] V1.1 Hero full-bleed A-01/A-02 (foto sendiri; ilustrasi H-1 hanya sebagai cadangan).
- [ ] V1.2 Bento kategori: Paket PC, Toko, Jasa, Konsultasi (A-03).
- [ ] V1.3 Paket unggulan: 3 kartu besar 4:3 (B-01).
- [ ] V1.4 "Terlaris di toko" jadi grid kartu foto 1:1 (8 item, A-04), bukan daftar teks.
- [ ] V1.5 Proses QC: 4 foto asli bernomor (A-05), teks ≤ 1 kalimat per langkah.
- [ ] V1.6 Form konsultasi di beranda diganti satu kartu visual menuju `/konsultasi`.
- [ ] V1.7 Strip lookbook (A-06), tampil otomatis hanya bila manifest berisi ≥ 6 foto asli.

**Quality Gate:** QG-W · QG-V (etalase ≥ 65 %, fold pertama ≥ 70 %) · QG-A · LCP lab mobile
< 2,5 s · satu tombol orange per fold (cek manual + screenshot).

### V2 — Katalog & kartu paket

**Delegasi:** Sonnet · review Opus.

- [ ] V2.1 `PrebuiltCard` versi foto-dominan (B-01); spec ringkas pill; `Price` total.
- [ ] V2.2 Filter jadi chip visual horizontal di mobile (tanpa overflow body).
- [ ] V2.3 Sementara foto baru belum ada: pakai `package-*.webp` 700×700 asli, bukan
  potongan 240×300.

**Quality Gate:** QG-W · QG-V (≥ 65 %) · QG-B.

### V3 — Detail paket

**Delegasi:** Opus (struktur informasi) · Sonnet (galeri, tab, sticky bar).

- [ ] V3.1 Galeri 5–8 foto + lightbox zoom (B-02).
- [ ] V3.2 Ringkasan 3–5 spec pill + FPS bar di dekat foto; rincian komponen, benchmark,
  dan opsi upgrade pindah ke tab/accordion.
- [ ] V3.3 Bar total + CTA sticky di mobile (aman safe-area, tidak menutupi konten).
- [ ] V3.4 Bersihkan kelas `dark:` dan judul Title Case; sentence case.
- [ ] V3.5 Audit ulang kontrak data paket agar selaras aturan "hanya total" sampai ke
  payload (bukan hanya UI).

**Quality Gate:** QG-W · QG-V (detail ≥ 55 %/50 %) · QG-B (cek payload RSC) · QG-A.

### V4 — Toko visual

**Delegasi:** Sonnet · Haiku (pemetaan sampul etalase).

- [ ] V4.1 Kartu produk: foto ≥ 65 % tinggi kartu; tombol Tokopedia tetap hijau, keranjang
  jadi ikon ber-`aria-label`.
- [ ] V4.2 Sampul visual 33 etalase dari foto produk terlaris (C-03) di `/toko` dan
  header `/toko/etalase/[slug]`.
- [ ] V4.3 `/toko/[slug]`: frame foto besar + zoom pada foto yang ada; galeri menunggu S3.
- [ ] V4.4 Banner promo: sembunyikan otomatis yang kedaluwarsa (sudah) dan minta banner baru
  ke pemilik (C-04).
- [ ] V4.5 Skeleton grid di `toko/loading.tsx` sesuai rasio kartu (tanpa shimmer gradient).

**Quality Gate:** QG-W · QG-V (≥ 65 %) · harga tampil = `priceIdr` harga normal.

### V5 — Jasa, Tentang kami, Konsultasi

**Delegasi:** Sonnet · Opus (review copy ringkas).

- [ ] V5.1 `/jasa`: kartu layanan bergambar 4:3 (D-01) + harga jasa via `Price`.
- [ ] V5.2 `/jasa/[slug]`: galeri proses sebelum/sesudah (D-02); fitur jadi baris ikon.
- [ ] V5.3 `/tentang-kami`: foto bengkel (E-01) dan peta; FAQ di accordion.
- [ ] V5.4 `/konsultasi`: langkah kebutuhan memakai kartu foto pilihan (F-01).
- [ ] V5.5 Bersihkan kelas `dark:` gaya lama di halaman-halaman ini.

**Quality Gate:** QG-W · QG-V (informasi ≥ 45 %) · QG-A.

### V6 — Lookbook hasil rakitan

**Delegasi:** Opus (kebijakan izin & struktur) · Sonnet.

- [ ] V6.1 Route `/galeri` (nama final: keputusan K-6) dengan grid 4:5/4:3 + lightbox.
- [ ] V6.2 Hanya foto asli dengan izin; metadata: paket/tier, bulan, tanpa data pribadi.
- [ ] V6.3 Masuk sitemap; kartu menautkan ke paket terkait.

**Quality Gate:** QG-W · QG-V (≥ 65 %) · semua item manifest `kind: "photo"`.

### V7 — Go-live visual

**Delegasi:** Opus (review akhir) · Haiku (laporan).

- [ ] V7.1 Baseline vs akhir VCR semua route dilampirkan di PR.
- [ ] V7.2 Lighthouse mobile beranda: performa ≥ 85, a11y ≥ 0,95, CLS < 0,1.
- [ ] V7.3 `DESIGN.md` & `UI_FIGCRAFT_SKILL.md` diperbarui dengan pola visual-first
  (bento, galeri, lightbox, MediaFrame).
- [ ] V7.4 `SITE_URL` ke domain utama agar canonical/OG memakai domain publik.

**Quality Gate:** QG-W · QG-V semua route · QG-A · QG-B.

---

## D. FONDASI PLATFORM (paralel setelah V0, wajib sebelum transaksi terstruktur)

Keamanan ditulis sebagai tujuan umum; rincian teknis disimpan di luar repo publik.

### P1 — Kebersihan & pengerasan

**Delegasi:** Opus (rencana) · Sonnet.

- [ ] P1.1 Pengerasan keamanan umum (header HTTP, defense-in-depth area admin, izin CI
  minimal, pembaruan dependensi otomatis).
- [ ] P1.2 Pisahkan kesehatan situs dari kesehatan CS agar uptime tidak alarm palsu.
- [ ] P1.3 `import 'server-only'` di modul server; hapus/aktifkan `server-pricing.ts`.
- [ ] P1.4 Rumus total paket menghormati `quantity` dan override + test.
- [ ] P1.5 Halaman `/cara-bayar` (setelah rekening ditetapkan) dan kebijakan privasi awal.

**Quality Gate:** QG-W · QG-B · test baru untuk P1.4.

### P2 — Backend, database & admin

**Delegasi:** Opus (skema, kontrak API) · Sonnet.

- [ ] P2.1 Database terkelola + staging (vendor: keputusan K-8); migrasi ter-versi.
- [ ] P2.2 Auth admin per pengguna + 2FA + audit log.
- [ ] P2.3 Katalog paket & harga internal pindah dari repo ke database; admin menyimpan ke
  server.
- [ ] P2.4 API berversi `/api/v1` dengan skema validasi bersama (lihat M1).
- [ ] P2.5 Media storage (object storage) untuk galeri & foto besar (lihat S2).

**Quality Gate:** QG-W · QG-B · data internal tidak lagi ada di repo.

### P3 — Pesanan & pembayaran manual terstruktur

- [ ] P3.1 Checkout Toko/paket membuat pesanan bernomor dengan harga dihitung server.
- [ ] P3.2 Instruksi bayar transfer + verifikasi oleh admin; WhatsApp memuat kode pesanan.
- [ ] P3.3 Penawaran & cek pesanan berbasis kode acak, tanpa data pribadi terbuka.
- [ ] P3.4 Booking jasa & status servis tersimpan.

**Quality Gate:** QG-W · QG-V untuk layar baru · E2E Playwright alur pesanan.

### P4 — Midtrans (setelah pemilik mendaftar)

- [ ] P4.1 Integrasi sandbox dari pesanan server.
- [ ] P4.2 Webhook terverifikasi, idempoten, rekonsiliasi harian.
- [ ] P4.3 Go-live produksi + pemantauan.

---

## E. WEB + APLIKASI HP (React Native / Expo)

Tujuan: satu backend, satu kontrak data, satu sumber media; tidak ada kerja dua kali.

```text
repo (web tetap di root agar sinkron harian & Vercel tidak berubah)
├── src/                      # Next.js web (sekarang)
├── packages/contracts/       # skema validasi + tipe DTO publik + format galat
├── packages/media/           # mediaUrl(), daftar rasio slot, tipe ImageAsset
└── apps/mobile/              # Expo (expo-router, expo-image)
```

| Lapisan | Dibagi | Catatan |
|---|---|---|
| API | `/api/v1/*` dari Next.js | Paginasi kursor, ETag, format galat seragam, versi minimum app |
| Tipe & validasi | `packages/contracts` | DTO publik tanpa harga part/delta; dipakai server, web, app |
| Media | `ImageAsset { src, width, height, alt, blurDataURL, kind }` | Web: `next/image`; app: `expo-image` dengan placeholder yang sama; base URL dari env |
| Auth | Admin: cookie sesi (web saja). Pelanggan (bila perlu): token akses pendek + refresh, disimpan aman di perangkat | Tanpa kunci statis di bundle app |
| Desain | Token warna/tipografi/radius dari `globals.css` diekspor ke `packages/contracts/tokens` | Sama-sama v2 |

### M1 — Kontrak bersama
**Delegasi:** Opus (kontrak) · Sonnet.
- [ ] M1.1 npm workspaces tanpa memindahkan web dari root.
- [ ] M1.2 `packages/contracts`: DTO paket/produk/jasa + `ImageAsset`; web memakainya lebih dulu.
- [ ] M1.3 Endpoint katalog `/api/v1` (paket, produk Toko, jasa) dari data yang sama dengan web.
**Quality Gate:** QG-W · QG-B pada JSON API · test kontrak.

### M2 — Aplikasi Expo MVP (visual-first)
**Delegasi:** Opus (navigasi & layar) · Sonnet (implementasi) · Haiku (aset ikon/splash).
- [ ] M2.1 Beranda bento, katalog paket, Toko grid 1:1, detail dengan galeri swipe + zoom.
- [ ] M2.2 Keranjang → WhatsApp / pesanan (mengikuti P3 bila sudah ada).
- [ ] M2.3 Status servis & garansi (setelah P3.4).
**Quality Gate:** QG-M · QG-B pada bundle app · gambar dari `packages/media`.

### M3 — Rilis store
- [ ] M3.1 Uji tertutup Play Store dan TestFlight; kebijakan privasi mencakup app.
- [ ] M3.2 Notifikasi status pesanan (opsional), scan QR garansi (opsional).
**Quality Gate:** QG-M · lolos review store.

---

## F. SCALE-UP & OPTIMASI (setelah Go-Live visual)

- [ ] S1 AVIF + lebar `srcset` disetel per slot setelah kuota terukur (K-2).
- [ ] S2 Foto Toko & galeri keluar dari git ke object storage dengan nama ber-hash;
  `products.json` menyimpan URL media.
- [ ] S3 Sinkron galeri hingga 5 foto per produk dari katalog toko sendiri
  (`docs/ASSET_PLAN.md` §4.4), resolusi master 1.000–1.200 px.
- [ ] S4 Open Graph dinamis per paket/produk dari foto asli (`opengraph-image`).
- [ ] S5 Anggaran performa di CI (LCP, CLS, ukuran gambar per halaman).
- [ ] S6 SEO gambar: `image` di JSON-LD Product memakai foto asli; sitemap gambar.
- [ ] S7 Header tier paket (B-03), teknisi (E-02), tekstur chapter gelap (G-02).

---

## G. Keputusan pemilik

| # | Keputusan | Rekomendasi |
|---|---|---|
| K-1 | DESIGN.md §1.5 membatasi ikon hanya untuk tombol/navigasi/status; visual-first butuh baris ikon fitur | Izinkan ikon fitur 16–20 px inline tanpa kotak tint. Belum diberlakukan |
| K-2 | Paket Vercel & kuota optimasi gambar; aktifkan AVIF? | Cek dashboard Usage dulu; thumbnail Toko `unoptimized`, optimizer untuk foto besar |
| K-3 | Jadwal sesi foto: 6 paket, bengkel, proses QC, (opsional) teknisi | Satu sesi setengah hari sebelum V1/V2 |
| K-4 | Izin pelanggan untuk lookbook | Formulir izin sederhana via WhatsApp; tanpa wajah/nama bila tidak diizinkan |
| K-5 | Sinkron menyimpan foto lebih besar/galeri (menambah ukuran repo) | Tunda sampai media storage (S2) siap |
| K-6 | Nama route lookbook (`/galeri` atau `/hasil-rakitan`) | `/galeri` |
| K-7 | Banner promo pengganti yang kedaluwarsa | Kirim banner 2:1 terbaru dari toko |
| K-8 | Vendor database/auth/storage untuk P2 | Satu vendor Postgres + auth + storage di region Singapura |
| K-9 | Aplikasi HP: langsung Expo atau PWA sebagai jembatan | Expo setelah M1 (API v1) siap; PWA opsional bila butuh cepat |
| K-10 | Nomor rekening transfer resmi | Rekening atas nama usaha, hanya dicantumkan di `/cara-bayar` |
| K-11 | Ilustrasi AI untuk latar/kategori | Boleh sebagai cadangan, diberi label `ilu-`; prioritas foto sendiri |

---

## Ringkasan progres

| Bagian | Item | Selesai |
|---|---|---|
| A. Rekam jejak (Fase 1–12) | 32 | 32 |
| C. Pilar V (MVP visual) | 37 | 0 |
| D. Fondasi platform | 17 | 0 |
| E. Web + aplikasi HP | 8 | 0 |
| F. Scale-up | 7 | 0 |
