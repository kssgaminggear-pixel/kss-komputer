#!/usr/bin/env node
// Scraper data publik Tokopedia untuk riset harga/produk KSS Komputer.
// Dijalankan di PC pemilik, memakai Chrome asli (bukan headless) dan sesi login pemilik.
// Pakai: node scrape.mjs --query "rtx 4060" --pages 2
//        node scrape.mjs --url "https://www.tokopedia.com/<toko>/product" --pages 3
//        node scrape.mjs --url "<url>" --cdp http://localhost:9222
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const a = { pages: 1, max: 0, cdp: '', out: path.join(HERE, 'out'), profile: path.join(HERE, '.profile'), url: '', query: '', wait: 180 };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const v = () => argv[++i];
    if (k === '--url') a.url = v();
    else if (k === '--query') a.query = v();
    else if (k === '--pages') a.pages = Math.max(1, Number(v()) || 1);
    else if (k === '--max') a.max = Number(v()) || 0;
    else if (k === '--cdp') a.cdp = v();
    else if (k === '--out') a.out = path.resolve(v());
    else if (k === '--profile') a.profile = path.resolve(v());
    else if (k === '--wait') a.wait = Number(v()) || 180;
    else if (k === '--debug') a.debug = true;
    else if (k === '-h' || k === '--help') a.help = true;
  }
  return a;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = () => 2000 + Math.floor(Math.random() * 2000); // 2-4 detik

// ---------- normalisasi respons GraphQL ----------
function num(v) {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(/[^\d]/g, ''));
  return Number.isFinite(n) && String(v).match(/\d/) ? n : null;
}

function toProduct(o) {
  if (!o || typeof o !== 'object') return null;
  const title = o.name || o.title || o.productName;
  const url = o.product_url || o.url || o.productUrl || o.uri;
  const priceRaw = o.price?.number ?? o.price?.text_idr ?? o.price?.text ?? o.priceInt ?? o.price ?? o.priceText;
  const price = num(typeof priceRaw === 'object' ? null : priceRaw);
  if (!title || !url || price == null) return null;
  const orig = num(o.price?.original ?? o.campaign?.original_price_fmt ?? o.originalPrice ?? o.slashPriceInfo?.originalPrice ?? o.priceOriginal);
  let sold = o.countSold ?? o.sold ?? o.txStats?.countSold ?? null;
  const groups = o.label_groups || o.labelGroups;
  const lg = Array.isArray(groups) ? groups.find((l) => /terjual/i.test(l?.title || '')) : null;
  if (lg) sold = lg.title;
  const img = o.primary_image?.resize300 || o.primary_image?.original || o.mediaURL?.image || o.mediaURL?.image300 || o.imageUrl || o.image?.url || o.media?.[0]?.urlOriginal || o.media?.[0]?.url300 || '';
  return {
    id: String(o.product_id ?? o.id ?? ''),
    title: String(title),
    price,
    original_price: orig || null,
    shop: o.shop?.name || o.shopName || '',
    location: o.shop?.city || o.shop?.location || o.shopLocation || '',
    // Daftar produk toko menaruh rating di stats.averageRating (stats.rating bernilai 0).
    rating: o.stats ? (o.stats.averageRating ?? '') : (o.rating ?? o.ratingAverage ?? o.averageRating ?? ''),
    review_count: o.stats?.reviewCount ?? o.countReview ?? '',
    sold: sold ?? '',
    url: String(url).split('?')[0],
    image: String(img),
  };
}

function walk(node, out, depth = 0) {
  if (!node || typeof node !== 'object' || depth > 12) return;
  if (Array.isArray(node)) { node.forEach((n) => walk(n, out, depth + 1)); return; }
  const p = toProduct(node);
  if (p) out.push(p);
  for (const v of Object.values(node)) walk(v, out, depth + 1);
}

// ---------- deteksi halaman tantangan (tidak dilewati otomatis) ----------
async function isChallenge(page) {
  try {
    const t = ((await page.title()) + ' ' + (await page.evaluate(() => document.body?.innerText?.slice(0, 600) || ''))).toLowerCase();
    return /captcha|verifikasi bahwa anda|are you a robot|akses ditolak|access denied|too many requests|unusual traffic/.test(t);
  } catch { return false; }
}

