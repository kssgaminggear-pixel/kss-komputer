# Changelog

Semua perubahan penting KSS Komputer dicatat di sini. Format mengikuti
[Keep a Changelog 1.1.0](https://keepachangelog.com/id-ID/1.1.0/) dan
[Semantic Versioning 2.0.0](https://semver.org/lang/id/).

<!--
ATURAN UNTUK SEMUA AGENT (baca sebelum menulis entri)
1. Tulis di bagian [Unreleased] pada commit/PR yang sama dengan perubahannya.
2. Kategori, urutan tetap: Added, Changed, Fixed, Removed, Security, Docs/Infra.
   Hapus kategori kosong. Jangan membuat kategori baru.
3. Satu baris per perubahan, bahasa Indonesia, kalimat aktif, sentence case,
   akhiri dengan nomor PR bila ada, mis. "(#14)". Jangan menyalin pesan commit mentah.
4. Fokus dampak bagi pengguna/pemilik, bukan nama file. Nama file hanya bila perlu.
5. Security: tulis hanya celah yang SUDAH diperbaiki, secara umum. Jangan tulis celah
   yang belum diperbaiki, hostname/port/nama secret, token, harga modal, atau data pribadi.
6. Jangan menulis harga satuan part atau selisih upgrade sebagai contoh.
7. Rilis: pindahkan isi [Unreleased] ke "## [x.y.z] - YYYY-MM-DD" hanya saat pemilik
   menyetujui rilis dan tag git dibuat. Pra-1.0: fitur = minor, perbaikan = patch.
-->

> **Catatan rekonstruksi.** Repo belum punya tag git maupun rilis resmi;
> `package.json` tetap `0.1.0`. Nomor 0.1.0–0.7.0 di bawah adalah **rekonstruksi**
> dari `git log` per 2026-11-28, dikelompokkan per tonggak kerja, dan tidak
> mewakili tag yang pernah dibuat. Tanggal = tanggal commit terakhir dalam kelompok.

## [Unreleased]

### Docs/Infra

- Tambah aturan multi-agent (Opus/Sonnet/Haiku), arah desain visual-first dominan
  gambar, dan struktur kerja wajib (changelog, checklist roadmap, uji visual
  Playwright/Mobile MCP) ke `CLAUDE.md`.
- Susun ulang `ROADMAP.md` menjadi v4: rekam jejak Fase 1–12 dicocokkan dengan kode,
  audit visual per route, Pilar V redesign web visual-first (MVP Go-Live) dengan
  metode ukur rasio visual, fondasi platform, integrasi web + aplikasi HP (Expo),
  scale-up, dan keputusan pemilik.
- Tambah `docs/ASSET_PLAN.md`: inventaris gambar, aturan sumber, pipeline `next/image`,
  fallback, daftar kebutuhan gambar per slot, dan prompt ilustrasi Google Flow.
- Buat `CHANGELOG.md` dengan riwayat versi rekonstruksi dari `git log`.

## [0.7.0] - 2026-11-28

### Changed

- Toko memakai harga normal toko, bukan harga diskon Tokopedia (#10).
- Pembayaran diarahkan ke WhatsApp dan transfer bank manual, dengan info pembayaran
  di keranjang, detail paket, dan penawaran (#11).
- Detail paket hanya menampilkan total harga PC; selisih per komponen tidak lagi
  ditampilkan (#13).

### Removed

- Format selisih harga upgrade dari utilitas publik (#13).

### Security

- Perkuat proxy CS (batas ukuran permintaan, jumlah token, dan laju) dan hapus detail
  infrastruktur dari README (#12).

## [0.6.0] - 2026-11-27

### Added

- Redesign visual v2 "Lembar spesifikasi bengkel": token baru, skala tipografi,
  sistem tombol/tag, radius maks 6 px, komponen `Price` (#1).
- Toko (marketplace sendiri) dari katalog Tokopedia KSS: `/toko`, detail produk,
  etalase, keranjang eceran, banner promo, validator data (#7).
- Sinkron harian katalog Toko dengan ambang pengaman dan laporan perubahan (#8).
- Scraper katalog toko sendiri untuk riset data, dijalankan pemilik (#4, #5).

### Changed

- Halaman sisa disapu ke gaya v2: ukuran teks minimum 11 px, tombol WhatsApp ink,
  ikon `Sparkles` diganti (#2).
- `/komponen`, `/aksesoris`, `/katalog`, dan `/produk/*` dialihkan permanen ke `/toko` (#7).
- Data Toko disinkronkan 2026-11-27 (#9).

### Removed

- Katalog komponen ber-harga satuan, filter sidebar, perbandingan, dan keranjang
  komponen lama (#6).

### Security

- Hapus harga satuan komponen dari seluruh data publik dan perketat price guard (#6).

## [0.5.0] - 2026-11-27

### Added

- Endpoint `GET /api/health`, monitor uptime terjadwal, dan auto-deploy produksi
  yang menunggu verifikasi CI.

### Changed

- Rakit PC custom diarahkan ke WhatsApp; simulator PC dihapus dan `/simulasi`
  dialihkan ke `/paket-rakitan`.

### Fixed

- Kontras teks dinaikkan dan kontrol form diberi label (aksesibilitas).
- Proxy CS tetap hidup melewati batas waktu tugas terjadwal; komentar uptime ganda
  dihilangkan.

### Docs/Infra

- Roadmap menandai monitoring dan auto-deploy selesai.

## [0.4.0] - 2026-11-22

### Added

- CS agent 24 jam di widget situs, dengan cek ketersediaan endpoint sebelum tampil.
- Balasan CS di-stream (SSE) dengan sanitasi harga per kalimat.
- Structured data (JSON-LD), sitemap, dan guard kebocoran harga di bundle.

### Fixed

- Nomor WhatsApp asli KSS dipakai di seluruh situs.

### Security

- Portal admin dikunci dengan sesi bertanda tangan.
- CS dilayani lewat proxy sempit yang hanya meneruskan endpoint yang diperlukan.

## [0.3.0] - 2026-11-16

### Added

- Domain v2 paket/jasa, mesin harga server, dan store pendukung.
- Halaman detail jasa, wizard konsultasi, detail komponen, tentang kami, dan
  `/cek-pesanan`.
- Lapisan data lengkap: tipe, data contoh, generator pesan WhatsApp, konstanta.
- Foto produk dan banner resmi dari toko Tokopedia KSS; hero foto; logo resmi KSS.
- Integrasi FigCraft (sumber desain native) dan `DESIGN.md`.

### Changed

- Redesign industrial oranye dengan hero taktis dan telemetri FPS; penyegaran
  responsif seluruh halaman publik; pola "AI slop" dihapus.
- Navbar/bottom nav ditata ulang mengikuti urutan menu baru.

### Fixed

- Status 404 dipertahankan pada halaman detail dinamis.
- Hasil pencarian menunjuk ke route komponen yang benar.
- Lint bersih, tautan footer diperbaiki.

### Security

- Kebocoran harga per part dari bundle publik ditutup, termasuk fallback `sellPrice`
  di helper kompatibilitas bersama.

### Docs/Infra

- README dan roadmap diselaraskan dengan kondisi deploy saat itu.

## [0.2.0] - 2026-11-15

### Changed

- Arah bisnis berpindah ke service-first: jasa rakit & servis jadi identitas utama,
  katalog eceran jadi pendukung.

### Docs/Infra

- Roadmap dirombak beberapa kali (v1 blueprint produksi, v2 checklist berbasis audit,
  v3 service-first).
- Aturan CI/CD dan deploy diperketat; workspace disinkronkan.

## [0.1.0] - 2026-11-03

### Added

- Inisialisasi Next.js 16 (App Router, TypeScript strict, Tailwind 4) dan dokumen
  arsitektur serta aturan proyek.
- Tipe inti, utilitas format, data contoh, dan dependensi dasar.
- Mesin validasi rakitan PC, store Zustand (builder, compare, cart) dengan persistensi.
- Spec badge, command search, navbar/footer/cart drawer, beranda padat informasi.
- Katalog dengan filter sidebar dan daftar harga produk (kemudian diganti di 0.6.0).

### Changed

- Beralih ke mode single-agent dan memperbarui arsitektur bisnis.

[Unreleased]: https://github.com/kssgaminggear-pixel/kss-komputer/compare/9acb5f9...HEAD
