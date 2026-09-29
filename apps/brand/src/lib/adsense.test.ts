import { describe, expect, it } from 'vitest';
import { adsensePublisher, siteConfig } from '../../../../scripts/site-config.mjs';

const origins = { BRAND_SITE_URL: 'https://projects.example.com', TILE_SITE_URL: 'https://tile.example.com' };
// Google's documented placeholder, only for local tests; never an actual account claim.
const fixture = 'pub-0000000000000000';

describe('optional AdSense publisher configuration', () => {
  it('omits advertising verification unless explicitly configured', () => {
    for (const env of [{}, origins, { ...origins, ADSENSE_PUBLISHER_ID: '   ' }]) {
      expect(siteConfig(env).adsensePublisher).toBeUndefined();
    }
  });

  it('uses one trimmed public ID for both related sites without lifting identity/contact gates', () => {
    expect(siteConfig({ ...origins, ADSENSE_PUBLISHER_ID: ` ${fixture} ` })).toMatchObject({
      adsensePublisher: fixture, operator: { complete: false }, contact: { complete: false },
    });
  });

  it('requires both public origins and rejects development fallback', () => {
    for (const env of [{}, { TILE_SITE_URL: origins.TILE_SITE_URL }]) {
      expect(() => siteConfig({ ...env, ADSENSE_PUBLISHER_ID: fixture }, true)).toThrow(/both configured public HTTPS origins/);
    }
  });

  it.each(['ca-pub-0000000000000000', 'pub-123', 'pub-00000000000000000', 'pub-abcdefghijklmnop', 'pub-0000000000000000\n', 'pub-0000000000000000\t', '<meta content="x">', 'pub-0000000000000000, RESELLER', 'pub-0000000000000000" onload="x', 'pub-００００００００００００００００', 123])('rejects invalid publisher format: %s', value => {
    expect(() => adsensePublisher(value, origins.BRAND_SITE_URL, origins.TILE_SITE_URL)).toThrow(/ADSENSE_PUBLISHER_ID/);
  });
});
