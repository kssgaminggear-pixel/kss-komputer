# KSS Komputer — Custom PC System Integrator & Service Center

Website resmi KSS Komputer: paket PC rakitan siap pakai, konfigurator custom,
layanan jasa servis/maintenance, konsultasi budget, dan tracking pengerjaan.

Fokus bisnis: **menjual paket rakitan dan jasa**, bukan harga satuan komponen.
Publik hanya melihat **total harga paket** dan **delta upgrade**.

---

## Dokumen Wajib untuk AI Agent

Baca berurutan sebelum menulis kode:

1. **`AGENTS.md`** — identitas bisnis, zero part-price leak, protokol eksekusi.
2. **`UI_FIGCRAFT_SKILL.md`** — kontrak visual industrial.
3. **`DESIGN.md`** — token & pola desain (Vercel/NVIDIA via awesome-design-md).
4. **`ARCHITECTURE.md`** — arsitektur modul dan domain.
5. **`ROADMAP.md`** — fase dan status.

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
npm run test     # Vitest: pricing, compatibility, sanitizer, CS price guard
npm run build
npm run check:price  # pastikan tidak ada nominal modal di bundle client
```

CI menjalankan urutan yang sama lewat `.github/workflows/ci.yml`.

## Deploy

Produksi: <https://kss-komputer-seven.vercel.app>

```bash
vercel deploy --prod --yes
```

## CS Agent 24 Jam

Widget CS di pojok kanan bawah memanggil `/api/cs`, yang meneruskan percakapan
ke 9Router lokal lewat Tailscale Funnel. Harga satuan komponen dilarang muncul:
`sanitizeReply()` di route akan meredaksi setiap nominal rupiah yang bukan total
paket atau harga layanan.

Alur produksi:

```
Browser -> Vercel /api/cs -> https://desktop-kqj59jg.tail588f47.ts.net
        -> scripts/cs-proxy.mjs (127.0.0.1:20129, wajib secret)
        -> 9Router (127.0.0.1:20128) -> combo New-Combo
```

- Proxy hanya mengizinkan `POST /v1/chat/completions` dan `GET /v1/models`.
- Dashboard 9Router tidak ikut terekspos; root Funnel menjawab `401`.
- Widget otomatis disembunyikan bila `/api/cs` melaporkan endpoint tidak siap,
  jadi tidak ada tombol CS mati saat laptop/9Router offline.

Env yang dibutuhkan (lokal di `.env.local`, produksi di Vercel):

| Variabel | Isi |
| --- | --- |
| `NINEROUTER_BASE_URL` | `https://desktop-kqj59jg.tail588f47.ts.net/v1` |
| `NINEROUTER_API_KEY` | secret proxy (bukan API key 9Router) |
| `NINEROUTER_MODEL` | `New-Combo` |
| `NINEROUTER_TUNNEL_SECRET` | secret yang sama, dibaca proxy lokal |

Operasional:

```bash
npm run cs:proxy                      # jalankan proxy manual
tailscale funnel status               # cek tunnel
tailscale funnel --bg 20129           # arahkan Funnel ke proxy
schtasks /Query /TN "KSS CS Proxy"    # cek autostart
```

Autostart proxy terdaftar sebagai scheduled task "KSS CS Proxy" (on logon).
9Router harus tetap berjalan agar CS aktif.

---

## FigCraft

Desain sumber dan cara regenerate ada di `design/figcraft/README.md`.
Skill FigCraft untuk OpenCode ada di `.opencode/skills/figcraft/`.

Aturan: perubahan visual harus mengikuti `UI_FIGCRAFT_SKILL.md`; file
`.figcraft` adalah sumber desain, PNG/SVG adalah hasil ekspor.
