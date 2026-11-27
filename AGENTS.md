# AGENTS.md — Instruksi Utama OpenCode untuk KSS Komputer

> Dokumen ini adalah instruksi utama untuk seluruh pekerjaan di repositori ini.
> Baca juga `UI_FIGCRAFT_SKILL.md` dan `DESIGN.md` sebelum menulis komponen UI apa pun.

## 1. Identitas Bisnis KSS Komputer

KSS Komputer adalah **Custom PC System Integrator & Pusat Layanan Jasa Komputer**.

- Toko resmi Tokopedia: <https://www.tokopedia.com/ksskomputer>
- Lokasi: Mangga Dua Mall, Jakarta
- Fokus: paket PC rakitan jadi, upgrade terukur, dan jasa servis/maintenance.

### 1.1 Aturan Harga Mutlak (Zero Part-Price Leak)

**DILARANG menampilkan harga satuan komponen yang menjadi bagian paket rakitan**
(CPU, motherboard, RAM, VGA, SSD, PSU, casing, cooler) — di halaman, HTML,
payload RSC, JSON, maupun bundle client. `PublicHardwarePart` tidak membawa field
harga apa pun.

Yang boleh tampil di publik hanya:

1. **Total Harga Paket Rakitan Jadi** — satu angka untuk seluruh unit.
2. **Selisih harga upgrade** (`+ Rp xxx.xxx`, `- Rp xxx.xxx`, atau
   `[Termasuk Paket]`) saat komponen diganti.
3. Harga layanan jasa (`priceStartFrom`) dan biaya rakit.
4. Harga produk eceran **Toko** (`/toko` dan section "Terlaris di toko" di
   beranda) yang bersumber dari listing Tokopedia resmi KSS
   (`data/marketplace/products.json`, field `priceIdr`). Data ini terpisah total
   dari `mock-data.ts`; dilarang menautkan atau menggabungkannya dengan komponen
   paket.

`costPrice`, `sellPrice`, dan `retailPrice` hanya untuk admin/server. Akses data
mentah wajib melewati modul server-only (`server-catalog`, `server-pricing`) dan
DTO tersanitasi. Guard: `npm run check:price`.

### 1.2 Model Penjualan

- Paket PC dijual sebagai satu unit siap pakai, termasuk rakit, cable management,
  stress test, dan garansi toko.
- Upgrade dihitung sebagai delta terhadap komponen bawaan paket.
- Jasa dijual per layanan, bukan per komponen.
- Checkout resmi diarahkan ke Tokopedia atau WhatsApp; tidak ada pembayaran
  langsung di aplikasi.

## 2. Protokol Eksekusi OpenCode

1. **Single-agent direct execution.** Jangan membuat atau memanggil sub-agent.
   Semua perintah terminal, penulisan file, dan perbaikan dilakukan langsung.
2. **Selalu baca `UI_FIGCRAFT_SKILL.md` dan `DESIGN.md`** sebelum menulis atau mengubah `.tsx`.
3. **Dilarang menulis placeholder** seperti `// TODO`, komponen kosong, atau
   handler palsu. Implementasi harus utuh dan bisa diklik.
4. **Type safety dulu.** Setiap selesai satu fase:
   - jalankan `npx tsc --noEmit`;
   - jalankan `npm run lint`;
   - perbaiki semua error sebelum melanjutkan;
   - centang item `[x]` di `ROADMAP.md`;
   - `git add .`, `git commit -m "..."`, lalu `git push`.
5. **Jangan mengubah data harga tanpa alasan bisnis.** Jika mengubah
   `costPrice`/`sellPrice`, jelaskan dampaknya pada total paket.
6. **Jangan menghapus komponen publik yang sedang dipakai** tanpa mengganti
   fungsinya pada commit yang sama.
7. **Verifikasi build** dengan `npm run build` untuk perubahan yang menyentuh
   route, Server Component, atau konfigurasi Next.js.
8. **Responsif wajib.** Uji 390px sampai 1440px; tidak boleh ada horizontal
   overflow pada body.

## 3. Peta Arsitektur

- `src/lib/types.ts` — kontrak domain (`HardwarePart`, `PrebuiltPackage`,
  `ComputerService`, dll.).
- `src/lib/mock-data.ts` — katalog internal, paket, dan layanan. Harga modal
  hanya boleh dipakai server/admin.
- `src/lib/compatibility.ts` — validasi rakitan, total paket, delta harga.
- `src/lib/format.ts` — format Rupiah, delta, generator pesan WhatsApp.
- `src/store/useAdminStore.ts` — markup, harga modal, paket kustom, profit.
- `src/app/(public)` atau route publik — hanya menerima DTO tersanitasi.
- `src/app/admin/*` — satu-satunya area yang boleh melihat harga modal.

Detail lengkap: `ARCHITECTURE.md`. Design token: `DESIGN.md`. Urutan pekerjaan: `ROADMAP.md`.

### 3.1 FigCraft & Design Sources

- Skill FigCraft terpasang di `.opencode/skills/figcraft/`.
- Sumber desain native ada di `design/figcraft/` (`.figcraft`, skrip JSON,
  PNG/SVG, dan kode React+Tailwind hasil Developer Mode).
- Gunakan `figcraft-cli` 0.18.1 untuk membuat/mengekspor desain. Jangan commit
  binary CLI.
- Semua hasil desain tetap harus dipetakan ke `UI_FIGCRAFT_SKILL.md`; jangan
  menyalin hex/px mentah tanpa alasan.

## 4. Gaya Kode

- TypeScript strict; hindari `any` kecuali di boundary parsing dan beri komentar.
- Server Component sebagai default; `'use client'` hanya untuk interaksi.
- Jangan memakai `export const dynamic = 'force-dynamic'`.
- Jangan memanggil `new Date()` di module scope pada halaman yang diprerender.
- Gunakan `font-mono tabular-nums tracking-tight` untuk semua angka teknis.
- Harga publik tidak boleh berasal dari perhitungan client-side yang membaca
  `sellPrice`.

## 5. Definition of Done

- `npx tsc --noEmit` = 0 error.
- `npm run lint` = 0 error.
- `npm run build` sukses.
- Tidak ada harga satuan part di bundle/HTML publik.
- UI mengikuti `UI_FIGCRAFT_SKILL.md` dan `DESIGN.md`.
- `ROADMAP.md` diperbarui dan commit sudah di-push.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
