# Product Structured Data Policy

ArcFort Weld is a B2B RFQ website. Product pages are designed for quotation requests, not direct
checkout with public prices.

## Current Policy

Product detail pages should output:

- `BreadcrumbList`
- `FAQPage`

Product detail pages should not output Google Product rich result markup until the required public
data is available.

## Why Product Markup Is Disabled

Google Product snippets require a `Product` item to include one of:

- `offers`
- `review`
- `aggregateRating`

For `offers`, Google also requires a real product price or price specification. ArcFort Weld does
not currently publish public product prices because quotation depends on product model, material,
quantity, packaging and destination.

## Do Not Invent These Fields

Do not add fake or estimated values for:

- Product price
- Stock availability
- Customer reviews
- Aggregate rating
- Review count
- Public offer validity dates

## When Product Markup Can Be Re-enabled

Product JSON-LD may be re-enabled only when at least one of these is confirmed and visible on the
same product page:

1. A real public offer with price and currency.
2. A real product review that follows Google review guidelines.
3. A real aggregate rating based on genuine reviews.

Until then, use strong page titles, meta descriptions, product content, FAQ structured data,
BreadcrumbList structured data and sitemap submission for SEO.
