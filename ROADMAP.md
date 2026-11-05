# MASTER ROADMAP & EXECUTION CHECKLIST — KSS KOMPUTER (FULL-STACK & PWA EDITION)

Panduan eksekusi bertahap untuk Single-Agent. Setiap menyelesaikan sub-tugas dan memastikan lolos uji TypeScript (`npx tsc --noEmit`) serta validasi skema database, ubah `[ ]` menjadi `[x]`.

**Prinsip Bisnis Utama KSS Komputer:**
1. **Mode Rakitan & Simulasi (Zero Part-Price Leak):** Pada halaman Paket PC Rakitan, Custom PC Configurator, dan Quotation Konsultasi, **DILARANG** menampilkan harga satuan per komponen (`costPrice` maupun `sellPrice` satuan). Yang ditampilkan ke publik hanyalah **Harga Total Paket PC Siap Pakai** dan **Selisih Harga (Delta Price `+ Rp xxx.xxx` / `- Rp xxx.xxx`)** saat pengguna mengganti/meng-upgrade komponen.
2. **Mode Katalog Eceran & Aksesoris:** Komponen lepas dan aksesoris (Monitor, Keyboard, Mouse, Headset, Kursi Gaming, Part Upgrade) dijual di halaman terpisah (`/komponen` & `/aksesoris`) dengan menampilkan **Harga Eceran Resmi (`retailPrice`)** bergaya katalog modern yang lebih rapi dan cepat dibanding Enterkomputer.
3. **Konsultasi Rakitan via WhatsApp & Smart Quotation:** Konsumen dapat berkonsultasi menyebutkan budget dan kebutuhan via WA, lalu Admin dapat meracik spesifikasi di Dashboard dan mengirimkan **Link Penawaran Resmi / File PDF Quotation** berisi daftar spesifikasi lengkap dan 1 Harga Total Paket.

---

## FASE 1: Fondasi Tipe Data, Kalkulator Markup & Data Paket Rakitan
Target: Menyiapkan kontrak TypeScript model bisnis System Integrator + Retail, utilitas format delta price, dan data awal komponen, paket PC jadi, aksesoris, serta layanan jasa.

- [x] **1.1 Buat `src/lib/types.ts`**:
  - Kontrak TypeScript untuk `HardwarePart` (`costPrice`, `sellPrice`, `wattage`, `specs` kompatibilitas), `PrebuiltPC` (paket PC jadi, target resolusi gaming/kerja, estimasi FPS, link Tokopedia), dan `ServicePackage` (layanan jasa).
- [x] **1.2 Buat `src/lib/format.ts`**:
  - Fungsi `formatIDR(amount)`, `formatDeltaIDR(diff)`, link konstan Tokopedia `https://tk.tokopedia.com/ZSpeToWkH/`, dan generator pesan checkout WhatsApp berisi rincian spesifikasi rakitan tanpa harga satuan per part.
- [x] **1.3 Buat `src/lib/mock-data.ts`**:
  - 45+ komponen hardware nyata di pasar Indonesia, 6 Paket PC Rakitan Siap Pakai, dan 4 Layanan Jasa KSS Komputer.
- [x] **1.4 Ekspansi Tipe Data Eceran & Quotation Konsultasi (`src/lib/types.ts` & `src/lib/format.ts`)**:
  - Tambahkan properti `retailPrice` dan `isRetailAvailable: boolean` pada `HardwarePart`, serta tipe `AccessoryItem` (Keyboard, Mouse, Headset, Monitor, Webcam, Kursi Gaming, UPS).
  - Tambahkan kontrak `ConsultationQuote` (`quoteCode`, `customerName`, `customerWa`, `budget`, `usageNeed`, `selectedParts`, `finalBundlePrice`, `validUntil`, `status`).
  - Tambahkan fungsi `generateConsultationWAMessage(payload)` untuk menghasilkan format chat WA otomatis saat konsumen meminta rekomendasi rakitan sesuai budget.

---

