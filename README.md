# KSS Komputer — Custom PC System Integrator & Service Center

Website resmi KSS Komputer: paket PC rakitan siap pakai, konfigurator custom,
layanan jasa servis/maintenance, konsultasi budget, dan tracking pengerjaan.

Fokus bisnis: **menjual paket rakitan dan jasa**, bukan harga satuan komponen.
Publik hanya melihat **total harga paket** dan **delta upgrade**.

---

## Dokumen Wajib untuk AI Agent

Baca berurutan sebelum menulis kode:

1. **`AGENTS.md`** — identitas bisnis, aturan zero part-price leak, protokol
   eksekusi, dan definition of done.
2. **`UI_FIGCRAFT_SKILL.md`** — kontrak visual industrial: surface, tipografi,
   FPS telemetry, delta tag, dan larangan anti-AI-slop.
3. **`ARCHITECTURE.md`** — struktur modul, domain model, alur data harga, dan
   state management.
4. **`ROADMAP.md`** — urutan fase dan status pekerjaan.

Sumber desain native FigCraft ada di `design/figcraft/` (lihat README folder).

---

## Tech Stack

- **Next.js 16** App Router + TypeScript strict + Turbopack
- **Tailwind CSS 4**
- **Zustand** + persist
- **lucide-react**
- **Vercel** untuk deployment

---

## Fitur Publik

1. **Homepage** — hero industrial, featured rig + FPS, paket, jasa, aksesoris,
   perbandingan KSS vs rakit sendiri.
2. **Paket PC (`/paket-rakitan`)** — filter budget/kebutuhan/platform, kartu
   dengan estimasi FPS dan satu harga total.
3. **Detail paket (`/paket-rakitan/[slug]`)** — quick upgrade dengan delta harga
   real-time, FPS benchmark, CTA WhatsApp/Tokopedia.
4. **Simulasi (`/simulasi`)** — 10 slot komponen, validasi kompatibilitas,
   delta pricing tanpa harga satuan, quotation cetak, salin spek, WhatsApp.
5. **Konsultasi (`/konsultasi`)** — wizard 5 langkah + rekomendasi + WA.
6. **Jasa (`/jasa`, `/jasa/[slug]`)** — katalog layanan, detail, booking WA.
7. **Cek pesanan (`/cek-pesanan`)** — tracking `TRK-KSS-XXX` 9 tahap.
8. **Penawaran (`/penawaran/[code]`)** — surat penawaran resmi, print/PDF.
9. **Katalog pendukung** — `/komponen`, `/komponen/[slug]`, `/aksesoris`.
10. **Tentang kami (`/tentang-kami`)** — profil bengkel, lokasi, garansi, FAQ.

## Area Internal

- `/admin/pricing` — markup, harga modal, assembly fee, profit paket.
- `/admin/quotes` — quotation studio.

---

## Aturan Harga (Wajib)

- `costPrice`, `sellPrice`, dan alias `price` **tidak boleh** masuk client bundle
  atau halaman publik.
- Data mentah hanya diakses server/admin melalui `server-catalog` /
  `server-pricing` dan DTO `sanitizer.ts`.
- Estimasi total/delta memakai `POST /api/build/estimate`.
- ESLint memblokir import `mock-data` dari komponen/halaman publik.

---

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build
```

## Deploy

Produksi: <https://kss-komputer-seven.vercel.app>

```bash
vercel deploy --prod --yes
```

---

## FigCraft

Desain sumber dan cara regenerate ada di `design/figcraft/README.md`.
Skill FigCraft untuk OpenCode ada di `.opencode/skills/figcraft/`.

Aturan: perubahan visual harus mengikuti `UI_FIGCRAFT_SKILL.md`; file
`.figcraft` adalah sumber desain, PNG/SVG adalah hasil ekspor.
