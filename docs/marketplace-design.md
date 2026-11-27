# Rancangan Marketplace "Toko" + Sinkron Harian Tokopedia (KSS Komputer)

Status: RANCANGAN untuk diimplementasi engineer (Sonnet). Basis: repo `main` desain v2, Next 16.4.6, Tailwind 4, zustand 5.
Tanda **[KONFIRMASI]** = keputusan pemilik. Tanda **[VERIFIKASI]** = fakta yang belum diketahui, wajib dicek sebelum kode ditulis.

---

## 0. Temuan audit (penting sebelum mulai)

1. **Harga eceran per part SUDAH publik hari ini.** `sanitizeHardwarePartForPublic` (`src/lib/sanitizer.ts:78-87`) mengirim `retailPrice ?? sellPrice` ke `/komponen`, `/komponen/[slug]`, dan **ke setiap halaman** lewat `src/app/layout.tsx:82` → `Navbar` → `CommandSearchModal` (seluruh `MOCK_HARDWARE_PARTS` + retailPrice ada di payload RSC tiap halaman).
2. **Kebocoran harga part di dalam paket.** `sanitizePrebuiltPCForPublic` dan `sanitizePrebuiltDetailForPublic` membungkus part dengan `PublicHardwarePart` (punya `retailPrice`) → harga satuan komponen bawaan paket ikut terkirim ke `PaketDetailClient`/`PrebuiltCard`. Ini melanggar AGENTS.md §1.1 sekarang juga; guard CI tidak menangkapnya karena hanya mencari `costPrice|sellPrice` literal di `.next/static` (payload RSC/HTML di `.next/server` tidak dipindai, dan `retailPrice` tidak ada di pola).
3. Fallback `retailPrice ?? sellPrice` = `sellPrice` internal bisa bocor untuk part tanpa `retailPrice`.
4. Guard `scripts/check-price-leak.mjs` hanya 3 regex di `.next/static`. Tidak ada folder `data/`.
5. Aset banner: `public/images/tokopedia/banner-store-1.webp`, `banner-store-2.webp` (arsip asli), `banner-pc-store.webp` (potongan). README aset melarang hotlink URL Tokopedia bertanda tangan.
6. Dua URL toko berbeda: konstanta `https://tk.tokopedia.com/ZSpeToWkH/` (format.ts & constants.ts, duplikat), README aset `ZSpsr3HRb` → `www.tokopedia.com/ksskomputer`, pemilik memberi `ZSsBtqjyH`. **[VERIFIKASI]** ketiganya mengarah ke toko yang sama; jadikan `https://www.tokopedia.com/ksskomputer` sumber kanonik sinkron.

Konsekuensi: marketplace ini justru kesempatan **mengetatkan** aturan (poin 1–3 ditutup), bukan mengendurkan.

---

## BAGIAN A — Marketplace

### A1. Nama, rute, redirect

| Item | Keputusan |
|---|---|
| Nama menu | **Toko** (label nav), judul halaman "Toko KSS Komputer", eyebrow `TOKO RESMI · TOKOPEDIA` |
| Daftar | `/toko` (query: `?etalase=<slug>&q=&sort=&min=&max=&rating=4`) |
| Etalase permalink | `/toko/etalase/[slug]` (SSG, SEO; isi = `/toko` ber-filter) |
| Detail | `/toko/[slug]` |
| Hapus | `src/app/komponen/**`, `src/app/aksesoris/**` (setelah redirect aktif) |

`next.config.ts` → `redirects()` (ganti 2 entri lama yang menunjuk `/komponen` agar tidak berantai):
```ts
{ source: '/komponen', destination: '/toko', permanent: true },
{ source: '/aksesoris', destination: '/toko', permanent: true },
{ source: '/komponen/:slug', destination: '/toko/lama/:slug', permanent: true },
{ source: '/katalog', destination: '/toko', permanent: true },
{ source: '/produk/:slug', destination: '/toko/lama/:slug', permanent: true },
{ source: '/simulasi', destination: '/paket-rakitan', permanent: true },
```
`/toko/lama/[slug]/route.ts` (Route Handler, server-only): cari di `data/marketplace/legacy-map.json` (`{ "rtx-4060-msi-ventus": "msi-rtx-4060-ventus-2x-8gb" }`, diisi manual/semi-otomatis saat sinkron pertama) → `redirect('/toko/<slug>', 308)`; tidak ketemu → `redirect('/toko?q=<slug-dijadikan-kata>', 307)`. Alasan: slug mock ≠ slug Tokopedia; jangan 404-kan backlink. **[VERIFIKASI]** API `redirect`/`permanentRedirect` di Route Handler pada Next 16 — baca `node_modules/next/dist/docs/` (bagian redirects & route handlers) sebelum menulis.

### A2. Navigasi, footer, sitemap, search global

- `Navbar.tsx:70-71`: ganti 2 item → `{ href: '/toko', label: 'Toko', icon: Store }` (cek ikon `Store` ada: `grep "declare const Store:"` di lucide d.ts). Posisi setelah "Paket Siap Pakai". Aktif bila `pathname.startsWith('/toko')`.
- `BottomNav.tsx`: 4 tab utama tetap Beranda/Jasa/Paket/Pesanan **atau [KONFIRMASI]** ganti "Pesanan" → "Toko" (rekomendasi: Toko masuk tab utama karena ini kanal order produk; "Cek pesanan" pindah ke panel Lainnya). `moreItems:57-58` → satu item `{ href: '/toko', label: 'Toko produk', icon: Store }` bila tidak di tab utama.
- `Footer.tsx:22-23` → `{ href: '/toko', label: 'Toko produk (Tokopedia)' }`.
- `sitemap.ts`: `STATIC_ROUTES` ganti `/komponen`,`/aksesoris` → `/toko`; ganti blok `parts` dengan produk aktif `getMarketplaceProducts()` → `/toko/<slug>`, `lastModified: product.syncedAt`, `changeFrequency: 'daily'`, `priority: 0.6`; etalase → `/toko/etalase/<slug>` `0.5`.
- `CommandSearchModal` (global, Ctrl/Cmd+K): **berhenti** menerima `getPublicHardwareParts()` dari `layout.tsx`. Ganti input menjadi indeks ringan `SearchEntry[]` = `{ slug, name, etalase, image }` dari marketplace (TANPA harga) + entri statis (paket, jasa, halaman). Hasil produk → link `/toko/<slug>`; footer modal "Lihat semua hasil di Toko" → `/toko?q=`. Ini sekaligus menutup temuan 0.1. Tombol "Tanya via WA" berbasis `generateCustomBuildWAMessage` dihapus dari modal (itu alur rakit, bukan toko).

### A3. Tata letak halaman `/toko` (390–1440)

Urutan vertikal (tiru struktur halaman toko Tokopedia, versi KSS):