async function waitForHuman(page, seconds) {
  console.log(`\n[!] Halaman meminta verifikasi. Selesaikan sendiri di jendela Chrome (maks ${seconds} dtk).`);
  const end = Date.now() + seconds * 1000;
  while (Date.now() < end) {
    await sleep(3000);
    if (!(await isChallenge(page))) return true;
  }
  return false;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = 500;
      const t = setInterval(() => {
        window.scrollBy(0, step);
        y += step;
        if (y >= document.body.scrollHeight + 600) { clearInterval(t); resolve(); }
      }, 350);
    });
  });
  await sleep(800);
}

// ---------- fallback DOM ----------
async function readDom(page) {
  return page.evaluate(() => {
    const rows = [];
    // JSON-LD (halaman detail produk)
    document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
      try {
        const j = JSON.parse(s.textContent || '{}');
        const list = Array.isArray(j) ? j : [j];
        list.forEach((x) => {
          if (x && x['@type'] === 'Product') {
            const off = Array.isArray(x.offers) ? x.offers[0] : x.offers || {};
            rows.push({
              title: x.name || '', price: Number(off.price || 0) || null, original_price: null,
              shop: x.brand?.name || '', location: '', rating: x.aggregateRating?.ratingValue ?? '',
              sold: '', url: x.url || location.href.split('?')[0],
              image: Array.isArray(x.image) ? x.image[0] : x.image || '',
            });
          }
        });
      } catch { /* abaikan */ }
    });
    // kartu produk (halaman daftar) — selektor perlu diverifikasi terhadap DOM terbaru
    const cards = document.querySelectorAll('[data-testid="master-product-card"], [data-testid="divProductWrapper"], a[data-testid="lnkProductContainer"]');
    cards.forEach((c) => {
      const a = c.matches('a') ? c : c.querySelector('a[href]');
      const txt = (c.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean);
      const priceLine = txt.find((s) => /^Rp\s?[\d.]+/.test(s));
      const price = priceLine ? Number(priceLine.replace(/[^\d]/g, '')) : null;
      const prices = txt.filter((s) => /^Rp\s?[\d.]+/.test(s));
      const sold = txt.find((s) => /terjual/i.test(s)) || '';
      const rating = txt.find((s) => /^\d(\.\d)?$/.test(s)) || '';
      const img = c.querySelector('img');
      if (a && price) {
        rows.push({
          title: img?.alt || txt[0] || '', price,
          original_price: prices[1] ? Number(prices[1].replace(/[^\d]/g, '')) : null,
          shop: '', location: '', rating, sold, url: a.href.split('?')[0], image: img?.src || '',
        });
      }
    });
    return rows;
  });
}

// ---------- output ----------
const COLS = ['id', 'review_count', 'title', 'price', 'original_price', 'shop', 'location', 'rating', 'sold', 'url', 'image'];
const csvCell = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function save(items, outDir, label) {
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'hasil';
  const base = path.join(outDir, `${stamp}-${slug}`);
  fs.writeFileSync(base + '.json', JSON.stringify(items, null, 2));
  fs.writeFileSync(base + '.csv', '﻿' + [COLS.join(','), ...items.map((r) => COLS.map((c) => csvCell(r[c])).join(','))].join('\n'));
  return base;
}

