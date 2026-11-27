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
4. **Konsultasi (`/konsultasi`)** — wizard 5 langkah + rekomendasi + WA.
5. **Jasa (`/jasa`, `/jasa/[slug]`)** — katalog layanan, detail, booking WA.
6. **Cek pesanan (`/cek-pesanan`)** — tracking `TRK-KSS-XXX` 9 tahap.
7. **Penawaran (`/penawaran/[code]`)** — surat penawaran resmi, print/PDF.
8. **Katalog pendukung** — `/komponen`, `/komponen/[slug]`, `/aksesoris`.
9. **Tentang kami (`/tentang-kami`)** — profil bengkel, lokasi, garansi, FAQ.

Rakit PC custom tidak memakai simulator. Semua permintaan racikan di luar paket
diarahkan ke teknisi via WhatsApp dengan pesan yang sudah berisi komponen minat.

## Area Internal

- `/admin/pricing` — markup, harga modal, assembly fee, profit paket.
- `/admin/quotes` — quotation studio.

---

## Aturan Harga (Wajib)

- `costPrice`, `sellPrice`, dan alias `price` **tidak boleh** masuk client bundle
  atau halaman publik.
- Data mentah hanya diakses server/admin melalui `server-catalog` /
  `server-pricing` dan DTO `sanitizer.ts`.
- Total paket dan delta upgrade dihitung server-side lewat `server-pricing`,
  bukan dari perhitungan client.
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

Produksi: <https://www.kssgo.com>

Deploy otomatis berjalan dari GitHub Actions setelah job `verify` lulus pada
branch `main`. Tambahkan repository secret `VERCEL_TOKEN` di
**Settings → Secrets and variables → Actions**. Tanpa secret tersebut, job deploy
dilewati dengan notice dan deploy manual tetap bisa dilakukan:

```bash
vercel deploy --prod --yes
```

## Monitoring

- `GET /api/health` — `200` bila katalog, harga paket, dan koneksi CS sehat;
  `503` bila salah satu gagal. Respons tidak memuat harga part atau token.
- Workflow `.github/workflows/uptime.yml` memeriksa endpoint tersebut tiap 15
  menit, membuka issue `[uptime]` saat gagal, dan menutupnya setelah pulih.

## Admin

Area `/admin/*` dilindungi `src/proxy.ts` (Proxy Next 16, pengganti middleware):

- Tanpa sesi valid → redirect ke `/admin/login`.
- Endpoint `/api/admin/*` tanpa sesi → `401`.
- Login dibatasi 5 percobaan / 5 menit per IP.
- Sesi berupa cookie `kss_admin` (HttpOnly, SameSite=Lax, 12 jam) bertanda
  tangan HMAC-SHA256.
- Bila env belum diatur, area admin ditutup total (fail closed).

Env yang dibutuhkan:

| Variabel | Isi |
| --- | --- |
| `ADMIN_PASSWORD` | password login admin |
| `ADMIN_SESSION_SECRET` | string acak panjang untuk menandatangani cookie |

```bash
# lokal
npm run dev   # buka http://localhost:3000/admin/login

# produksi: set kedua env di Vercel, lalu deploy ulang
```

Untuk merotasi kredensial: ganti `ADMIN_PASSWORD` dan/atau
`ADMIN_SESSION_SECRET`, lalu deploy ulang. Semua sesi lama otomatis batal saat
secret berubah.

## CS Agent 24 Jam

Widget CS di pojok kanan bawah memanggil `/api/cs`, yang meneruskan percakapan
ke 9Router lokal lewat Tailscale Funnel. Harga satuan komponen dilarang muncul:
`createStreamGuard()` menahan teks per batas kalimat lalu meredaksi setiap
nominal rupiah yang bukan total paket atau harga layanan, sehingga angka yang
terpotong antar-chunk tetap tidak bisa lolos.

Balasan memakai Server-Sent Events:

- Browser mengirim `{ stream: true }`; route membalas `text/event-stream`.
- Event `delta` berisi potongan teks yang sudah tersanitasi, `done` menutup
  balasan, dan `error` memicu fallback WhatsApp di widget.
- Bila upstream mengembalikan JSON biasa, widget otomatis memakai jalur
  non-streaming sebagai fallback.
- Sanitizer menahan kalimat terakhir sampai stream selesai; ini disengaja agar
  nominal harga part tidak pernah tampil setengah jadi.
- Latensi token pertama ditentukan model 9Router (bisa 10-50 detik untuk
  `New-Combo`), bukan oleh buffering sanitizer.

Alur produksi:

```
Browser -> Vercel /api/cs -> tunnel HTTPS (alamatnya hanya di env, jangan ditulis di repo)
        -> scripts/cs-proxy.mjs (127.0.0.1:20129, wajib secret)
        -> 9Router (127.0.0.1:20128) -> combo New-Combo
```

- Proxy hanya mengizinkan `POST /v1/chat/completions` dan `GET /v1/models`.
- Proxy membatasi ukuran permintaan, `max_tokens`, dan jumlah permintaan per menit
  (`scripts/cs-proxy-lib.mjs`). Setelah mengubahnya, jalankan ulang task "KSS CS Proxy".
- Dashboard 9Router tidak ikut terekspos; root Funnel menjawab `401`.
- Widget otomatis disembunyikan bila `/api/cs` melaporkan endpoint tidak siap,
  jadi tidak ada tombol CS mati saat laptop/9Router offline.

Env yang dibutuhkan (lokal di `.env.local`, produksi di Vercel):

| Variabel | Isi |
| --- | --- |
| `NINEROUTER_BASE_URL` | URL tunnel ke proxy, diakhiri `/v1` (rahasia operasional, jangan ditulis di repo) |
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
Tugas ini tidak punya batas waktu eksekusi, mengulang tiap 5 menit, dan
me-restart otomatis bila proses mati — jadi CS tidak lagi mati setelah 72 jam
seperti batas default Windows. 9Router harus tetap berjalan agar CS aktif.
Status kesehatan bisa dicek di `/api/health`; bila `checks.cs` bukan `ok`,
pastikan 9Router (20128), proxy (20129), dan Funnel Tailscale hidup.

---

## FigCraft

Desain sumber dan cara regenerate ada di `design/figcraft/README.md`.
Skill FigCraft untuk OpenCode ada di `.opencode/skills/figcraft/`.

Aturan: perubahan visual harus mengikuti `UI_FIGCRAFT_SKILL.md`; file
`.figcraft` adalah sumber desain, PNG/SVG adalah hasil ekspor.