```
[Navbar]
[Header toko — kss-chapter-dark bg-zinc-950]  logo/nama, "Toko resmi KSS Komputer di Tokopedia",
   statistik mono: produk aktif · rating rata-rata · terakhir sinkron (dari meta) · tombol outline-dark "Kunjungi toko di Tokopedia"
[Banner promo carousel]  (di dalam chapter terang, tepat di bawah header)
[Bar pencarian toko + sort]  sticky top di bawah navbar
[Etalase]  desktop: sidebar kiri 240px · mobile: chip horizontal scroll
[Grid produk]  + hitungan hasil + chip filter aktif
[Catatan kaki toko]  "Harga & stok mengikuti Tokopedia, diperbarui harian. Checkout di Tokopedia."
[Footer]
```
Grid: `grid-cols-2` (390) · `sm:grid-cols-3` · `lg:grid-cols-3` (dengan sidebar) · `xl:grid-cols-4`. Pakai `kss-grid-hairline` (kartu dipisah 1px, bukan shadow). Kontainer `kss-container`. Tidak ada horizontal overflow kecuali baris chip etalase (`overflow-x-auto`, `scroll-snap-type:x`, masker tepi TANPA gradient → pakai border kanan hairline + tombol panah).

Satu aksi orange-700 per layar: di `/toko` **tidak ada** tombol orange (CTA kartu = hijau Tokopedia, sesuai aturan "hijau hanya Tokopedia"). Orange hanya untuk `kss-eyebrow`, indikator etalase aktif (border-l 2px orange-700), dan fokus. Di detail, satu-satunya orange = tidak ada; CTA utama hijau Tokopedia, sekunder WA (ink) & keranjang (outline).

### A4. Banner promo carousel — `src/components/toko/PromoBanner.tsx` (client)

Data: `data/marketplace/banners.json` (dikelola manual, bukan hasil sinkron):
```json
[{ "id": "b1", "image": "/images/tokopedia/banner-store-1.webp", "alt": "Promo rakit PC KSS Komputer", "href": "/toko/etalase/pc-game-dan-desain-expert", "activeFrom": "2026-11-01", "activeUntil": "2026-12-31" }]
```
- Banner kedaluwarsa disaring di server. 0 banner → komponen tidak dirender (tanpa placeholder). 1 banner → statis, tanpa kontrol.
- Rasio tetap `aspect-[3/1]` desktop, `aspect-[2/1]` mobile (crop `object-cover object-center`); `next/image` `priority` hanya slide pertama, `sizes="(min-width:1280px) 1216px, 100vw"`. **[VERIFIKASI]** dimensi asli `banner-store-*.webp` (`file`/`sharp metadata`) dan apakah teks banner terbaca di 390px; bila tidak, buat potongan mobile `banner-store-1-m.webp`.
- Perilaku: **tanpa autoplay** default. Navigasi: tombol prev/next (`kss-icon-btn`, ikon `ChevronLeft/Right`), indikator titik = tombol `aria-label="Banner 2 dari 3"`, swipe via `scroll-snap` native (container `overflow-x-auto snap-x snap-mandatory`, tiap slide `snap-center w-full shrink-0`) — tanpa library.
- Autoplay opsional **[KONFIRMASI]**: bila diaktifkan, 7 dtk, berhenti permanen saat hover/fokus/sentuh/interaksi apa pun, ada tombol jeda (WCAG 2.2.2), dan mati total bila `prefers-reduced-motion: reduce`.
- A11y: `<section aria-roledescription="carousel" aria-label="Promo toko">`, slide `role="group" aria-roledescription="slide" aria-label="1 dari 3"`, slide non-aktif `inert`; panah kiri/kanan saat fokus di carousel. `scroll-behavior: smooth` hanya jika `motion-safe:`.
- Visual: radius 6px (`rounded-md`), border hairline `border-zinc-200`, tanpa overlay gradient/teks di atas gambar (teks sudah di banner).

### A5. Pencarian khusus toko — `src/components/toko/TokoSearchBar.tsx`

- Client-side penuh; indeks dibangun di server sekali (`buildSearchIndex(products)`) dan dikirim sebagai prop: per produk `haystack = normalize(name + brand + etalaseName + tags.join(' '))`.
- `normalize`: lowercase, NFKD hapus diakritik, ganti `[^a-z0-9]+` → spasi, sinonim kecil statis (`vga→gpu`, `ssd nvme→nvme`, `ram→memori`) di `src/lib/marketplace/search.ts`.
- Pencocokan multi-token AND (pola sama `matchesSearchTokens` di CommandSearchModal — ekstrak jadi util bersama `src/lib/search-tokens.ts`). Skor: token cocok di awal nama +3, di nama +2, di etalase/brand +1; tie-break = sort aktif.
- Input `type="search"`, `kss-input`, ikon `Search`, placeholder "Cari di toko KSS Komputer", debounce 150 ms, sinkron ke URL `?q=` via `router.replace` (tanpa scroll). `Esc` mengosongkan. Hasil diumumkan lewat `aria-live="polite"`: "12 produk ditemukan".
- Pencarian berlaku **di dalam etalase aktif**; bila 0 hasil di etalase tapi ada di etalase lain → tampilkan tautan "Cari di semua etalase (5)".
- Hubungan dengan Cmd+K: modal global = navigasi lintas situs (judul + gambar, tanpa harga); bar toko = filter grid. Di `/toko`, Cmd+K tetap modal global.

### A6. Etalase — `src/components/toko/EtalaseNav.tsx`

- Sumber: `data/marketplace/etalase.json` hasil sinkron, urutan = urutan etalase di toko Tokopedia (`position`). Etalase tanpa produk tampil (rating>0 & terjual>0) disembunyikan.
- Item tetap di atas: "Semua produk" (jumlah), lalu "Produk terlaris" (virtual: 12 teratas by `sold`). **[KONFIRMASI]** etalase bawaan Tokopedia seperti "Produk Terjual"/"Diskon" ikut disalin atau tidak; rekomendasi: hanya etalase buatan toko + 2 virtual di atas.
- Desktop (`lg:`): sidebar `sticky top-[calc(var(--nav-h)+1rem)]`, daftar `<nav aria-label="Etalase toko">` tautan (bukan tombol) ke `/toko/etalase/<slug>`, item aktif `aria-current="page"` + `border-l-2 border-orange-700 font-semibold`, hitungan `kss-num text-meta text-zinc-500` rata kanan.
- Mobile: baris `kss-chip` / `kss-chip-active` scroll horizontal; tombol "Semua etalase" membuka sheet daftar penuh.
- Tautan, bukan state lokal: etalase = halaman SSG (SEO + back button benar). Filter/sort/q tetap query string.

### A7. Filter & sort

- Sort (select/segmented, default **Terlaris**): `terlaris` (sold desc, rating desc) · `rating` (rating desc, ratingCount desc) · `termurah` · `termahal` · `terbaru` (firstSeenAt desc). **[KONFIRMASI]** default = urutan asli etalase Tokopedia? Rekomendasi: Terlaris (ketersediaan "urutan asli" tergantung sumber data).
- Filter: rentang harga (2 input angka mono, terapkan saat blur/Enter), rating minimal (4+ / 4.5+), "Diskon saja", stok (sembunyikan habis — default ON). Desktop di sidebar bawah etalase; mobile tombol "Filter (2)" → bottom sheet `dialog` dengan focus trap, tombol "Terapkan".
- Chip filter aktif di atas grid dengan `X` per chip + "Reset".
- `FilterSidebar.tsx` (28KB, khusus komponen/spek) **tidak** dipakai ulang; hapus setelah `/komponen` dihapus bila tak ada pemakai lain (grep dulu).

