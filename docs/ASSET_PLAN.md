# ASSET_PLAN.md — Rencana aset gambar KSS Komputer

> Lampiran `ROADMAP.md` Pilar V (Web visual-first). Dibaca saat menyiapkan foto,
> mengubah pipeline gambar, atau membuat ilustrasi. Token warna dan aturan visual
> tetap mengikuti `src/app/globals.css` dan `DESIGN.md`.
>
> Data inventaris diambil 2026-11-28 dari isi repo (skrip ringkas, bukan klaim dokumen).

## 1. Inventaris aset saat ini

| Lokasi | Jumlah | Resolusi | Ukuran | Dipakai di |
|---|---|---|---|---|
| `public/images/marketplace/<id>.webp` | 671 file, 1 foto per produk | 471 file 600×600, sisanya 447–600 px (beberapa 4:3 dan 3:4) | median 24 KB, maks 68 KB, total 20 MB (ter-commit di git) | `/toko`, `/toko/[slug]`, beranda "Terlaris di toko", pencarian |
| `public/images/tokopedia/package-*.webp` | 6 | 700×700 | ±72 KB | arsip, belum dipakai langsung |
| `public/images/tokopedia/package-*-case.webp` | 6 | 240×300 | 12–17 KB | thumbnail paket (`src/lib/package-images.ts`), seksi "Kenapa KSS" |
| `public/images/tokopedia/banner-*.webp` | 3 | 700×600 dan 1200×600 | 90–138 KB | hero beranda, banner promo `/toko`, Open Graph |
| `public/images/tokopedia/monitor-22.webp` | 1 | header tidak terbaca skrip | 139 KB | arsip |
| `public/images/brand/` | 4 | logo PNG + WebP | 61 KB total | navbar, footer, CS, login |
| `public/images/kss-pc-blueprint.svg` | 1 | vektor | 10 KB | cadangan ilustrasi (belum dipakai di UI) |

Catatan penting:

- Produk Toko yang tampil (aktif, punya rating, pernah terjual) = 671, semuanya punya
  foto. 498 baris lain tidak tampil dan tidak punya foto.
- Sinkron (`scripts/sync/lib/images.mjs`) mengunduh **satu** foto utama per produk,
  diperkecil `fit: inside` 600 px, WebP q78. Belum ada galeri multi-foto.
- Hanya 60 dari 1.169 produk punya deskripsi; halaman detail Toko nyaris tanpa isi selain foto.
- **Nol** foto asli bengkel, teknisi, proses QC, atau hasil rakitan pelanggan.
- Foto paket di halaman detail dan kartu berasal dari potongan 240×300, jadi tidak bisa
  dipakai besar tanpa pecah.
- Banner `promo-11-11` di `data/marketplace/banners.json` sudah lewat `activeUntil`
  (2026-11-11), sehingga carousel promo tinggal satu banner.
- Repo: pack git ±20 MB, sebagian besar foto Toko. Setiap ganti foto menambah riwayat git.

## 2. Aturan sumber gambar (wajib)

| Jenis | Sumber yang boleh | Dilarang |
|---|---|---|
| Foto produk Toko | Katalog toko KSS sendiri lewat `tools/tokopedia-scraper` / `npm run sync:marketplace` yang dijalankan pemilik | Toko lain; menembus robots.txt, captcha, atau blokir; hotlink URL ber-signature |
| Foto paket rakitan | Foto unit asli KSS (foto sendiri), atau foto listing paket di toko KSS sendiri | Render 3D/AI yang tampak seperti unit asli |
| Lookbook / hasil rakitan / testimoni | **Hanya foto asli**, dengan izin pelanggan bila wajah, nama, atau rumah terlihat | Gambar AI, foto stok, foto pihak lain |
| Bengkel, teknisi, proses QC | Foto sendiri; wajah teknisi hanya dengan persetujuan | Gambar AI yang meniru tempat/orang asli |
| Latar hero, tekstur, ilustrasi kategori generik | Foto sendiri, atau ilustrasi AI (Google Flow) sesuai §5 | Logo/merek tiruan, teks dalam gambar, orang yang tampak seperti pelanggan/teknisi |

