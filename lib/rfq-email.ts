import { siteConfig } from "./content/site.ts";
import type { RfqTextValues } from "./rfq-constraints.ts";
import { buildRfqQuotationReadiness } from "./rfq-qualification.ts";
import type { SourceAttribution } from "./source-attribution.ts";

export type RfqEmailPayload = RfqTextValues & {
  sourcePath: string;
  sourceAttribution: SourceAttribution;
};

export type RfqEmailAttachment = {
  name: string;
  size: number;
  type: string;
  path?: string;
};

export type RfqEmailRequestMeta = {
  userAgent: string;
  referrer: string;
};

type EmailShellOptions = {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  content: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeText(value: string | undefined, fallback = "Not provided") {
  const normalizedValue = value?.trim();
  return escapeHtml(normalizedValue || fallback);
}

function multilineText(value: string | undefined, fallback = "Not provided") {
  return safeText(value, fallback).replaceAll("\n", "<br />");
}

function detailRow(label: string, value: string | undefined, fallback?: string) {
  return `
    <tr>
      <td style="width: 34%; padding: 10px 12px; border-bottom: 1px solid #d9e2ec; color: #526174; font-size: 12px; font-weight: 700; text-transform: uppercase; vertical-align: top;">${escapeHtml(label)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #d9e2ec; color: #071524; font-size: 14px; font-weight: 600; line-height: 1.55; overflow-wrap: anywhere;">${safeText(value, fallback)}</td>
    </tr>`;
}

function section(title: string, content: string) {
  return `
    <tr>
      <td style="padding: 0 32px 24px;">
        <h2 style="margin: 0 0 10px; color: #071524; font-family: Arial, Helvetica, sans-serif; font-size: 18px; line-height: 1.35;">${escapeHtml(title)}</h2>
        <div style="border-left: 4px solid #f6b445; background: #f4f7fb; padding: 16px; color: #334155; font-size: 14px; line-height: 1.65; overflow-wrap: anywhere;">${content}</div>
      </td>
    </tr>`;
}

function emailShell({ preheader, eyebrow, title, intro, content }: EmailShellOptions) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin: 0; padding: 0; background: #eef3f8; color: #071524; font-family: Arial, Helvetica, sans-serif;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background: #eef3f8;">
      <tr>
        <td align="center" style="padding: 24px 12px;">
          <table role="presentation" width="680" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 680px; border: 1px solid #d9e2ec; background: #ffffff;">
            <tr>
              <td style="border-top: 6px solid #f6b445; background: #071524; padding: 28px 32px;">
                <div style="margin: 0 0 8px; color: #f6b445; font-size: 12px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase;">${escapeHtml(siteConfig.shortName)} &nbsp;|&nbsp; ${escapeHtml(eyebrow)}</div>
                <div style="color: #ffffff; font-size: 28px; font-weight: 800; line-height: 1.2;">${escapeHtml(title)}</div>
                <div style="margin-top: 8px; color: #cbd5e1; font-size: 13px; line-height: 1.5;">${escapeHtml(siteConfig.tagline)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 28px 32px 24px; color: #334155; font-size: 15px; line-height: 1.7;">${escapeHtml(intro)}</td>
            </tr>
            ${content}
            <tr>
              <td style="border-top: 1px solid #d9e2ec; background: #f4f7fb; padding: 22px 32px; color: #64748b; font-size: 12px; line-height: 1.6;">
                <strong style="color: #071524;">${escapeHtml(siteConfig.legalName)}</strong><br />
                ${escapeHtml(siteConfig.address)}<br />
                <a href="${escapeHtml(siteConfig.url)}" style="color: #0f4c81; text-decoration: none;">${escapeHtml(siteConfig.url)}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function attachmentList(attachments: RfqEmailAttachment[], includePath: boolean) {
  if (attachments.length === 0) {
    return "No attachments uploaded.";
  }

  return `<ul style="margin: 0; padding-left: 20px;">${attachments
    .map((attachment) => {
      const sizeMb = (attachment.size / (1024 * 1024)).toFixed(2);
      const storagePath = includePath && attachment.path ? ` | ${safeText(attachment.path)}` : "";
      return `<li style="margin: 0 0 6px;">${safeText(attachment.name)} (${sizeMb} MB)${storagePath}</li>`;
    })
    .join("")}</ul>`;
}

function bulletList(items: string[]) {
  return `<ul style="margin: 0; padding-left: 20px;">${items
    .map((item) => `<li style="margin: 0 0 6px;">${safeText(item)}</li>`)
    .join("")}</ul>`;
}

function attachmentText(attachments: RfqEmailAttachment[], includePath: boolean) {
  if (attachments.length === 0) {
    return "No attachments uploaded.";
  }

  return attachments
    .map((attachment) => {
      const sizeMb = (attachment.size / (1024 * 1024)).toFixed(2);
      const storagePath = includePath && attachment.path ? ` - ${attachment.path}` : "";
      return `- ${attachment.name} (${sizeMb} MB)${storagePath}`;
    })
    .join("\n");
}

export function buildInquiryEmailText(
  payload: RfqEmailPayload,
  attachments: RfqEmailAttachment[],
  reference: string,
  requestMeta: RfqEmailRequestMeta,
) {
  const readiness = buildRfqQuotationReadiness(payload, attachments);

  return [
    "New RFQ inquiry from ArcFort Weld website",
    `RFQ Reference: ${reference}`,
    `Quotation Readiness: ${readiness.label}`,
    "",
    "Confirmed Signals:",
    ...readiness.confirmedSignals.map((item) => `- ${item}`),
    "",
    "Sales Follow-up Checklist:",
    ...readiness.followUpItems.map((item) => `- ${item}`),
    "",
    `Name: ${payload.name}`,
    `Company: ${payload.company}`,
    `Email: ${payload.email}`,
    `WhatsApp: ${payload.whatsapp || "Not provided"}`,
    `Country: ${payload.country}`,
    `Quantity: ${payload.quantity}`,
    "",
    "Product Requirements:",
    payload.productRequirements,
    "",
    "Message:",
    payload.message || "No additional message.",
    "",
    "Attachments:",
    attachmentText(attachments, true),
    "",
    "Attachment Safety:",
    "Attachments were submitted by an external website visitor. File signatures were checked, but files were not malware-scanned. Use endpoint protection and do not enable macros.",
    "",
    "Source:",
    `Path: ${payload.sourcePath}`,
    `Landing Page: ${payload.sourceAttribution.landingPage || "Not captured"}`,
    `Browser Referrer: ${payload.sourceAttribution.referrer || "Not captured"}`,
    `UTM Source: ${payload.sourceAttribution.utmSource || "Not captured"}`,
    `UTM Medium: ${payload.sourceAttribution.utmMedium || "Not captured"}`,
    `UTM Campaign: ${payload.sourceAttribution.utmCampaign || "Not captured"}`,
    `UTM Term: ${payload.sourceAttribution.utmTerm || "Not captured"}`,
    `UTM Content: ${payload.sourceAttribution.utmContent || "Not captured"}`,
    `Referrer: ${requestMeta.referrer}`,
    `User Agent: ${requestMeta.userAgent}`,
  ].join("\n");
}

export function buildBuyerConfirmationEmailText(
  payload: RfqEmailPayload,
  attachments: RfqEmailAttachment[],
  reference: string,
) {
  return [
    `Dear ${payload.name},`,
    "",
    "Thank you for sending your RFQ to ArcFort Weld.",
    "",
    "We have received your inquiry. A sales specialist will review the submitted product details, quantity, packaging requirement and destination. Technical fit or OEM requests may require a drawing, sample photo or model reference before a quotation can be finalized.",
    "",
    "RFQ Summary",
    `Reference: ${reference}`,
    `Company: ${payload.company}`,
    `Email: ${payload.email}`,
    `WhatsApp: ${payload.whatsapp || "Not provided"}`,
    `Country: ${payload.country}`,
    `Quantity: ${payload.quantity}`,
    "",
    "Product Requirements:",
    payload.productRequirements,
    "",
    "Message:",
    payload.message || "No additional message.",
    "",
    "Attachments:",
    attachmentText(attachments, false),
    "",
    "Information that can help us review faster:",
    "- Product or OEM number, torch or machine model, size and quantity per line item",
    "- Drawing, product list, or clear sample photos when fit details are important",
    "- Logo, private-label, carton, shipping term and destination requirements",
    "",
    "For updates, reply with the RFQ reference or contact us directly:",
    `Email: ${siteConfig.email}`,
    `WhatsApp: ${siteConfig.whatsapp}`,
    "",
    `${siteConfig.legalName}`,
    siteConfig.tagline,
    "",
    "This is an automatic confirmation email from the ArcFort Weld website.",
  ].join("\n");
}

export function buildInquiryEmailHtml(
  payload: RfqEmailPayload,
  attachments: RfqEmailAttachment[],
  reference: string,
  requestMeta: RfqEmailRequestMeta,
) {
  const readiness = buildRfqQuotationReadiness(payload, attachments);
  const buyerRows = [
    detailRow("RFQ Reference", reference),
    detailRow("Name", payload.name),
    detailRow("Company", payload.company),
    detailRow("Email", payload.email),
    detailRow("WhatsApp", payload.whatsapp),
    detailRow("Country", payload.country),
    detailRow("Quantity", payload.quantity),
  ].join("");
  const sourceRows = [
    detailRow("Source path", payload.sourcePath),
    detailRow("Landing page", payload.sourceAttribution.landingPage, "Not captured"),
    detailRow("Browser referrer", payload.sourceAttribution.referrer, "Not captured"),
    detailRow("UTM source", payload.sourceAttribution.utmSource, "Not captured"),
    detailRow("UTM medium", payload.sourceAttribution.utmMedium, "Not captured"),
    detailRow("UTM campaign", payload.sourceAttribution.utmCampaign, "Not captured"),
    detailRow("UTM term", payload.sourceAttribution.utmTerm, "Not captured"),
    detailRow("UTM content", payload.sourceAttribution.utmContent, "Not captured"),
    detailRow("Request referrer", requestMeta.referrer, "Direct"),
    detailRow("User agent", requestMeta.userAgent, "Unknown"),
  ].join("");
  const readinessContent = `
    <div style="margin: 0 0 14px; color: #071524; font-size: 15px; font-weight: 800;">${safeText(readiness.label)}</div>
    <div style="margin: 0 0 8px; color: #526174; font-size: 12px; font-weight: 700; text-transform: uppercase;">Confirmed signals</div>
    ${bulletList(readiness.confirmedSignals)}
    <div style="margin: 16px 0 8px; color: #526174; font-size: 12px; font-weight: 700; text-transform: uppercase;">Sales follow-up checklist</div>
    ${bulletList(readiness.followUpItems)}`;
  const content = [
    section("Quotation Readiness", readinessContent),
    `<tr><td style="padding: 0 32px 24px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border: 1px solid #d9e2ec; border-collapse: collapse;">${buyerRows}</table></td></tr>`,
    section("Product Requirements", multilineText(payload.productRequirements)),
    section("Additional Message", multilineText(payload.message, "No additional message.")),
    section("Attachments", attachmentList(attachments, true)),
    section(
      "Attachment Safety",
      "Attachments were submitted by an external website visitor. File signatures were checked, but files were not malware-scanned. Use endpoint protection and do not enable macros.",
    ),
    `<tr><td style="padding: 0 32px 24px;"><h2 style="margin: 0 0 10px; color: #071524; font-size: 18px;">Inquiry Source</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border: 1px solid #d9e2ec; border-collapse: collapse;">${sourceRows}</table></td></tr>`,
  ].join("");

  return emailShell({
    preheader: `New website RFQ ${reference} from ${payload.company}`,
    eyebrow: "New Website RFQ",
    title: `Inquiry ${reference}`,
    intro:
      "A new website inquiry passed form validation and was accepted for sales follow-up. Review the product references and attachments before preparing a quotation.",
    content,
  });
}

export function buildBuyerConfirmationEmailHtml(
  payload: RfqEmailPayload,
  attachments: RfqEmailAttachment[],
  reference: string,
) {
  const followUpEmailHref = `${siteConfig.emailHref}?subject=${encodeURIComponent(
    `Additional RFQ details - ${reference}`,
  )}`;
  const followUpWhatsAppHref = `${siteConfig.whatsappHref}?text=${encodeURIComponent(
    `Hello ArcFort Weld, I would like to add details to RFQ ${reference}.`,
  )}`;
  const summaryRows = [
    detailRow("RFQ Reference", reference),
    detailRow("Company", payload.company),
    detailRow("Email", payload.email),
    detailRow("WhatsApp", payload.whatsapp),
    detailRow("Country", payload.country),
    detailRow("Quantity", payload.quantity),
  ].join("");
  const nextSteps = `
    <ol style="margin: 0; padding-left: 20px;">
      <li style="margin-bottom: 8px;"><strong>Technical review:</strong> product details, fit references and attachments are checked.</li>
      <li style="margin-bottom: 8px;"><strong>Quotation preparation:</strong> applicable MOQ, packing and delivery options are organized.</li>
      <li><strong>Follow-up:</strong> the sales team may request a drawing, sample photo or model reference when fit details need confirmation.</li>
    </ol>`;
  const reviewDetails = bulletList([
    "Product or OEM number, torch or machine model, size and quantity per line item",
    "Drawing, product list, or clear sample photos when fit details are important",
    "Logo, private-label, carton, shipping term and destination requirements",
  ]);
  const contactActions = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
      <tr>
        <td style="padding: 0 6px 8px 0;"><a href="${escapeHtml(followUpEmailHref)}" style="display: block; background: #0f4c81; padding: 13px 16px; color: #ffffff; font-size: 13px; font-weight: 700; text-align: center; text-decoration: none;">Email ArcFort Weld</a></td>
        <td style="padding: 0 0 8px 6px;"><a href="${escapeHtml(followUpWhatsAppHref)}" style="display: block; border: 1px solid #0f4c81; padding: 12px 16px; color: #0f4c81; font-size: 13px; font-weight: 700; text-align: center; text-decoration: none;">WhatsApp</a></td>
      </tr>
    </table>
    <div style="margin-top: 8px; color: #526174; font-size: 12px; line-height: 1.6;">Email: ${escapeHtml(siteConfig.email)} | WhatsApp: ${escapeHtml(siteConfig.whatsapp)}</div>`;
  const content = [
    `<tr><td style="padding: 0 32px 24px;"><div style="border-left: 4px solid #f6b445; background: #f4f7fb; padding: 16px; color: #334155; font-size: 15px; line-height: 1.7;">Dear ${safeText(payload.name)},<br /><br />We have received your inquiry. Keep the RFQ reference below when sending additional drawings, photos or product details.</div></td></tr>`,
    `<tr><td style="padding: 0 32px 24px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border: 1px solid #d9e2ec; border-collapse: collapse;">${summaryRows}</table></td></tr>`,
    section("Product Requirements", multilineText(payload.productRequirements)),
    section("Additional Message", multilineText(payload.message, "No additional message.")),
    section("Attachments Received", attachmentList(attachments, false)),
    section("What Happens Next", nextSteps),
    section("Information That Helps Us Review Faster", reviewDetails),
    section("Add Details or Follow Up", contactActions),
  ].join("");

  return emailShell({
    preheader: `ArcFort Weld received your RFQ ${reference}`,
    eyebrow: "RFQ Received",
    title: `Thank you, ${payload.name}`,
    intro:
      "Your inquiry is now available for product and quotation review. Technical fit or OEM requests may require a drawing, sample photo or model reference before a quotation can be finalized.",
    content,
  });
}