### A8. Kartu produk — `src/components/toko/ProductCard.tsx` (server-renderable; tombol keranjang = island client kecil)

```
┌──────────────────────┐
│ [gambar 1:1 contain] │  badge kiri-atas maks 1: "−15%" kss-tag-danger | "Terlaris" kss-tag-ink | "Stok sedikit" kss-tag-warn
├──────────────────────┤
│ Nama produk 2 baris  │  text-sm, line-clamp-2, link ke /toko/<slug> (seluruh area atas = link)
│ Rp 1.249.000         │  <Price> text-base
│ Rp 1.469.000 −15%    │  harga coret: <s> + <Price> text-meta text-zinc-500; persen kss-num
│ ★ 4,9 · 120+ terjual │  ikon Star 12px fill-amber-500 (bukan emoji), kss-num text-meta
│ [Beli di Tokopedia]  │  kss-btn-tokopedia w-full h-9 text-meta, ikon ExternalLink
│ [+ Keranjang]        │  kss-icon-btn kecil, opsional (lihat A10)
└──────────────────────┘
```
- Gambar: lokal hasil sinkron `/images/marketplace/<id>.webp` (README aset melarang hotlink bertanda tangan). Placeholder bila gagal: kotak `bg-zinc-100` + ikon `Package`.
- "terjual": tampilkan seperti Tokopedia (`120+`, `1rb+`) → simpan angka mentah + label sumber (`soldLabel`), render label.
- Rating format `4,9` (koma, `toLocaleString('id-ID',{minimumFractionDigits:1})`), `aria-label="Rating 4,9 dari 5, 120+ terjual"`.
- CTA Tokopedia: `<a href={product.tokopediaUrl} target="_blank" rel="noopener noreferrer nofollow">` + `aria-label="Beli {nama} di Tokopedia (tab baru)"`. Hanya URL `https://www.tokopedia.com/ksskomputer/...` (divalidasi).
- Produk `hidden`/takedown tidak dirender. Produk `out_of_stock` tampil redup (`opacity-60`) + tag "Stok habis", CTA tetap ke Tokopedia (teks "Lihat di Tokopedia"), keranjang dinonaktifkan.

### A9. Detail `/toko/[slug]`

- `generateStaticParams` dari produk aktif; slug tak ada atau `status!=='active'` → `notFound()` (produk takedown = 404 + `noindex`; **[KONFIRMASI]** alternatif 410 tidak didukung langsung — cukup 404).
- Layout: 2 kolom `lg:` (galeri 1:1 kiri, info kanan), 1 kolom mobile dengan **bar aksi sticky bawah** (di atas BottomNav) berisi harga + "Beli di Tokopedia".
- Isi: breadcrumb (Toko › Etalase › Nama), nama `h1`, rating + terjual + `kss-label` "Kondisi baru", harga + coret, badge, stok, CTA hijau, sekunder "Tanya via WhatsApp" (`kss-btn-wa` ink, pesan berisi nama + URL produk, TANPA harga eksplisit atau dengan harga — boleh, ini eceran), "Tambah ke keranjang" (`kss-btn-outline`), deskripsi (teks bersih hasil normalisasi; render paragraf + list sederhana, **tanpa HTML mentah** → `whitespace-pre-line`, link dinonaktifkan), spesifikasi kunci (opsional `specs` dari normalisasi), "Terakhir diperbarui {tanggal}" (`syncedAt`), produk terkait (etalase sama, 4, sort terlaris).
- Metadata: `title` "{nama} — Toko KSS Komputer", canonical `/toko/<slug>`, `openGraph.images` gambar lokal. JSON-LD `Product` + `Offer` (price, priceCurrency IDR, availability, url = tokopediaUrl) + `AggregateRating` (ratingValue, reviewCount) — **hanya** bila angka asli dari sumber (aturan Google: jangan rating palsu).

### A10. Keranjang eceran & nasib data lama

- `useRetailCartStore`: ubah tipe `addItem(product: MarketplaceCartInput)` dengan `MarketplaceCartInput = { id, slug, name, priceIdr, originalPriceIdr?, tokopediaUrl, image? }`. Naikkan nama storage `kss-retail-cart-storage-v2` + `migrate` yang **mengosongkan** item v1 (id mock tidak ada lagi). Checkout WA tetap; tambahkan di pesan daftar tautan Tokopedia per item.
- **[KONFIRMASI]** apakah keranjang dipertahankan sama sekali. Rekomendasi: pertahankan (pembeli bisa kirim daftar belanja multi-produk via WA untuk nego/rakit), tapi CTA utama tetap Tokopedia.
- `MOCK_HARDWARE_PARTS`: **tetap ada** sebagai data internal untuk paket rakitan, konsultasi, kompatibilitas, upgrade delta. Hanya **tidak lagi punya etalase publik**. `retailPrice`/`isRetailAvailable` menjadi tidak dipakai publik → hapus dari `PublicHardwarePart` (lihat A11).
- `MOCK_ACCESSORIES`: masih dipakai `src/app/page.tsx:12` (Home). Ganti section aksesoris di Home dengan "Terlaris di toko" (6 produk marketplace teratas). Setelah tak ada pemakai, hapus `getPublicAccessories`, `sanitizeAccessoryForPublic`, `MOCK_ACCESSORIES` (P2, grep dulu; admin store mungkin memakai — cek `useAdminStore.ts`).
- `useCompareStore` (compare part) — grep pemakai; bila hanya dipakai `/komponen`, hapus di P2.
- Paket rakitan: **tidak berubah secara bisnis** — tetap satu total + delta. Tidak ada tautan dari part paket ke produk toko yang membawa harga.

### A11. Konflik aturan harga — pemisahan aman **[KONFIRMASI PEMILIK]**

Prinsip: dua domain data yang tidak pernah bercampur.

| Domain | Contoh | Harga per item publik? | Sumber |
|---|---|---|---|
| **Produk eceran toko** | barang yang dijual satuan di Tokopedia | **Boleh** — sudah publik di Tokopedia, kita hanya mencerminkan | `data/marketplace/products.json` (sinkron) |
| **Komponen paket rakitan** | CPU/VGA/dll. di dalam paket | **Dilarang** (tetap) — hanya total paket & delta upgrade | `mock-data.ts` via `server-catalog`/`server-pricing` |

Aturan implementasi:
1. Tipe terpisah: `MarketplaceProduct` (field harga bernama `priceIdr`, `originalPriceIdr`) tidak pernah di-`import` oleh modul paket; `HardwarePart` tidak pernah diubah menjadi kartu toko. Tidak ada join id part ↔ produk toko di kode publik.
2. `PublicHardwarePart` **kehilangan** `retailPrice` dan `isRetailAvailable`:
   ```ts
   export type PublicHardwarePart = Omit<HardwarePart,
     'costPrice' | 'sellPrice' | 'price' | 'retailPrice' | 'isRetailAvailable' | 'originalPrice'>;
   ```
   `sanitizeHardwarePartForPublic` berhenti mengisi harga. Perbaiki semua pemakai (tsc akan menunjuk). Ini menutup temuan 0.2 & 0.3.
3. `layout.tsx` tidak lagi mengirim part ke Navbar (A2).
4. Guard CI diperketat (bukan dilonggarkan), lihat A12.