## FASE 2: Compatibility Engine & Zustand State (Builder, Cart & Markup Store)
Target: Membangun mesin validasi kompatibilitas, perhitungan delta price, keranjang eceran, dan state management builder & admin pricing.

- [x] **2.1 Buat `src/lib/compatibility.ts`**:
  - Validasi socket, RAM, form factor, dimensi GPU, peringatan BIOS, kalkulasi total Watt, dan fungsi `calculateBundleTotal(parts, assemblyFee, globalMarkupPercent)`.
- [x] **2.2 Buat `src/store/useBuilderStore.ts`**:
  - Menyimpan komponen rakitan aktif, fungsi `loadPrebuilt(pkg)`, `selectPart(slot, part)`, `getDeltaPrice(slot, candidatePart)`, serta perhitungan total harga bundel otomatis (persist di `localStorage`).
- [ ] **2.3 Buat `src/store/useAdminStore.ts`**:
  - Menyimpan pengaturan global markup (`globalMarkupPercent`), `defaultAssemblyFee`, serta kemampuan mengedit modal (`costPrice`), harga bundel (`sellPrice`), dan harga eceran (`retailPrice`) *(Catatan: overrides untuk `retailPrice` belum diintegrasikan)*.
- [x] **2.4 Buat `src/store/useRetailCartStore.ts` & `src/store/useQuoteStore.ts`**:
  - `useRetailCartStore`: State keranjang belanja khusus pembelian komponen eceran & aksesoris (menampilkan harga satuan & subtotal normal) dengan fitur Checkout via WA / Tokopedia.
  - `useQuoteStore`: State untuk menyimpan daftar Surat Penawaran (Quotation) hasil konsultasi WA yang dibuat oleh Admin.

---

## FASE 3: Layout Global Modern (Enterkomputer Reimagined), PWA & Homepage Konversi Tinggi
Target: Antarmuka berdensitas tinggi namun modern (Bento Grid & Sticky Mobile Bar), dukungan install aplikasi (PWA), dan navigasi terintegrasi ke Tokopedia & WA.

- [x] **3.1 Buat `src/components/layout/Navbar.tsx`, `BottomNav.tsx` (Mobile) & `Footer.tsx`**:
  - Navigasi utama berisi pintasan ke **Paket PC Rakitan**, **Simulasi & Konsultasi Rakitan**, **Komponen & Aksesoris**, **Layanan Jasa**, Global Search Bar cepat, badge ringkasan harga rakitan aktif, keranjang eceran, dan tombol resmi **Tokopedia (`https://tk.tokopedia.com/ZSpeToWkH/`)**.
  - `BottomNav.tsx`: Navigasi bawah khusus layar mobile agar terasa seperti native app.
  - Buat `public/manifest.json` dan metadata viewport agar web berjalan sebagai **PWA (Progressive Web App)** yang bisa di-install di Android/iOS.
- [x] **3.2 Buat `src/app/page.tsx` (High-Conversion Homepage)**:
  - Hero Banner interaktif dengan 2 CTA utama: **"Pilih Paket PC Siap Pakai"** & **"Konsultasi Rakitan Sesuai Budget (WA)"**.
  - Quick Filter berdasarkan kebutuhan (*Gaming 1080p*, *Gaming 1440p*, *Editing & Render*, *Office & Kasir*) dan rentang budget (*5 Jutaan*, *7–10 Juta*, *10–15 Juta*, *>20 Juta*).
  - Grid **Paket PC Rakitan Terlaris** lengkap dengan daftar spek inti (tanpa harga satuan part), bar estimasi FPS (Valorant, Cyberpunk 2077, GTA V), **Total Harga Paket Jadi**, tombol **Ubah/Upgrade Spek**, dan tombol **Beli via Tokopedia / WA**.
  - Seksi **Aksesoris & Gear Pilihan** serta **Keunggulan KSS Komputer** (Garansi Resmi, Stress-Tested sebelum kirim, Cable Management Rapi, Packing Kayu Aman).

---

