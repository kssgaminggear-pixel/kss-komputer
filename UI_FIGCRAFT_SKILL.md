# UI_FIGCRAFT_SKILL.md — KSS Komputer High-Craft UI System

> **Wajib dibaca setiap kali membuat atau mengubah komponen `.tsx`.**
> Skill ini adalah kontrak visual KSS Komputer. Jika sebuah komponen bertentangan
> dengan aturan di sini, komponen tersebut salah — bukan skill-nya.

---

## 1. Arah Estetika: Industrial System Integrator

Referensi rasa: **Aftershock PC + Linear + Vercel**. Presisi, tenang, padat data,
dan terasa seperti perangkat teknis mahal — bukan landing page agensi.

### 1.1 DILARANG KERAS — Anti-AI-Slop

| Dilarang | Alasan |
|---|---|
| `bg-gradient-to-*` warna-warni | Menghilangkan kesan presisi industrial |
| `rounded-2xl` / `rounded-3xl` | Terlalu lembut; KSS memakai sudut tegas |
| `backdrop-blur` berlebihan | Berat, tidak perlu, dan mengaburkan hierarki |
| Hero kosong setinggi 1 layar | Membuang ruang dan memperlambat konversi |
| Emoji sebagai ikon UI | Gunakan `lucide-react` |
| Placeholder `// TODO` | Wajib implementasi utuh |
| Harga satuan part di UI publik | Melanggar aturan bisnis B2 |

### 1.2 Surface & Hairline Grid

- Latar halaman: `bg-zinc-950` (dark) atau `bg-zinc-50` (light).
- Surface kartu: `bg-zinc-900/90` + `border border-zinc-800`.
- Hover: `hover:border-zinc-700 transition-colors duration-150`.
- Sudut: `rounded-sm` atau `rounded-md`. Tidak ada radius lebih besar.
- Shadow: maksimum `shadow-xs` / `shadow-sm`. Tidak ada `shadow-2xl`.
- Jarak: gunakan `gap-2` sampai `gap-6`; section `py-8` sampai `py-12`.
- Container: `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8`.

### 1.3 Aksen Fungsional (hanya untuk aksi, bukan dekorasi)

| Fungsi | Kelas |
|---|---|
| CTA utama (Checkout / Kustomisasi) | `bg-orange-600 hover:bg-orange-500 text-white` |
| Tokopedia resmi | `bg-[#00AA5B] hover:bg-[#00924E] text-white` |
| WhatsApp / booking | `bg-emerald-600 hover:bg-emerald-700 text-white` |
| Status ready / kompatibel | `text-emerald-400 border-emerald-500/30 bg-emerald-500/10` |
| Peringatan / tambah biaya | `text-amber-400 border-amber-500/30 bg-amber-500/10` |
| Error / tidak kompatibel | `text-red-400 border-red-500/30 bg-red-500/10` |

Jangan memakai lebih dari satu warna aksen dalam satu baris aksi.

---

## 2. Komponen Mikro Wajib (FigCraft Patterns)

### 2.1 Hardware Spec Pill

Setiap komponen wajib punya badge teknis dengan margin rapat:

```tsx
<span className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-sm">
  AM5 · DDR5 · 170W
</span>
```

Aturan:
- Maksimal 3 pill per baris; sisanya masuk baris baru.
- Isi pill: socket, tipe RAM, wattage, form factor, atau kapasitas.
- Jangan memakai pill untuk harga.

### 2.2 FPS Telemetry Bar (wajib pada kartu Paket PC)

```tsx
<div className="space-y-1">
  <div className="flex items-center justify-between gap-2">
    <span className="text-[11px] text-zinc-400">Valorant</span>
    <span className="font-mono tabular-nums text-xs text-zinc-100">300+ FPS</span>
  </div>
  <div className="h-1.5 bg-zinc-800 overflow-hidden rounded-none">
    <div className="h-full bg-orange-500" style={{ width: '88%' }} />
  </div>
</div>
```

Aturan:
- Track `h-1.5 bg-zinc-800 rounded-none`; isi `bg-orange-500`.
- Angka FPS: `font-mono tabular-nums text-xs`.
- Tampilkan 2–3 game; target resolusi harus eksplisit (1080p/1440p/4K).
- Bar bukan grafik ilmiah: tujuannya perbandingan cepat.