Teks pengganti **AGENTS.md §1.1** (usulan):
```md
### 1.1 Aturan Harga Mutlak (Zero Part-Price Leak untuk paket)

DILARANG menampilkan harga satuan komponen yang menjadi bagian paket rakitan
(CPU, motherboard, RAM, VGA, SSD, PSU, casing, cooler) — di halaman, HTML, payload RSC,
JSON, maupun bundle client. `PublicHardwarePart` tidak membawa field harga apa pun.

Yang boleh tampil di publik:
1. Total harga paket rakitan jadi.
2. Selisih harga upgrade (`+ Rp`, `- Rp`, `[Termasuk Paket]`).
3. Harga layanan jasa (`priceStartFrom`) dan biaya rakit.
4. Harga produk eceran **Toko** (`/toko`) yang bersumber dari listing Tokopedia resmi KSS
   (`data/marketplace/products.json`, field `priceIdr`). Data ini terpisah total dari
   `mock-data.ts`; dilarang menautkan/menggabungkan dengan komponen paket.

`costPrice`, `sellPrice`, `retailPrice` hanya untuk admin/server. Guard: `npm run check:price`.
```
Baris pengganti di **CLAUDE.md** "Aturan bisnis":
```md
- Dilarang harga satuan part paket di publik; hanya total paket, delta upgrade, harga jasa, dan harga produk eceran /toko (data sinkron Tokopedia, domain terpisah). Data paket hanya lewat server-catalog/server-pricing + DTO tanpa harga (AGENTS.md §1.1).
```

### A12. Penyesuaian guard `scripts/check-price-leak.mjs`

Tambahkan (tetap satu skrip, exit 1 bila ada hit):
1. **Pola diperluas** di `.next/static`: tambah `/retailPrice"?\s*:\s*\d/`, `/"?sellPrice"?\s*:\s*\d/` (sudah), `/"?costPrice"?\s*:\s*\d/` (sudah). `priceIdr` **diizinkan**.
2. **Pindai payload server paket**: walk `.next/server/app/paket-rakitan/**` dan `.next/server/app/konsultasi/**`, `.next/server/app/penawaran/**` (ekstensi `.html`, `.rsc`, `.body`, `.meta`, `.json`, `.segment.rsc`) untuk pola di atas **dan** `priceIdr` (domain toko tidak boleh muncul di paket). **[VERIFIKASI]** nama file output prerender Next 16 (`ls .next/server/app/paket-rakitan` setelah build) dan sesuaikan ekstensi.
3. **Pindai semua halaman non-toko** untuk `priceIdr` → harus 0 (kecuali Home section "Terlaris di toko" — whitelist `.next/server/app/index.*`). Whitelist eksplisit: `toko/**`, `index.*`.
4. **Tes unit** `src/lib/__tests__/sanitizer.test.ts`: `Object.keys(sanitizeHardwarePartForPublic(part))` tidak mengandung `/price/i`; DTO paket hanya punya `totalBundlePrice`/`baseTotalPrice`/`deltaPrice`. Uji `JSON.stringify(getPublicPrebuiltDetail(slug))` tidak mengandung `retailPrice|sellPrice|costPrice`.
5. Pesan sukses diganti: `[price-guard] Bersih: paket tanpa harga part; harga toko hanya di /toko.`

---

## BAGIAN B — Data & sinkron harian

### B1. Struktur file

```
data/marketplace/
  products.json        # array MarketplaceProduct (SEMUA yang pernah terlihat, termasuk hidden)
  etalase.json         # array Etalase (urutan toko)
  meta.json            # SyncMeta
  banners.json         # manual (A4)
  legacy-map.json      # slug mock lama -> slug toko (A1)
  .schema-version      # "1"
public/images/marketplace/<id>.webp   # gambar utama 600x600, diunduh sinkron
docs/SYNC_PLAYBOOK.md
scripts/sync/                         # pipeline deterministik (Node 22, ESM, tanpa dependensi baru kecuali disebut)
  fetch-source.mjs  parse-source.mjs  diff.mjs  apply.mjs  images.mjs  report.mjs  run.mjs
  lib/{http.mjs, normalize.mjs, guards.mjs, schema.mjs}
scripts/validate-marketplace.mjs
```
Data di-commit ke repo (git = riwayat & audit; Vercel build statis). Tidak ada DB baru.

### B2. Tipe TS — `src/lib/marketplace/types.ts`

```ts
export type MarketplaceStatus = 'active' | 'missing' | 'hidden';
export type MarketplaceStock = 'ready' | 'low' | 'out_of_stock';

export interface MarketplaceProduct {
  id: string;                 // ID produk Tokopedia (string), kunci stabil
  slug: string;               // slug kita: kebab(name) + '-' + id.slice(-4); TIDAK berubah setelah dibuat
  name: string;
  brand?: string;
  etalaseIds: string[];       // urutan etalase toko
  priceIdr: number;           // integer rupiah > 0
  originalPriceIdr?: number;  // > priceIdr bila diskon
  discountPct?: number;       // dihitung skrip, bukan sumber
  rating: number;             // 0–5, 1 desimal
  ratingCount: number;        // jumlah ulasan
  sold: number;               // angka bawah dari label ("1rb+" -> 1000)
  soldLabel: string;          // label asli ("1rb+ terjual" -> "1rb+")
  stock: MarketplaceStock;
  description: string;        // teks bersih ≤ 4000 char
  descriptionHash: string;    // sha1 deskripsi mentah sumber (deteksi perubahan tanpa LLM)
  specs?: Record<string, string>;
  tags?: string[];
  image: string;              // '/images/marketplace/<id>.webp'
  imageSourceHash?: string;
  tokopediaUrl: string;       // https://www.tokopedia.com/ksskomputer/...
  status: MarketplaceStatus;
  missingRuns: number;        // berapa run berturut-turut tidak ditemukan
  firstSeenAt: string;        // ISO
  syncedAt: string;           // ISO terakhir data berubah/terkonfirmasi
  hiddenReason?: 'takedown' | 'manual' | 'no_rating' | 'no_sales';
  manualOverride?: { hidden?: boolean; name?: string; description?: string }; // dihormati sinkron
}

export interface MarketplaceEtalase { id: string; slug: string; name: string; position: number; }

export interface MarketplaceSyncMeta {
  schemaVersion: 1;
  lastRunAt: string; lastSuccessAt: string;
  source: 'seller_export' | 'embedded_json' | 'public_api' | 'headless';
  counts: { total: number; active: number; visible: number; hidden: number; missing: number };
  runId: string;              // YYYY-MM-DD-hhmm
}

/** DTO publik — yang benar-benar dikirim ke client. */
export type PublicMarketplaceProduct = Pick<MarketplaceProduct,
  'id'|'slug'|'name'|'brand'|'etalaseIds'|'priceIdr'|'originalPriceIdr'|'discountPct'|
  'rating'|'ratingCount'|'sold'|'soldLabel'|'stock'|'image'|'tokopediaUrl'|'firstSeenAt'|'syncedAt'>;
export type PublicMarketplaceDetail = PublicMarketplaceProduct & Pick<MarketplaceProduct,'description'|'specs'|'tags'>;
```
Daftar (`/toko`) memakai `PublicMarketplaceProduct` (tanpa deskripsi → payload kecil); detail memakai `PublicMarketplaceDetail`.

