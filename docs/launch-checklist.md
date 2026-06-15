# ARCFORT Website Launch Checklist

Use this checklist before switching the website to production traffic.

## Code Readiness

- `npm run lint` passes.
- `npm run build` passes.
- `sitemap.xml` is generated.
- `robots.txt` is generated.
- Header and footer links are working.
- RFQ form validation works.
- Product, category, application and guide pages render correctly.

## Required Business Data

- Official business email: arcfortweld@outlook.com.
- Official WhatsApp number: +86-18803076512.
- Company address: Renqiu City, Cangzhou, Hebei Province, China.
- Main port: Tianjin Xingang Port / Tianjin Port, China.
- Alternative ports: Qingdao Port or Ningbo Port are available upon request.
- Real product images: pending.
- Product catalog PDF: pending.
- Real SKU data: pending.
- Product specifications: pending by product.
- MOQ and lead time by product: covered by policy, pending by exact product and order quantity.

## Supabase RFQ Setup

- Run `supabase/rfq-schema.sql` in Supabase SQL Editor.
- Create or confirm private bucket `rfq-attachments`.
- Configure `SUPABASE_URL` in Vercel.
- Configure `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
- Configure `SUPABASE_RFQ_TABLE=rfq_inquiries`.
- Configure `SUPABASE_RFQ_BUCKET=rfq-attachments`.
- Submit a real test RFQ and confirm the row is stored.
- Upload a test attachment and confirm the file path is stored.

## Vercel Deployment

- Import GitHub repository `arcfort-website`.
- Framework preset: Next.js.
- Production branch: `main`.
- Add custom domains:
  - `arcfortweld.com`
  - `www.arcfortweld.com`
- Set required environment variables.
- Deploy production.
- Confirm HTTPS works for both domains.

## SEO Checks

- Confirm homepage title and description.
- Confirm product category metadata.
- Confirm product detail metadata.
- Confirm application and guide metadata.
- Submit sitemap in Google Search Console after launch.
- Confirm no invented certifications, prices, stock status, factory capacity or customer cases are published.

## Post-Launch

- Review confirmed business data before major website updates.
- Add real product photos.
- Upload official PDF catalog.
- Import confirmed SKU data using `docs/product-sku-template.csv`.
- Add analytics only after privacy requirements are reviewed.