Gambar AI wajib diberi nama berawalan `ilu-` dan dicatat di manifest dengan
`kind: "illustration"` agar tidak pernah tertukar dengan foto produk.

## 3. Struktur folder target

```text
public/images/
├── brand/                     # logo, ikon aplikasi (tetap)
├── hero/                      # latar hero: <slot>-<w>.webp (foto sendiri atau ilu-)
├── paket/<slug>/              # 01-front.webp, 02-side.webp, 03-interior.webp, ...
├── jasa/<slug>/               # foto proses asli per layanan
├── bengkel/                   # toko, meja kerja, rak stok (foto sendiri)
├── lookbook/<yyyy-mm>-<id>/   # hasil rakitan asli + izin
├── kategori/                  # sampul kategori (foto produk asli atau ilu-)
├── marketplace/<id>.webp      # foto utama Toko (sinkron, tetap)
└── marketplace/g/<id>-<n>.webp  # galeri Toko (fase scale-up, lihat §4.4)
```

Manifest `src/lib/media/manifest.json` (dihasilkan skrip, bukan ditulis tangan):
`{ path, width, height, kind: "photo"|"illustration", alt, blurDataURL, source }`.
Komponen membaca `width/height/blurDataURL` dari manifest, bukan menebak.

## 4. Pipeline

### 4.1 Masuk (ingest)

1. Foto sendiri: JPG/HEIC asli, sisi panjang ≥ 2400 px, ditaruh di folder lokal pemilik
   (di luar repo). Jangan commit file mentah.
2. Skrip Node (`scripts/media/build.mjs`, rencana) dengan `sharp`:
   - auto-orient, buang metadata EXIF/GPS (privasi lokasi);
   - potong ke rasio slot (§6) dengan titik fokus dari manifest bila ada;
   - keluaran master WebP q80, sisi panjang maks 1600 px (2400 px khusus hero);
   - `blurDataURL` = WebP 16 px base64 (< 1 KB) atau warna dominan;
   - tulis/perbarui manifest.
3. Foto Toko: tetap lewat sinkron. Perubahan yang direncanakan: simpan
   `width`/`height` di `products.json`, opsi galeri (§4.4).

### 4.2 Sajian (`next/image`, Next.js 16)

Dicek terhadap `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`:

- `images.qualities` **wajib** dideklarasikan di Next 16 (default `[75]`); nilai di luar
  daftar dibulatkan ke yang terdekat. Usulan: `[60, 75, 85]`.
- `images.formats`: default WebP. AVIF (`['image/avif', 'image/webp']`) menambah cache
  dan transformasi per format; aktifkan hanya bila kuota hosting cukup (keputusan pemilik).
- `images.localPatterns`: batasi optimasi ke `/images/**`.
- `preload` menggantikan `priority` (deprecated di Next 16); umumnya cukup
  `loading="eager"` + `fetchPriority="high"` untuk satu gambar LCP per halaman.
- `sizes` wajib untuk setiap `fill`; tanpa `sizes` browser menganggap 100vw.
- `placeholder="blur"` butuh `blurDataURL` untuk gambar non-statis; ambil dari manifest.
- Art direction hero (crop mobile 4:5, desktop 16:9): `getImageProps()` + `<picture>`.
- `minimumCacheTTL` panjang (mis. 31 hari) aman karena nama file baru = URL baru.

### 4.3 Kuota hosting

- 671 foto Toko × 3–4 lebar `srcset` × jumlah format bisa menghasilkan ribuan
  transformasi optimizer per bulan. Paket Vercel dan batas transformasinya **belum
  dicek** (lihat keputusan pemilik di ROADMAP).
- Opsi hemat: foto Toko sudah WebP 600 px dan kecil, sehingga thumbnail Toko boleh
  `unoptimized` (disajikan statis dari CDN) sementara optimizer dipakai untuk foto besar
  (hero, paket, lookbook).

### 4.4 Galeri multi-foto Toko (scale-up)

- Ambil hingga 5 foto per produk dari halaman produk toko KSS sendiri, dengan jeda yang
  sama seperti sinkron sekarang; berhenti bila diblokir dan serahkan ke pemilik.
- Perkiraan: 671 × 5 × ±50 KB ≈ 170 MB. **Tidak masuk git.** Pindahkan ke object storage
  (Vercel Blob atau storage vendor backend) dengan nama ber-hash; DTO hanya membawa URL.

