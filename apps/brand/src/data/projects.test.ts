import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { operatorProfile, publicOrigin, siteConfig } from '../../../../scripts/site-config.mjs';
import { projects, projectUrl, tileWalkthrough } from './projects';
import { asNumber, decimal, measurement, type LengthUnit } from '../../../tile/src/lib/calculator';
import { planLayout } from '../../../tile/src/lib/layout';

describe('independent site configuration', () => {
  it('keeps unconfigured builds private and enables loopback links only for dev', () => {
    expect(siteConfig({})).toMatchObject({ brandSite: undefined, tileSite: undefined, brandLink: undefined, tileLink: undefined, brandName: 'Projects' });
    expect(siteConfig({}, true)).toMatchObject({ brandSite: undefined, tileSite: undefined, brandLink: 'http://localhost:4322', tileLink: 'http://localhost:4321' });
  });
  it.each(['http://site.com', 'https://localhost', 'https://localhost:4322', 'https://127.0.0.1', 'https://192.168.1.1', 'https://[::1]', 'https://site.local', 'https://site.test', 'https://site.invalid', 'https://site.com/path', 'https://site.com/?q=x', 'https://site.com/#hash', 'https://user:password@site.com', 'https://site.com:8443'])('rejects a non-public origin %s', value => {
    expect(() => publicOrigin(value, 'SITE')).toThrow();
  });
  it('normalizes each public origin independently and keeps the legacy variable tile-only', () => {
    expect(siteConfig({ BRAND_SITE_URL: 'https://projects.example.com/', PUBLIC_SITE_URL: 'https://tile.example.com/' })).toMatchObject({ brandSite: 'https://projects.example.com', tileSite: 'https://tile.example.com', brandLink: 'https://projects.example.com', tileLink: 'https://tile.example.com' });
    expect(siteConfig({ PUBLIC_SITE_URL: 'https://tile.example.com' }).brandSite).toBeUndefined();
  });
  it('rejects conflicting aliases, missing public project destination and overlapping origins', () => {
    expect(() => siteConfig({ TILE_SITE_URL: 'https://a.example.com', PUBLIC_SITE_URL: 'https://b.example.com' })).toThrow();
    expect(() => siteConfig({ BRAND_SITE_URL: 'https://a.example.com' })).toThrow();
    expect(() => siteConfig({ BRAND_SITE_URL: 'https://a.example.com', TILE_SITE_URL: 'https://a.example.com' })).toThrow();
  });
});

describe('operator publication information', () => {
  it('keeps missing, whitespace-only and partial identity incomplete without breaking local builds', () => {
    expect(operatorProfile({})).toEqual({ name: undefined, bio: undefined, complete: false });
    expect(operatorProfile({ OPERATOR_PUBLIC_NAME: ' ', OPERATOR_BIO: '' }).complete).toBe(false);
    expect(operatorProfile({ OPERATOR_PUBLIC_NAME: 'Fixture operator' }).complete).toBe(false);
    expect(operatorProfile({ OPERATOR_BIO: 'Fixture introduction.' }).complete).toBe(false);
    expect(siteConfig({ BRAND_SITE_URL: 'https://projects.example.com', TILE_SITE_URL: 'https://tile.example.com' }).operator.complete).toBe(false);
  });
  it('trims supplied text without inventing identity or treating it as markup', () => {
    expect(operatorProfile({ OPERATOR_PUBLIC_NAME: '  Fixture & <operator>  ', OPERATOR_BIO: '  An introduction with <script>literal text</script>.  ' })).toEqual({ name: 'Fixture & <operator>', bio: 'An introduction with <script>literal text</script>.', complete: true });
  });
  it('rejects oversized fields and control characters', () => {
    expect(() => operatorProfile({ OPERATOR_PUBLIC_NAME: 'a'.repeat(121) })).toThrow(/OPERATOR_PUBLIC_NAME/);
    expect(() => operatorProfile({ OPERATOR_BIO: 'a'.repeat(1001) })).toThrow(/OPERATOR_BIO/);
    expect(() => operatorProfile({ OPERATOR_PUBLIC_NAME: 'name\nnew line' })).toThrow(/OPERATOR_PUBLIC_NAME/);
    expect(() => operatorProfile({ OPERATOR_BIO: 'intro\u0000' })).toThrow(/OPERATOR_BIO/);
  });
});

