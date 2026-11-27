import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('data/marketplace', () => {
  // Menjalankan validator lewat `npm test` agar ikut diperiksa CI.
  it('lolos validator', () => {
    const output = execFileSync(process.execPath, ['scripts/validate-marketplace.mjs'], {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    expect(output).toContain('valid');
  }, 30_000);
});
