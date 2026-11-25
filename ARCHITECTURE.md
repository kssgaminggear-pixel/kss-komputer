# ARCHITECTURE.md — KSS Komputer

Dokumen ini menjelaskan arsitektur target KSS Komputer sebagai **Custom PC System
Integrator & Pusat Layanan Jasa Komputer**. Fokus utama: paket rakitan jadi,
upgrade berbasis delta, dan layanan jasa — bukan penjualan komponen lepasan.

---

## 1. Prinsip Arsitektur

1. **Satu harga untuk satu paket.** Publik hanya melihat total harga paket.
2. **Delta, bukan harga part.** Upgrade ditampilkan sebagai selisih harga.
3. **Server sebagai pemegang harga.** `costPrice`/`sellPrice` tidak pernah masuk
   bundle client.
4. **Kompatibilitas deterministik.** Aturan socket, RAM, form factor, clearance,
   dan PSU dihitung dari spesifikasi, bukan tebakan.
5. **UI industrial high-craft.** Semua komponen mengikuti
   `UI_FIGCRAFT_SKILL.md`.

---

## 2. Stack

| Lapisan | Teknologi |
|---|---|
| Framework | Next.js 16 App Router (Turbopack, Cache Components) |
| Bahasa | TypeScript strict |
| Styling | Tailwind CSS 4 |
| State | Zustand + persist |
| Ikon | lucide-react |
| Deploy | Vercel (`https://kss-komputer-seven.vercel.app`) |

Dependensi wajib: `next`, `react`, `react-dom`, `zustand`, `lucide-react`,
`tailwindcss`.

---

## 3. Batas Bisnis: Zero Part-Price Leak

### 3.1 Yang boleh tampil publik

- Total harga paket rakitan.
- Delta upgrade (`+ Rp`, `- Rp`, `[Termasuk Paket]`).
- Harga layanan jasa (`priceStartFrom`).
- Biaya rakit/assembly fee bila relevan.

### 3.2 Yang dilarang tampil publik

- `costPrice` (modal distributor).
- `sellPrice` (harga jual internal part).
- Alias `price` per komponen.
- Perhitungan harga yang membaca `sellPrice` di client.

### 3.3 Alur data

```text
mock-data / database (costPrice, sellPrice)
        │
        ├── admin (useAdminStore, /admin/pricing)  → boleh melihat modal
        │
        └── server-catalog / server-pricing
                 │ sanitize + hitung total/delta
                 ▼
          DTO publik (tanpa harga part)
                 │
                 ▼
          Server Component → props → Client Component
```

Rakit custom ditangani langsung oleh teknisi via WhatsApp. Tidak ada route
estimasi publik: total paket dan delta upgrade dihitung server-side oleh
`server-pricing`, lalu dikirim sebagai DTO tersanitasi.

---

## 4. Struktur Direktori

```text
src/
├── app/
│   ├── page.tsx                 # Homepage retail-industrial
│   ├── paket-rakitan/           # Katalog + detail quick-upgrade
│   ├── jasa/                    # Katalog + detail layanan
│   ├── konsultasi/              # Wizard budget
│   ├── komponen/                # Katalog pendukung (retailPrice)
│   ├── aksesoris/               # Katalog pendukung
│   ├── cek-pesanan/             # Tracking
│   ├── penawaran/[code]/        # Surat penawaran
│   ├── tentang-kami/
│   ├── admin/pricing/           # Markup & profit (modal terlihat)
├── components/
│   ├── layout/                  # Navbar, Footer, BottomNav
│   ├── prebuilt/                # Kartu paket + FPS telemetry
│   ├── catalog/                 # Filter & baris katalog
│   ├── service/                 # Booking form
│   └── ui/                      # PageHeader, SectionHeader
├── lib/
│   ├── types.ts                 # Kontrak domain
│   ├── mock-data.ts             # Katalog internal + paket + jasa
│   ├── compatibility.ts         # Validasi + total + delta
│   ├── format.ts                # Rupiah, delta, WhatsApp
│   ├── sanitizer.ts             # DTO publik
│   ├── server-catalog.ts        # Akses data server-only
│   └── server-pricing.ts        # Estimasi total/delta server-only
└── store/
    ├── useAdminStore.ts         # Markup, modal, paket kustom
    ├── useCartStore.ts
    ├── useRetailCartStore.ts
    └── useQuoteStore.ts
```