### B3. Loader server-only — `src/lib/marketplace/server.ts`

```ts
import 'server-only';  // [VERIFIKASI] paket `server-only` tersedia; bila tidak, pakai komentar + aturan eslint seperti server-catalog.ts
import productsRaw from '../../../data/marketplace/products.json';
import etalaseRaw from '../../../data/marketplace/etalase.json';
import metaRaw from '../../../data/marketplace/meta.json';
import { parseCatalog } from './schema'; // validator TS ringan, logika sama dengan validate-marketplace.mjs

const catalog = parseCatalog(productsRaw, etalaseRaw, metaRaw); // tidak throw; produk invalid dibuang + console.warn saat build

export const isVisible = (p: MarketplaceProduct) =>
  p.status === 'active' && !p.manualOverride?.hidden && p.rating > 0 && p.ratingCount > 0 && p.sold > 0;

export function getMarketplaceProducts(): PublicMarketplaceProduct[]
export function getMarketplaceProductBySlug(slug: string): PublicMarketplaceDetail | undefined
export function getMarketplaceEtalase(): (MarketplaceEtalase & { count: number })[]   // hanya count>0, urut position
export function getRelatedProducts(p, limit = 4): PublicMarketplaceProduct[]
export function getTopSellers(limit = 6): PublicMarketplaceProduct[]
export function getMarketplaceMeta(): { lastSuccessAt: string; visible: number } | null
export function getSearchEntries(): { slug; name; etalase; image }[]  // untuk Cmd+K, TANPA harga
```
- `import` JSON statis (bukan `fs`) → ikut build, kompatibel `cacheComponents`. **[VERIFIKASI]** di docs Next 16 bahwa JSON import di Server Component tidak memerlukan `'use cache'`; bila halaman jadi dinamis, bungkus getter dengan `'use cache'` + `cacheLife('days')`.
- Aturan tampil (permintaan pemilik): `rating>0 && ratingCount>0 && sold>0 && status==='active'`.

### B4. Perilaku saat data kosong/rusak

| Kondisi | Build | Halaman |
|---|---|---|
| `products.json` tidak ada / JSON invalid | `validate-marketplace` gagal di CI → **tidak deploy** (versi lama tetap live) | — |
| Valid tapi 0 produk tampil | lolos dengan warning | `/toko`: empty state "Katalog sedang diperbarui. Belanja langsung di toko Tokopedia kami." + `kss-btn-tokopedia` ke URL toko + WA ink. Etalase & search disembunyikan. |
| Sebagian produk invalid | loader membuang item itu, build lanjut | normal |
| `meta.lastSuccessAt` > 72 jam | lolos | teks kecil "Harga terakhir diperbarui 3 hari lalu — cek Tokopedia untuk harga terkini" (`kss-tag-warn`) |
| Gambar hilang | — | placeholder `Package` |

Empty hasil filter: "Tidak ada produk cocok untuk 'xyz' di etalase ini." + tombol "Reset filter" (outline) + saran 3 produk terlaris.
Loading: `/toko/loading.tsx` skeleton grid 8 kartu `bg-zinc-100` tanpa shimmer (static block; `motion-safe:animate-pulse` paling banter).

### B5. Validator — `scripts/validate-marketplace.mjs` (CI, tanpa dependensi)

Gagal (exit 1) bila:
- JSON tidak terparse; `schemaVersion !== 1`; field wajib hilang/tipe salah.
- `id` duplikat; `slug` duplikat atau tidak `^[a-z0-9]+(-[a-z0-9]+)*$`; slug produk yang sudah ada **berubah** dibanding `git show origin/main:data/marketplace/products.json` (slug immutable → SEO).
- `priceIdr` bukan integer atau ≤ 0 atau > 200.000.000; `originalPriceIdr ≤ priceIdr`; `rating ∉ [0,5]`; `sold`, `ratingCount` negatif.
- `tokopediaUrl` tidak cocok `^https://www\.tokopedia\.com/ksskomputer/[a-z0-9-]+` (**[VERIFIKASI]** domain/handle toko).
- `image` bukan path lokal `/images/marketplace/` atau file tidak ada di `public/`.
- `etalaseIds` merujuk etalase tak dikenal.
- `description` mengandung `<script`, `javascript:`, URL eksternal non-tokopedia, nomor telepon selain WA resmi (anti-injeksi/spam), > 4000 char.
- Field terlarang muncul: `costPrice|sellPrice|retailPrice` di mana pun di `data/marketplace/**`.
Warning (exit 0): 0 produk tampil; `lastSuccessAt` > 72 jam.
Opsi `--compare <file-lama>` mencetak ringkasan diff + memanggil `guards.mjs` (B8) → dipakai workflow auto-merge.

Tambah ke `package.json`: `"validate:marketplace": "node scripts/validate-marketplace.mjs"`, `"sync:marketplace": "node scripts/sync/run.mjs"`.
CI (`.github/workflows/ci.yml`, job `verify`, sebelum Build): `- name: Validate marketplace data` → `run: npm run validate:marketplace` (perlu `fetch-depth: 0` atau `git fetch origin main --depth=1` untuk cek slug immutable).

### B6. Sumber data Tokopedia — opsi berurutan

Pemilik = penjual sah atas data tokonya sendiri, tapi ToS Tokopedia tetap berlaku untuk akses otomatis. **[VERIFIKASI]** ToS & `robots.txt` Tokopedia saat implementasi. Jangan menembus captcha/blokir/login bot.

1. **Ekspor Seller Center (utama bila tersedia).** Tokopedia Seller memiliki fitur kelola produk massal berbasis file Excel. **[VERIFIKASI]**: apakah ekspor memuat harga, harga coret, stok, deskripsi, etalase, URL/ID produk; apakah bisa diunduh otomatis (biasanya butuh login → **jangan** otomatisasi login; alternatif: pemilik mengunduh manual mingguan ke folder `inbox/`, sinkron harian memakai file terbaru). Ekspor kemungkinan **tidak** memuat rating & terjual → digabung dengan opsi 2.
2. **Data tertanam di HTML halaman publik toko/produk.** Banyak halaman e-commerce menyertakan JSON-LD `schema.org/Product` atau state aplikasi di `<script>`. **[VERIFIKASI]** apakah halaman produk Tokopedia memuatnya tanpa eksekusi JS dan field apa yang tersedia (price, aggregateRating, sold?). Fetch biasa (`fetch` Node), parse deterministik.
3. **API publik/resmi.** Tokopedia punya program API untuk mitra (Tokopedia Open Platform/TikTok Shop Partner) — **[VERIFIKASI]** kelayakan akun KSS, karena sejak integrasi dengan TikTok Shop kebijakannya bisa berubah. Endpoint internal tak terdokumentasi (GraphQL web) **tidak direkomendasikan** (rapuh, abu-abu ToS).
4. **Headless browser** (Playwright di PC pemilik, browser asli, 1 tab, tanpa stealth plugin) hanya bila 1–3 gagal dan ToS mengizinkan. Dependensi dev opsional, tidak masuk repo web (`scripts/sync/package.json` terpisah).

