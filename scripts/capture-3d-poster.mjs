// Membuat poster cadangan "Bedah PC" dari scene 3D itu sendiri.
// Pakai: jalankan situs hasil build, lalu `node scripts/capture-3d-poster.mjs http://localhost:3123`,
// kemudian `npm run media:build`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const base = process.argv[2] ?? 'http://localhost:3123';
const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images', '3d');
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1.75 });
await page.goto(base, { waitUntil: 'networkidle' });
const stage = page.locator('[data-bedah-stage]');
await stage.scrollIntoViewIfNeeded();
await page.locator('[data-bedah-stage][data-state="3d"]').waitFor({ timeout: 20_000 });
await page.addStyleTag({
  content: '[data-bedah-overlay], header.sticky, nav.fixed, button.fixed, a.fixed { visibility: hidden !important }',
});

for (const [mode, label] of [['rakit', 'Rakit'], ['cleaning', 'Cleaning'], ['upgrade', 'Upgrade']]) {
  await page.getByRole('tab', { name: label, exact: true }).click();
  await page.waitForTimeout(2200);
  const shot = await stage.screenshot();
  const file = path.join(out, `ilu-bedah-pc-${mode}.webp`);
  const info = await sharp(shot).resize({ width: 1200 }).webp({ quality: 80 }).toFile(file);
  console.log(path.basename(file), `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`);
}
await browser.close();
