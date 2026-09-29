import { writeFile } from 'node:fs/promises';

/** Build artifact only: never loads ad code, changes account settings or infers root domains. */
export function adsenseFiles(publisher) {
  return {
    name: 'optional-adsense-file',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        if (publisher) await writeFile(new URL('ads.txt', dir), `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, 'utf8');
      },
    },
  };
}