function pageUrl(base, n) {
  if (n === 1) return base;
  const u = new URL(base);
  // Daftar produk toko memakai /<toko>/product/page/<n>, bukan ?page=.
  if (/\/product\/?$/.test(u.pathname)) {
    u.pathname = u.pathname.replace(/\/?$/, `/page/${n}`);
    return u.toString();
  }
  u.searchParams.set('page', String(n));
  return u.toString();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || (!args.url && !args.query)) {
    console.log('Pakai: node scrape.mjs (--url <url> | --query "<kata>") [--pages N] [--max N] [--cdp http://localhost:9222] [--out dir] [--profile dir] [--wait detik]');
    process.exit(args.help ? 0 : 1);
  }
  const base = args.url || `https://www.tokopedia.com/search?q=${encodeURIComponent(args.query)}`;
  const label = args.query || new URL(base).pathname;

  let context, browser;
  if (args.cdp) {
    browser = await chromium.connectOverCDP(args.cdp);
    context = browser.contexts()[0] || (await browser.newContext());
  } else {
    context = await chromium.launchPersistentContext(args.profile, {
      channel: 'chrome', headless: false, viewport: null, locale: 'id-ID', timezoneId: 'Asia/Jakarta',
    });
  }
  const page = await context.newPage();

  const found = new Map();
  const add = (p) => { if (!found.has(p.url)) found.set(p.url, p); };
  const debugDir = path.join(args.out, 'debug');
  let seq = 0;
  if (args.debug) fs.mkdirSync(debugDir, { recursive: true });
  let etalase = [];
  page.on('response', async (res) => {
    try {
      if (!/graphql/i.test(res.url()) || res.request().method() !== 'POST') return;
      const body = await res.json();
      if (args.debug) {
        const op = new URL(res.url()).pathname.split('/').pop().replace(/[^A-Za-z0-9_-]/g, '') || 'graphql';
        fs.writeFileSync(path.join(debugDir, `${String(++seq).padStart(3, '0')}-${op}.json`), JSON.stringify(body));
      }
      for (const part of Array.isArray(body) ? body : [body]) {
        const list = part?.data?.shopShowcasesByShopID?.result;
        if (Array.isArray(list)) etalase = list.map((e, i) => ({ id: String(e.id), name: e.title, count: e.count, type: e.type, position: i, url: e.link }));
      }
      const out = [];
      walk(body, out);
      out.forEach(add);
    } catch { /* respons bukan JSON */ }
  });

  let aborted = false;
  for (let n = 1; n <= args.pages; n++) {
    const target = pageUrl(base, n);
    console.log(`[${n}/${args.pages}] ${target}`);
    const before = found.size;
    const resp = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch((e) => { console.log('  gagal buka:', e.message); return null; });
    const status = resp?.status();
    if (status === 403 || status === 429 || (await isChallenge(page))) {
      const ok = await waitForHuman(page, args.wait);
      if (!ok) { console.log('Berhenti: halaman masih terblokir. Hasil sebelumnya tetap disimpan.'); aborted = true; break; }
    }
    await autoScroll(page);
    // Respons produk kadang baru selesai setelah scroll; tunggu maks 15 dtk sebelum fallback.
    for (let i = 0; i < 30 && found.size === before; i++) await sleep(500);
    if (found.size === before) {
      console.log('  GraphQL tidak menghasilkan produk, pakai fallback DOM');
      (await readDom(page)).filter((p) => p.title && p.url).forEach(add);
    }
    console.log(`  total unik: ${found.size}`);
    if (args.debug) {
      const info = await page.evaluate(() => {
        const ids = {};
        document.querySelectorAll('[data-testid]').forEach((e) => { const k = e.getAttribute('data-testid'); ids[k] = (ids[k] || 0) + 1; });
        const links = [...new Set([...document.querySelectorAll('a[href*="/ksskomputer/"]')].map((a) => a.href.split('?')[0]))];
        return { url: location.href.split('?')[0], title: document.title, testids: ids, shopLinks: links, text: document.body.innerText.slice(0, 5000) };
      });
      fs.writeFileSync(path.join(debugDir, `page-${n}.json`), JSON.stringify(info, null, 2));
      await page.screenshot({ path: path.join(debugDir, `page-${n}.png`) }).catch(() => {});
    }
    if (args.max && found.size >= args.max) break;
    if (n < args.pages) await sleep(jitter());
  }

  let items = [...found.values()];
  if (args.max) items = items.slice(0, args.max);
  if (items.length) {
    const b = save(items, args.out, label);
    if (etalase.length) fs.writeFileSync(b + '-etalase.json', JSON.stringify(etalase, null, 2));
    console.log(`\nSelesai: ${items.length} produk\n  ${b}.json\n  ${b}.csv`);
  } else {
    console.log('\nTidak ada produk terambil. Cek jendela Chrome dan selektor DOM di readDom().');
  }
  await page.close().catch(() => {});
  if (args.cdp) await browser.close().catch(() => {}); else await context.close().catch(() => {});
  process.exit(aborted ? 2 : items.length ? 0 : 3);
}

main().catch((e) => { console.error(e); process.exit(1); });
