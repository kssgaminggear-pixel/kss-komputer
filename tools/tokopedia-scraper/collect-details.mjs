#!/usr/bin/env node
// Mengambil teks deskripsi dari sejumlah kecil halaman produk toko sendiri.
// Satu tab, jeda 3-6 detik. 403/429/captcha menghentikan run (exit 2).
// Pakai: node collect-details.mjs <targets.json> <hasil.json>
//   targets.json: [{ "id": "...", "url": "https://www.tokopedia.com/ksskomputer/..." }]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MAX_TARGETS = 100;
const [targetsFile, outFile] = process.argv.slice(2);
const targets = JSON.parse(fs.readFileSync(targetsFile, 'utf8')).slice(0, MAX_TARGETS);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Blocked extends Error {}

async function main() {
  const context = await chromium.launchPersistentContext(path.join(HERE, '.profile'), {
    channel: 'chrome', headless: false, viewport: null, locale: 'id-ID', timezoneId: 'Asia/Jakarta',
  });
  const page = await context.newPage();
  const results = {};
  let missed = 0;
  try {
    for (const [index, target] of targets.entries()) {
      if (!target.url.startsWith('https://www.tokopedia.com/ksskomputer/')) continue;
      if (index > 0) await sleep(3000 + Math.floor(Math.random() * 3000));
      const response = await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
      const status = response?.status();
      const head = (await page.evaluate(() => `${document.title} ${document.body?.innerText?.slice(0, 600) || ''}`)).toLowerCase();
      if (status === 403 || status === 429 || /captcha|verifikasi bahwa anda|are you a robot|akses ditolak|access denied|too many requests|unusual traffic/.test(head)) {
        throw new Blocked(`terblokir di ${target.url} (status ${status})`);
      }
      const box = page.locator('[data-testid="lblPDPDescriptionProduk"]');
      for (let i = 0; i < 20 && !(await box.count()); i++) {
        await page.evaluate(() => window.scrollBy(0, 600));
        await sleep(400);
      }
      if (await box.count()) results[target.id] = await box.first().innerText();
      else missed += 1;
      // Berturut-turut kosong biasanya tanda halaman berubah atau diblokir.
      if (missed >= 5 && Object.keys(results).length === 0) throw new Blocked('deskripsi tidak terbaca di 5 halaman pertama');
    }
    fs.writeFileSync(outFile, JSON.stringify(results, null, 1));
    console.log(`Deskripsi: ${Object.keys(results).length} terbaca, ${missed} tidak ditemukan.`);
  } finally {
    await context.close().catch(() => {});
  }
}

main().catch((error) => {
  console.error(error instanceof Blocked ? `BERHENTI: ${error.message}` : error);
  process.exit(error instanceof Blocked ? 2 : 1);
});
