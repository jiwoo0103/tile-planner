// Local build-only verification. Reserved example.com fixtures are never deployed or fetched.
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const baseEnv = { ...process.env };
for (const key of ['BRAND_SITE_URL', 'TILE_SITE_URL', 'PUBLIC_SITE_URL', 'BRAND_NAME', 'OPERATOR_PUBLIC_NAME', 'OPERATOR_BIO', 'OPERATOR_CONTACT_EMAIL', 'BRAND_GOOGLE_SITE_VERIFICATION', 'TILE_GOOGLE_SITE_VERIFICATION', 'ADSENSE_PUBLISHER_ID']) delete baseEnv[key];
const fixtureEnv = { ...baseEnv, BRAND_SITE_URL: 'https://projects.example.com', TILE_SITE_URL: 'https://tile.example.com', BRAND_NAME: 'Verification fixture', OPERATOR_PUBLIC_NAME: 'Fixture & <operator>', OPERATOR_BIO: 'Fixture introduction <script>alert("fixture")</script>.', OPERATOR_CONTACT_EMAIL: 'reports+checks&review@example.com', BRAND_GOOGLE_SITE_VERIFICATION: 'Brand_fixture-only_123', TILE_GOOGLE_SITE_VERIFICATION: 'Tile_fixture-only_456' };
// Google's documented placeholder is a local fixture, never a real publisher or deployment value.
fixtureEnv.ADSENSE_PUBLISHER_ID = 'pub-0000000000000000';
const astro = resolve('node_modules/astro/bin/astro.mjs');
const build = (app, env) => {
  const result = spawnSync(process.execPath, [astro, 'build'], { cwd: resolve('apps', app), env, encoding: 'utf8' });
  assert.equal(result.status, 0, `${app} build failed:\n${result.stdout}\n${result.stderr}`);
};
const read = (app, path) => readFileSync(resolve('apps', app, 'dist', path), 'utf8');
const htmlFiles = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? htmlFiles(join(dir, entry.name)) : entry.name.endsWith('.html') ? [join(dir, entry.name)] : []);
const checkNoLoopback = () => {
  for (const app of ['brand', 'tile']) {
    for (const file of htmlFiles(resolve('apps', app, 'dist'))) {
      assert.doesNotMatch(readFileSync(file, 'utf8'), /https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])/i, `${file} leaks a development origin`);
    }
  }
};
const sitemapLocations = xml => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const checkSitemap = (app, origin) => {
  assert.deepEqual(sitemapLocations(read(app, 'sitemap-index.xml')), [`${origin}/sitemap-0.xml`]);
  const urls = sitemapLocations(read(app, 'sitemap-0.xml'));
  assert.equal(urls.length, new Set(urls).size, `${app} sitemap has duplicate URLs`);
  const indexable = [];
  for (const file of htmlFiles(resolve('apps', app, 'dist'))) {
    const html = readFileSync(file, 'utf8');
    if (/name="robots" content="index, follow"/.test(html)) {
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)[1];
      indexable.push(canonical);
    }
  }
  assert.deepEqual([...urls].sort(), indexable.sort(), `${app} sitemap must list exactly its indexable HTML pages`);
  for (const url of urls) {
    const parsed = new URL(url);
    assert.equal(parsed.origin, origin);
    assert.equal(parsed.search + parsed.hash, '');
    assert.ok(existsSync(resolve('apps', app, 'dist', `.${parsed.pathname}`, 'index.html')), `${url} must have a built page`);
  }
};
const checkVerification = (app, expected) => {
  for (const file of htmlFiles(resolve('apps', app, 'dist'))) {
    const html = readFileSync(file, 'utf8');
    const tags = html.match(/<meta name="google-site-verification"[^>]*>/g) ?? [];
    if (expected && file === resolve('apps', app, 'dist/index.html')) {
      assert.deepEqual(tags, [`<meta name="google-site-verification" content="${expected}">`]);
      assert.ok(html.indexOf(tags[0]) < html.indexOf('</head>'), 'Verification belongs in the homepage head');
    } else assert.deepEqual(tags, [], `${file} must not have a verification tag`);
  }
};
const checkAdsense = (app, publisher) => {
  assert.equal(existsSync(resolve('apps', app, 'dist/ads.txt')), Boolean(publisher), `${app} ads.txt must be absent without a publisher`);
  if (publisher) assert.equal(read(app, 'ads.txt'), `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`);
  for (const file of htmlFiles(resolve('apps', app, 'dist'))) {
    const html = readFileSync(file, 'utf8');
    const tags = html.match(/<meta name="google-adsense-account"[^>]*>/g) ?? [];
    if (publisher && file === resolve('apps', app, 'dist/index.html')) {
      assert.deepEqual(tags, [`<meta name="google-adsense-account" content="ca-${publisher}">`]);
      assert.ok(html.indexOf(tags[0]) < html.indexOf('</head>'), 'Publisher metadata belongs in the homepage head');
    } else assert.deepEqual(tags, [], `${file} must not have publisher metadata`);
    assert.doesNotMatch(html, /adsbygoogle|googlesyndication|doubleclick|<ins\b/i, `${file} must not activate advertising`);
    if (!publisher) assert.doesNotMatch(html, /(?:ca-)?pub-\d{16}/, `${file} must not retain a publisher fixture`);
  }
};

