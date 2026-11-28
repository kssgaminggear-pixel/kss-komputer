import { expect, test } from '@playwright/test';

test('tanya jawab Beranda: bisa dibuka lewat keyboard, ubin hanya di layar lebar', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900, tiles: 4 },
    { width: 390, height: 844, tiles: 0 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/', { waitUntil: 'networkidle' });
    const faq = page.locator('section[aria-labelledby="judul-faq"]');
    await expect(faq.locator('details')).toHaveCount(4);
    await expect(faq.locator('img:visible')).toHaveCount(viewport.tiles);

    const first = faq.locator('details').first();
    await first.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(first).toHaveAttribute('open', '');
    await expect(first.locator('p')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  }
});

test('banner konsultasi: tombol menuju konsultasi dan WhatsApp', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const banner = page.locator('#konsultasi-budget');
  await expect(banner.getByRole('link', { name: 'Mulai konsultasi' })).toHaveAttribute('href', '/konsultasi');
  await expect(banner.getByRole('link', { name: 'Chat WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\//);
});
