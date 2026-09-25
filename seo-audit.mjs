#!/usr/bin/env node
// SEO/AEO audit for a built static site. Usage: node seo-audit.mjs <dist-dir> <site-url> [--out SEO-AUDIT.md]
// Zero dependencies. Exits 1 when errors are found so it can gate a deploy.
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const [distArg, siteArg, ...rest] = process.argv.slice(2);
if (!distArg || !siteArg) { console.error('Usage: node seo-audit.mjs <dist-dir> <site-url> [--out report.md]'); process.exit(2); }
const DIST = path.resolve(distArg), SITE = siteArg.replace(/\/$/, ''), OUT = rest.includes('--out') ? rest[rest.indexOf('--out') + 1] : 'SEO-AUDIT.md';
const LANG_FOLDERS = { pt: 'pt-BR', en: 'en', es: 'es', fr: 'fr', de: 'de', it: 'it' }; // first path segment → expected <html lang>

const walk = async (d) => (await Promise.all((await readdir(d, { withFileTypes: true })).map((e) => e.isDirectory() ? walk(path.join(d, e.name)) : /\.html$/.test(e.name) ? [path.join(d, e.name)] : []))).flat();
const attr = (tag, name) => { const m = tag.match(new RegExp(`${name}="([^"]*)"`)); return m ? m[1] : null; };
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
const exists = async (p) => { try { await stat(p); return true; } catch { return false; } };
const resolveLocal = async (href) => { const clean = href.split('#')[0].split('?')[0]; if (!clean) return true; const p = path.join(DIST, clean); return (await exists(p)) || (await exists(path.join(p, 'index.html'))) || (await exists(p + '.html')); };
const relOf = (f) => '/' + path.relative(DIST, f).replace(/\\/g, '/').replace(/index\.html$/, '');

const files = await walk(DIST), errors = [], warns = [], titles = new Map(), descs = new Map();
const stats = { pages: 0, links: 0, jsonld: 0, faq: 0, breadcrumbs: 0 };
for (const f of files) {
  const rel = relOf(f), html = await readFile(f, 'utf8'), is404 = /404\.html$/.test(f); stats.pages++;
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = attr((html.match(/<meta name="description"[^>]*>/) || [''])[0], 'content');
  const canonical = attr((html.match(/<link rel="canonical"[^>]*>/) || [''])[0], 'href');
  const robots = attr((html.match(/<meta name="robots"[^>]*>/) || [''])[0], 'content') || '';
  const h1s = [...html.matchAll(/<h1[\s>]/g)].length, lang = attr((html.match(/<html[^>]*>/) || [''])[0], 'lang');
  const seg = rel.split('/')[1], expectedLang = LANG_FOLDERS[seg] || 'en';
  if (!title) errors.push(`${rel}: missing <title>`); else { if (title.length > 60) warns.push(`${rel}: title is ${title.length} chars: "${decode(title)}"`); if (!is404) { if (titles.has(title)) errors.push(`${rel}: duplicate title of ${titles.get(title)}`); else titles.set(title, rel); } }
  if (!desc) errors.push(`${rel}: missing meta description`); else { if (desc.length > 165) warns.push(`${rel}: description is ${desc.length} chars`); if (desc.length < 60 && !is404) warns.push(`${rel}: description is short (${desc.length})`); if (!is404) { if (descs.has(desc)) warns.push(`${rel}: description duplicates ${descs.get(desc)}`); else descs.set(desc, rel); } }
  if (!canonical) errors.push(`${rel}: missing canonical`); else if (!is404 && canonical !== SITE + rel) errors.push(`${rel}: canonical differs from URL (${canonical})`);
  if (h1s !== 1) errors.push(`${rel}: ${h1s} <h1> elements (expected 1)`);
  if (!lang) errors.push(`${rel}: missing <html lang>`); else if (LANG_FOLDERS[seg] && lang !== expectedLang) warns.push(`${rel}: lang="${lang}" but folder suggests ${expectedLang}`);
  if (!html.includes('property="og:title"')) warns.push(`${rel}: missing og:title`);
  if (is404 && !/noindex/.test(robots)) errors.push(`${rel}: 404 page without noindex`);
  if (!is404 && /noindex/.test(robots)) warns.push(`${rel}: indexable page has noindex`);
  for (const [, block] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { const j = JSON.parse(block); stats.jsonld++; for (const n of j['@graph'] || [j]) { const t = [].concat(n['@type']); if (t.includes('FAQPage')) stats.faq++; if (t.includes('BreadcrumbList')) stats.breadcrumbs++; } } catch (e) { errors.push(`${rel}: invalid JSON-LD: ${e.message}`); } }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) errors.push(`${rel}: <img> without alt`);
  for (const m of html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>/g)) {
    const href = decode(m[1]); stats.links++;
    if (/^(mailto|tel):/.test(href)) continue;
    if (/^https?:\/\//.test(href)) { if (href.startsWith(SITE + '/') && !(await resolveLocal(href.slice(SITE.length)))) errors.push(`${rel}: broken absolute link ${href}`); if (m[0].includes('target="_blank"') && !/noopener/.test(m[0])) errors.push(`${rel}: _blank without noopener (${href})`); continue; }
    if (href.startsWith('#')) { const id = href.slice(1); if (id && !html.includes(`id="${id}"`)) errors.push(`${rel}: anchor #${id} does not exist`); continue; }
    if (!(await resolveLocal(href))) errors.push(`${rel}: broken internal link ${href}`);
  }
}
let smUrls = new Set();
if (await exists(path.join(DIST, 'sitemap.xml'))) {
  const sm = await readFile(path.join(DIST, 'sitemap.xml'), 'utf8'); smUrls = new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  for (const f of files) { if (/404\.html$/.test(f)) continue; const rel = relOf(f); if (!smUrls.has(SITE + rel)) errors.push(`${rel}: not in sitemap`); }
  for (const u of smUrls) if (!(await resolveLocal(u.slice(SITE.length)))) errors.push(`sitemap: URL does not exist ${u}`);
  for (const m of sm.matchAll(/hreflang="[^"]+" href="([^"]+)"/g)) if (!(await resolveLocal(m[1].slice(SITE.length)))) errors.push(`sitemap: alternate does not exist ${m[1]}`);
} else warns.push('no sitemap.xml found');
for (const f of ['robots.txt', 'llms.txt']) if (!(await exists(path.join(DIST, f)))) warns.push(`no ${f} found`);

const md = `# SEO/AEO audit · ${SITE} · ${new Date().toISOString().slice(0, 10)}\n\n| Metric | Value |\n|---|---|\n| HTML pages | ${stats.pages} |\n| Links checked | ${stats.links} |\n| Valid JSON-LD blocks | ${stats.jsonld} |\n| Pages with FAQPage | ${stats.faq} |\n| Pages with BreadcrumbList | ${stats.breadcrumbs} |\n| URLs in sitemap | ${smUrls.size} |\n| Errors | ${errors.length} |\n| Warnings | ${warns.length} |\n\n## Errors\n${errors.length ? errors.map((e) => `- ${e}`).join('\n') : '- none'}\n\n## Warnings\n${warns.length ? warns.map((w) => `- ${w}`).join('\n') : '- none'}\n`;
await writeFile(OUT, md);
console.log(`seo-audit: ${stats.pages} pages · ${stats.links} links · ${errors.length} errors · ${warns.length} warnings → ${OUT}`);
if (errors.length) { console.log(errors.slice(0, 30).join('\n')); process.exit(1); }
