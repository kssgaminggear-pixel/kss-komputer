// Membangun src/lib/media/manifest.json dari public/images (kecuali foto Toko) dan
// mengisi imageWidth/imageHeight di data/marketplace/products.json.
// Jalankan: npm run media:build
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PUBLIC = path.join(ROOT, 'public');
const MANIFEST = path.join(ROOT, 'src', 'lib', 'media', 'manifest.json');
const PRODUCTS = path.join(ROOT, 'data', 'marketplace', 'products.json');

/** Teks alternatif awal. Suntingan di manifest dipertahankan pada build berikutnya. */
const DEFAULT_ALT = {
  '/images/tokopedia/banner-pc-store.webp': 'Etalase PC rakitan KSS Komputer',
  '/images/tokopedia/banner-store-1.webp': 'Banner promo KSS Komputer',
  '/images/tokopedia/banner-store-2.webp': 'Banner pilihan casing PC rakitan KSS Komputer',
  '/images/tokopedia/monitor-22.webp': 'Monitor 22 inci dari etalase KSS Komputer',
  '/images/kss-pc-blueprint.svg': 'Ilustrasi garis PC rakitan',
};

const readJson = (file, fallback) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback);
const writeJson = (file, value, indent) => fs.writeFileSync(file, `${JSON.stringify(value, null, indent)}\n`);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'marketplace' ? [] : walk(full);
    return /\.(webp|avif|png|jpe?g|svg)$/i.test(entry.name) ? [full] : [];
  });
}

function describe(url) {
  const name = path.posix.basename(url);
  if (url.startsWith('/images/brand/')) return { kind: 'brand', source: 'logo-kss' };
  if (url.startsWith('/images/3d/')) return { kind: 'illustration', source: 'internal' };
  if (name.startsWith('ilu-')) return { kind: 'illustration', source: 'ai' };
  if (name.endsWith('.svg')) return { kind: 'illustration', source: 'internal' };
  return { kind: 'photo', source: 'katalog-toko-kss' };
}

const previous = readJson(MANIFEST, {});
const manifest = {};

for (const file of walk(path.join(PUBLIC, 'images')).sort()) {
  const url = `/${path.relative(PUBLIC, file).split(path.sep).join('/')}`;
  const { width, height } = await sharp(file).metadata();
  if (!width || !height) throw new Error(`ukuran tidak terbaca: ${url}`);
  const blur = url.endsWith('.svg')
    ? ''
    : `data:image/webp;base64,${(await sharp(file).resize(16, 16, { fit: 'inside' }).webp({ quality: 40 }).toBuffer()).toString('base64')}`;
  manifest[url] = {
    width,
    height,
    ...describe(url),
    alt: previous[url]?.alt ?? DEFAULT_ALT[url] ?? '',
    blurDataURL: blur,
  };
}

fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
writeJson(MANIFEST, manifest, 2);

/** Urutan kunci disamakan dengan hasil sinkron agar diff harian tetap kecil. */
function withSize(product, width, height) {
  const entries = Object.entries(product).filter(([key]) => key !== 'imageWidth' && key !== 'imageHeight');
  entries.splice(entries.findIndex(([key]) => key === 'tokopediaUrl'), 0, ['imageWidth', width], ['imageHeight', height]);
  return Object.fromEntries(entries);
}

const products = readJson(PRODUCTS, []);
let sized = 0;
for (const [index, product] of products.entries()) {
  const file = product.image && path.join(PUBLIC, product.image);
  if (!file || !fs.existsSync(file)) continue;
  const { width, height } = await sharp(file).metadata();
  if (product.imageWidth === width && product.imageHeight === height) continue;
  products[index] = withSize(product, width, height);
  sized += 1;
}
if (sized > 0) writeJson(PRODUCTS, products, 1);

console.log(`manifest: ${Object.keys(manifest).length} gambar; ukuran foto Toko diperbarui: ${sized}`);
