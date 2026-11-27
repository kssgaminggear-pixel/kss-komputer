# Playbook sinkron katalog Toko

Memperbarui `data/marketplace/*` dan `public/images/marketplace/*` dari toko Tokopedia KSS.
Seluruh langkah dikerjakan `scripts/sync/run.mjs`. Hydrogen hanya merapikan teks deskripsi;
harga, takedown, dan merge tidak pernah diputuskan model. Jangan menyunting JSON dengan tangan.

## Menjalankan

| Perintah | Isi |
|---|---|
| `npm run sync:marketplace` | kumpulkan, terapkan, tes lokal, PR, merge bila aman, cek situs |
| `npm run sync:marketplace -- --no-publish` | kumpulkan dan terapkan, tanpa git |
| `npm run sync:marketplace -- --dry-run` | laporan saja dari snapshot terakhir, tanpa jaringan |

Syarat: repo di branch `main` tanpa perubahan lokal, `gh auth status` aktif, Chrome terpasang,
dan `tools/tokopedia-scraper` sudah `npm install`. Hasil: `scripts/sync/.out/report.md` dan
`run-result.json`.

## Jadwal (dibuat pemilik, sekali)

```powershell
schtasks /Create /TN "KSS Toko Sync" /SC DAILY /ST 10:17 /TR "powershell -NoProfile -ExecutionPolicy Bypass -File \"<folder repo>\scripts\sync\run-daily.ps1\""
```

Pilih jam saat PC menyala dan sudah login: jendela Chrome terbuka selama beberapa menit.
Selama run berjalan jangan bekerja di folder repo (branch berpindah dan `npm run build` dijalankan).
Log: `%USERPROFILE%\.kss-sync\logs`, disimpan 30 hari. Hapus jadwal: `schtasks /Delete /TN "KSS Toko Sync"`.

## Aturan

- Harga yang disimpan (`priceIdr`) adalah **harga normal** toko (harga coret Tokopedia bila ada),
  bukan harga setelah diskon. Perubahan diskon di Tokopedia tidak mengubah harga situs.
- Produk hilang dua run berturut-turut disembunyikan, tidak dihapus. Slug tidak pernah berubah.
- PR diberi label `needs-review` dan **tidak** di-merge bila: harga satu produk berubah >40%,
  >20% produk hilang sekaligus (hitungan takedown tidak naik), >30% harga berubah,
  produk tampil turun >25%, atau >50 produk baru.
- Run dibatalkan tanpa menimpa data bila: 403/429/captcha, pengumpulan tidak lengkap,
  snapshot kosong, >10% baris rusak, tidak ada produk tampil, atau validator gagal.
- Merge hanya setelah tes lokal dan semua check CI hijau. Merge berarti deploy produksi.
- Batal, gagal, atau perlu tinjauan: issue GitHub berlabel `sync-failed`.
- PR `data-sync` yang masih terbuka menahan run berikutnya; setelah 3 hari ditutup dan diganti.
- Deskripsi diambil bertahap (30 halaman produk per run, `--details N`, maksimal 100).

## Menangani `needs-review`

Baca laporan di PR, cek listing di Tokopedia. Benar: merge setelah check hijau.
Salah: tutup PR; run berikutnya mengulang dari data `main`.

## Larangan

Tidak menembus captcha/blokir, tidak memakai alat penyamar bot, tidak menaikkan ambang agar lolos,
tidak force-push, tidak melewati hook atau CI, dan tidak menyimpan token atau kunci di repo.
