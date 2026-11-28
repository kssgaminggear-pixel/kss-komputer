/**
 * Audit visual (ROADMAP.md §0.2): `npm run audit:visual` setelah `npm run build`.
 * Selalu gagal bila gambar rusak atau cadangan tidak muncul. Target VCR, dinding
 * teks, dan foto pecah hanya dilaporkan, kecuali VISUAL_STRICT=1 (mulai V1).
 */
import fs from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const OUT = path.join(process.cwd(), 'test-results', 'visual');
const STRICT = process.env.VISUAL_STRICT === '1';

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, folds: 4 },
  { name: 'desktop', width: 1440, height: 900, folds: 3 },
] as const;

type Kind = 'etalase' | 'detail' | 'informasi' | 'transaksi';

const ROUTES: { path: string; kind: Kind }[] = [
  { path: '/', kind: 'etalase' },
  { path: '/paket-rakitan', kind: 'etalase' },
  { path: '/toko', kind: 'etalase' },
  { path: '/toko/etalase/pc-game-dan-desain-expert', kind: 'etalase' },
  { path: '/paket-rakitan/kss-esports-champion-1080p', kind: 'detail' },
  // Diisi dari tautan pertama di /toko agar tidak bergantung pada satu produk.
  { path: 'produk-pertama', kind: 'detail' },
  { path: '/jasa', kind: 'informasi' },
  { path: '/tentang-kami', kind: 'informasi' },
  { path: '/konsultasi', kind: 'transaksi' },
];

async function resolveRoute(page: Page, route: string) {
  if (route !== 'produk-pertama') return route;
  await page.goto('/toko');
  const href = await page.locator('main article a[href^="/toko/"]').first().getAttribute('href');
  expect(href).toBeTruthy();
  return href as string;
}

/** Porsi titik sampel (tiap 8 px) yang mengenai elemen visual pada fold yang terlihat. */
function measureFold() {
  const step = 8;
  const bars = [...document.querySelectorAll('body *')]
    .filter((el) => ['fixed', 'sticky'].includes(getComputedStyle(el).position))
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width >= innerWidth * 0.9 && r.height > 0 && r.height < innerHeight * 0.3)
    .filter((r) => r.top <= 1 || r.bottom >= innerHeight - 1);
  let total = 0;
  let visual = 0;
  for (let y = step / 2; y < innerHeight; y += step) {
    if (bars.some((r) => y >= r.top && y <= r.bottom)) continue;
    for (let x = step / 2; x < innerWidth; x += step) {
      total += 1;
      const hit = document.elementsFromPoint(x, y).some((el) => {
        if (el instanceof HTMLImageElement) return el.complete && el.naturalWidth > 0;
        if (el.matches('picture, video, canvas, [data-visual]')) return true;
        if (el instanceof SVGSVGElement) {
          const r = el.getBoundingClientRect();
          return r.width >= 64 && r.height >= 64;
        }
        return false;
      });
      if (hit) visual += 1;
    }
  }
  return total ? visual / total : 0;
}

function inspectContent() {
  const hidden = 'details, dialog, [role="tabpanel"], [role="dialog"], [aria-hidden="true"]';
  const walls = [...document.querySelectorAll<HTMLElement>('main p, main li, main dd')]
    .filter((el) => !el.closest(hidden) && el.offsetParent !== null && !el.querySelector('p, li'))
    .map((el) => el.innerText.trim())
    .filter((text) => text.length > 300)
    .map((text) => `${text.slice(0, 60)}…`);

  const broken: string[] = [];
  const noAlt: string[] = [];
  for (const img of document.images) {
    if (img.offsetParent === null || img.getBoundingClientRect().width === 0) continue;
    const name = decodeURIComponent(img.currentSrc || img.src).replace(/^.*?(\/images\/[^&?]+).*$/, '$1');
    if (!img.complete || img.naturalWidth === 0) broken.push(name);
    else if (!img.hasAttribute('alt')) noAlt.push(name);
  }
  return { walls, broken, noAlt };
}

/** Lebar piksel file yang diterima dibanding kebutuhan layar. naturalWidth ber-srcset dihitung per kepadatan, jadi file diukur langsung. */
async function sharpness(page: Page) {
  return page.evaluate(async () => {
    const results: { src: string; ratio: number }[] = [];
    for (const img of document.images) {
      const box = img.getBoundingClientRect();
      if (img.offsetParent === null || box.width < 64 || !img.currentSrc || img.currentSrc.endsWith('.svg')) continue;
      const bitmap = await createImageBitmap(await (await fetch(img.currentSrc)).blob());
      // Untuk object-contain, lebar yang digambar bisa lebih kecil dari kotaknya.
      const drawn =
        getComputedStyle(img).objectFit === 'contain'
          ? Math.min(box.width, box.height * (bitmap.width / bitmap.height))
          : Math.max(box.width, box.height * (bitmap.width / bitmap.height));
      results.push({
        src: decodeURIComponent(img.currentSrc).replace(/^.*?(\/images\/[^&?]+).*$/, '$1'),
        ratio: Math.round((bitmap.width / (drawn * devicePixelRatio)) * 100) / 100,
      });
      bitmap.close();
    }
    return results;
  });
}