Etika & teknis `lib/http.mjs`: jeda **≥2 dtk + jitter 0–1 dtk** antar request, konkurensi 1, maks 300 request/run, `User-Agent: KSS-Komputer-CatalogSync/1.0 (+https://<domain-situs>/tentang-kami)` jujur, timeout 20 dtk, retry 2× hanya untuk 5xx/timeout dengan backoff 10/30 dtk; **HTTP 403/429/captcha → hentikan run seketika** (`status: blocked`), jangan rotasi IP/UA. Cache respons mentah ke `scripts/sync/.cache/<runId>/` (gitignored) untuk debugging dan re-parse tanpa fetch ulang.

Gagal di tahap mana pun = **tidak menimpa data lama**: pipeline menulis ke `scripts/sync/.out/` dulu, baru `apply.mjs` menyalin ke `data/marketplace/` setelah validasi + guard lolos.

### B7. Aturan diff — `scripts/sync/diff.mjs` (deterministik)

Input: `products.json` lama + `snapshot.json` baru (hasil parse). Kunci = `id`.

| Kasus | Aksi |
|---|---|
| Baru (id tak dikenal) | tambah, `slug` dibuat sekali, `firstSeenAt=now`, `status=active`, butuh normalisasi deskripsi (LLM) |
| Ada di keduanya | update `priceIdr`, `originalPriceIdr`, `rating`, `ratingCount`, `sold`/`soldLabel`, `stock`, `etalaseIds`, `name`; `missingRuns=0`; `status=active` (kecuali `manualOverride.hidden`) |
| Deskripsi: `sha1(raw)` beda | tandai `needsNormalize` → LLM; sama → pakai deskripsi bersih lama (hemat token) |
| Gambar: hash URL/bytes beda | unduh ulang (`images.mjs`, `sharp` resize 600 webp q80 — **[VERIFIKASI]** `sharp` terpasang di PC pemilik; README aset menyebut pernah dipakai) |
| Tidak ditemukan run ini | `missingRuns += 1`; `missingRuns==1` → `status=missing` (tetap tampil? **tidak**: hanya `active` yang tampil — **[KONFIRMASI]**; rekomendasi: run pertama hilang **tetap tampil** sebagai `active` dengan `missingRuns=1`, agar gangguan sementara tidak menghapus produk) ; `missingRuns>=2` → `status=hidden`, `hiddenReason='takedown'` |
| Hidden lalu muncul lagi | `status=active`, `missingRuns=0`, `hiddenReason` dihapus, slug lama dipakai |
| `rating==0` atau `sold==0` | tetap disimpan (agar muncul otomatis setelah laku), tidak tampil (filter loader) |
| Tidak pernah menghapus baris | penghapusan permanen hanya manual (produk hidden > 180 hari boleh dipangkas P2) |

Keputusan final yang dipakai skrip: `status` hanya `active|hidden`; `missingRuns` menentukan. Status `missing` dipakai di laporan saja.

Laporan diff (`report.mjs` → `scripts/sync/.out/report.md`, juga jadi isi PR): jumlah baru/berubah/hilang/kembali; tabel perubahan harga (lama → baru, %), produk takedown; daftar flag guard.

### B8. Ambang pengaman — `scripts/sync/lib/guards.mjs`

Run dianggap **perlu tinjauan manusia** (PR dibuat tanpa auto-merge, label `needs-review`) bila salah satu:
- perubahan harga satu produk > **±40%**;
- > **20%** produk aktif hilang dalam run ini (indikasi parse rusak/blokir) → selain review, **jangan** naikkan `missingRuns` sama sekali (run dianggap tidak sah untuk takedown);
- > **30%** produk mengalami perubahan harga;
- jumlah produk tampil turun > 25% atau menjadi 0;
- produk baru > 50 dalam satu run;
- deskripsi hasil LLM gagal lolos validator (B5) → pakai deskripsi lama/teks mentah terpotong, flag.
Run dibatalkan total (tanpa PR, data lama utuh, notifikasi) bila: sumber `blocked`, snapshot 0 produk, atau parse error > 10%.

### B9. Peran model "hydrogen low" via 9router

**Fakta yang TIDAK diketahui (jangan diasumsikan dalam kode tanpa verifikasi):**
- **[VERIFIKASI]** Apa itu 9router di setup pemilik (router/proxy LLM lokal?), base URL, autentikasi, apakah endpoint OpenAI-compatible (`/v1/chat/completions`), nama model persis ("hydrogen low"?), batas konteks, dukungan JSON mode/tool calling, harga/kuota.
- **[VERIFIKASI]** Apa itu "Hydrogen" (agen/runner di PC pemilik?) dan bagaimana ia dijadwalkan; apakah ia bisa menjalankan perintah shell (`node`, `git`, `gh`) atau hanya memanggil model.

**Asumsi kerja (tulis sebagai konfigurasi, mudah diganti):** 9router mengekspos HTTP API kompatibel OpenAI di `NINEROUTER_BASE_URL` dengan `NINEROUTER_API_KEY`, model `NINEROUTER_MODEL="hydrogen-low"` (nama persis diverifikasi). Bila tidak kompatibel, hanya `scripts/sync/lib/llm.mjs` yang diganti.

Pembagian kerja (model kecil = paling sedikit mungkin):

| Tahap | Pelaksana |
|---|---|
| Jadwal, fetch, parse, diff, guard, validasi, tulis JSON, gambar, git, PR | **Skrip** (`run.mjs`) |
| Normalisasi deskripsi berubah/baru: buang emoji/hashtag/promo berlebih/nomor HP/link, rapikan jadi paragraf + bullet, ekstrak ≤8 `specs` kunci, ≤6 `tags` | **LLM** (batch, hanya `needsNormalize`) |
| Ringkasan PR 3 kalimat dari `report.md` | **LLM** (opsional) |
| Memutuskan apa pun soal harga/takedown/merge | **Tidak pernah LLM** |

Dua mode orkestrasi (pilih setelah verifikasi Hydrogen):
- **Mode A (rekomendasi): skrip memanggil model.** Task Scheduler → `node scripts/sync/run.mjs`; skrip memanggil 9router hanya di langkah normalisasi. Paling deterministik, paling murah.
- **Mode B: Hydrogen sebagai orkestrator.** Hydrogen dijadwalkan, membaca `docs/SYNC_PLAYBOOK.md`, menjalankan perintah berurutan, membaca `run-result.json`, lalu berhenti. Hydrogen tidak mengedit JSON secara manual.

Kontrak LLM normalisasi (`llm.mjs`): 1 request per ≤5 produk; input per produk ≤ 3000 char mentah; `temperature: 0`; output **JSON saja**:
```json
{"items":[{"id":"123","description":"...","specs":{"Chipset":"B760"},"tags":["motherboard","intel"]}]}
```
Skrip memvalidasi: JSON parse, id sama dengan input, panjang ≤4000, tanpa URL/telepon/HTML, angka harga **tidak boleh** muncul di deskripsi hasil (strip `Rp\s?\d` — harga dari field, bukan teks), dan teks hasil harus mengandung ≥60% token kata dari teks sumber (anti-halusinasi kasar). Gagal → retry 1×, lalu fallback: teks mentah dibersihkan regex. Prompt sistem (masuk playbook):
```
Kamu merapikan deskripsi produk toko komputer. Bahasa Indonesia. Jangan menambah fakta,
spesifikasi, garansi, atau harga yang tidak ada di teks sumber. Hapus emoji, hashtag, ajakan
chat, nomor telepon, tautan, dan teks promo berulang. Keluarkan HANYA JSON sesuai skema:
{"items":[{"id":string,"description":string,"specs":{string:string},"tags":[string]}]}.
description: paragraf pendek + baris "- " untuk poin, maks 1200 karakter.
specs: maks 8 pasangan yang tertulis eksplisit di sumber. tags: maks 6 kata huruf kecil.
```

