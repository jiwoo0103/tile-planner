import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { siteConfig } from '../../scripts/site-config.mjs';
import { adsenseFiles } from '../../scripts/adsense.mjs';

const sites = siteConfig(process.env);
export default defineConfig({
  site: sites.brandSite,
  output: 'static',
  trailingSlash: 'always',
  integrations: [...(sites.brandSite ? [sitemap({ filter: page => {
    const path = new URL(page).pathname;
    // Privacy stays a local draft until live hosting and operator data handling are verified.
    return path !== '/privacy/' && (path !== '/about/' || sites.operator.complete) && (path !== '/contact/' || sites.contact.complete);
  } })] : []), adsenseFiles(sites.adsensePublisher)],
  vite: { plugins: [tailwindcss()], define: {
    'import.meta.env.PROJECT_TILE_ORIGIN': JSON.stringify(sites.tileLink ?? ''),
    'import.meta.env.PROJECT_BRAND_NAME': JSON.stringify(sites.brandName),
    'import.meta.env.PROJECT_GOOGLE_SITE_VERIFICATION': JSON.stringify(sites.brandVerification ?? ''),
    'import.meta.env.PROJECT_ADSENSE_PUBLISHER': JSON.stringify(sites.adsensePublisher ?? ''),
  } },
  devToolbar: { enabled: false },
});