### 4.5 Fallback (tidak boleh ada kotak kosong/gambar rusak)

Urutan: foto → sampul kategori (`kategori/`) → `kss-pc-blueprint.svg` di bidang
`bg-zinc-100`/`bg-zinc-900` dengan label mono kategori. `onError` menukar ke fallback.
Fallback ikon `Package` di kotak abu (pola sekarang) dihapus.

## 5. Prompt Google Flow (hanya ilustrasi/dekorasi)

Semua prompt: tanpa teks, tanpa logo, tanpa merek, tanpa orang. Hasil disaring
pemilik, diberi awalan `ilu-`, dan tetap tunduk pada palet v2 (zinc + aksen orange tipis,
tanpa gradient mencolok, tanpa efek glow/neon).

**H-1 Latar hero beranda (desktop 16:9, 2400×1350)**
```
Dark, minimal still-life photograph of a clean electronics workbench surface, matte black anodized aluminum and dark grey anti-static mat, a few precision screwdrivers and neatly coiled cables placed at the far right edge, large empty negative space on the left two thirds for text, soft top-down studio light, low contrast, color palette near-black zinc greys with one thin warm orange accent line, no text, no logos, no brand marks, no people, no computer brand visible, photorealistic texture, 16:9
```

**H-2 Latar hero mobile (4:5, 1080×1350)** — prompt H-1, ganti akhir kalimat:
```
... vertical composition, tools grouped at the bottom edge, empty negative space in the upper half for text, 4:5
```

**K-1 Ilustrasi kategori jasa "Rakit PC" (1:1, 1200×1200)**
```
Monochrome technical line illustration of a generic desktop PC case in three-quarter view with the side panel removed, simplified motherboard, cooler and graphics card drawn as clean outlines, blueprint style, thin off-white lines on near-black zinc background, single thin orange accent line highlighting the cable path, flat, no shading gradients, no text, no logos, no brand names, 1:1
```

**K-2 "Servis & perbaikan"**
```
Monochrome technical line illustration of a generic motherboard top view with a multimeter probe outline touching a test point, blueprint style, thin off-white lines on near-black zinc background, one thin orange accent highlight, flat, no text, no logos, no brand names, no people, 1:1
```

**K-3 "Cleaning & maintenance"**
```
Monochrome technical line illustration of a generic CPU cooler fan and heatsink with small airflow arrows and a soft brush outline, blueprint style, thin off-white lines on near-black zinc background, one thin orange accent arrow, flat, no text, no logos, no brand names, no people, 1:1
```

**K-4 "Upgrade"**
```
Monochrome technical line illustration of a generic RAM stick and NVMe SSD being inserted into empty slots, with a small upward arrow, blueprint style, thin off-white lines on near-black zinc background, one thin orange accent arrow, flat, no text, no logos, no brand names, no people, 1:1
```

**K-5 "Konsultasi"**
```
Monochrome technical line illustration of a clipboard with a checklist grid next to a generic PC case outline and a small speech bubble outline, blueprint style, thin off-white lines on near-black zinc background, one thin orange accent check mark, flat, no text or letters, no logos, no brand names, no people, 1:1
```

**T-1 Tekstur bidang gelap (pola hairline, 2400×1600)**
```
Seamless subtle texture of a dark matte zinc surface with an extremely faint engineering grid of thin lines, almost flat, very low contrast, no objects, no text, no logos, suitable as a background behind white typography, 3:2
```

Yang **tidak** boleh dibuat dengan AI: foto produk, unit paket, galeri hasil rakitan,
interior/eksterior toko, teknisi, pelanggan, testimoni, layar benchmark/FPS.

## 6. Daftar kebutuhan gambar per slot

Kolom ukuran = ukuran master yang disimpan; `next/image` menurunkan lebar lain.

