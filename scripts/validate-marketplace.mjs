/**
 * Validator data Toko (tanpa dependensi). Dijalankan di CI sebelum build.
 * Gagal = tidak deploy, sehingga versi lama tetap tayang.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const errors = [];
const fail = (message) => errors.push(message);

function read(name) {
  const text = fs.readFileSync(path.join(ROOT, 'data', 'marketplace', name), 'utf8');
  if (/costPrice|sellPrice|retailPrice/.test(text)) fail(`${name}: memuat field harga internal`);
  return JSON.parse(text);
}

const products = read('products.json');
const etalase = read('etalase.json');
const meta = read('meta.json');
const banners = read('banners.json');

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const isIso = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value));

if (meta.schemaVersion !== 1 || !isIso(meta.lastSuccessAt)) fail('meta.json tidak sesuai skema');

const shelfIds = new Set();
const shelfSlugs = new Set();
for (const shelf of etalase) {
  if (!shelf.id || !shelf.name || !SLUG.test(shelf.slug)) fail(`etalase tidak valid: ${shelf.name}`);
  if (shelfIds.has(shelf.id) || shelfSlugs.has(shelf.slug)) fail(`etalase ganda: ${shelf.slug}`);
  shelfIds.add(shelf.id);
  shelfSlugs.add(shelf.slug);
}

const ids = new Set();
const slugs = new Set();
let shown = 0;
for (const p of products) {
  const at = `produk ${p.id}`;
  if (!p.id || ids.has(p.id)) fail(`${at}: id kosong atau ganda`);
  if (!SLUG.test(p.slug || '') || slugs.has(p.slug)) fail(`${at}: slug tidak valid atau ganda`);
  ids.add(p.id);
  slugs.add(p.slug);
  if (typeof p.name !== 'string' || !p.name.trim()) fail(`${at}: nama kosong`);
  if (!Number.isInteger(p.priceIdr) || p.priceIdr <= 0 || p.priceIdr > 1_000_000_000) fail(`${at}: harga di luar batas`);
  if (p.originalPriceIdr !== undefined && !(p.originalPriceIdr > p.priceIdr)) fail(`${at}: harga coret tidak lebih besar`);
  if (!(p.rating >= 0 && p.rating <= 5)) fail(`${at}: rating di luar 0-5`);
  if (!Number.isInteger(p.sold) || p.sold < 0) fail(`${at}: jumlah terjual tidak valid`);
  if (!['ready', 'out_of_stock'].includes(p.stock)) fail(`${at}: stok tidak dikenal`);
  if (!['active', 'hidden'].includes(p.status)) fail(`${at}: status tidak dikenal`);
  if (!isIso(p.firstSeenAt) || !isIso(p.syncedAt)) fail(`${at}: tanggal tidak valid`);
  if (!/^https:\/\/www\.tokopedia\.com\/ksskomputer\/[a-z0-9-]+$/.test(p.tokopediaUrl || '')) fail(`${at}: URL bukan toko KSS`);
  if (p.image && (!p.image.startsWith('/images/marketplace/') || !fs.existsSync(path.join(ROOT, 'public', p.image)))) {
    fail(`${at}: gambar tidak ada di public/`);
  }
  if (!Array.isArray(p.etalaseIds) || p.etalaseIds.some((id) => !shelfIds.has(id))) fail(`${at}: etalase tidak dikenal`);
  const description = p.description ?? '';
  if (typeof description !== 'string' || description.length > 4000 || /<script|javascript:|https?:\/\/|(?:\+?62|\b0)8\d{7,}/i.test(description)) {
    fail(`${at}: deskripsi mengandung tautan, nomor telepon, skrip, atau terlalu panjang`);
  }
  if (p.status === 'active' && p.rating > 0 && p.sold > 0) shown += 1;
}

// Build membutuhkan minimal satu halaman produk; katalog kosong berarti sinkron rusak.
if (shown === 0) fail('tidak ada produk yang memenuhi syarat tampil');

for (const banner of banners) {
  if (!banner.id || !banner.alt || !banner.href?.startsWith('/')) fail(`banner tidak valid: ${banner.id}`);
  if (!fs.existsSync(path.join(ROOT, 'public', banner.image || '-'))) fail(`banner ${banner.id}: gambar tidak ada`);
}

// Slug produk yang sudah tayang tidak boleh berubah atau hilang.
try {
  const base = JSON.parse(
    execFileSync('git', ['show', 'origin/main:data/marketplace/products.json'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
  );
  const current = new Map(products.map((p) => [p.id, p.slug]));
  for (const old of base) {
    if (current.get(old.id) !== old.slug) fail(`produk ${old.id}: slug berubah atau baris dihapus`);
  }
} catch {
  console.log('[marketplace] pembanding origin/main tidak tersedia; cek slug tetap dilewati.');
}

if (errors.length) {
  console.error(`[marketplace] ${errors.length} kesalahan:`);
  for (const message of errors.slice(0, 30)) console.error(`  - ${message}`);
  process.exit(1);
}

const ageHours = (Date.now() - Date.parse(meta.lastSuccessAt)) / 36e5;
if (ageHours > 72) console.warn(`[marketplace] peringatan: data berumur ${Math.round(ageHours / 24)} hari.`);
console.log(`[marketplace] valid: ${products.length} produk, ${shown} tampil, ${etalase.length} etalase.`);