### B10. `docs/SYNC_PLAYBOOK.md` (isi ringkas, ≤60 baris)

```md
# Playbook sinkron katalog Toko (harian)
Tujuan: perbarui data/marketplace/* dari toko Tokopedia KSS. Jangan menyunting JSON tangan.
Langkah (hentikan di langkah pertama yang gagal, laporkan run-result.json):
1. git switch main && git pull --ff-only
2. npm run sync:marketplace            # fetch→parse→diff→LLM normalisasi→guard→tulis .out/
3. Baca scripts/sync/.out/run-result.json: {status: ok|needs_review|aborted, flags[], counts}
4. aborted → selesai, kirim notifikasi berisi flags. JANGAN commit.
5. node scripts/sync/apply.mjs && npm run validate:marketplace
6. git switch -c data-sync/YYYY-MM-DD; git add data/marketplace public/images/marketplace; git commit -m "data(toko): sinkron YYYY-MM-DD"
7. git push -u origin HEAD; gh pr create --title "data(toko): sinkron YYYY-MM-DD" --body-file scripts/sync/.out/report.md --label data-sync
8. status ok → gh pr merge --auto --squash ; needs_review → tambah label needs-review, JANGAN merge.
Larangan: tidak mengubah file di luar data/marketplace dan public/images/marketplace; tidak menembus
captcha/403/429; tidak menaikkan batas guard; tidak force-push; tidak merge PR berlabel needs-review.
```
(`run.mjs` dapat menjalankan langkah 1–8 sendiri di Mode A; playbook tetap jadi sumber kebenaran.)

### B11. Alur git & CI

1. Branch `data-sync/YYYY-MM-DD` (run kedua di hari yang sama → `-2`).
2. PR ke `main`, label `data-sync`. CI `verify` (tsc, lint, test, build, price-guard, validate-marketplace) berjalan pada `pull_request` (sudah ada di `ci.yml`).
3. Auto-merge bersyarat: aktifkan "Allow auto-merge" di repo + branch protection `main` mewajibkan check `verify` **[VERIFIKASI]** apakah branch protection sudah ada. Skrip memanggil `gh pr merge --auto --squash` hanya bila `run-result.status==='ok'`.
4. Workflow tambahan `.github/workflows/data-sync-guard.yml` (on `pull_request` paths `data/marketplace/**`): gagal bila PR dari `data-sync/*` menyentuh file di luar `data/marketplace/**` dan `public/images/marketplace/**`, atau berlabel `needs-review` (mencegah auto-merge tidak sengaja). Jalankan `node scripts/validate-marketplace.mjs --compare` terhadap `origin/main` (guard dihitung ulang di CI, tidak percaya PC lokal).
5. Merge → push ke `main` → job `deploy` existing (Vercel prebuilt) jalan otomatis. Tidak perlu perubahan deploy.
6. PR `needs-review` yang tidak disentuh 3 hari → run berikutnya menutupnya (`gh pr close`) dan membuat PR baru (hindari tumpukan).

### B12. Penjadwalan di PC pemilik (Windows)

- `scripts/sync/run-daily.ps1`: `Set-Location <repo>`; muat env dari `%USERPROFILE%\.kss-sync\.env`; `node scripts/sync/run.mjs *>> "$env:USERPROFILE\.kss-sync\logs\sync-$(Get-Date -f yyyy-MM-dd).log"`; exit code diteruskan.
- Task Scheduler: harian **03:17 WIB** (luar jam sibuk, menit tak bulat), "Run whether user is logged on or not", "Run task as soon as possible after a scheduled start is missed", "Wake the computer to run" opsional, batas waktu 30 menit, jangan jalankan instance ganda. Perintah buat (pemilik jalankan):
  ```powershell
  schtasks /Create /TN "KSS Toko Sync" /SC DAILY /ST 03:17 /TR "powershell -NoProfile -ExecutionPolicy Bypass -File C:\path\repo\scripts\sync\run-daily.ps1" /RL LIMITED
  ```
  Linux/macOS: `17 3 * * * cd /path/repo && node scripts/sync/run.mjs >> ~/.kss-sync/logs/sync.log 2>&1`.
- Kunci run: `scripts/sync/.lock` (PID + waktu; kedaluwarsa 1 jam).
- Log: rotasi 30 hari (skrip menghapus log lama). `run-result.json` disimpan per run.
- Notifikasi gagal/needs_review: **[KONFIRMASI]** kanal. Opsi tanpa layanan baru: (a) GitHub Issue otomatis `gh issue create --label sync-failed` (notifikasi email GitHub ke pemilik), (b) pesan ke WA/Telegram bot bila pemilik punya. Default: (a). Juga notifikasi bila **tidak ada run sukses > 48 jam** (cek `meta.lastSuccessAt` di workflow GitHub terjadwal harian `stale-check.yml` → buat issue).

### B13. Kredensial

