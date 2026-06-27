# Search Indexing Submission

This document records the indexing workflow for ArcFort Weld.

## Current Production Indexing Signals

- Canonical site URL: `https://www.arcfortweld.com`
- Sitemap: `https://www.arcfortweld.com/sitemap.xml`
- Robots: `https://www.arcfortweld.com/robots.txt`
- IndexNow key file: `https://www.arcfortweld.com/e6b4f4d8a1c24d11a9c94af9170c2b58.txt`

## Google Search Console

Google Search Console requires the site owner's Google account and domain verification. Do not
commit Google verification tokens to the repository.

Recommended steps:

1. Add a Domain property for `arcfortweld.com` in Google Search Console.
2. Verify the domain through the DNS TXT record provided by Google.
3. Submit this sitemap: `https://www.arcfortweld.com/sitemap.xml`.
4. Use URL Inspection to request indexing for:
   - `https://www.arcfortweld.com/`
   - `https://www.arcfortweld.com/products`
   - `https://www.arcfortweld.com/products/mig-mag-torch-parts`
   - `https://www.arcfortweld.com/products/tig-torch-parts`
   - `https://www.arcfortweld.com/products/plasma-cutting-consumables`
   - priority product pages after every SKU batch.

## IndexNow

IndexNow can notify participating search engines when pages are added, updated or deleted. The key
file is public verification data, not a private API secret.

After deployment, run a dry run first:

```bash
npm run indexing:submit -- --dry-run
```

Then submit the live sitemap URLs:

```bash
npm run indexing:submit
```

Optional checks:

```bash
npm run indexing:submit -- --limit 5 --dry-run
npm run indexing:submit -- --sitemap .next/server/app/sitemap.xml.body --dry-run
```

## When To Submit

Submit after these changes:

- New SKU pages are published.
- Product page titles, descriptions or canonical URLs change.
- Category pages or buyer guides are updated.
- Important RFQ or contact pages change.

Do not submit repeatedly for unchanged pages.
