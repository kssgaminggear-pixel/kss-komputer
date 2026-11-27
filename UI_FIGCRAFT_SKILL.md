# UI_FIGCRAFT_SKILL.md — Pola Komponen KSS Komputer (v2)

> Dibaca saat membuat/mengubah komponen `.tsx`. Token dan alasan: `DESIGN.md`.
> Kelas `kss-*` didefinisikan di `src/app/globals.css` — itu sumber kebenaran.
> Jika komponen bertentangan dengan dokumen ini, komponennya yang salah.

## 1. Anti-AI-slop (dilarang)

| Dilarang | Alasan |
|---|---|
| `bg-gradient-*` | Merusak kesan presisi |
| `rounded-lg` ke atas (kini dikunci 6px) | Sudut tegas |
| `backdrop-blur`, `shadow-md` ke atas | Berat dan mengaburkan hierarki |
| Ikon dalam kotak tint, ikon `Sparkles`, emoji | Pola template generik |
| Badge pill di atas H1, judul Title Case | Klise; pakai eyebrow + sentence case |
| `font-black` di judul kartu/harga | Pakai 600–800 sesuai skala |
| Teks < 11px, body 11px | Terbaca seperti panel admin |
| `// TODO`, handler palsu | Wajib implementasi utuh |
| Harga satuan part di UI publik | Aturan bisnis (AGENTS.md §1.1) |

## 2. Permukaan & aksi

- Halaman: `bg-zinc-50`; section selang-seling `kss-section` / `kss-section-alt`. Hero & footer: `kss-chapter-dark`.
- Kartu: `kss-card` (+ `kss-card-hover` = border saja). Kelompok sejajar: `kss-grid-hairline`.
- Hierarki aksi (maks satu orange per fold):
  - Utama: `kss-btn-primary` (orange-700)
  - Kuat sekunder & WhatsApp: `kss-btn-dark` / `kss-btn-wa` (ink)
  - Tersier: `kss-btn-outline`
  - Tokopedia: `kss-btn-tokopedia` (`#00803F`)
  - Status saja: emerald (ok), amber (tambah biaya), red (error)
- Tombol ikon wajib `aria-label`. Ikon dekoratif `aria-hidden`.
- Fokus: outline global orange-600; jangan menambah `ring-*`.

## 3. Pola mikro

**Spec pill** (socket, RAM, watt; tanpa harga; maks 3 per baris):
```tsx
<span className="kss-spec-pill">AM5 · DDR5 · 170W</span>
```

**Tabel spesifikasi kartu:** `<dl>` dengan `grid-cols-[40px_1fr]`, `dt` = `kss-label`, `dd` = `text-body-sm` (CPU/GPU/RAM/SSD).

**FPS telemetry** (2–3 game, resolusi eksplisit):
```tsx
<div className="kss-fps-track"><div className="kss-fps-fill" style={{ width: '88%' }} /></div>
```
Angka: `kss-num text-meta font-semibold`.

**Delta upgrade:** `kss-delta-included` → `[Termasuk Paket]`; `kss-delta-plus` → `[+ Rp …]`; `kss-delta-minus` → `[- Rp …]`. Nol delta bukan `+ Rp 0`. Jangan tampilkan `sellPrice`/`costPrice` part.

**Angka:** semua harga lewat `<Price value={…} />`; FPS/watt/SKU pakai `kss-num` (`font-mono tabular-nums tracking-tight`).

**Eyebrow:** `<p className="kss-eyebrow"><span aria-hidden className="h-1.5 w-1.5 bg-orange-600" />Teks</p>`.

## 4. Struktur halaman

- **Header halaman:** `PageHeader` (eyebrow, judul sentence case, deskripsi maks ~2 baris di mobile, aksi di kanan/bawah, `breadcrumb` opsional).
- **Header section:** `SectionHeader`.
- **Kartu paket PC**, urutan: tag (platform, resolusi, rekomendasi) → nama + deskripsi → tabel spesifikasi → FPS → total harga (satu-satunya harga) → "Detail & upgrade" (ink) → WA (outline) + Tokopedia → tautan "Ubah spesifikasi via WhatsApp". Tanpa harga per komponen.
- **Quick-Upgrade Panel:** opsi = nama part + delta tag; terpasang ditandai border orange + `[Termasuk Paket]`; total diperbarui real-time; mobile: delta di baris terpisah.
- **Rakit custom:** via WhatsApp (`generateCustomBuildWAMessage()`), pesan tanpa harga satuan. Tidak ada simulator.

## 5. Responsif & aksesibilitas

- Uji 390, 768, 1024, 1280, 1440. Tanpa horizontal overflow pada body (strip chip boleh scroll horizontal).
- Target sentuh: tombol 40px, chip/toolbar 36px, baris menu 48px.
- Kontras ≥ 4,5:1. Status tidak hanya warna (sertakan teks/ikon).
- Gambar/iframe wajib `alt`/`title`. Select punya label (`sr-only` bila perlu). Nav aktif `aria-current`, chip `aria-pressed`.
- Gerak 150ms; `prefers-reduced-motion` ditangani global.

## 6. Checklist sebelum commit

- [ ] Satu tombol orange per fold; WhatsApp ink; hijau hanya Tokopedia/status.
- [ ] Tanpa gradient, blur, radius > 6px, shadow besar, `Sparkles`, emoji.
- [ ] Harga via `Price`; FPS/watt via `kss-num`; tidak ada harga satuan part.
- [ ] Sentence case; tidak ada teks < 11px.
- [ ] Responsif 390–1440 tanpa overflow.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run check:price` bersih.
