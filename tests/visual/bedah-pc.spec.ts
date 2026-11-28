import { expect, test, type Page } from '@playwright/test';

const section = (page: Page) => page.locator('section[aria-labelledby="judul-bedah"]');
// Halaman sebelumnya tetap ada (tersembunyi) di DOM, jadi dibatasi ke bagian Beranda.
const stage = (page: Page) => section(page).locator('[data-bedah-stage]');

test('bedah PC: 3D baru dimuat saat didekati, tab dan jeda berfungsi, konsol bersih', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));

  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(section(page).locator('canvas')).toHaveCount(0);

  await stage(page).scrollIntoViewIfNeeded();
  await expect(stage(page)).toHaveAttribute('data-state', '3d', { timeout: 20_000 });
  await expect(section(page).locator('canvas')).toHaveCount(1);

  const tabs = section(page).getByRole('tab');
  await expect(tabs).toHaveCount(3);
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(section(page).getByRole('tabpanel')).toContainText('Cleaning');
  await expect(section(page).getByRole('link', { name: 'Lihat layanan' })).toHaveAttribute(
    'href',
    '/jasa/deep-cleaning-repaste'
  );

  await section(page).getByRole('button', { name: 'Jeda animasi model' }).click();
  await page.waitForTimeout(1800);
  const first = await stage(page).screenshot();
  await page.waitForTimeout(600);
  expect(Buffer.compare(first, await stage(page).screenshot()), 'gambar diam saat dijeda').toBe(0);
  await section(page).getByRole('button', { name: 'Putar animasi model' }).click();
  await page.waitForTimeout(600);
  expect(Buffer.compare(first, await stage(page).screenshot()), 'bergerak lagi saat diputar').not.toBe(0);
  expect(errors).toEqual([]);
});

test('bedah PC: gerak dikurangi menampilkan gambar cadangan tanpa kanvas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'networkidle' });
  await stage(page).scrollIntoViewIfNeeded();
  const poster = stage(page).locator('img');
  await expect.poll(() => poster.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  await expect(section(page).locator('canvas')).toHaveCount(0);
  await section(page).getByRole('tab', { name: 'Upgrade' }).click();
  await expect(poster).toHaveAttribute('alt', /Upgrade/);
});

test('bedah PC: tanpa WebGL tetap menampilkan gambar cadangan', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      return type.startsWith('webgl') ? null : original.call(this, type as '2d', ...(rest as []));
    } as typeof original;
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  await stage(page).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await expect(stage(page)).toHaveAttribute('data-state', 'poster');
  await expect(stage(page).locator('img')).toBeVisible();
});

test('bedah PC: bolak-balik halaman tidak menumpuk kanvas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/', { waitUntil: 'networkidle' });
  for (let round = 0; round < 3; round += 1) {
    await stage(page).scrollIntoViewIfNeeded();
    await expect(stage(page)).toHaveAttribute('data-state', '3d', { timeout: 20_000 });
    await expect(page.locator('[data-bedah-stage] canvas:visible')).toHaveCount(1);
    await section(page).getByRole('link', { name: 'Lihat layanan' }).click();
    await expect(page).toHaveURL(/\/jasa\//);
    await page.goBack({ waitUntil: 'networkidle' });
  }
});
