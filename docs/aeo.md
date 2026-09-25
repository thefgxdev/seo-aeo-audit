# AEO: answer-engine optimisation

SEO optimises for a list of links. AEO optimises for an answer. The model chooses the source it can **quote safely**: a clear fact, a well-defined entity, a date, an identifiable author, a text that answers the question in one sentence and then goes deeper.

## What weighs

1. **Consistent entities.** The same name, title and description on every page, in the structured data, in `llms.txt`, on GitHub, LinkedIn and Wikidata. Divergence between sources lowers the model's confidence.
2. **Answer first.** Each page opens with the answer in one or two sentences (who, what, when, where). Context after.
3. **Explicit questions.** FAQ blocks written the way people ask, with self-contained answers, mirrored in `FAQPage` schema.
4. **Complete structured data.** `Person` or `Organization` with `sameAs`, `WebSite`, `WebPage`, `BreadcrumbList`, `Article` with `datePublished` and `dateModified`, `Service` with `areaServed`, `speakable`.
5. **Files for machines.** `llms.txt` (index) and `llms-full.txt` (full content) at the root, sitemap with real `lastmod`, robots that allow AI crawlers.
6. **Cross-source authority.** Other sources saying the same thing: profiles, directories, press, Wikidata.
7. **Freshness.** Real `dateModified`, reviewed content, scheduled publishing.

## Per-page checklist

- [ ] `<title>` with entity plus fact, 60 characters or fewer.
- [ ] Meta description that answers "who/what" in 155 characters.
- [ ] One `<h1>`; the first paragraph answers the main question.
- [ ] Absolute dates, full names on first mention, acronyms expanded.
- [ ] Valid JSON-LD (test at validator.schema.org).
- [ ] `hreflang` when there are languages; absolute canonical.
- [ ] Images with descriptive `alt`.
- [ ] Internal links with descriptive text.
- [ ] FAQ block when the page is about an entity or a service.

## Local intent

For "service in city" queries, answer engines look for the city in the title, the H1, the first paragraph, `areaServed` in `Service`/`Organization` schema, a `PostalAddress`, and consistency with the business profile on maps. One page per service and city intent, each with its own FAQ, beats one page listing everything.

## Measuring

There is no console for answer engines yet. What works: ask the assistants your target questions monthly, record whether and how you are cited, and track which pages they quote. Correlate with Search Console impressions for the same queries.
