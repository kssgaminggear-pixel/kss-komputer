# tokopedia-scraper

Riset harga/produk publik Tokopedia. Jalan di PC pemilik dengan Chrome asli (jendela terlihat) dan sesi login yang tersimpan.

## Setup sekali
```
cd tools\tokopedia-scraper
npm install
```
Chrome yang sudah terpasang dipakai langsung (`channel: chrome`), tidak perlu mengunduh browser.

## Jalankan
```
node scrape.mjs --query "rtx 4060" --pages 2
node scrape.mjs --url "https://www.tokopedia.com/<toko>/product" --pages 3 --max 60
node scrape.mjs --url "https://tk.tokopedia.com/<kode>/" --pages 1
```
Menempel ke Chrome yang sudah terbuka:
```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir=%TEMP%\chrome-cdp
node scrape.mjs --url "<url>" --cdp http://localhost:9222
```

## Opsi
`--url` / `--query` (salah satu wajib), `--pages N` (default 1), `--max N`, `--cdp URL`, `--out DIR` (default `out/`), `--profile DIR` (default `.profile/`, cookie tersimpan), `--wait DETIK` (tunggu verifikasi manual, default 180).

## Perilaku
- Menangkap respons GraphQL produk. Bila kosong, jatuh ke pembacaan DOM setelah auto-scroll (dan JSON-LD untuk halaman detail).
- Jeda acak 2-4 detik antar halaman.
- Bila muncul captcha/verifikasi/403/429, skrip berhenti menunggu Anda menyelesaikannya sendiri di jendela Chrome. Skrip tidak melewati captcha. Jika tetap terblokir, run dihentikan (exit 2) dan hasil yang sudah ada disimpan.
- Keluaran: `out/<waktu>-<label>.json` dan `.csv` dengan kolom title, price, original_price, shop, location, rating, sold, url, image.
- Exit code: 0 ok, 1 error, 2 terblokir, 3 tidak ada produk.

## Catatan
- `out/` dan `.profile/` jangan di-commit (cookie sesi ada di `.profile/`).
- Teruji 2026-11-27 pada `https://www.tokopedia.com/ksskomputer/product` (80 produk per halaman, halaman lanjut `/product/page/N`). Short link `tk.tokopedia.com` hanya membuka beranda toko (2 produk), jadi pakai URL daftar produk.
- Data daftar produk: `rating` berasal dari `stats.averageRating`; `review_count` selalu 0 di respons ini sehingga tidak bisa dipakai sebagai jumlah ulasan. Daftar etalase toko disimpan di `out/<waktu>-<label>-etalase.json` bila halaman memuatnya.
- `--debug` menyimpan respons GraphQL, info halaman, dan screenshot ke `out/debug/`.
- `--query` membuka `/search?`, yang dilarang `robots.txt` Tokopedia. Jangan dipakai.
- Bentuk GraphQL dan selektor DOM bisa berubah. Selektor kartu di `readDom()` tidak menghasilkan apa pun pada halaman toko saat diuji.
- Hanya data publik toko sendiri/riset harga wajar. Patuhi ketentuan Tokopedia; jangan dijalankan dalam volume besar.
- Hasil jangan langsung dipublikasikan di web KSS. Aturan harga AGENTS.md §1.1 tetap berlaku.
