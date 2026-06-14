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
  paymentTerms: "T/T, 30% deposit before production, 70% balance before shipment",
  moqPolicy: "Small trial orders accepted; OEM MOQ depends on product and packaging requirements",
  leadTime: "7-20 working days for regular orders",
  oemService: "Logo, packaging, private label, and model customization available",
  sameAs: [] as string[],
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
