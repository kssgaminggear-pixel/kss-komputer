# DESIGN.md — KSS Komputer (v2 "Lembar Spesifikasi Bengkel")

> Dibaca hanya saat mengubah UI. Sumber kebenaran kode: `src/app/globals.css`.
> Pola komponen: `UI_FIGCRAFT_SKILL.md`. Rancangan lengkap v2: `design-spec.md`.

## 1. Arah visual

KSS adalah bengkel rakit di Mangga Dua, bukan startup SaaS. Rasa: datasheet hardware
(Intel ARK, Noctua), nota servis, label rak gudang, dipadu foto produk gelap ala NVIDIA.

1. **Data adalah dekorasi.** Tabel spesifikasi rapi, angka mono, label mono uppercase kecil, hairline 1px. Tanpa ornamen kosong.
2. **Dua chapter, satu aksen.** Ink (`zinc-950`) untuk top bar, hero, footer. Kanvas terang untuk isi. Orange hanya untuk satu aksi utama per layar dan tanda telemetri (bar FPS, garis aktif, corner square).
3. **Hairline grid, bukan kartu mengambang.** Item sejajar berjumlah tetap memakai `kss-grid-hairline`. Kartu terpisah hanya untuk paket PC.
4. **Tipografi besar, bobot terkendali.** H1 800, H2 700, judul kartu 600, harga mono 600.
5. **Ikon fungsional.** Di tombol, navigasi, status, dan penjelas fitur/spesifikasi. Ikon penjelas: garis (outline) monokrom, 14–16px (`h-3.5`/`h-4`), sejajar teks, **tanpa kotak atau lingkaran latar berwarna**, `aria-hidden` bila teksnya sudah menjelaskan.
6. **Gerak 150ms**, hanya warna/opacity. Tanpa translate kartu atau shadow hover.

## 2. Warna & kontras

| Peran | Terang | Chapter gelap |
|---|---|---|
| Judul | zinc-950 | zinc-50 |
| Body | zinc-600 | zinc-400 |
| Teks paling pudar | zinc-500 (hanya di putih/zinc-50) | zinc-400 |
| Border kontainer / internal | zinc-200 / zinc-100 | zinc-800 / zinc-900 |
| Aksi utama (fill + teks putih) | orange-700, hover orange-800 | sama |
| Tanda non-teks (bar, garis aktif) | orange-600 | orange-500 |
| Teks aksen (eyebrow) | orange-700 | orange-400 |
| WhatsApp | tombol ink (`zinc-900`) + `MessageCircle` | `kss-btn-inverse` |
| Tokopedia | `#00803F`, hover `#006B35` | sama |
| Status | emerald-700 ok · amber-800 tambah biaya · red-700 error | |

- Orange-600 dengan teks putih hanya 3,56:1 dan `#00AA5B` dengan teks putih 3,04:1: keduanya **gagal**. Jangan dipakai sebagai fill tombol berteks.
- `#00AA5B` hanya untuk tanda/ikon non-teks. Zinc-400 jangan dipakai di latar terang.
- Dilarang: gradient dekoratif, aksen baru, hijau/emerald untuk hal selain Tokopedia dan status.

## 3. Tipografi

Geist (sans) dan Geist Mono. Skala di `@theme` globals.css, minimum 11px:

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

- Container `kss-container` (maks 1280px). Section `kss-section` (zinc-50) dan `kss-section-alt` (putih) bergantian, `py-12 lg:py-20`.
- Hero desktop 5/7 (copy kiri, foto kanan); mobile foto dulu.
- Grid kartu 1/2/3 kolom. Tidak boleh ada horizontal overflow 390–1440px.
- Anchor target diberi `scroll-mt-20`.

## 5. Komponen (kelas di globals.css)

- Tombol: `kss-btn-primary` (orange), `kss-btn-dark`, `kss-btn-wa` (ink), `kss-btn-outline`, `kss-btn-tokopedia`, `kss-btn-inverse` dan `kss-btn-outline-dark` (chapter gelap), `kss-icon-btn`. Tinggi 40px, `rounded-sm`.
- Tag: `kss-tag` + `-neutral|-accent|-ink|-ok|-warn|-danger|-on-dark`. Spec pill: `kss-spec-pill`.
- Delta upgrade: `kss-delta-included|plus|minus`. Nol delta = `[Termasuk Paket]`.
- FPS: `kss-fps-track` + `kss-fps-fill`.
- Chip filter: `kss-chip`; aktif = ink (`kss-chip-active`), bukan orange.
- Form: `kss-input`, `kss-field-label`.
- Radius: tag 2px, tombol/input 4px, kontainer/foto 6px. `lg`–`3xl` dikunci 6px di `@theme`.
- Corner square 12px orange hanya di foto hero. Penanda eyebrow = kotak 6px, bukan dot bulat.

**Peta ikon (lucide-react):** Paket `PcCase` · Jasa `Wrench` · Komponen `Cpu`/`Layers` · Aksesoris `Headphones` · Konsultasi `MessageSquareText` · WhatsApp `MessageCircle` · Pesanan `ClipboardList` · Tentang `Building2` · Link keluar `ArrowUpRight`/`ExternalLink`. **Jangan pakai `Sparkles`.**

## 6. Fotografi

Foto produk asli di `public/images/tokopedia/` (lihat README di folder itu). Wadah `bg-zinc-100` (terang) / `bg-zinc-900` (gelap) + border hairline. Foto poster dipotong ke area unit. Overlay solid, bukan gradient. Slot berikutnya: foto asli bengkel dan teknisi.

## 7. Do / Don't

**Do:** hairline + border; kontras gelap/terang antar-chapter; label mono pendek; uji 390/768/1024/1440; `prefers-reduced-motion`.
**Don't:** `rounded-xl` ke atas, `backdrop-blur`, `shadow-md` ke atas, gradient, emoji, ikon dalam kotak tint, harga satuan part di publik, lebih dari satu tombol orange per fold, teks di bawah 11px.