| ID | Route / slot | Rasio | Master (px) | Sumber | Jumlah | Prioritas |
|---|---|---|---|---|---|---|
| A-01 | `/` hero full-bleed desktop | 16:9 | 2400×1350 | Foto sendiri unit/etalase KSS; cadangan H-1 (ilustrasi) | 1–3 | MVP |
| A-02 | `/` hero mobile | 4:5 | 1080×1350 | Crop A-01 atau H-2 | 1–3 | MVP |
| A-03 | `/` bento kategori (Paket, Toko, Jasa, Konsultasi) | 1:1 dan 2:1 | 1200×1200 / 2400×1200 | Paket & Toko: foto asli; Jasa & Konsultasi: foto sendiri, cadangan K-1..K-5 | 4–6 | MVP |
| A-04 | `/` "Terlaris di toko" grid | 1:1 | 600×600 | Sinkron Toko (sudah ada) | 8 | MVP |
| A-05 | `/` proses QC (4 langkah) | 4:3 | 1600×1200 | Foto sendiri saat rakit/stress test | 4 | MVP |
| A-06 | `/` dan `/galeri` lookbook | 4:5 dan 4:3 | 1600×2000 / 1600×1200 | **Foto asli** hasil rakitan + izin | ≥ 12 | MVP (tampil hanya bila ≥ 6 foto) |
| B-01 | Kartu paket (`PrebuiltCard`) | 4:3 | 1600×1200 | Foto sendiri unit paket; sementara `package-*.webp` 700×700 asli | 6 paket | MVP |
| B-02 | `/paket-rakitan/[slug]` galeri | 1:1 | 2000×2000 | Foto sendiri: depan 3/4, samping kaca, interior kabel, I/O belakang, RGB menyala, layar stress test | 5–8 per paket | MVP |
| B-03 | `/paket-rakitan` header tier | 21:9 | 2400×1030 | Crop foto paket | 1 | Scale-up |
| C-01 | `/toko` kartu produk | 1:1 | 600×600 (naik ke 1000 bila sinkron diubah) | Sinkron Toko | 671 | ada |
| C-02 | `/toko/[slug]` galeri + zoom | 1:1 | 1200×1200 | Sinkron Toko galeri (§4.4) | ≤ 5 per produk | Scale-up |
| C-03 | `/toko` sampul etalase (33 etalase) | 4:3 | 1200×900 | Foto produk terlaris di etalase itu (otomatis) | 33 | MVP |
| C-04 | `/toko` banner promo | 2:1 | 2400×1200 | Banner toko sendiri; perbarui yang kedaluwarsa | 2–4 | MVP |
| D-01 | `/jasa` kartu layanan | 4:3 | 1600×1200 | Foto proses asli; cadangan K-1..K-4 | 4 | MVP |
| D-02 | `/jasa/[slug]` galeri proses | 4:3 | 1600×1200 | Foto sendiri sebelum/sesudah | 3–6 per layanan | MVP |
| E-01 | `/tentang-kami` bengkel | 3:2 | 2400×1600 | Foto sendiri: depan toko, meja kerja, rak | 4–6 | MVP |
| E-02 | `/tentang-kami` teknisi | 4:5 | 1200×1500 | Foto sendiri + persetujuan; boleh tanpa wajah | 2–4 | Scale-up |
| F-01 | `/konsultasi` kartu pilihan kebutuhan | 4:3 | 1200×900 | Foto paket asli per tier (gaming/kantor/kreator) | 3–5 | MVP |
| G-01 | Open Graph per paket/produk | 1.91:1 | 1200×630 | Dibangkitkan `opengraph-image` dari foto asli + nama + total paket | otomatis | Scale-up |
| G-02 | Tekstur chapter gelap | 3:2 | 2400×1600 | T-1 (ilustrasi) atau tanpa tekstur | 1 | Opsional |
| M-01 | Aplikasi HP: ikon & splash | 1:1 | 1024×1024 | Logo resmi (sudah ada) | 1 set | Fase M |

## 7. Panduan pemotretan singkat (foto sendiri)

- Latar polos gelap atau abu, cahaya samping lembut, tanpa label harga di frame.
- Satu sesi per paket: 6 sudut tetap (lihat B-02) agar galeri seragam antarpaket.
- Lensa setara 35–50 mm, kamera sejajar unit; hindari distorsi sudut lebar.
- Layar benchmark difoto dari layar asli, bukan disunting.
- Simpan nama file: `<slug>-01-front.jpg` dst. agar skrip bisa memetakan otomatis.