it('reuses one implemented project record with real routes and fails closed without an origin', () => {
  expect(projects).toHaveLength(1);
  const [project] = projects;
  expect(project.id).toBe('tile-planner');
  expect(project.detailPath).toBe('/projects/tile-planner/');
  expect(existsSync(new URL('../pages/projects/tile-planner.astro', import.meta.url))).toBe(true);
  expect(projectUrl(project, {})).toBeUndefined();
  expect(projectUrl(project, { tile: 'https://tile.example.com' }, '/calculator/')).toBe('https://tile.example.com/calculator/');
  for (const tool of project.tools) {
    expect(existsSync(new URL(`../../../tile/src/pages${tool.path}index.astro`, import.meta.url)) || existsSync(new URL(`../../../tile/src/pages${tool.path.slice(0, -1)}.astro`, import.meta.url))).toBe(true);
  }
});

it('reproduces the detail page walkthrough using its actual URL inputs and live engines', () => {
  const params = new URL(tileWalkthrough.layoutPath, 'https://tile.example.com').searchParams;
  const dimension = (name: string) => measurement(params.get(name)!, params.get(`${name}Unit`)! as LengthUnit);
  const input = { roomWidth: dimension('roomWidth'), roomLength: dimension('roomLength'), tileWidth: dimension('tileWidth'), tileLength: dimension('tileLength'), waste: params.get('waste')!, tilesPerBox: params.get('tilesPerBox')!, pricePerBox: params.get('pricePerBox')! };
  const corner = planLayout(input, decimal(params.get('grout')!), params.get('orientation') as '0', 'corner');
  const center = planLayout(input, decimal(params.get('grout')!), '0', 'center');
  expect(corner.estimate).toMatchObject({ rawTiles: 49.5, baseTiles: 50, requiredTiles: 55, boxes: 7, purchasedTiles: 56, extraTiles: 1, cost: 336 });
  expect([corner.x.count, corner.y.count, corner.full, corner.cut]).toEqual([9, 6, 40, 14]);
  expect([center.full, center.cut, asNumber(center.x.first), asNumber(center.x.last), asNumber(center.y.first), asNumber(center.y.last)]).toEqual([28, 26, 296.8, 296.8, 452.2, 452.2]);
  expect(center.estimate).toEqual(corner.estimate);
  expect(new URL(tileWalkthrough.calculatorPath, 'https://tile.example.com').search).toBe(`?${params}`);
  expect(tileWalkthrough.results.map(row => row.value)).toEqual(['99 sq ft', '55 tiles', '7 boxes', '56 tiles', '$336.00 USD']);
  const page = readFileSync(new URL('../pages/projects/tile-planner.astro', import.meta.url), 'utf8');
  for (const text of ['40 full tiles and 14 cut pieces', '296.8 mm', '452.2 mm', '28 full tiles and 26 cut pieces', '2,500 placed pieces']) expect(page).toContain(text);
});

it('publishes byte-identical real verification screenshots', () => {
  const hash = (url: URL) => createHash('sha256').update(readFileSync(url)).digest('hex');
  for (const name of ['calculator-desktop.png', 'calculator-mobile.png', 'layout-desktop.png']) {
    expect(hash(new URL(`../../public/images/tile-planner/${name}`, import.meta.url)))
      .toBe(hash(new URL(`../../../../verification/${name}`, import.meta.url)));
  }
});

it('supports another finished project origin from metadata without leaking a configured-site fallback', () => {
  const project = { ...projects[0], id: 'verification-fixture', siteKey: undefined, siteUrl: 'https://fixture.example.com/' };
  expect(projectUrl(project, {})).toBe('https://fixture.example.com/');
  expect(projectUrl(project, {}, '/tool/')).toBe('https://fixture.example.com/tool/');
  expect(() => projectUrl({ ...project, siteUrl: 'javascript:alert(1)' }, {})).toThrow();
  expect(() => projectUrl({ ...project, siteUrl: 'http://localhost:4321' }, {})).toThrow();
  expect(projectUrl({ ...project, siteKey: 'tile' }, {})).toBeUndefined();
});
