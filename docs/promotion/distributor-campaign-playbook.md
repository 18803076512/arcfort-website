# ArcFort Weld Distributor Promotion Playbook

## Campaign Objective

Generate qualified welding and cutting product inquiries from international distributors,
importers, wholesalers, repair networks and industrial suppliers. The campaign should move a buyer
from product-scope review to a traceable RFQ without making unsupported product or company claims.

## Campaign Offer

- Landing page: `/distributor-supply`
- Primary resource: `/downloads/arcfort-distributor-sourcing-guide.pdf`
- Supporting resources: company catalog, public product list and RFQ worksheet in `/downloads`
- Conversion path: `/rfq?product=Distributor%20welding%20product%20program`
- Direct contact: `arcfortweld@outlook.com` and WhatsApp `+86-18803076512`

The sourcing guide explains the product families, inquiry process, confirmed trade terms and the
information needed for quotation. It does not publish unverified compatibility, certifications,
prices or exact specifications.

## Audience Priorities

1. Welding equipment distributors that already list MIG/MAG, TIG or plasma consumables.
2. Importers and wholesalers with mixed replacement-part purchasing programs.
3. Repair workshops and service networks that need repeat consumable supply.
4. OEM buyers that can provide product references, drawings, samples and packaging requirements.

Prioritize companies whose current product range clearly overlaps ArcFort Weld supply. Do not use
unverified personal lists or irrelevant mass messaging.

The first public-company research set is stored in `distributor-prospect-research.csv`. It contains
official websites and product-scope evidence only. These companies are research candidates, not
customers, partners or approved distributors. Follow `prospect-qualification-guide.md`, recheck each
official website immediately before contact and keep all correspondence and buyer data outside Git.

## Message Hierarchy

1. Product scope: six welding and cutting product families in one RFQ.
2. Procurement clarity: line-by-line references, quantity, evidence and packaging review.
3. OEM support: logo, private label packaging, carton and model customization after review.
4. Confirmed commercial information: regular lead time, trial-order policy, payment basis and port.
5. Conversion: download the guide, review products, or send a product list and drawing.

## Four-Week Operating Cycle

| Week | Focus                         | Actions                                                                                                                |
| ---- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1    | Company and distributor scope | Publish the company post, update relevant directory profiles and send a small set of personalized introduction emails. |
| 2    | MIG/MAG sourcing              | Publish the MIG/MAG category post, link to the category page and follow up only with relevant recipients.              |
| 3    | Plasma consumables            | Publish the plasma category post and share the guide with business contacts who have granted permission.               |
| 4    | RFQ conversion                | Promote the RFQ worksheet, review campaign events and identify the content that produced qualified inquiry actions.    |

Repeat the cycle with different product-family evidence only after the previous cycle is reviewed.
Do not increase outreach volume before relevance and inquiry quality are understood.

The first manual test batch is defined in `data/promotion/outreach-wave-01.csv`, with finished
company-level drafts in `docs/promotion/outreach-wave-01.md`. Every row remains
`ready_for_manual_review` until a person rechecks the official source, approves the message and sends
it through the published business inquiry route. The repository never sends these messages.

## Link Workflow

1. Maintain campaign definitions in `data/promotion/campaigns.csv`.
2. Run `npm run promotion:links`.
3. Use the matching ID from `docs/promotion/campaign-links.csv` in each post or message.
4. Run `npm run promotion:check` before deployment.
5. Run `npm run promotion:test` to verify the analytics query allowlist.
6. Never put a buyer name, email address, phone number or company-private reference in a UTM value.

`npm run promotion:check` also validates the public prospect tracker, official-domain source links,
allowed statuses and campaign-link references. It also validates the five-company outreach wave,
its generated tracking URLs, opt-out wording and unsupported-claim guard. It rejects personal
contact data in tracker fields.

## Measurement

Use GA4 only after consent and only through the configured `NEXT_PUBLIC_GA_ID`. Establish the first
30-day baseline before setting performance targets.

Review these events by source, medium, campaign and content:

- Distributor landing-page sessions
- `buyer_tool_download_click` with `asset_key=distributor_sourcing_guide`
- `rfq_link_click`
- `rfq_form_start`
- `rfq_submit_success`
- `contact_email_click`
- `contact_whatsapp_click`

`rfq_form_start` is recorded once after a consented buyer first interacts with the form. It contains
only the interaction type, form entry type and selected-product count. Buyer contact details,
inquiry text, product references and uploaded file details are not included in this event.

Qualified inquiry review remains manual. Check whether an inquiry includes a usable product name or
reference, quantity and destination, rather than treating every form event as a sales opportunity.

## External Account Checklist

- Verify the domain in Google Search Console and submit `https://www.arcfortweld.com/sitemap.xml`.
- Configure the real GA4 measurement ID in Vercel as `NEXT_PUBLIC_GA_ID`.
- Complete the LinkedIn company page with the confirmed company name, address, product scope and
  distributor landing-page tracking URL.
- Add the company only to relevant industrial or welding directories that allow a real company
  profile and direct website link.
- Send outreach manually from an identified company mailbox, personalize the relevance statement
  and record opt-out requests.
- Test one real RFQ from a browser and confirm it reaches `arcfortweld@outlook.com` before promoting
  the form as an automated channel.

## Publishing Gate

Before each important campaign launch, run the promotion link check, SEO audit, production build,
performance budget and secret scan. After deployment, verify the landing page and PDF, run the live
SEO and security checks, then submit changed indexable URLs through IndexNow.
