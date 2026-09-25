# SEO/AEO Audit for static sites

A zero-dependency Node script that audits a built static site page by page, link by link: titles, descriptions, canonicals, hreflang, headings, JSON-LD validity, image alt text, internal links, anchors, `noopener`, sitemap coverage. Plus a guide to `llms.txt` and the structured data that answer engines (ChatGPT, Gemini, Perplexity, Google AI Overviews) actually use.

By [Felipe Guedes](https://fgxdev.com). Extracted from the tooling behind fgxdev.com, where it runs on every build with zero errors across 370+ pages.

## Usage

```bash
node seo-audit.mjs ./dist https://example.com
```

Outputs a Markdown report (`SEO-AUDIT.md`) and exits with code 1 if there are errors, so it can gate a deploy.

### What counts as an error

- Missing or duplicate `<title>`; missing meta description; missing canonical; canonical that does not match the page URL.
- Zero or more than one `<h1>`.
- `<html lang>` missing or inconsistent with the language folder.
- Invalid JSON-LD.
- `<img>` without `alt`.
- Broken internal link or anchor; `target="_blank"` without `noopener`.
- Indexable page missing from the sitemap; sitemap URL that does not exist; hreflang alternate that does not exist.
- 404 page without `noindex`; indexable page with `noindex`.

### What counts as a warning

- Title over 60 characters, description over 155 or under 60, duplicate descriptions, internal links without a trailing slash when the site uses folders.

## AEO: being cited by answer engines

Search engines rank links. Answer engines choose a source they can quote safely. [`docs/aeo.md`](docs/aeo.md) covers what that requires:

1. Consistent entities: the same name, role and description on every page, in the schema, in `llms.txt` and on external profiles.
2. Answer first: each page opens with the answer in one or two sentences.
3. Explicit questions: FAQ blocks written the way people ask, with self-contained answers, mirrored in `FAQPage` schema.
4. Complete structured data: `Person` or `Organization`, `WebSite`, `WebPage`, `BreadcrumbList`, `Article`, `FAQPage`, `Service`, `speakable`, `sameAs`.
5. Files for machines: `llms.txt`, `llms-full.txt`, sitemap with real `lastmod`, robots that allow AI crawlers.

[`docs/llms-txt.md`](docs/llms-txt.md) has a template and the list of crawlers to allow in `robots.txt`.

## Em português

Script Node sem dependências que audita um site estático página por página e link por link, com relatório em Markdown e código de saída para bloquear deploys com erro. Guia de AEO em [`docs/aeo.md`](docs/aeo.md).

## License

MIT.
