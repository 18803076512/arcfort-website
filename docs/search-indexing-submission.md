# Search Indexing Submission

Reviewed: 2026-10-28. This workflow separates technical crawl readiness, search-engine notification,
and Google-reported indexing. Passing one stage does not prove the next.

## Canonical Signals And Release Gate

- Site: `https://www.arcfortweld.com`
- Sitemap: `https://www.arcfortweld.com/sitemap.xml`
- Robots: `https://www.arcfortweld.com/robots.txt`
- IndexNow verification file: `https://www.arcfortweld.com/e6b4f4d8a1c24d11a9c94af9170c2b58.txt`

For a content release, retain its changed canonical URL list and reason (new page or significant
content/structured-data/link change). Run the applicable product/evidence checks, build and SEO
checks before publication. After the existing deployment succeeds, run:

```bash
npm run health:production
npm run indexing:submit -- --dry-run
```

The live audit checks sitemap URLs, status, canonical, noindex, links, redirects and missing pages.
It now evaluates Googlebot and Bingbot robots groups against all sitemap URLs and registered sitemap
images, plus the sitemap itself. It verifies the API/Console exclusions for both bots. This is a
policy check, not a simulation of Googlebot's cached rules, rendered resources or indexing choices.

Keep `lastmod` tied to a significant page update. Do not set every URL to today's date after a
monitoring, test or deployment-only change. Do not add unreviewed products/images to gain URL count.

## Google Search Console: Evidence Before Requests

Use the existing `arcfortweld.com` property; do not create another property or redo DNS verification
merely because the HTML verification tag is absent. Never commit credentials or verification values.

1. Read the current Page indexing report and the existing sitemap's fetch/error status. Submit the
   canonical sitemap only if missing or an actual sitemap problem requires it and authorization
   covers that Search Console write.
2. Export exact URLs from **Redirect error**, **Discovered - currently not indexed**, and
   **Crawled - currently not indexed** separately. Keep report date, count and validation status.
   A normal old URL that redirects is not automatically an error.
3. Inspect the affected URLs and a small commercial-priority sample. The existing eight-URL queue
   is in `knowledge-base/seo/indexing-follow-up-2026-10-25.md`; it is not the missing list of 48 URLs.
   Check inspection quota before API inspection. The API reads the indexed version, not a live test
   and not an indexing request.
4. Record per URL: inspection date, verdict/coverage reason, last crawl, crawl/index permission,
   fetch state, declared canonical, Google canonical and discovery/sitemap source. Keep an unknown
   value unknown. Do not substitute HTTP 200, zero impressions or an email notification for this data.
5. Compare last crawl with the actual repair deployment. Fix current redirect loops, failed targets,
   accidental blocks or canonical conflicts; preserve legitimate redirects and stable URLs.
6. For pages that were crawled but remain unindexed, review buyer usefulness, real technical
   differences, exact photos and competing content before requesting another crawl. Do not publish
   invented specifications or lightly reworded variants.
7. Request indexing only for a small reviewed set of new or materially corrected important pages.
   Validate a report issue after its known affected URLs are fixed. Retain the submission date and
   check later Google evidence; repeated requests are not a proof or guarantee of indexing.

The GSC Wizard connection previously reported a subscription limitation. Native Search Console or
an owner export can supply the missing evidence without purchasing a new service. Browser fallback
and account authentication follow the applicable connection rules; no browser access is assumed.
Current per-URL Google status remains unverified until that evidence is available.

## IndexNow: Preview A Specific Change Set

IndexNow notifies participating engines. It is not Google's URL Inspection or Indexing API.
The verification key is publicly served ownership data, not a private account credential.

The default command and `--dry-run` are both read-only previews. They print the **entire selected URL
list** and verify the live key contents and Bingbot crawl permission. They do not POST. A whole-site
preview is an inventory, not a recommendation to resubmit unchanged URLs.

For a real content change, create a reviewed text file outside tracked source with one canonical URL
per line. Blank lines and `#` comments are allowed. Include only the exact pages changed in that
release, with no tracking/query parameters, fragments, aliases or unrelated pages. Then run:

```bash
npm run indexing:submit -- --urls-file /path/to/reviewed-changed-urls.txt --dry-run
```

After the exact list and destination have been reviewed under the owner's authorization, use:

```bash
npm run indexing:submit -- --submit --urls-file /path/to/reviewed-changed-urls.txt
```

Actual submission requires the live canonical sitemap and an explicit file, at most 100 URLs. Each
selected URL must be an exact member of that sitemap and within the verified key's directory scope.
The tool verifies key contents, robots, direct HTTP 200, supported content type, noindex and (for HTML)
a single self-canonical before its one POST. If any preflight fails, nothing is submitted. A failed
or timed-out POST is not automatically repeated: record its uncertain outcome and investigate first.

- HTTP 200 means the notification was received, not that the URLs were crawled or indexed.
- HTTP 202 means received with key validation pending, not completed validation or indexing.
- Deletions and migrations need their own reviewed workflow; this tool intentionally accepts only
  current sitemap URLs. Do not reinsert deleted URLs into the sitemap to notify an engine.
- Custom submission endpoints are not supported. Optional key settings must match their live file;
  changing `--key` also changes its default verification-file location.

Offline and limited previews remain available:

```bash
npm run indexing:submit -- --limit 5 --dry-run
npm run indexing:submit -- --sitemap .next/server/app/sitemap.xml.body --dry-run
```

An offline preview skips all live checks and is labeled accordingly. `--limit` is preview-only;
actual writes require the full reviewed file. Existing automation that ran the command without flags
must deliberately adopt the reviewed-list workflow; no-argument execution now sends nothing.

## Retain Evidence And Follow Through

Keep a release record with the commit/deployment, affected canonical URLs, live-check result,
engine, request date/status (if sent), and subsequent inspection result. Omit buyer data, private
mail headers and tokens. Public health is checked by the existing six-hour workflow; no new task or
paid service is required. GSC follow-up is not automatically scheduled or completed by this tool.

For the October 2026 notice, the 48 validated URLs and the separate Redirect error examples remain
missing. The next highest-value action is to obtain those exact Google report exports and match them
to the deployed fixes. Product content improvements remain gated by the five-SKU evidence plan in
`knowledge-base/seo/website-ecosystem-2026-10-25.md`.

## References

- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec
- https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect
- https://www.indexnow.org/documentation