## FASE 4: Katalog Paket Rakitan & Halaman Detail Quick-Upgrade
Target: Menampilkan katalog PC rakitan siap pakai dan pengalaman upgrade spek instan yang hanya menampilkan selisih harga (Delta Price).

- [x] **4.1 Buat `src/app/paket-rakitan/page.tsx`**:
  - Katalog seluruh PC Rakitan Jadi dengan filter budget, filter platform (`AMD Ryzen` vs `Intel Core`), filter kegunaan, dan pengurutan harga total.
- [x] **4.2 Buat `src/app/paket-rakitan/[slug]/page.tsx`**:
  - Menampilkan foto rig, daftar lengkap komponen yang terpasang (**tanpa harga satuan per part**), dan estimasi performa game/render.
  - Fitur **Quick Spec Upgrader**: Konsumen bisa langsung mengganti opsi RAM (misal 16GB ke 32GB), SSD (512GB ke 1TB), VGA, atau Casing dari daftar part kompatibel, melihat badge selisih harga (`+ Rp xxx.xxx` / `- Rp xxx.xxx`), dan melihat **Total Harga Paket** ter-update otomatis.
  - Tombol **Pesan Paket Ini via WhatsApp**, **Beli di Tokopedia**, dan **Buka di Custom Configurator**.

---

## FASE 5: Custom PC Configurator & Form Konsultasi WA (`/simulasi`)
Target: Pengalaman merakit PC impian tanpa membocorkan modal/harga eceran per part, ditambah jalur cepat konsultasi budget untuk konsumen awam.

- [x] **5.1 Buat `src/app/simulasi/page.tsx` (Dual-Mode: Custom Builder & Konsultasi Budget)**:
  - **Tab 1: Custom PC Configurator**:
    - Menampilkan baris slot (`Processor`, `Motherboard`, `Cooler`, `RAM`, `SSD NVMe`, `HDD`, `VGA / GPU`, `PSU`, `Casing`, `Monitor`).
    - Drawer pemilih komponen otomatis memfilter hanya komponen yang kompatibel dan hanya menampilkan badge **Delta Price (`+ Rp xxx.xxx` / `- Rp xxx.xxx`)**—bukan harga satuan part.
    - Sticky Telemetry Bar yang menampilkan: Status `100% Kompatibel`, Estimasi Daya (`Watt`), dan **Total Harga Rakitan Jadi** (sudah termasuk markup & jasa rakit).
    - Tombol **Cetak Penawaran Resmi (Print/PDF View)**, **Salin Spek**, **Konsultasi Spek Ini via WA**, dan **Request Link Tokopedia**.
  - **Tab 2: Form Konsultasi Rakitan by Budget (Via WA)**:
    - Form interaktif bagi konsumen yang bingung memilih part: Input Nama, Slider/Input Budget (Rp), Pilihan Kebutuhan Utama (Gaming/Editing/Streaming/Office), Preferensi Brand (AMD/Intel/Nvidia/Bebas), dan Catatan Tambahan.
    - Tombol **"Kirim Kebutuhan ke WhatsApp Teknisi KSS"** yang otomatis menyusun pesan konsultasi terstruktur.

---

## FASE 6: Katalog Komponen Eceran & Aksesoris Modern (`/komponen` & `/aksesoris`)
Target: Menjual komponen lepas dan aksesoris komputer dengan tampilan katalog cepat & modern (penyempurnaan tabel Enterkomputer) yang menampilkan harga satuan eceran.

- [x] **6.1 Buat `src/app/komponen/page.tsx` & `src/app/aksesoris/page.tsx`**:
  - Tampilan *Dual-View* (Bento Grid & Compact High-Density Table ala Enterkomputer versi modern) dengan pencarian instan (*instant search*), filter kategori (`VGA`, `Processor`, `Motherboard`, `RAM`, `SSD`, `Monitor`, `Keyboard`, `Mouse`, `Headset`, `Kursi Gaming`), dan filter brand.
  - Berbeda dengan halaman rakitan, halaman ini menampilkan **Harga Eceran Resmi (`retailPrice`)**, badge status stok (*Ready Stock* / *Tanya Stok*), tombol **+ Keranjang**, dan tombol **Beli via WA / Tokopedia**.
