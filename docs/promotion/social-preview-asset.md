# Distributor Social Preview Asset

## Purpose

The distributor campaign uses a dedicated 1200 x 630 Open Graph and Twitter preview generated at
build time. It is designed for shared links to `/distributor-supply` on LinkedIn, messaging apps and
other platforms that read social metadata.

## Source Asset

- Website file: `public/images/site/arcfort-distributor-social-background.png`
- Generated size: 1732 x 908
- Source reference: the existing ArcFort Weld OEM consumables workbench website visual
- Generation method: OpenAI built-in image generation, edit mode

The source is a campaign visual, not evidence for an exact SKU, factory capacity, certification,
compatible model or technical specification. It must not be reused as product-level proof.

## Final Rendering

`lib/content/distributor-social-image.tsx` reads the local source image and uses Next.js
`ImageResponse` to render exact 1200 x 630 Open Graph and Twitter images. The route-specific metadata
files live in `app/distributor-supply/`.

The rendered text uses only confirmed company and product-family information:

- ArcFort Weld
- Renqiu Ailesen Welding Technology Co., Ltd.
- MIG/MAG torch parts
- TIG torch parts
- Plasma cutting consumables
- OEM supply

## Generation Prompt

Reframe the supplied industrial welding consumables workbench photograph into a polished 1.91:1
social-preview composition. Preserve the recognizable welding torch consumables, copper contact
tips, ceramic cups, plasma parts, cable connectors, clamps, cartons, workbench and blue industrial
packing environment. Keep products inspectable across the lower two-thirds and provide a clean dark
industrial-blue area in the upper-left. Do not add people, machines, logos, labels, certification
marks, specifications, text, watermarks, factory signage, sparks, haze or decorative bokeh.

## Validation

Run `npm run build`, then `npm run seo:snippets`. The audit verifies route-specific Open Graph and
Twitter image URLs, 1200 x 630 dimensions, alt text and search-snippet exclusion regions.
