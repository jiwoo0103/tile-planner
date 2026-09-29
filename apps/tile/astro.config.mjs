import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { siteConfig } from '../../scripts/site-config.mjs';
import { adsenseFiles } from '../../scripts/adsense.mjs';

const sites = siteConfig(process.env);
export default defineConfig({
  site: sites.tileSite,
  output: 'static',
  trailingSlash: 'always',
  integrations: [...(sites.tileSite ? [sitemap()] : []), adsenseFiles(sites.adsensePublisher)],
  vite: { plugins: [tailwindcss()], define: {
    'import.meta.env.PROJECT_BRAND_ORIGIN': JSON.stringify(sites.brandLink ?? ''),
    'import.meta.env.PROJECT_GOOGLE_SITE_VERIFICATION': JSON.stringify(sites.tileVerification ?? ''),
    'import.meta.env.PROJECT_ADSENSE_PUBLISHER': JSON.stringify(sites.adsensePublisher ?? ''),
  } },
  devToolbar: { enabled: false },
});
