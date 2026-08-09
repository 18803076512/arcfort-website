# Distributor Prospect Qualification Guide

## Purpose

Use this guide to turn public company research into a small, relevant and measurable distributor
campaign. The companies in `distributor-prospect-research.csv` are research candidates only. They
are not ArcFort Weld customers, partners, agents or approved distributors.

The public tracker contains company-level facts and official website links only. Never add personal
names, direct personal contact details, message contents, buyer files or private commercial data to
this repository.

## Qualification Standard

A company may enter the tracker only when its official website confirms all of the following:

1. It is an operating welding, cutting or industrial supply business.
2. Its public range overlaps at least one ArcFort Weld category.
3. Its official website provides a company-level contact page or inquiry route.
4. The source page and contact page use the same company website domain.

Recheck the website before any contact. Remove or mark a row `not_relevant` when the business has
closed, changed scope, blocks supplier approaches or no longer has a credible product overlap.

## Priority Levels

| Priority | Use                                                                                   |
| -------- | ------------------------------------------------------------------------------------- |
| A        | Direct overlap in welding torch parts, plasma consumables or replacement accessories. |
| B        | Broad welding supplier with a plausible but less specific replacement-parts need.     |
| C        | Adjacent consumables supplier that needs further qualification before contact.        |

Priority is a research decision, not a prediction of buying intent.

## First-Cycle Workflow

1. Select no more than five Priority A companies from one region.
2. Reopen the evidence and contact URLs and confirm the product overlap is still public.
3. Identify one relevant product family and one buyer problem from the official website.
4. Send one manually reviewed company introduction from the ArcFort Weld business mailbox.
5. Use the `distributor_email_intro` tracking link from `campaign-links.csv`.
6. Record only the company-level status in the public tracker; keep correspondence outside Git.
7. Send one follow-up only when the first message was relevant and no opt-out was received.
8. Stop contact immediately after an opt-out and set the status to `opted_out`.

Do not automate unsolicited outreach, scrape personal contacts or send the same generic message to
the full list. Expand the weekly batch only after qualified replies and RFQ quality are reviewed.

## Allowed Statuses

| Status            | Meaning                                                                  |
| ----------------- | ------------------------------------------------------------------------ |
| `not_contacted`   | Public research is complete; no outreach has been sent.                  |
| `research_review` | Website or product overlap needs another manual check.                   |
| `contacted`       | One relevant company-level introduction has been sent.                   |
| `replied`         | The company replied, but commercial fit is not yet established.          |
| `qualified`       | A real product need, quantity or sourcing discussion has been confirmed. |
| `not_relevant`    | Product scope or purchasing fit is insufficient.                         |
| `opted_out`       | The company asked not to be contacted again.                             |

## Message Requirements

Each introduction should state who ArcFort Weld is, why the selected product range is relevant,
what evidence can be reviewed and one clear next action. Do not claim compatibility, approvals,
certifications, customer relationships, stock or pricing that has not been confirmed.

Use one link only. The recommended first-contact offer is the distributor sourcing guide and a
line-by-line product review based on the buyer's sample, drawing, model number or current list.

## Measurement

Review the first 30 days by campaign source and qualified inquiry outcome. Useful signals are guide
downloads, RFQ starts, successful RFQ submissions and direct contact clicks. A click or form start
is not a qualified lead by itself.

Do not set volume or conversion targets until GA4 is configured and the first baseline is measured.
The decisive result is a relevant buyer reply or inquiry containing a usable product reference,
quantity and destination country.

## Validation

Run the following before committing tracker changes:

```bash
npm run promotion:prospects
npm run promotion:check
npm run security:secrets
```

The prospect validator checks the fixed schema, official-domain URLs, campaign IDs, statuses,
priorities, dates and accidental personal contact data.