try {
  for (const app of ['brand', 'tile']) build(app, fixtureEnv);
  for (const app of ['brand', 'tile']) checkAdsense(app, fixtureEnv.ADSENSE_PUBLISHER_ID);
  checkVerification('brand', fixtureEnv.BRAND_GOOGLE_SITE_VERIFICATION);
  checkVerification('tile', fixtureEnv.TILE_GOOGLE_SITE_VERIFICATION);
  const brand = read('brand', 'projects/tile-planner/index.html');
  const brandHome = read('brand', 'index.html');
  const tile = read('tile', 'index.html');
  assert.match(brand, /<link rel="canonical" href="https:\/\/projects\.example\.com\/projects\/tile-planner\/"/);
  assert.match(brand, /href="https:\/\/tile\.example\.com\/calculator\/\?/);
  assert.match(brand, /Verification fixture/);
  assert.match(brandHome, /<link rel="canonical" href="https:\/\/projects\.example\.com\/"/);
  assert.match(brandHome, /href="https:\/\/tile\.example\.com\/"/);
  assert.match(brandHome, /href="\/projects\/tile-planner\/"/);
  assert.match(brandHome, /data-project="tile-planner"/);
  assert.match(tile, /<link rel="canonical" href="https:\/\/tile\.example\.com\/"/);
  assert.match(tile, /href="https:\/\/projects\.example\.com\/projects\/tile-planner\/"/);
  assert.match(tile, /href="https:\/\/projects\.example\.com\/about\/"/);
  assert.match(tile, /href="https:\/\/projects\.example\.com\/contact\/"/);
  assert.match(tile, /href="https:\/\/projects\.example\.com\/privacy\/"/);
  assert.match(brandHome, /href="\/about\/"/);
  assert.match(brandHome, /href="\/contact\/"/);
  assert.match(brandHome, /href="\/privacy\/"/);
  const privacy = read('brand', 'privacy/index.html');
  assert.match(privacy, /name="robots" content="noindex, nofollow"/);
  assert.match(privacy, /operating details unverified/);
  assert.match(privacy, /Fixture &amp; &lt;operator&gt;/);
  assert.match(privacy, /reports\+checks&amp;review@example\.com/);
  assert.doesNotMatch(privacy, /<form|<script/);
  assert.doesNotMatch(read('brand', 'sitemap-0.xml'), /https:\/\/projects\.example\.com\/privacy\//);
  const about = read('brand', 'about/index.html');
  assert.match(about, /name="robots" content="index, follow"/);
  assert.match(about, /<link rel="canonical" href="https:\/\/projects\.example\.com\/about\/"/);
  assert.match(about, /Fixture &amp; &lt;operator&gt;/);
  assert.match(about, /Fixture introduction &lt;script&gt;alert/);
  assert.doesNotMatch(about, /<script>|operator information pending/);
  assert.ok(read('brand', 'sitemap-0.xml').includes('https://projects.example.com/about/'));
  const contact = read('brand', 'contact/index.html');
  assert.match(contact, /name="robots" content="index, follow"/);
  assert.match(contact, /<link rel="canonical" href="https:\/\/projects\.example\.com\/contact\/"/);
  assert.match(contact, /reports\+checks&amp;review@example\.com/);
  assert.match(contact, /id="copy-email"/);
  assert.doesNotMatch(contact, /<form|contact email pending/);
  const mailto = contact.match(/href="(mailto:[^"]+)"/)[1].replaceAll('&amp;', '&');
  const emailUrl = new URL(mailto);
  assert.equal(decodeURIComponent(emailUrl.pathname), fixtureEnv.OPERATOR_CONTACT_EMAIL);
  assert.deepEqual([...emailUrl.searchParams.keys()], ['subject', 'body']);
  assert.ok(emailUrl.searchParams.get('body').includes('Observed result or message:'));
  assert.ok(read('brand', 'sitemap-0.xml').includes('https://projects.example.com/contact/'));
  for (const [app, origin] of [['brand', fixtureEnv.BRAND_SITE_URL], ['tile', fixtureEnv.TILE_SITE_URL]]) {
    assert.ok(read(app, 'robots.txt').includes(`Sitemap: ${origin}/sitemap-index.xml`));
    checkSitemap(app, origin);
  }
  checkNoLoopback();
  const missingIdentity = { ...fixtureEnv };
  delete missingIdentity.OPERATOR_PUBLIC_NAME;
  delete missingIdentity.OPERATOR_BIO;
  delete missingIdentity.OPERATOR_CONTACT_EMAIL;
  delete missingIdentity.BRAND_GOOGLE_SITE_VERIFICATION;
  delete missingIdentity.TILE_GOOGLE_SITE_VERIFICATION;
  delete missingIdentity.ADSENSE_PUBLISHER_ID;
  build('brand', missingIdentity);
  build('tile', missingIdentity);
  checkVerification('brand');
  checkVerification('tile');
  for (const app of ['brand', 'tile']) checkAdsense(app);
  checkSitemap('brand', fixtureEnv.BRAND_SITE_URL);
  checkSitemap('tile', fixtureEnv.TILE_SITE_URL);
  const incompleteAbout = read('brand', 'about/index.html');
  assert.match(incompleteAbout, /name="robots" content="noindex, nofollow"/);
  assert.match(incompleteAbout, /operator information pending/);
  assert.doesNotMatch(read('brand', 'sitemap-0.xml'), /https:\/\/projects\.example\.com\/about\//);
  const incompleteContact = read('brand', 'contact/index.html');
  assert.match(incompleteContact, /name="robots" content="noindex, nofollow"/);
  assert.match(incompleteContact, /contact email pending/);
  assert.doesNotMatch(incompleteContact, /mailto:|id="copy-email"|<form/);
  assert.doesNotMatch(read('brand', 'sitemap-0.xml'), /https:\/\/projects\.example\.com\/contact\//);
  const incompletePrivacy = read('brand', 'privacy/index.html');
  assert.match(incompletePrivacy, /name="robots" content="noindex, nofollow"/);
  assert.match(incompletePrivacy, /No public contact mailbox has been supplied/);
  assert.doesNotMatch(read('brand', 'sitemap-0.xml'), /https:\/\/projects\.example\.com\/privacy\//);
  console.log('Configured build: optional homepage Search Console/AdSense metadata, exact ads.txt presence/content without ad activation, per-origin sitemaps/canonicals and About/Contact/Privacy gates passed.');
} finally {
  // Leave normal private local builds, not the fixture origins, in both output directories.
  for (const app of ['brand', 'tile']) build(app, baseEnv);
}
for (const app of ['brand', 'tile']) {
  checkVerification(app);
  checkAdsense(app);
  for (const file of htmlFiles(resolve('apps', app, 'dist'))) {
    const html = readFileSync(file, 'utf8');
    assert.match(html, /name="robots" content="noindex, nofollow"/);
    assert.doesNotMatch(html, /rel="canonical"|example\.com|Verification fixture/);
  }
  assert.match(read(app, 'robots.txt'), /Disallow: \//);
  assert.equal(existsSync(resolve('apps', app, 'dist/sitemap-index.xml')), false);
}
checkNoLoopback();
assert.match(read('brand', 'about/index.html'), /operator information pending/);
assert.match(read('brand', 'contact/index.html'), /contact email pending/);
assert.doesNotMatch(read('brand', 'contact/index.html'), /mailto:|id="copy-email"|<form/);
assert.doesNotMatch(read('tile', 'index.html'), /Operator &amp; principles/);
assert.doesNotMatch(read('tile', 'index.html'), /Contact &amp; error reports/);
assert.doesNotMatch(read('tile', 'index.html'), /Privacy &amp; data/);
assert.match(read('brand', 'privacy/index.html'), /No public contact mailbox has been supplied/);
assert.match(read('brand', 'privacy/index.html'), /operating details unverified/);
console.log('Unconfigured build: noindex, blocked crawlers, no invented canonicals/sitemaps or loopback links; restored both private builds.');
