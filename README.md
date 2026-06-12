# arcfort-website

ARCFORT Welding & Cutting Solutions independent website project.

## Brand

- Brand name: ARCFORT
- Full brand: ARCFORT Welding & Cutting Solutions
- Positioning: Industrial Welding & Cutting Solutions
- Audience: Global distributors, importers, OEM buyers, industrial users, and repair workshops

## Tech Stack

- Next.js 15 App Router
- TypeScript
- TailwindCSS
- ESLint
- Prettier

## Pages

- `/` - Home
- `/products` - Product center
- `/products/[category]` - SEO category page
- `/products/[category]/[slug]` - Product detail page
- `/about` - About
- `/contact` - Contact
- `/rfq` - Request for quotation

## Content Architecture

- `content/categories.ts` - sample product category content
- `content/products.ts` - sample product detail content
- `content/applications.ts` - future application page content entry
- `content/guides.ts` - future guide and blog article content entry
- `lib/content/schemas.ts` - reusable TypeScript content schema
- `lib/content/seo.ts` - metadata helper
- `lib/content/jsonld.ts` - JSON-LD helpers for Product, BreadcrumbList, Organization, and FAQ

The current mock content includes 3 product categories and 5 products only. Missing product data is marked as `To be confirmed` instead of inventing specifications, certifications, prices, stock status, factory capacity, or customer cases.

## About Page

- Hero section
- Company overview
- What We Supply
- Our Advantages
- Quality Control
- Contact and RFQ CTA

## Product Lines

- MIG Torch Parts
- TIG Torch Parts
- Plasma Cutting Parts
- Welding Consumables
- Welding Machines
- Welding Accessories

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Notes

- No real API keys or secrets are included.
- The RFQ page currently contains a static form prepared for future backend or CRM integration.
- Replace placeholder contact details before production launch.
- `app/sitemap.ts` and `app/robots.ts` are included for search engine discovery.
- Product and category pages include SEO metadata and JSON-LD structured data where appropriate.
