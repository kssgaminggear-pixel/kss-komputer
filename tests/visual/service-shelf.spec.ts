import { expect, test } from '@playwright/test';

test('rak jasa: 10 kartu, panah dan titik menggeser tanpa melebarkan halaman', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/', { waitUntil: 'networkidle' });
    const shelf = page.locator('section[aria-labelledby="rak-jasa"]');
    const rack = shelf.locator('ul');
    await expect(rack.locator('li')).toHaveCount(10);
    await shelf.scrollIntoViewIfNeeded();

    const position = () => rack.evaluate((el) => el.scrollLeft);
    const dots = shelf.getByRole('button', { name: /^Halaman layanan/ });
    expect(await dots.count()).toBeGreaterThan(1);

    if (viewport.width >= 640) {
      await expect(shelf.getByRole('button', { name: 'Layanan sebelumnya' })).toBeDisabled();
      await shelf.getByRole('button', { name: 'Layanan berikutnya' }).click();
      await expect.poll(position).toBeGreaterThan(0);
    }

    await dots.last().click();
    await expect(dots.last()).toHaveAttribute('aria-current', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  }
});

test('rak jasa: gambar kartu yang tampil termuat', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const rack = page.locator('section[aria-labelledby="rak-jasa"] ul');
  await rack.scrollIntoViewIfNeeded();
  const image = rack.locator('img').first();
  await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
});
