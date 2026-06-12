# AGENTS.md

## Project Context

This repository is an industrial B2B website for Renqiu Ailesen Welding Technology Co., Ltd.

The website focuses on welding machines, cutting machines, welding torch consumables, TIG torch
parts, MIG/MAG torch parts, plasma cutting consumables, OEM welding accessories, and export inquiry
generation.

## Content Rules

1. Do not invent product specifications, certifications, prices, stock status, factory capacity, or
   customer cases.
2. If a field is missing, use a clear placeholder such as "To be confirmed" and report it after the
   task.
3. All product pages must be written in professional B2B English.
4. Use industrial terminology accurately, including MIG/MAG, TIG, MMA, plasma cutting, contact tip,
   tip holder, gas lens, ceramic cup, nozzle, electrode, torch liner, and diffuser.
5. Every product page should include title, short description, specification table, compatibility,
   applications, product features, packaging/MOQ/lead time, FAQ, and RFQ call-to-action.
6. Every category page should include SEO intro text, product grid, buyer guide section, FAQ, and
   internal links to related categories.
7. Add SEO metadata and JSON-LD structured data where appropriate.
8. Keep the design consistent with an industrial blue B2B style.
9. Do not hardcode real API keys, email passwords, database passwords, private tokens, or credentials.
10. After changes, run lint, build, and type checks when available.
11. Summarize all modified files and any missing data after each task.

## Workflow Rules

1. Read relevant files before modifying code.
2. Complete one clearly scoped task at a time.
3. Do not remove existing functionality unless the task explicitly requires it.
4. Keep all pages responsive for desktop and mobile.
5. Keep all pages suitable for overseas B2B industrial inquiries.
6. Ask for a plan before implementing large changes.

## Future Data Sources

Product and category data may later come from Supabase or Sanity CMS. Until then, keep mock data
structured, explicit, and easy to replace.
