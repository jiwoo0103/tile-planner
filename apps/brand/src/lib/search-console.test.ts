import { describe, expect, it } from 'vitest';
import { searchConsoleVerification, siteConfig } from '../../../../scripts/site-config.mjs';

const origins = { BRAND_SITE_URL: 'https://projects.example.com', TILE_SITE_URL: 'https://tile.example.com' };

describe('Search Console public HTML-tag configuration', () => {
  it('is optional for both configured and private builds', () => {
    for (const env of [{}, origins]) {
      expect(siteConfig(env)).toMatchObject({ brandVerification: undefined, tileVerification: undefined });
    }
    expect(searchConsoleVerification('  ', 'fixture', undefined)).toBeUndefined();
  });

  it('keeps independently supplied homepage values separate and trims spaces', () => {
    expect(siteConfig({ ...origins, BRAND_GOOGLE_SITE_VERIFICATION: ' Brand_fixture-123 ', TILE_GOOGLE_SITE_VERIFICATION: 'Tile_fixture-456' }))
      .toMatchObject({ brandVerification: 'Brand_fixture-123', tileVerification: 'Tile_fixture-456' });
    expect(siteConfig({ TILE_SITE_URL: origins.TILE_SITE_URL, TILE_GOOGLE_SITE_VERIFICATION: 'Tile_fixture-456' }))
      .toMatchObject({ brandVerification: undefined, tileVerification: 'Tile_fixture-456' });
  });

  it('requires the matching public origin and never uses a development fallback', () => {
    expect(() => siteConfig({ BRAND_GOOGLE_SITE_VERIFICATION: 'Fixture' }, true)).toThrow(/public HTTPS origin/);
    expect(() => siteConfig({ TILE_GOOGLE_SITE_VERIFICATION: 'Fixture' }, true)).toThrow(/public HTTPS origin/);
    expect(() => siteConfig({ TILE_SITE_URL: origins.TILE_SITE_URL, BRAND_GOOGLE_SITE_VERIFICATION: 'Fixture' })).toThrow(/public HTTPS origin/);
  });

  it.each(['<meta name="google-site-verification" content="x">', 'x" /><script>alert(1)</script>', 'x&y', "x'y", 'google-site-verification=x', 'x y', 'x\ny', 'x\t', 'x\u0000', 'é', 'x'.repeat(257), 123])('rejects malformed or HTML-injecting content: %s', value => {
    expect(() => searchConsoleVerification(value, 'FIXTURE_VERIFICATION', origins.BRAND_SITE_URL)).toThrow(/FIXTURE_VERIFICATION/);
  });
});
