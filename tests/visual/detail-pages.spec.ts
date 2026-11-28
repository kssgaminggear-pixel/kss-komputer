import { expect, test } from '@playwright/test';

const PAKET = '/paket-rakitan/kss-esports-champion-1080p';

test('detail paket: upgrade dilipat, total berubah, tanpa selisih harga', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(PAKET, { waitUntil: 'networkidle' });
  const card = page.locator('[data-order-card]');
  const total = card.locator('.kss-price').first();
  const before = await total.innerText();

  const group = page.locator('[data-upgrade-group]').first();
  await expect(group).not.toHaveAttribute('open', /.*/);
  await group.locator('summary').click();
  expect(await group.innerText(), 'pilihan upgrade tidak menampilkan harga').not.toMatch(/Rp/);
  await group.locator('button[aria-pressed="false"]').first().click();
  await expect.poll(() => total.innerText()).not.toBe(before);

  const specs = page.locator('[data-spec-list]');
  await specs.locator('summary').click();
  expect(await specs.innerText(), 'rincian bagian tidak menampilkan harga').not.toMatch(/Rp/);
  await expect(page.locator('[data-action-bar]')).toBeHidden();
});

test('detail paket di HP: bar total menempel lalu hilang saat kartu pesan terlihat', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(PAKET, { waitUntil: 'networkidle' });
  const bar = page.locator('[data-action-bar]');
  await expect(bar).toBeVisible();
  await expect(bar.getByRole('button', { name: 'Pesan' })).toBeVisible();
  await expect(bar.getByRole('link', { name: 'Tokopedia' })).toBeVisible();
  const barBox = (await bar.boundingBox())!;
  const csBox = (await page.locator('[data-cs-fab]').boundingBox())!;
  expect(csBox.y + csBox.height).toBeLessThanOrEqual(barBox.y);
  await page.locator('[data-order-card]').scrollIntoViewIfNeeded();
  await expect(bar).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test('tentang kami: dipimpin gambar berlabel ilustrasi dan tanpa gulir samping', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/tentang-kami', { waitUntil: 'networkidle' });
    const image = page.locator('main img').first();
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    await expect(page.locator('main').getByText('Ilustrasi', { exact: true }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  }
});
