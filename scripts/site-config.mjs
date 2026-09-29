/** Validate build-time public origins; never accept local preview addresses as public sites. */
export function publicOrigin(value, name) {
  if (!value?.trim()) return undefined;
  let url;
  try { url = new URL(value); } catch { throw new Error(`${name} must be a public HTTPS origin.`); }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.username || url.password || url.search || url.hash || url.port ||
      !host.includes('.') || host.includes(':') || /^[\d.]+$/.test(host) ||
      /(?:^|\.)(localhost|local|internal|test|invalid|example)$/.test(host)) {
    throw new Error(`${name} must be a public HTTPS origin without credentials, port, path, query or hash.`);
  }
  return url.origin;
}

/** Public text supplied by the operator, not inferred from a brand or project name. */
export function operatorProfile(env) {
  const field = (key, max) => {
    const raw = env[key];
    if (raw === undefined || raw === '') return undefined;
    if (typeof raw !== 'string' || /[\u0000-\u001f\u007f]/.test(raw) || raw.trim().length > max) {
      throw new Error(`${key} must be plain single-line text of at most ${max} characters.`);
    }
    return raw.trim() || undefined;
  };
  const name = field('OPERATOR_PUBLIC_NAME', 120);
  const bio = field('OPERATOR_BIO', 1000);
  return { name, bio, complete: Boolean(name && bio) };
}

/** One public mailbox; syntax checks cannot establish ownership or deliverability. */
export function operatorContact(env) {
  const raw = env.OPERATOR_CONTACT_EMAIL;
  if (raw === undefined || (typeof raw === 'string' && !raw.trim())) return { email: undefined, complete: false };
  const invalid = () => { throw new Error('OPERATOR_CONTACT_EMAIL must be one plain email address with a public domain.'); };
  if (typeof raw !== 'string' || /[\u0000-\u001f\u007f]/.test(raw)) invalid();
  const email = raw.trim();
  const parts = email.split('@');
  if (email.length > 254 || parts.length !== 2) invalid();
  const [local, domain] = parts;
  if (!local || local.length > 64 || !/^[A-Za-z0-9.!#$%&'*+\-/=?^_`{|}~]+$/.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..')) invalid();
  const labels = domain.split('.');
  if (labels.length < 2 || labels.some(label => !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label)) ||
      !/^[A-Za-z]{2,63}$/.test(labels.at(-1)) || /(?:^|\.)(localhost|local|internal|test|invalid|example)$/i.test(domain)) invalid();
  return { email, complete: true };
}

/** Public HTML-tag content, never the full tag or a DNS record. Does not prove ownership. */
export function searchConsoleVerification(value, name, origin) {
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'string' || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error(`${name} must be the single-line HTML-tag content value from Search Console.`);
  }
  const token = value.trim();
  if (!token) return undefined;
  if (!/^[A-Za-z0-9_-]{1,256}$/.test(token)) {
    throw new Error(`${name} must contain only letters, digits, underscores or hyphens (at most 256 characters).`);
  }
  if (!origin) throw new Error(`${name} requires its site's configured public HTTPS origin.`);
  return token;
}

/** Public publisher identifier; syntax cannot establish account control or approval. */
export function adsensePublisher(value, brandOrigin, tileOrigin) {
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'string' || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error('ADSENSE_PUBLISHER_ID must be a single-line pub- identifier with 16 digits.');
  }
  const publisher = value.trim();
  if (!publisher) return undefined;
  if (!/^pub-\d{16}$/.test(publisher)) throw new Error('ADSENSE_PUBLISHER_ID must use pub- followed by exactly 16 digits.');
  if (!brandOrigin || !tileOrigin) throw new Error('ADSENSE_PUBLISHER_ID requires both configured public HTTPS origins.');
  return publisher;
}

/** Each app has its own canonical origin. PUBLIC_SITE_URL is a tile-only legacy alias. */
export function siteConfig(env, development = false) {
  const brand = publicOrigin(env.BRAND_SITE_URL, 'BRAND_SITE_URL');
  const tile = publicOrigin(env.TILE_SITE_URL, 'TILE_SITE_URL');
  const legacyTile = publicOrigin(env.PUBLIC_SITE_URL, 'PUBLIC_SITE_URL');
  if (tile && legacyTile && tile !== legacyTile) throw new Error('TILE_SITE_URL and PUBLIC_SITE_URL disagree.');
  const tileSite = tile ?? legacyTile;
  if (brand && !tileSite) throw new Error('BRAND_SITE_URL requires TILE_SITE_URL so project links target the real tile site.');
  if (brand && brand === tileSite) throw new Error('Brand and tile must have separate public origins.');
  return {
    brandSite: brand, tileSite,
    brandLink: brand ?? (development ? 'http://localhost:4322' : undefined),
    tileLink: tileSite ?? (development ? 'http://localhost:4321' : undefined),
    brandName: env.BRAND_NAME?.trim() || 'Projects',
    brandVerification: searchConsoleVerification(env.BRAND_GOOGLE_SITE_VERIFICATION, 'BRAND_GOOGLE_SITE_VERIFICATION', brand),
    tileVerification: searchConsoleVerification(env.TILE_GOOGLE_SITE_VERIFICATION, 'TILE_GOOGLE_SITE_VERIFICATION', tileSite),
    adsensePublisher: adsensePublisher(env.ADSENSE_PUBLISHER_ID, brand, tileSite),
    operator: operatorProfile(env),
    contact: operatorContact(env),
  };
}
