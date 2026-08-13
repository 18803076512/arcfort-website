import { siteConfig } from "./site.ts";

export const companyBuyerProfiles = [
  {
    title: "Distributors & Importers",
    description:
      "Build mixed-category product lists for trial orders, regional stocking and repeat purchasing.",
    href: "/distributor-supply",
  },
  {
    title: "Welding Equipment Suppliers",
    description:
      "Source torch consumables, cutting parts, machines and accessories using itemized references.",
    href: "/products",
  },
  {
    title: "Repair Workshops & Industrial Users",
    description:
      "Request replacement parts using torch labels, existing parts, measurements, photos or samples.",
    href: "/guides/identify-welding-torch-consumables-from-photos-samples",
  },
  {
    title: "OEM & Private-Label Buyers",
    description:
      "Define the base product, logo, label, carton, packaging and order quantity before quotation.",
    href: "/oem-service",
  },
] as const;

export const companyInquiryStages = [
  {
    step: "01",
    title: "Define the product scope",
    description:
      "Send product names, models or existing references, quantity by item and destination country.",
  },
  {
    step: "02",
    title: "Review technical evidence",
    description:
      "Use drawings, labels, product photos, samples or measured details when specifications or fit require confirmation.",
  },
  {
    step: "03",
    title: "Confirm quotation details",
    description:
      "Review the quoted item, packing, MOQ, lead-time basis, payment terms and any open technical fields.",
  },
  {
    step: "04",
    title: "Approve the order basis",
    description:
      "Confirm product references, artwork, labels, packing and shipment requirements before production planning.",
  },
] as const;

export const companyEvidenceBoundaries = {
  confirmed: [
    `Legal company: ${siteConfig.legalName}`,
    `Website brand: ${siteConfig.name}`,
    `Location: ${siteConfig.address}`,
    `Business contact: ${siteConfig.email} and ${siteConfig.whatsapp}`,
    `Main port: ${siteConfig.mainPort}`,
    `Standard payment basis: ${siteConfig.paymentTerms}`,
  ],
  productSpecific: [
    "Exact material grade, dimensions, thread and technical rating",
    "Brand, torch, machine or OEM-number compatibility",
    "Certification or destination-market compliance documents",
    "Product-specific MOQ, packing unit and production schedule",
    "Freight, Incoterm, insurance and shipment date",
    "Customized logo, label, carton and model requirements",
  ],
} as const;

export const companyResourceLinks = [
  {
    href: "/quality-control",
    title: "Quality Control",
    description: "Review product confirmation, packing and pre-shipment control points.",
  },
  {
    href: "/shipping-payment#export-order-workflow",
    title: "Shipping & Payment",
    description: "Check confirmed payment, MOQ, lead-time and export-order information.",
  },
  {
    href: "/downloads",
    title: "Catalog & RFQ Files",
    description: "Open the company catalog and structured buyer preparation files.",
  },
  {
    href: "/contact",
    title: "Company Contact",
    description: "Use the website form, business email or WhatsApp for product inquiries.",
  },
] as const;

export const companyFaq = [
  {
    question: "What is the legal company behind ArcFort Weld?",
    answer: `${siteConfig.legalName} is the legal company operating the ${siteConfig.name} website brand. The company Chinese name is ${siteConfig.chineseName}.`,
  },
  {
    question: "Where is Renqiu Ailesen Welding Technology Co., Ltd. located?",
    answer: `The confirmed business address is ${siteConfig.address}. The main port for export-order planning is ${siteConfig.mainPort}.`,
  },
  {
    question: "What products does ArcFort Weld supply?",
    answer:
      "The supply scope covers MIG/MAG torch parts, TIG torch parts, plasma cutting consumables, welding consumables, welding machines, cutting machines, welding accessories and OEM welding products.",
  },
  {
    question: "Who does ArcFort Weld serve?",
    answer:
      "The website supports international distributors, importers, wholesalers, welding equipment suppliers, repair workshops, industrial users and OEM buyers.",
  },
  {
    question: "How are product compatibility and technical details confirmed?",
    answer:
      "Exact fit and technical details are reviewed using the torch or machine model, existing part reference, drawing, label, product photo, measured information or physical sample. A general family name alone does not confirm compatibility.",
  },
  {
    question: "How should a buyer request a quotation?",
    answer:
      "Send an itemized product list with model or reference, quantity, destination country and packing requirements. Add drawings, product photos or sample details where technical review is needed.",
  },
] as const;

export const companyRfqPrompt = [
  "Company and product sourcing inquiry",
  "Buyer company and country:",
  "Product category / item list:",
  "Model, size or existing reference:",
  "Quantity by item:",
  "Drawing, photo or sample available:",
  "Packing or OEM requirement:",
  "Target schedule and destination:",
].join("\n");
