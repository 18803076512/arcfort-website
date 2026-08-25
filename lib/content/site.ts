export const siteConfig = {
  name: "ArcFort Weld",
  shortName: "ArcFort Weld",
  legalName: "Renqiu Ailesen Welding Technology Co., Ltd.",
  chineseName: "任丘市埃勒森焊接科技有限公司",
  tagline: "Industrial Welding & Cutting Solutions",
  url: "https://www.arcfortweld.com",
  defaultSeoImage: "/images/site/arcfort-hero-welding-workshop.png",
  logo: "/favicon.svg",
  description:
    "Renqiu Ailesen Welding Technology Co., Ltd. operates ArcFort Weld, supplying industrial welding and cutting products for global distributors, importers, OEM buyers and industrial users.",
  contentLastModified: "2026-08-21",
  oemLastModified: "2026-08-13",
  guidesLastModified: "2026-08-13",
  aboutLastModified: "2026-08-13",
  qualityLastModified: "2026-08-13",
  distributorLandingLastModified: "2026-08-13",
  contactLastModified: "2026-08-09",
  productTemplateLastModified: "2026-08-12",
  catalogLastModified: "2026-06-29",
  email: "arcfortweld@outlook.com",
  emailHref: "mailto:arcfortweld@outlook.com",
  whatsapp: "+86-18803076512",
  whatsappHref: "https://wa.me/8618803076512",
  responseNote:
    "Send your product list, drawing or sample photo. Sales follow-up is provided after the product details are reviewed.",
  address: "Renqiu City, Cangzhou, Hebei Province, China",
  addressCity: "Renqiu City",
  addressProvince: "Hebei Province",
  addressCountryCode: "CN",
  mainPort: "Tianjin Xingang Port / Tianjin Port, China",
  alternativePorts: "Qingdao Port or Ningbo Port are available upon request.",
  paymentTerms: "T/T, 30% deposit before production, 70% balance before shipment",
  moqPolicy: "Small trial orders accepted; OEM MOQ depends on product and packaging requirements",
  leadTime: "7-20 working days for regular orders",
  regularLeadTime: "Usually 7-20 working days after deposit confirmation for regular orders",
  sampleLeadTime: "Usually 3-7 working days when materials are available",
  oemLeadTime:
    "Usually 20-35 working days depending on quantity, packaging and production schedule",
  paymentAlternatives:
    "T/T is preferred, with 30% deposit before production and 70% balance before shipment. L/C at sight can be discussed for large orders; final terms depend on order quantity and cooperation history.",
  oemService: "Logo, packaging, private label, and model customization available",
  sameAs: [] as string[],
};

type ContactLinkContext = {
  subject?: string;
  message?: string;
};

const defaultContactSubject = "ArcFort Weld product inquiry";
const defaultContactMessage = [
  "Hello ArcFort Weld, I would like to request a quotation.",
  "",
  "Product / model:",
  "Quantity:",
  "Destination country:",
  "Drawing, sample photo or reference:",
].join("\n");

export function buildEmailHref({
  subject = defaultContactSubject,
  message = defaultContactMessage,
}: ContactLinkContext = {}) {
  return `${siteConfig.emailHref}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

export function buildWhatsAppHref({ message = defaultContactMessage }: ContactLinkContext = {}) {
  return `${siteConfig.whatsappHref}?text=${encodeURIComponent(message)}`;
}

export const organizationIdentity = {
  name: siteConfig.legalName,
  legalName: siteConfig.legalName,
  alternateNames: [siteConfig.name, siteConfig.chineseName],
  brandName: siteConfig.name,
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