- [x] **6.2 Buat Drawer Keranjang Eceran (`src/components/cart/RetailCartDrawer.tsx`)**:
  - Menampilkan daftar aksesoris/komponen eceran yang dipilih beserta subtotal dan tombol **Checkout Pesanan Eceran ke WhatsApp**.

---

## FASE 7: Layanan Jasa (`/jasa`), Admin Quotation Generator & Panel Pricing (`/admin`)
Target: Menawarkan jasa service profesional serta memberikan alat bagi Admin untuk merespons chat konsultasi WA dengan Surat Penawaran (Quotation) resmi dan kontrol harga penuh.

- [x] **7.1 Buat `src/app/jasa/page.tsx`**:
  - Katalog layanan jasa rakit, maintenance, deep cleaning, repaste thermal, dan upgrade PC dengan estimasi biaya jasa transparan dan tombol booking jadwal via WhatsApp.
- [ ] **7.2 Buat Admin Pricing & Markup Panel (`src/app/admin/pricing/page.tsx`)**:
  - Panel bergaya spreadsheet untuk pemilik KSS Komputer guna mengatur `costPrice` (modal), `sellPrice` (harga bundel rakitan), `retailPrice` (harga jual eceran), persentase `Markup (%)`, `Biaya Rakit`, melihat estimasi profit per paket rakitan, dan fitur **Export/Import JSON/CSV** *(Catatan: input `retailPrice`, fitur Import JSON/CSV, dan kalkulasi profit per paket PC belum ada di UI)*.
- [x] **7.3 Buat Admin WA Consultation Quotation Maker (`src/app/admin/quotes/page.tsx`) & Halaman Cetak Penawaran (`src/app/penawaran/[code]/page.tsx`)**:
  - Ketika konsumen chat di WA meminta rakitan budget tertentu, Admin membuka `/admin/quotes`, memasukkan Nama Konsumen, No WA, memilih komponen rakitan dengan melihat harga modal asli + profit margin, dan menetapkan **Harga Final Paket Penawaran**.
  - Menghasilkan **Halaman Surat Penawaran Resmi (`/penawaran/[code]`)** siap cetak (Print-to-PDF) dan siap dikirim balik ke WA konsumen, yang berisi kop KSS Komputer, tabel spesifikasi lengkap **TANPA harga per part**, **1 Total Harga Penawaran**, masa berlaku penawaran, serta tombol konfirmasi pesanan ke WA/Tokopedia.

---

## FASE 8: Migrasi Database Produksi (PostgreSQL + Prisma ORM) & Server Security
Target: Memindahkan penyimpanan dari `mock-data.ts` / `localStorage` ke database relasional yang aman agar harga modal (`costPrice`) dan harga per part rakitan tidak pernah bocor di Network Inspector browser.

- [ ] **8.1 Setup Prisma & Skema PostgreSQL (`prisma/schema.prisma`)**:
  - Buat skema tabel `HardwarePart`, `PrebuiltPC`, `PrebuiltPCItem`, `Accessory`, `ServicePackage`, `ConsultationQuote`, dan `AdminSetting`.
  - Buat script `prisma/seed.ts` untuk memigrasikan seluruh data awal dari `src/lib/mock-data.ts` ke database *(Catatan: file schema & seed baru berupa draft; paket `@prisma/client` & `prisma` belum terinstall di package.json dan belum ada koneksi database aktif)*.
- [ ] **8.2 Buat Server Actions / Data Sanitizer (`src/lib/server-dto.ts`)**:
  - Pastikan semua *fetch* data untuk halaman publik (`/paket-rakitan`, `/simulasi`, `/penawaran/[code]`) membuang properti `costPrice` dan harga komponen individual di sisi server sebelum dikirim ke client *(Catatan: Server Actions belum dibuat dan `server-dto.ts` belum dihubungkan ke UI publik; halaman masih mengimpor mock-data secara client-side)*.