- GitHub: **fine-grained PAT** khusus repo ini, izin: Contents R/W, Pull requests R/W, Issues R/W (untuk notifikasi), Metadata R. Kedaluwarsa 90 hari (pengingat kalender). Disimpan via `gh auth login --with-token` atau Windows Credential Manager; **tidak** di repo, tidak di `.env` yang ter-commit.
- 9router: `NINEROUTER_BASE_URL`, `NINEROUTER_API_KEY`, `NINEROUTER_MODEL` di `%USERPROFILE%\.kss-sync\.env` (di luar repo).
- Tokopedia: **tidak ada kredensial login** dalam pipeline otomatis. Ekspor Seller Center (bila dipakai) diunduh manual ke `%USERPROFILE%\.kss-sync\inbox\`.
- `.gitignore` tambah: `scripts/sync/.cache/`, `scripts/sync/.out/`, `scripts/sync/.lock`, `.kss-sync/`.

### B14. Estimasi token per run (hanya Mode A)

Asumsi: N produk aktif ~100–300 **[VERIFIKASI]** jumlah listing toko; deskripsi berubah per hari biasanya sedikit.
- Run tipikal (0–10 deskripsi berubah): 0–2 panggilan × (~500 sistem + 5×~900 input + 5×~400 output) ≈ **0–14 rb token/hari** + ringkasan PR opsional ~1,5 rb.
- Run awal (semua 300 produk perlu normalisasi): 60 panggilan ≈ **~420 rb token** sekali. Bisa dibagi beberapa hari (`--max-normalize 50`); sisanya pakai teks mentah dibersihkan regex.
- Mode B menambah overhead orkestrasi Hydrogen (membaca playbook + output perintah) kira-kira 5–15 rb token/run **[VERIFIKASI]** tergantung cara kerja Hydrogen.
Biaya rupiah tidak dapat dihitung tanpa tarif 9router/hydrogen low.

Ringkasan hemat token: hash deskripsi (LLM hanya untuk yang berubah) · batch 5 · temperature 0 · output JSON ketat · ringkasan PR opsional · semua keputusan di skrip · LLM tak pernah melihat harga/diff.

---

## C. Daftar file berurutan

**P0 — keamanan harga + fondasi data (tanpa UI baru)**
1. `src/lib/types.ts` — perketat `PublicHardwarePart` (A11.2).
2. `src/lib/sanitizer.ts` — hapus harga dari part publik; perbaiki pemakai (`PaketDetailClient`, `PrebuiltCard`, `CommandSearchModal`, `KomponenClient` sementara, `useRetailCartStore`, `useCompareStore`).
3. `src/app/layout.tsx` + `Navbar.tsx` + `CommandSearchModal.tsx` — berhenti mengirim part; terima `SearchEntry[]`.
4. `scripts/check-price-leak.mjs` (A12) + `src/lib/__tests__/sanitizer.test.ts`.
5. `src/lib/marketplace/{types,schema,server,search}.ts`; `data/marketplace/{products,etalase,meta,banners,legacy-map}.json` (seed: beberapa produk contoh yang **benar** dari toko, diisi pemilik/sinkron pertama — jangan karang data).
6. `scripts/validate-marketplace.mjs`, `package.json` scripts, `ci.yml` step validasi.
7. AGENTS.md §1.1 + CLAUDE.md baris aturan bisnis (setelah [KONFIRMASI]).

**P1 — Marketplace UI + migrasi**
8. `src/components/toko/{PromoBanner,TokoSearchBar,EtalaseNav,FilterSheet,SortSelect,ProductCard,AddToCartButton,ProductGrid,EmptyState,StoreHeader}.tsx`.
9. `src/app/toko/{page,TokoClient,loading}.tsx`, `src/app/toko/etalase/[slug]/page.tsx`, `src/app/toko/[slug]/page.tsx` (+ `ProductDetailActions.tsx`), `src/app/toko/lama/[slug]/route.ts`.
10. `next.config.ts` redirects; `Navbar`, `BottomNav`, `Footer`, `sitemap.ts`.
11. `useRetailCartStore.ts` v2 + `CartDrawer.tsx`.
12. `src/app/page.tsx`/`HomeClient.tsx` — section aksesoris → "Terlaris di toko" (grep bagian, jangan baca utuh).
13. Hapus `src/app/komponen/**`, `src/app/aksesoris/**`.
14. Pipeline: `scripts/sync/**`, `docs/SYNC_PLAYBOOK.md`, `.gitignore`, `.github/workflows/data-sync-guard.yml`.

**P2 — perapihan**
15. `stale-check.yml`; pemangkasan produk hidden >180 hari.
16. Hapus kode mati: `FilterSidebar.tsx`, `ProductRowPricelist.tsx`, `getPublicAccessories`, `MOCK_ACCESSORIES`, `useCompareStore` (setelah grep pemakai).
17. Satukan `TOKOPEDIA_URL` (constants.ts vs format.ts) ke satu konstanta.
18. README.md/ARCHITECTURE.md/ROADMAP.md: rute `/toko` & data marketplace (ringkas).

## D. Checklist QA

- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run test`, `npm run build`, `npm run check:price`, `npm run validate:marketplace` lulus.
- [ ] Payload `/paket-rakitan/<slug>` (view-source + `.rsc`) tidak mengandung `retailPrice|sellPrice|costPrice|priceIdr`.
- [ ] Halaman selain `/toko*` dan `/` tidak mengandung `priceIdr`; tidak ada daftar part di payload layout.
- [ ] Hanya produk `rating>0 && ratingCount>0 && sold>0 && active` tampil; jumlah di etalase = jumlah kartu.
- [ ] Urutan etalase = urutan toko; etalase kosong tersembunyi.
- [ ] Redirect 301/308: `/komponen`, `/aksesoris`, `/katalog`, `/komponen/<slug-lama>`, `/produk/<slug>` — tidak berantai, tidak 404.
- [ ] Search: multi-token, tanpa diakritik, `?q=` tersinkron, aria-live mengumumkan jumlah, Esc mengosongkan.
- [ ] Banner: tanpa autoplay (atau berhenti saat interaksi + reduced-motion), keyboard panah, slide tak aktif `inert`, 1 banner = statis, 0 = tidak dirender.
- [ ] Kartu: harga via `<Price>`, coret + persen benar, rating koma desimal, label terjual asli, CTA hijau `#00803F` membuka tab baru `rel="noopener noreferrer nofollow"`.
- [ ] Tidak ada tombol orange di `/toko`; WA = ink; radius ≤6px; tanpa gradient/blur/emoji/Sparkles; sentence case.
- [ ] 390/768/1024/1440: tak ada overflow horizontal (kecuali baris chip), sticky bar detail tidak menutupi BottomNav.
- [ ] Empty data, empty filter, data basi >72 jam, gambar hilang — semuanya punya tampilan.
- [ ] Detail produk takedown → 404 dan hilang dari sitemap.
- [ ] Keranjang v1 lama dikosongkan bersih; checkout WA berisi tautan Tokopedia per item.
- [ ] Sinkron: run kering (`--dry-run`) tanpa jaringan dari `.cache` menghasilkan diff identik (deterministik).
- [ ] Simulasi: hapus 1 produk dari snapshot → run 1 tetap tampil, run 2 hidden; muncul lagi → aktif, slug sama.
- [ ] Simulasi: harga +50% → `needs_review`, tidak auto-merge; 25% produk hilang → `missingRuns` tidak naik.
- [ ] Simulasi 403/429 → run berhenti, data lama utuh, issue notifikasi dibuat.
- [ ] Output LLM rusak/halusinasi (menambah spesifikasi) → ditolak validator, fallback teks mentah.
- [ ] PR data-sync menyentuh file di luar `data/marketplace` → `data-sync-guard` gagal.
- [ ] Token GitHub tidak ada di repo/log; log tidak memuat API key.

## E. Daftar konfirmasi/verifikasi pemilik (ringkas)

[KONFIRMASI] perubahan AGENTS.md §1.1 (harga eceran /toko boleh, paket tetap tertutup) · nama "Toko" & rute `/toko` · Toko masuk tab utama BottomNav · keranjang eceran dipertahankan · autoplay banner (default mati) · default sort · etalase bawaan Tokopedia disalin atau tidak · produk hilang run pertama tetap tampil · kanal notifikasi.
[VERIFIKASI] URL kanonik toko (3 short link berbeda) · ketersediaan & isi ekspor Seller Center · data tertanam/JSON-LD di halaman produk · ToS/robots Tokopedia untuk akses otomatis · spesifikasi 9router (base URL, auth, OpenAI-compatible?, nama model "hydrogen low", JSON mode, tarif) · apa itu Hydrogen & kemampuannya menjalankan shell · `sharp`/Node 22/`gh` di PC pemilik · branch protection & auto-merge repo · jumlah listing toko · dimensi banner · API redirect/route handler & JSON import di Next 16 docs.
