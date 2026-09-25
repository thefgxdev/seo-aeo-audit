# llms.txt

A plain-text index of a site, at the root, written for language models and AI crawlers. Optional companion: `llms-full.txt` with the complete content.

## Template

```markdown
# Site or person name

> One-sentence description: who, what, where.

Two or three paragraphs of the essential facts, written as facts.

## Services or sections
- [Name](https://example.com/path/): one line.

## Questions and answers
**Question written the way people ask it?**
Self-contained answer in two or three sentences.

## Articles
- [Title](https://example.com/articles/slug/) (YYYY-MM-DD; tags): one-line description.

## Links
- email: contact@example.com
- Other languages: https://example.com/pt/
```

Keep it current: generate it from the same source as the site at build time. A stale `llms.txt` is worse than none.

## robots.txt

Allow the crawlers that feed answer engines explicitly. Blocking them removes you from the answers.

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: CCBot
Allow: /

Sitemap: https://example.com/sitemap.xml
```

Block only private routes, and block them for everyone.

## Where to link it

- A visible link in the footer (`/llms.txt`), so humans and crawlers find it.
- Mentioned in the site's `WebSite` schema is not standard yet; the root location is what matters.
