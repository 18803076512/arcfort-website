export const siteConfig = {
  name: "ArcFort Weld",
  shortName: "ArcFort Weld",
  legalName: "Renqiu Ailesen Welding Technology Co., Ltd.",
  chineseName: "任丘市埃勒森焊接科技有限公司",
  tagline: "Industrial Welding & Cutting Solutions",
  url: "https://arcfortweld.com",
  description:
    "Industrial welding and cutting product supplier for distributors, importers, OEM buyers, industrial users and repair workshops.",
  email: "arcfortweld@outlook.com",
  emailHref: "mailto:arcfortweld@outlook.com",
  whatsapp: "+86-18803076512",
  whatsappHref: "https://wa.me/8618803076512",
  address: "Renqiu City, Cangzhou, Hebei Province, China",
  mainPort: "Tianjin Xingang Port / Tianjin Port, China",
  alternativePorts: "Qingdao Port or Ningbo Port are available upon request.",
  paymentTerms:
    "T/T is preferred. Standard payment term: 30% deposit before production, 70% balance before shipment. L/C at sight can be discussed for large orders. Payment terms are negotiable depending on order quantity and customer cooperation history.",
  moqPolicy:
    "MOQ depends on product type, model, and customization requirements. For standard welding consumables and torch parts, small trial orders are acceptable. For OEM, customized packaging, or special models, MOQ will be confirmed according to production requirements.",
  leadTime:
    "Sample order: usually 3-7 working days if materials are available. Regular order: usually 7-20 working days after deposit confirmation. OEM or customized order: usually 20-35 working days depending on quantity, packaging, and production schedule.",
  oemService:
    "OEM and customized service are available. We support product customization, logo printing, private label packaging, carton design, and product model customization according to customer requirements. Customers can provide samples, drawings, photos, or technical specifications for quotation and production confirmation.",
  sameAs: [] as string[],
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