async function loadEverything(page: Page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= height; y += 600) {
    await page.evaluate((top) => scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(60);
  }
  // Gambar lazy di rak geser baru dimuat setelah digeser ke layar; yang benar-benar rusak tetap terdeteksi.
  await page.evaluate(async () => {
    for (const img of document.images) {
      if (img.complete || img.offsetParent === null) continue;
      img.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    for (const rack of document.querySelectorAll('ul')) rack.scrollTo({ left: 0, behavior: 'instant' });
  });
  await page
    .waitForFunction(() => [...document.images].every((i) => i.offsetParent === null || i.complete), null, {
      timeout: 30_000,
    })
    .catch(() => undefined);
}

for (const viewport of VIEWPORTS) {
  test.describe(viewport.name, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 2 });

    for (const route of ROUTES) {
      test(`audit ${route.path}`, async ({ page }) => {
        const url = await resolveRoute(page, route.path);
        const failedRequests: string[] = [];
        page.on('response', (response) => {
          if (response.status() >= 400 && /\/_next\/image|\/images\//.test(response.url())) {
            failedRequests.push(`${response.status()} ${response.url()}`);
          }
        });

        const response = await page.goto(url, { waitUntil: 'networkidle' });
        expect(response?.status(), 'status halaman').toBeLessThan(400);
        await loadEverything(page);

        const slug = `${viewport.name}${url === '/' ? '_beranda' : url.replace(/\//g, '_')}`.slice(0, 80);
        fs.mkdirSync(OUT, { recursive: true });
        const folds: number[] = [];
        for (let fold = 0; fold < viewport.folds; fold += 1) {
          const top = fold * viewport.height;
          if (top >= (await page.evaluate(() => document.body.scrollHeight))) break;
          await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), top);
          await page.waitForTimeout(250);
          folds.push(Math.round((await page.evaluate(measureFold)) * 100));
          await page.screenshot({ path: path.join(OUT, `${slug}-${fold + 1}.png`) });
        }

        const content = await page.evaluate(inspectContent);
        const sharp = await sharpness(page);
        const report = {
          route: url,
          kind: route.kind,
          viewport: viewport.name,
          vcrFirstFold: folds[0],
          vcrAverage: Math.round(folds.reduce((a, b) => a + b, 0) / folds.length),
          folds,
          textWalls: content.walls,
          brokenImages: content.broken,
          missingAlt: content.noAlt,
          blurryImages: sharp.filter((s) => s.ratio < 0.75),
          failedRequests,
        };
        fs.writeFileSync(path.join(OUT, `${slug}.json`), JSON.stringify(report, null, 2));

        expect(report.brokenImages, 'gambar rusak').toEqual([]);
        expect(report.failedRequests, 'permintaan gambar gagal').toEqual([]);
        expect(report.missingAlt, 'img tanpa atribut alt').toEqual([]);

        if (!STRICT || route.kind === 'transaksi') return;
        expect(report.textWalls, 'dinding teks').toEqual([]);
        expect(report.blurryImages, 'foto pecah').toEqual([]);
        if (route.kind === 'etalase') {
          expect(report.vcrAverage).toBeGreaterThanOrEqual(65);
          expect(report.vcrFirstFold).toBeGreaterThanOrEqual(70);
        } else if (route.kind === 'detail') {
          expect(report.vcrFirstFold).toBeGreaterThanOrEqual(viewport.name === 'desktop' ? 55 : 50);
        } else {
          expect(report.vcrAverage).toBeGreaterThanOrEqual(45);
        }
      });
    }

    test('cadangan muncul saat foto gagal dimuat', async ({ page }) => {
      // Semua foto diblokir; hanya ilustrasi SVG yang boleh lewat.
      await page.route(/\/_next\/image|\/images\/(tokopedia|marketplace)\//, (route) => route.abort());
      for (const url of ['/toko', '/paket-rakitan']) {
        await page.goto(url);
        const fallback = page.locator('main [data-media-fallback] img').first();
        await expect(fallback).toBeVisible();
        await expect.poll(() => fallback.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
      }
      fs.mkdirSync(OUT, { recursive: true });
      await page.goto('/toko', { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join(OUT, `${viewport.name}-fallback.png`) });
    });
  });
}
