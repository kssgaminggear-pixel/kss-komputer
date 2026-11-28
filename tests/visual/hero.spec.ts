import { expect, test, type Page } from '@playwright/test';

const carousel = (page: Page) => page.locator('[aria-roledescription="carousel"]');
const activeTab = (page: Page) => carousel(page).locator('button[aria-current="true"]');

test('hero jasa: satu H1, indikator, jeda, dan keyboard berfungsi', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toHaveCount(1);
  const first = await activeTab(page).getAttribute('aria-label');

  await carousel(page).getByRole('button', { name: 'Jeda putar otomatis' }).click();
  await expect(carousel(page).getByRole('button', { name: 'Putar otomatis' })).toBeVisible();

  await activeTab(page).focus();
  await page.keyboard.press('ArrowRight');
  await expect(activeTab(page)).not.toHaveAttribute('aria-label', first ?? '');
  await expect(carousel(page).locator('[aria-roledescription="slide"]:not([inert])')).toHaveCount(1);

  // Gambar slide yang tampil harus benar-benar termuat.
  const image = carousel(page).locator('[aria-roledescription="slide"]:not([inert]) img').first();
  await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test('hero jasa: tanpa putar otomatis saat gerak dikurangi', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'networkidle' });
  const first = await activeTab(page).getAttribute('aria-label');
  await page.waitForTimeout(1500);
  await expect(activeTab(page)).toHaveAttribute('aria-label', first ?? '');
  await expect(carousel(page).getByRole('button', { name: /putar otomatis/i })).toHaveCount(0);
});

test('hero jasa: berpindah sendiri bila tidak dijeda', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.mouse.move(2, 2);
  const first = await activeTab(page).getAttribute('aria-label');
  await expect(activeTab(page)).not.toHaveAttribute('aria-label', first ?? '', { timeout: 12_000 });
});

test('hero jasa: kontrol tidak tertutup tombol melayang', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
    { width: 360, height: 640 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/', { waitUntil: 'networkidle' });
    for (const control of await carousel(page).locator('button:visible').all()) {
      const covered = await control.evaluate((el) => {
        const box = el.getBoundingClientRect();
        const top = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
        return !(top && el.contains(top));
      });
      expect(covered, `${await control.getAttribute('aria-label')} di ${viewport.width}px`).toBe(false);
    }
  }
});