---

## 5. Domain Model

### 5.1 `HardwarePart`

Menyimpan identitas komponen, `costPrice`, `sellPrice`, `wattage`, `stockStatus`,
dan `specs` (socket, RAM type, form factor, dimensi GPU/cooler, VRAM, PSU).

- Hanya dipakai internal/admin.
- Tidak boleh dikirim langsung ke client.

### 5.2 `PrebuiltPackage`

Kontrak paket rakitan jadi:

- `tier`: Office & Kasir, E-Sports 1080p, AAA 1080p Ultra, Creator & 1440p,
  Workstation & 4K.
- `parts`: referensi `partId` + quantity.
- `assemblyFee`, `customTotalOverride`.
- `fpsBenchmarks`: game, resolusi, FPS, settings.
- `tokopediaUrl`, `highlights`.

### 5.3 `ComputerService`

Kontrak layanan jasa:

- `category`: rakit, upgrade, cleaning, konsultasi.
- `priceStartFrom`, `durationEstimate`, `features`, `warrantyInfo`.

### 5.4 Kompatibilitas & Delta

`validateBuild()` menerima `BuildSelections` atau `HardwarePart[]` dan
mengembalikan laporan:

- error/warning socket, RAM, form factor, clearance, BIOS, PSU;
- total wattage;
- rekomendasi PSU (`totalWattage × 1.35`, dibulatkan ke 50W).

`calculatePackageTotal(parts, assemblyFee, markup)` menghitung harga jual paket.
`calculatePartDelta(current, candidate, markup)` menghitung selisih upgrade.
Keduanya **server/admin-only** karena memakai `sellPrice`/`costPrice`.

---

## 6. State Management

### 6.1 Rakit Custom via WhatsApp

- Tidak ada state konfigurator di client dan tidak ada route simulasi.
- Paket siap pakai hanya membawa total harga + opsi delta upgrade.
- Permintaan racikan di luar paket diarahkan ke WhatsApp
  (`generateCustomBuildWAMessage`) dengan daftar komponen tanpa harga satuan.
- Teknisi menyusun kompatibilitas, ketersediaan stok, dan total paket di server.

### 6.2 `useAdminStore`

- `globalMarkupPercent`, `defaultAssemblyFee`, `tokopediaStoreUrl`.
- Override `costPrice`/`sellPrice` per part.
- Profit paket (`calculatePackageProfit`, `calculatePackageProfitV2`).
- Paket kustom (`customPackages`, `upsertPackage`, `deletePackage`,
  `getMergedPackages`).

---

## 7. UI System

- Semua aturan visual ada di `UI_FIGCRAFT_SKILL.md`.
- Palet: zinc surface, orange CTA, emerald status/WA, Tokopedia green.
- Angka wajib `font-mono tabular-nums tracking-tight`.
- FPS telemetry bar pada setiap kartu paket.
- Delta tag pada setiap opsi upgrade.
- Tidak ada gradient, radius > `md`, blur berlebihan, atau hero kosong.

---

## 8. Keamanan & Kualitas

- ESLint `no-restricted-imports` melarang `mock-data`, `server-catalog`, dan
  `server-pricing` di komponen client.
- Halaman publik hanya menerima DTO tersanitasi.
- `npx tsc --noEmit`, `npm run lint`, dan `npm run build` wajib lulus.
- Uji responsif 390–1440px tanpa horizontal overflow.

---

## 9. Catatan Migrasi

Kontrak v2 (`PrebuiltPackage`, `ComputerService`) ditambahkan berdampingan dengan
tipe lama (`PrebuiltPC`, `ServicePackage`) agar halaman yang sudah live tidak
rusak. Fase 3–6 memigrasikan UI ke kontrak v2, setelah itu tipe lama dapat
dihapus.
