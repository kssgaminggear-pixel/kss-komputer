# DESIGN.md — KSS Komputer

> Design system untuk website **KSS Komputer**. Dibaca oleh agent sebelum
> mengubah UI. Dokumen ini menggabungkan prinsip dari
> [`VoltAgent/awesome-design-md`](https://github.com/VoltAgent/awesome-design-md):
> **Vercel** (presisi tipografi, hairline, kanvas netral) dan **NVIDIA**
> (banner foto gelap, satu aksen, sudut tegas, kartu teknis padat).

---

## 1. Arah Visual

**Industrial System Integrator.** Premium, presisi, padat informasi, dan
fotografi-first. Bukan landing page SaaS generik, bukan toko komponen biasa.

- Hero dan footer = chapter gelap (`#09090b`) dengan foto produk.
- Body = kanvas terang (`#fafafa` / `#ffffff`) dengan hairline.
- Satu aksen aksi: **Signal Orange `#ea580c`**.
- Hijau Tokopedia `#00AA5B` hanya untuk aksi resmi Tokopedia.
- Emerald/amber hanya untuk status (ready, delta, garansi).

---

## 2. Warna

| Token | Nilai | Peran |
|---|---|---|
| `ink` | `#09090b` | Hero/footer, teks utama |
| `canvas` | `#ffffff` | Kartu, surface utama |
| `canvas-soft` | `#fafafa` | Latar body/section |
| `hairline` | `#e4e4e7` | Border 1px, divider |
| `body` | `#52525b` | Teks sekunder |
| `mute` | `#a1a1aa` | Metadata |
| `accent` | `#ea580c` | CTA utama, aksen aktif |
| `accent-hover` | `#f97316` | Hover CTA |
| `tokopedia` | `#00AA5B` | Checkout Tokopedia |
| `success` | `#10b981` | Ready/kompatibel |
| `warning` | `#f59e0b` | Delta tambah biaya |
| `danger` | `#ef4444` | Error |

Jangan menambah aksen baru. Jangan memakai gradient dekoratif.

---

## 3. Tipografi

- **Sans:** Geist, weight 400/500/700. Display memakai weight 700–900.
- **Mono:** Geist Mono untuk harga, FPS, watt, SKU, resi.
- Headline sentence-case, tracking negatif (`-0.03em` sampai `-0.04em`).
- Angka wajib `font-mono tabular-nums tracking-tight`.
- Eyebrow memakai mono uppercase 10–11px, tracking lebar.

| Peran | Ukuran |
|---|---|
| Hero H1 | 32–48px, weight 900 |
| Section H2 | 24–32px, weight 900 |
| Card title | 16–18px, weight 700 |
| Body | 13–14px, line-height 1.6 |
| Metadata | 10–11px mono uppercase |

---

## 4. Layout & Spacing

- Base 4px; section padding 64–96px desktop, 40–56px mobile.
- Container maksimum 1280px (`max-w-7xl`), gutter 16–32px.
- Hero desktop: split 5/7 (copy kiri, banner foto kanan).
- Mobile: banner foto tampil lebih dulu, copy di bawah.
- Grid kartu: 1-up mobile, 2-up tablet, 3-up desktop.
- Tidak boleh ada horizontal overflow 390–1440px.

---

## 5. Komponen

### Banner Hero
- Foto produk full-bleed di panel kanan; copy di kiri.
- Overlay bawah solid `ink/95` berisi nama paket + total harga + CTA.
- Badge Official Store (emerald) dan rating di atas foto.
- Sudut tegas `rounded-md`, border hairline gelap.

### Kartu Paket
- Thumbnail unit 76×96 (foto asli, crop casing).
- Badge platform/resolusi + garansi.
- Nama, deskripsi 2 baris, spec pill (socket/RAM/watt/resolusi).
- FPS telemetry bars, panel tersendiri.
- Satu CTA utama orange full-width.
- Aksi sekunder: WhatsApp (outline) + Tokopedia (hijau).
- Harga total mono besar; tidak ada harga part.

### Spec Pill
`text-[10px] font-mono uppercase tracking-wider border rounded-sm px-1.5 py-0.5`

### FPS Bar
Track `h-1.5 bg-zinc-200` (gelap: `bg-zinc-800`), isi `bg-orange-500`,
angka mono kanan, label game kiri, resolusi di header.

### Delta Tag
- Termasuk: `bg-zinc-100 text-zinc-500`
- Tambah: `bg-amber-500/10 border-amber-500/30 text-amber-600`
- Hemat: `bg-emerald-500/10 border-emerald-500/30 text-emerald-600`

### Tombol
- Primary: orange, `h-10/11`, `rounded-md`, weight 700.
- Secondary: outline hairline.
- Tokopedia: hijau `#00AA5B`.
- Tidak ada pill radius besar.

### Corner Square
Aksen 12×12px orange di sudut banner/kartu tertentu (motif dari NVIDIA),
maksimal satu per section.

---

## 6. Fotografi

- Gunakan foto produk asli KSS (Tokopedia) di `public/images/tokopedia/`.
- Foto poster marketing harus dipotong ke area unit agar teks promo tidak ikut.
- Foto banner boleh full-bleed dengan overlay solid, bukan gradient.
- Jangan memakai ilustrasi AI generik jika ada foto asli.

---

## 7. Do / Don't

**Do**
- Gunakan hairline + border, bukan shadow besar.
- Pertahankan kontras gelap/terang antar-chapter.
- Beri ruang pada foto produk.
- Gunakan mono untuk semua angka teknis.
- Uji 390, 768, 1024, 1440.

**Don't**
- Gradient dekoratif, `rounded-2xl/3xl`, `backdrop-blur`, `shadow-xl/2xl`.
- Hero kosong tanpa foto/ilustrasi.
- Harga satuan komponen di publik.
- Lebih dari satu CTA orange per fold.
- Emoji sebagai ikon.

---

## 8. Prompt Cepat untuk Agent

> Bangun halaman bergaya **industrial system integrator**: hero gelap dengan
> foto produk asli, body terang, hairline, satu aksen orange, tipografi Geist
> dengan tracking negatif, angka mono, dan kartu teknis padat. Ikuti
> `DESIGN.md` dan `UI_FIGCRAFT_SKILL.md`.
