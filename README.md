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
- `/about` - About
- `/contact` - Contact
- `/rfq` - Request for quotation

## RFQ Page

- Front-end RFQ form with basic required-field validation
- Email format validation
- Upload field for drawings, product lists and PDFs
- Success thank-you message without real backend submission
- `/RFQ` redirects to `/rfq`

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