### 2.3 Delta Price Tag (wajib pada Upgrade Paket)

```tsx
// Termasuk paket
<span className="text-xs font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-sm">
  [Termasuk Paket]
</span>

// Tambah biaya
<span className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-sm">
  [+ Rp 650.000]
</span>

// Lebih hemat
<span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-sm">
  [- Rp 250.000]
</span>
```

Aturan:
- Nol delta = `[Termasuk Paket]`, bukan `+ Rp 0`.
- Positif = amber, negatif = emerald.
- Jangan pernah menampilkan `sellPrice`/`costPrice` part di samping tag ini.

### 2.4 Tipografi Angka Mutlak

Semua angka berikut **wajib** memakai `font-mono tabular-nums tracking-tight`:

- Harga dan total paket (`Rp 9.450.000`)
- Selisih harga (`+ Rp 550.000`, `- Rp 200.000`)
- Daya (`450W`, `170W`)
- FPS (`144 FPS`)
- SKU dan nomor resi

Jangan memakai font sans untuk angka teknis. Jangan memakai `tracking-wide`
pada angka panjang karena menghambat pemindaian.

### 2.5 Tombol & Input

```tsx
// CTA utama
<button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-orange-600 px-4 text-xs font-bold text-white transition-colors hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
```

- Tinggi tombol: `h-9` (sekunder) atau `h-10`–`h-11` (utama).
- Input: `rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none`.
- Radius input maksimum `rounded-md`.
- Semua tombol ikon wajib punya `aria-label` atau `title`.

---

## 3. Struktur Halaman

### 3.1 Header Halaman
- Eyebrow mono uppercase 10–11px.
- Judul `text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight`.
- Deskripsi maksimum 2 baris pada mobile.
- Aksi di kanan pada desktop, turun ke bawah pada mobile.

### 3.2 Kartu Paket PC
Wajib memuat, dalam urutan:
1. Tier + resolusi + garansi.
2. Nama paket.
3. 3–4 Hardware Spec Pill.
4. 2–3 FPS Telemetry Bar.
5. Total harga paket (satu-satunya harga).
6. CTA Kustomisasi (orange) + Tokopedia/WA (sesuai konteks).

Tidak boleh ada daftar harga per komponen.

### 3.3 Quick-Upgrade Panel
- Setiap opsi: nama part + delta tag.
- Opsi terpasang ditandai border oranye dan label `[Termasuk Paket]`.
- Total paket diperbarui real-time; jangan menampilkan harga part.
- Mobile: delta tag di baris terpisah dari nama agar tidak terpotong.

### 3.4 Rakit Custom via WhatsApp
- Tidak ada simulator atau halaman configurator.
- CTA racikan memakai `generateCustomBuildWAMessage()` dan membuka WhatsApp.
- Pesan WA hanya berisi nama komponen/kebutuhan, tanpa harga satuan.
- Tombol tetap memakai pola `kss-btn-primary` / `kss-btn-outline` dan ikon pesan.
- Untuk upgrade paket, gunakan Quick-Upgrade Panel dengan delta tag.

---

## 4. Responsif & Aksesibilitas

- Uji minimal pada **390px, 768px, 1024px, 1280px, 1440px**.
- Tidak boleh ada horizontal overflow pada body.
- Strip kategori/filter boleh `overflow-x-auto`, tetapi halaman tidak.
- Target sentuh minimum 36×36px.
- Kontras teks minimal 4.5:1.
- Jangan mengandalkan warna saja: sertakan ikon atau teks status.
- Semua gambar/iframe wajib punya `alt`/`title`.
- Hormati `prefers-reduced-motion`; animasi hanya 150–200ms.

---

## 5. Checklist Sebelum Commit

- [ ] Tidak ada gradient, radius > `md`, atau blur berlebihan.
- [ ] Semua harga/FPS/watt memakai mono tabular-nums.
- [ ] Tidak ada harga satuan part di halaman publik.
- [ ] FPS bar dan delta tag mengikuti pola di atas.
- [ ] Responsif 390–1440 tanpa overflow.
- [ ] `npx tsc --noEmit` bersih.
- [ ] `npm run lint` bersih.
