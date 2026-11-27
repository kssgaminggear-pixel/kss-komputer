/**
 * Mengubah snapshot `tools/tokopedia-scraper/out/store/snapshot.json` menjadi
 * `data/marketplace/*` dan mengunduh gambar produk yang tampil.
 *
 * Slug, firstSeenAt, dan deskripsi produk yang sudah ada dipertahankan.
 * Produk yang hilang disembunyikan setelah dua run berturut-turut, tidak dihapus.
 * Ini bukan pipeline sinkron harian lengkap (belum ada ambang pengaman).
 *
 * Pakai: node scripts/marketplace/import-snapshot.mjs [path-snapshot]
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { parseSold } from './parse-sold.mjs';

const ROOT = process.cwd();
const DATA = path.join(ROOT, 'data', 'marketplace');
const IMAGES = path.join(ROOT, 'public', 'images', 'marketplace');
const SNAPSHOT = path.resolve(process.argv[2] || 'tools/tokopedia-scraper/out/store/snapshot.json');
const STORE_PREFIX = 'https://www.tokopedia.com/ksskomputer/';

const readJson = (file, fallback) =>
  fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
const writeJson = (name, value) =>
  fs.writeFileSync(path.join(DATA, name), `${JSON.stringify(value, null, 1)}\n`);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function kebab(value, max = 70) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/, '');
}

const snapshot = readJson(SNAPSHOT, null);
if (!snapshot?.products?.length) throw new Error(`snapshot kosong atau tidak ada: ${SNAPSHOT}`);
if (snapshot.failures?.length) {
  throw new Error(`snapshot tidak lengkap (${snapshot.failures.join(', ')}); jalankan ulang pengumpul data`);
}

const previous = new Map(readJson(path.join(DATA, 'products.json'), []).map((item) => [item.id, item]));
const previousShelves = new Map(readJson(path.join(DATA, 'etalase.json'), []).map((item) => [item.id, item]));
const now = snapshot.fetchedAt;

const etalase = snapshot.etalase.map((shelf) => ({
  id: shelf.id,
  slug: previousShelves.get(shelf.id)?.slug || kebab(shelf.name),
  name: shelf.name,
  position: shelf.position,
}));

const products = [];
const imageSources = new Map();
let rejected = 0;

for (const row of snapshot.products) {
  if (!row.id || !row.name || !row.price || !row.url.startsWith(STORE_PREFIX)) {
    rejected += 1;
    continue;
  }
  const old = previous.get(row.id);
  previous.delete(row.id);
  imageSources.set(row.id, row.image);
  products.push({
    id: row.id,
    slug: old?.slug || `${kebab(row.name)}-${row.id.slice(-6)}`,
    name: row.name.replace(/\s+/g, ' '),
    etalaseIds: row.etalaseIds,
    priceIdr: row.price,
    ...(row.originalPrice > row.price ? { originalPriceIdr: row.originalPrice } : {}),
    rating: Math.round(row.rating * 10) / 10,
    ...parseSold(row.soldLabel),
    stock: row.soldOut ? 'out_of_stock' : 'ready',
    description: old?.description || '',
    image: old?.image || '',
    tokopediaUrl: row.url,
    status: 'active',
    missingRuns: 0,
    firstSeenAt: old?.firstSeenAt || now,
    syncedAt: now,
  });
}

for (const old of previous.values()) {
  const missingRuns = old.missingRuns + 1;
  products.push({ ...old, missingRuns, status: missingRuns >= 2 ? 'hidden' : old.status });
}

fs.mkdirSync(IMAGES, { recursive: true });
const needImage = products.filter(
  (item) =>
    item.status === 'active' &&
    item.rating > 0 &&
    item.sold > 0 &&
    imageSources.get(item.id) &&
    !(item.image && fs.existsSync(path.join(ROOT, 'public', item.image)))
);

let downloaded = 0;
let imageFailures = 0;
for (const product of needImage) {
  try {
    const response = await fetch(imageSources.get(product.id), { signal: AbortSignal.timeout(20_000) });
    if (response.status === 403 || response.status === 429) {
      throw Object.assign(new Error(`unduhan gambar ditolak (${response.status})`), { blocked: true });
    }
    if (!response.ok) throw new Error(`status ${response.status}`);
    await sharp(Buffer.from(await response.arrayBuffer()))
      .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(IMAGES, `${product.id}.webp`));
    product.image = `/images/marketplace/${product.id}.webp`;
    downloaded += 1;
  } catch (error) {
    if (error.blocked) throw error;
    imageFailures += 1;
  }
  await sleep(300);
}

// Data ditulis paling akhir: kegagalan di atas tidak menimpa katalog lama.
fs.mkdirSync(DATA, { recursive: true });
products.sort((a, b) => a.id.localeCompare(b.id));
writeJson('products.json', products);
writeJson('etalase.json', etalase);
writeJson('meta.json', { schemaVersion: 1, lastSuccessAt: now });

const shown = products.filter((item) => item.status === 'active' && item.rating > 0 && item.sold > 0);
console.log(
  JSON.stringify(
    { total: products.length, tampil: shown.length, etalase: etalase.length, ditolak: rejected, gambarDiunduh: downloaded, gambarGagal: imageFailures },
    null,
    1
  )
);
