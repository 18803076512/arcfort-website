import { siteConfig } from "./site.ts";

export const exportTradeCards = [
  { title: "Main Port", value: siteConfig.mainPort },
  { title: "Other Port Options", value: siteConfig.alternativePorts },
  { title: "Payment Basis", value: siteConfig.paymentTerms },
  { title: "MOQ Policy", value: siteConfig.moqPolicy },
  { title: "Regular Lead Time", value: siteConfig.regularLeadTime },
  { title: "OEM Scope", value: siteConfig.oemService },
] as const;

export const exportOrderStages = [
  {
    step: "01",
    title: "Submit an itemized RFQ",
    description:
      "List each product, model or reference, quantity, packing requirement and destination separately. Add drawings, photos or samples where product fit requires review.",
  },
  {
    step: "02",
    title: "Review the quotation basis",
    description:
      "Confirm the quoted product scope, MOQ, packing, lead-time basis, payment terms and proposed shipment plan. Freight and Incoterms remain order-specific until stated in the quotation.",
  },
  {
    step: "03",
    title: "Confirm deposit and order details",
    description:
      "T/T is preferred, with a 30% deposit before production. Product references, artwork, labels and packing details should be approved before the order enters production planning.",
  },
  {
    step: "04",
    title: "Complete pre-shipment review",
    description:
      "Confirm the final item list, quantities, packing marks and required shipment documents. The standard T/T balance is 70% before shipment.",
  },
  {
    step: "05",
    title: "Arrange dispatch",
    description:
      "Tianjin Xingang Port / Tianjin Port is the main port. The final port, transport method, freight basis and shipment timing are confirmed for the specific order.",
  },
] as const;

export const exportLeadTimeRows = [
  {
    orderType: "Sample order",
    timing: siteConfig.sampleLeadTime,
    confirmation:
      "Confirm material availability, requested samples, packing and dispatch method before relying on the schedule.",
  },
  {
    orderType: "Regular order",
    timing: siteConfig.regularLeadTime,
    confirmation:
      "Timing varies by product type, quantity and packing. The quotation should state the applicable schedule.",
  },
  {
    orderType: "OEM or customized order",
    timing: siteConfig.oemLeadTime,
    confirmation:
      "Artwork, private-label packing, model customization, material availability and approval timing can affect the schedule.",
  },
] as const;

export const exportQuotationInputs = [
  {
    title: "Product scope",
    buyerShouldSend:
      "Product name, SKU, model or existing reference, requested specification and available compatibility evidence.",
    quotationShouldConfirm:
      "Quoted product identity, included components and every technical field supported by reviewed data.",
  },
  {
    title: "Quantity and MOQ",
    buyerShouldSend:
      "Trial quantity and expected repeat quantity for each SKU, kept on separate quotation lines.",
    quotationShouldConfirm:
      "MOQ by product and any different MOQ caused by logo, private-label packing or special models.",
  },
  {
    title: "Packing and OEM",
    buyerShouldSend:
      "Standard or customized packing request, logo, label, barcode, carton and shipping-mark requirements.",
    quotationShouldConfirm:
      "Packing unit, customization scope, artwork approval needs and any related MOQ or lead-time effect.",
  },
  {
    title: "Destination and transport",
    buyerShouldSend:
      "Destination country, delivery city or port, preferred transport method and whether a freight option is requested.",
    quotationShouldConfirm:
      "Named port or delivery basis, transport scope, freight inclusion and applicable Incoterm when agreed.",
  },
  {
    title: "Payment and schedule",
    buyerShouldSend:
      "Order stage, target delivery window and any request to discuss L/C at sight for a large order.",
    quotationShouldConfirm:
      "Deposit and balance basis, quotation validity when stated, lead-time start point and order-specific schedule.",
  },
  {
    title: "Documents and labels",
    buyerShouldSend:
      "Required manual language, product labels, packing list details and destination-market document requests.",
    quotationShouldConfirm:
      "Documents and markings actually available for the proposed products; certification is never assumed.",
  },
] as const;

export const exportOrderFaq = [
  {
    question: "What is the main export port for ArcFort Weld orders?",
    answer:
      "The main port is Tianjin Xingang Port / Tianjin Port, China. Qingdao Port or Ningbo Port can be discussed when the product list and shipment plan make another port more suitable.",
  },
  {
    question: "What payment terms are used for welding product orders?",
    answer: siteConfig.paymentAlternatives,
  },
  {
    question: "When does the regular order lead time begin?",
    answer:
      "Regular orders are usually scheduled for 7-20 working days after deposit confirmation. Product type, quantity, packing and approved order details can affect the schedule stated in the quotation.",
  },
  {
    question: "Can buyers place a small trial order?",
    answer:
      "Small trial orders are accepted for standard products. MOQ for OEM products, special models or customized packaging depends on the product and production requirements.",
  },
  {
    question: "Are freight costs or Incoterms fixed on the website?",
    answer:
      "No. Freight, insurance, transport scope and Incoterms depend on the destination, shipment size, transport method and quotation date. They should be stated in the order-specific quotation.",
  },
  {
    question: "What should an OEM buyer confirm before production?",
    answer:
      "Confirm the base product, customization scope, approved logo and artwork, labels, packing unit, carton design, quantities and any sample or pre-production approval requirement.",
  },
] as const;

export const exportBuyerPaths = [
  {
    href: "/products",
    title: "Product Center",
    description: "Build the item list by category, SKU and available product reference.",
  },
  {
    href: "/distributor-supply",
    title: "Distributor Supply",
    description: "Prepare mixed-category trial and repeat-order requirements for review.",
  },
  {
    href: "/oem-service",
    title: "OEM Service",
    description: "Define logo, private-label packaging, carton and model customization scope.",
  },
  {
    href: "/quality-control",
    title: "Quality Control",
    description: "Review the inspection and order-confirmation points used before shipment.",
  },
] as const;

export const exportRfqPrompt = [
  "Export welding and cutting product order",
  "Product list / SKU / model:",
  "Quantity by item:",
  "Packing or OEM requirement:",
  "Destination country and city / port:",
  "Preferred transport method or Incoterm request:",
  "Target delivery schedule:",
  "Drawing, photo, sample or document reference:",
].join("\n");
