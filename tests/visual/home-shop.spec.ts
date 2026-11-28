import { expect, test, type Page } from '@playwright/test';

const shop = (page: Page) => page.locator('#toko-kss');

test('toko Beranda: 18 kartu di layar lebar, 12 di HP, gambar termuat', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900, cards: 18, paket: 6 },
    { width: 390, height: 844, cards: 12, paket: 4 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(shop(page).locator('article:visible')).toHaveCount(viewport.cards);
    await expect(shop(page).locator('article:visible a[href^="/paket-rakitan/"]')).toHaveCount(viewport.paket);

    // Paket tidak masuk keranjang eceran.
    const paketCards = shop(page).locator('article', { has: page.locator('a[href^="/paket-rakitan/"]') });
    await expect(paketCards.getByRole('button')).toHaveCount(0);

    for (const image of await shop(page).locator('img:visible').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  }
});

test('toko Beranda: pencarian membuka /toko dengan kata kunci', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const input = shop(page).getByRole('searchbox');
  await input.fill('monitor');
  await input.press('Enter');
  await expect(page).toHaveURL(/\/toko\?q=monitor/);
});

test('toko Beranda: tombol keranjang menambah produk', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const button = shop(page).getByRole('button', { name: /^Tambah .* ke keranjang$/ }).and(page.locator(':enabled')).first();
  await button.click();
  await expect(button).toContainText('Ditambahkan');
});
