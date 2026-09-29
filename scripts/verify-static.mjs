import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, relative, dirname, join } from 'node:path';

const apps = readdirSync('apps').filter(name => existsSync(`apps/${name}/dist/index.html`));
const failures = [];
let pages = 0;
let scripts = 0;
// Until actual approval and consent are verified, inspect executable output as well as markup.
// Publisher verification metadata and explanatory page text are intentionally outside this check.
const adActivation = /adsbygoogle|googlesyndication|doubleclick|data-ad-(?:client|slot)/i;
const walk = dir => readdirSync(dir).flatMap(name => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
for (const app of apps) {
  const root = resolve('apps', app, 'dist');
  const files = walk(root);
  const htmlFiles = files.filter(path => path.endsWith('.html'));
  for (const file of files.filter(path => /\.(?:m?js)$/.test(path))) {
    scripts++;
    if (adActivation.test(readFileSync(file, 'utf8'))) failures.push(`${app}/${relative(root, file)}: advertising activation found in JavaScript`);
  }
  for (const file of htmlFiles) {
    pages++;
    const html = readFileSync(file, 'utf8');
    const label = `${app}/${relative(root, file)}`;
    for (const [markup] of html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script\s*>|<(?:ins|iframe|link)\b[^>]*>/gi)) {
      if (adActivation.test(markup)) failures.push(`${label}: advertising activation found in executable/resource markup`);
    }
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    if (new Set(ids).size !== ids.length) failures.push(`${label}: duplicate HTML id`);
    if (!/<title>[^<]+<\/title>/.test(html)) failures.push(`${label}: missing title`);
    if (!/<meta\s+name="description"\s+content="[^"]+"/.test(html)) failures.push(`${label}: missing description`);
    for (const [, attribute, raw] of html.matchAll(/\b(href|src)="([^"]*)"/g)) {
      const value = raw.replaceAll('&amp;', '&');
      if (!value || /^(?:[a-z][\w+.-]*:|\/\/)/i.test(value)) continue;
      const [beforeHash, fragment] = value.split('#');
      const pathname = beforeHash.split('?')[0];
      let target = pathname ? resolve(pathname.startsWith('/') ? root : dirname(file), `.${pathname.startsWith('/') ? pathname : `/${pathname}`}`) : file;
      if (!(target === root || target.startsWith(root + '\\') || target.startsWith(root + '/'))) {
        failures.push(`${label}: path escapes output: ${value}`); continue;
      }
      if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
      else if (!existsSync(target) && existsSync(target + '.html')) target += '.html';
      if (!existsSync(target)) { failures.push(`${label}: missing ${attribute} ${value}`); continue; }
      if (fragment && target.endsWith('.html')) {
        const decoded = decodeURIComponent(fragment);
        const targetHTML = target === file ? html : readFileSync(target, 'utf8');
        const targetIds = [...targetHTML.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
        if (!targetIds.includes(decoded)) failures.push(`${label}: missing anchor ${value}`);
      }
    }
  }
}
if (!pages) failures.push('No built pages found. Run npm run build first.');
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Verified ${pages} built pages and ${scripts} JavaScript files across ${apps.length} site(s): metadata, unique IDs, internal links, local assets and no known advertising activation markers.`);
