#!/usr/bin/env node
// Mengumpulkan katalog toko KSS sendiri: semua produk lalu keanggotaan tiap etalase.
// Hanya membaca respons yang memang dimuat halaman. Satu tab, jeda 2-4 detik.
// 403/429/captcha menghentikan run tanpa menulis snapshot (data lama tidak tertimpa).
// Pakai: node collect-store.mjs [--max-loads 90] [--out out/store]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STORE = 'https://www.tokopedia.com/ksskomputer';

const argv = process.argv.slice(2);
const option = (name, fallback) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : fallback);
const MAX_LOADS = Number(option('--max-loads', 90));
const OUT = path.resolve(HERE, option('--out', 'out/store'));
const PROFILE = path.join(HERE, '.profile');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const jitter = () => 2000 + Math.floor(Math.random() * 2000);

class Blocked extends Error {}

const digits = (value) => {
  const clean = String(value ?? '').replace(/[^\d]/g, '');
  return clean ? Number(clean) : null;
};

function toRow(item) {
  const url = String(item.product_url || '').split('?')[0];
  const sold = (item.label_groups || []).find((group) => /terjual/i.test(group?.title || ''))?.title || '';
  return {
    id: String(item.product_id || ''),
    name: String(item.name || '').trim(),
    url,
    price: digits(item.price?.text_idr),
    originalPrice: digits(item.campaign?.original_price_fmt),
    rating: Number(item.stats?.averageRating || 0),
    reviewCount: Number(item.stats?.reviewCount || 0),
    soldLabel: sold,
    soldOut: Boolean(item.flags?.isSold),
    preorder: Boolean(item.flags?.isPreorder),
    image: item.primary_image?.original || item.primary_image?.resize300 || '',
  };
}

async function main() {
  const context = await chromium.launchPersistentContext(PROFILE, {
    channel: 'chrome', headless: false, viewport: null, locale: 'id-ID', timezoneId: 'Asia/Jakarta',
  });
  const page = await context.newPage();

  let showcases = [];
  let batch = null;
  let expected = null;
  let blockedStatus = 0;
  const pending = new Set();

  page.on('response', (response) => {
    if (!/gql\.tokopedia|graphql/i.test(response.url()) || response.request().method() !== 'POST') return;
    if (response.status() === 403 || response.status() === 429) blockedStatus = response.status();
    const task = (async () => {
      const sent = [].concat(JSON.parse(response.request().postData() || '[]'));
      const body = await response.json();
      for (const [index, part] of [].concat(body).entries()) {
        const list = part?.data?.shopShowcasesByShopID?.result;
        if (Array.isArray(list)) showcases = list;
        const products = part?.data?.GetShopProduct;
        // Halaman etalase juga meminta daftar tanpa filter; hanya respons yang cocok yang dipakai.
        const variables = sent[index]?.variables;
        const matches =
          expected &&
          String(variables?.etalaseId || '') === expected.etalaseId &&
          Number(variables?.page) === expected.page;
        if (matches && Array.isArray(products?.data)) {
          batch = { rows: products.data.map(toRow), hasNext: Boolean(products.links?.next) };
        }
      }
    })().catch(() => {});
    pending.add(task);
    task.finally(() => pending.delete(task));
  });

  let loads = 0;
  async function load(url, want) {
    if (loads >= MAX_LOADS) throw new Error(`batas ${MAX_LOADS} halaman tercapai`);
    if (loads > 0) await sleep(jitter());
    loads += 1;
    batch = null;
    expected = want;
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const status = response?.status();
    const text = (await page.evaluate(() => `${document.title} ${document.body?.innerText?.slice(0, 600) || ''}`)).toLowerCase();
    if (status === 403 || status === 429 || /captcha|verifikasi bahwa anda|are you a robot|akses ditolak|access denied|too many requests|unusual traffic/.test(text)) {
      throw new Blocked(`terblokir di ${url} (status ${status})`);
    }
    // Produk baru diminta setelah bagian daftar terlihat.
    for (let i = 0; i < 60 && !batch; i++) {
      await page.evaluate(() => window.scrollBy(0, 700));
      await sleep(500);
      await Promise.all([...pending]);
      if (blockedStatus) throw new Blocked(`respons ${blockedStatus} di ${url}`);
    }
    return batch;
  }

  async function collect(firstUrl, etalaseId, onRow) {
    let count = 0;
    for (let number = 1; ; number++) {
      const url = number === 1 ? firstUrl : `${firstUrl}/page/${number}`;
      const result = await load(url, { etalaseId, page: number });
      if (!result) {
        console.log(`  ! tidak ada respons produk di halaman ${number}`);
        return { count, complete: false };
      }
      result.rows.forEach(onRow);
      count += result.rows.length;
      console.log(`  halaman ${number}: ${result.rows.length} produk (muat ke-${loads})`);
      if (!result.hasNext || result.rows.length === 0) return { count, complete: true };
    }
  }

  const products = new Map();
  const failures = [];
  try {
    console.log('Semua produk');
    const all = await collect(`${STORE}/product`, 'etalase', (row) => {
      if (row.id) products.set(row.id, { ...row, etalaseIds: [] });
    });
    if (!all.complete) failures.push('semua-produk');

    // type 1 = etalase buatan toko; sisanya etalase bawaan Tokopedia.
    const etalase = showcases
      .filter((item) => item.type === 1 && item.count > 0)
      .map((item, position) => ({ id: String(item.id), name: item.name || item.title, alias: item.alias, count: item.count, position }));
    console.log(`Etalase buatan toko: ${etalase.length}`);

    for (const shelf of etalase) {
      console.log(`Etalase ${shelf.name} (${shelf.count})`);
      const result = await collect(`${STORE}/etalase/${shelf.alias}`, shelf.id, (row) => {
        const product = products.get(row.id);
        if (product && !product.etalaseIds.includes(shelf.id)) product.etalaseIds.push(shelf.id);
      });
      if (!result.complete) failures.push(shelf.alias);
    }

    fs.mkdirSync(OUT, { recursive: true });
    const file = path.join(OUT, 'snapshot.json');
    fs.writeFileSync(file, JSON.stringify({ fetchedAt: new Date().toISOString(), loads, failures, etalase, products: [...products.values()] }, null, 1));
    console.log(`\nSelesai: ${products.size} produk, ${etalase.length} etalase, ${loads} halaman, gagal: ${failures.length}\n  ${file}`);
  } finally {
    await context.close().catch(() => {});
  }
}

main().catch((error) => {
  console.error(error instanceof Blocked ? `BERHENTI: ${error.message}. Snapshot tidak ditulis.` : error);
  process.exit(error instanceof Blocked ? 2 : 1);
});
