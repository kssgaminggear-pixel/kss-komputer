# DESIGN.md — KSS Komputer (V3 "Bengkel hangat")

> Dibaca hanya saat mengubah UI. Sumber kebenaran kode: `src/app/globals.css`.
> Pola komponen: `UI_FIGCRAFT_SKILL.md` (bila bertentangan, dokumen ini yang berlaku).
> V3 menggantikan v2 atas persetujuan pemilik (2026-11-28).

## 1. Arah visual

KSS adalah meja kerja teknisi: kertas krem, logam baja, tinta hitam, sedikit orange merek.
Ramah untuk orang awam yang datang membawa PC rusak, tetapi tetap terasa toko komputer.

1. **Blok warna per seksi** (clay = jasa, steel = toko, butter = angka & proses, ink = penutup/3D), bukan deretan seksi berpola sama.
2. **Bentuk lembut:** kartu 14px, panel 20px, blok besar 28px, tombol/chip/tab pil.
3. **Gambar memimpin.** Motif dekoratif hanya dari dunia PC (kipas, baut, jalur PCB), bukan blob acak.
4. **Satu aksi orange per layar.**
5. **Ikon fungsional:** garis monokrom 14–16px tanpa kotak/lingkaran latar berwarna, `aria-hidden` bila teks sudah menjelaskan.
6. **Gerak 150–450ms** dan selalu patuh `prefers-reduced-motion`. Carousel otomatis wajib punya tombol jeda.

Diganti dari v2: radius maks 6px, hero/footer wajib `zinc-950`, label mono uppercase, larangan bayangan.

## 2. Warna & kontras

| Token | Pakai untuk |
|---|---|
| `paper` / `paper-deep` | kanvas utama / seksi dan kartu lembut |
| `line` | hairline di paper |
| `ink` / `ink-soft` | judul dan tombol ink / teks sekunder |
| `block-clay` `block-steel` `block-butter` `block-ink` | latar blok seksi (`kss-block-*`) |
| `shape-*` | motif dan latar media cutout di blok senada |
| `accent` (orange-700) | fill satu aksi utama, teks putih |
| `accent-hover` (orange-800) | eyebrow dan teks aksen kecil di paper/blok |
| `tokopedia` `#00803F` | hanya tombol Tokopedia |

- WhatsApp = tombol ink; `kss-btn-inverse` di area gelap.
- `zinc-500` digelapkan di globals.css agar lolos di blok terang, dan diterangkan di area gelap. Jangan pakai `zinc-400` untuk teks di latar terang.
- Teks `orange-700` hanya di paper atau putih; di atas blok warna pakai `orange-800`.
- Pasangan warna baru ditambahkan ke `src/lib/__tests__/theme.test.ts`.
- Dilarang: gradient dekoratif (satu-satunya pengecualian: scrim fungsional di bawah teks di atas foto), blur/glassmorphism, blok hijau/mint.
## 3. Tipografi

Bricolage Grotesque (`--font-display`) hanya untuk H1/H2; Geist untuk isi; Geist Mono **hanya untuk angka**.
Skala di `@theme` globals.css, minimum 11px:

| Token | Ukuran | Pakai untuk |
|---|---|---|
| `text-micro` | 11px | label mono uppercase |
| `text-meta` | 12px | metadata, tombol kecil |
| `text-body-sm` | 13px | deskripsi kartu |
| `text-body` | 15px | paragraf |
| `text-title` | 17px / 600 | judul kartu |
| `text-h3` | 20px / 600 | judul blok |
| `text-h2` | 26→36px / 700 | judul section |
| `text-h1-page` | 30→44px / 800 | judul halaman |
| `text-h1` | 34→56px / 800 | hero |

Headline sentence case, tracking negatif. Angka: `font-mono tabular-nums tracking-tight`, harga lewat komponen `Price` ("Rp" lebih kecil).
Paragraf `max-w-[52ch]`–`[60ch]`, judul `text-balance`.

## 4. Layout

- Container `kss-container` (maks 1280px). Blok warna: `kss-block` + `kss-block-*` (menjorok dan membulat di desktop).
- Pembatas gelombang `kss-wave-top`, paling banyak 4 kali per halaman.
- Tidak boleh ada horizontal overflow 390–1440px. Anchor target diberi `scroll-mt-20`.

## 5. Komponen (kelas di globals.css)

- Tombol pil 40px: `kss-btn-primary` (orange), `kss-btn-dark`, `kss-btn-wa` (ink), `kss-btn-outline`, `kss-btn-tokopedia`, `kss-btn-inverse` dan `kss-btn-outline-dark` (area gelap), `kss-icon-btn`.
- Kartu: `kss-card` (di paper), `kss-card-float` (di atas blok warna), `kss-ring-selected` (kartu unggulan).
- Tag: `kss-tag` + `-neutral|-accent|-ink|-ok|-warn|-danger|-on-dark`. Spec pill: `kss-spec-pill`.
- FPS: `kss-fps-track` + `kss-fps-fill`.
- Chip filter: `kss-chip`; aktif = ink (`kss-chip-active`), bukan orange.
- Form: `kss-input`, `kss-field-label`.
- Angka harga lewat komponen `Price`.

**Peta ikon (lucide-react):** Paket `PcCase` · Jasa `Wrench` · Komponen `Cpu`/`Layers` · Aksesoris `Headphones` · Konsultasi `MessageSquareText` · WhatsApp `MessageCircle` · Pesanan `ClipboardList` · Tentang `Building2` · Link keluar `ArrowUpRight`/`ExternalLink`. **Jangan pakai `Sparkles`.**

## 6. Fotografi

Foto produk asli di `public/images/tokopedia/` (lihat README di folder itu). Gambar yang bisa diganti pemilik wajib lewat `getSlot()` (`src/lib/media/slots.json`).
Gambar buatan AI hanya ilustrasi, berlabel "Ilustrasi", tanpa orang, huruf, atau logo tiruan.

## 7. Do / Don't

**Do:** satu fokus per layar; blok warna berganti; uji 390/768/1024/1440; `prefers-reduced-motion`.
**Don't:** blur, gradient dekoratif, emoji, ikon `Sparkles`, ikon dalam kotak tint, testimoni/penghargaan/logo media tanpa bukti, harga satuan part di publik, lebih dari satu tombol orange per layar, teks di bawah 11px.