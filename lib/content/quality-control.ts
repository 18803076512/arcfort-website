export const qualityInspectionStages = [
  {
    step: "01",
    title: "Product reference review",
    buyerEvidence:
      "Itemized RFQ, existing part number, torch or machine label, drawing, measured details, product photos or a physical sample.",
    reviewFocus:
      "Separate confirmed product identity from open material, dimension, thread, rating and compatibility fields before quotation approval.",
    orderRecord:
      "Quoted item reference, buyer-supplied evidence and any technical details still requiring approval.",
  },
  {
    step: "02",
    title: "Pre-production readiness",
    buyerEvidence:
      "Approved product reference, quantity by line, packaging requirement, artwork version and any requested inspection evidence.",
    reviewFocus:
      "Check that the product, customization and packing basis is sufficiently defined before production planning or order preparation.",
    orderRecord:
      "Approved order details, open actions and the inspection or sample-approval scope agreed for the order.",
  },
  {
    step: "03",
    title: "Product and first-piece review",
    buyerEvidence:
      "Critical dimensions, appearance points, interface details or approved sample criteria that matter to product selection and fit.",
    reviewFocus:
      "Review applicable dimensions, thread, profile, finish, assembly or identification against the agreed reference. Methods vary by product.",
    orderRecord:
      "Measurement, photo or sample evidence when requested and confirmed as part of the quotation or order.",
  },
  {
    step: "04",
    title: "Packing and pre-shipment review",
    buyerEvidence:
      "Packing unit, labels, barcodes, carton marks, destination requirements and the final approved item list.",
    reviewFocus:
      "Reconcile product identity, quantity, packing presentation, marks and requested shipment documents before dispatch approval.",
    orderRecord:
      "Final packing basis, shipment-document scope and pre-shipment evidence agreed for the order.",
  },
] as const;

export const qualityProductReviewMatrix = [
  {
    family: "MIG/MAG torch parts",
    commonRisk:
      "Similar-looking contact tips, tip holders, diffusers, nozzles and liners can differ by thread, bore, length, profile or torch series.",
    buyerShouldSend:
      "Torch label, current consumable photos, wire size, measured thread and key dimensions, plus any reliable part reference.",
    lockBeforeOrder:
      "Part type, thread, wire or bore size, profile, key dimensions, torch reference and packing unit.",
  },
  {
    family: "TIG torch parts",
    commonRisk:
      "Ceramic cup number, collet size, collet-body or gas-lens thread and torch-family references are not interchangeable by appearance alone.",
    buyerShouldSend:
      "Torch model or label, electrode diameter, current consumable stack photos, thread details and sample or drawing when available.",
    lockBeforeOrder:
      "Cup size, electrode size, thread or interface, torch reference, component type and packing unit.",
  },
  {
    family: "Plasma cutting consumables",
    commonRisk:
      "Electrodes, nozzles, shields and swirl rings must match the torch system and the correct position in the consumable stack.",
    buyerShouldSend:
      "Torch or system label, full consumable-stack photos, existing reference numbers and measured details or samples.",
    lockBeforeOrder:
      "Torch reference, component position, nozzle orifice when documented, profile, key dimensions and complete item list.",
  },
  {
    family: "Welding consumables",
    commonRisk:
      "Consumable type, nominal size, material requirement, packaging format and destination documentation can change the correct item.",
    buyerShouldSend:
      "Current label or data sheet, required type and size, material requirement, quantity, packing and destination country.",
    lockBeforeOrder:
      "Product type, supported material and size data, packing, quantity and available document scope.",
  },
  {
    family: "Welding and cutting machines",
    commonRisk:
      "Process, input supply, output requirement, duty expectation, connector type and included accessories must be reviewed together.",
    buyerShouldSend:
      "Required process, input voltage and frequency, target output range, workpiece context, connector preference and destination requirements.",
    lockBeforeOrder:
      "Quoted model, documented ratings, included accessories, plug or connector requirement, packing and document scope.",
  },
  {
    family: "Welding accessories",
    commonRisk:
      "Cable connectors, holders, clamps and related accessories can differ by connection standard, cable range, contact interface and assembly.",
    buyerShouldSend:
      "Current item photos, connector or interface details, cable requirement, measured dimensions, quantity and intended application.",
    lockBeforeOrder:
      "Accessory type, interface, supported size or cable range, assembly scope, quantity and packing unit.",
  },
] as const;

export const qualityBuyerSupplierControls = [
  {
    area: "Product identity",
    buyerInput:
      "One line per item with product name, model or reference, quantity and a photo, drawing or sample reference where fit matters.",
    supplierConfirmation:
      "The exact quoted item and included components, with similar-looking alternatives kept on separate lines.",
  },
  {
    area: "Technical fields",
    buyerInput:
      "Critical size, thread, material, rating or interface requirements, identifying which values are measured and which are expected.",
    supplierConfirmation:
      "Only supported values, the evidence basis and a clear list of details that remain available upon request or require a sample.",
  },
  {
    area: "Compatibility",
    buyerInput:
      "Torch or machine label, complete component stack, existing reference and the dimensions needed to distinguish the part.",
    supplierConfirmation:
      "Whether fit is confirmed, reference-only or still unverified. A family name alone is not treated as confirmed fitment.",
  },
  {
    area: "Packing and identification",
    buyerInput:
      "Unit quantity, inner packing, label, barcode, logo, carton artwork and shipping-mark requirements.",
    supplierConfirmation:
      "Approved packing unit, artwork version, carton basis, customization scope and related MOQ or schedule effect.",
  },
  {
    area: "Inspection evidence",
    buyerInput:
      "The required photo, measurement, sample, packing or pre-shipment record and when approval is needed.",
    supplierConfirmation:
      "Available evidence, review method, timing and any cost or lead-time effect stated before the order is approved.",
  },
] as const;

export const qualityEvidenceOptions = [
  {
    title: "Reference sample or drawing",
    description:
      "Use an approved sample, marked drawing or dimensional reference when a product name or photo cannot establish exact fit.",
  },
  {
    title: "Product and measurement photos",
    description:
      "Request the required views and measurement points during the RFQ stage. Availability and scope are confirmed for the specific order.",
  },
  {
    title: "Packing artwork and marks",
    description:
      "Approve the label, barcode, inner-pack quantity, carton artwork and shipping marks before customized packing is prepared.",
  },
  {
    title: "Pre-shipment record",
    description:
      "Define the item, quantity, packing and document evidence needed before balance payment or dispatch approval.",
  },
] as const;

export const qualityResourceLinks = [
  {
    href: "/products",
    title: "Product Center",
    description: "Build an itemized list by product family, SKU and available reference.",
  },
  {
    href: "/guides/identify-welding-torch-consumables-from-photos-samples",
    title: "Part Identification Guide",
    description: "Prepare photos, labels, dimensions and samples for consumable matching.",
  },
  {
    href: "/oem-service",
    title: "OEM Service",
    description: "Define the approval path for logo, labels, cartons and model customization.",
  },
  {
    href: "/shipping-payment#export-order-workflow",
    title: "Export Order Workflow",
    description: "Connect product approval to payment, packing, documents and dispatch.",
  },
] as const;

export const qualityFaq = [
  {
    question: "What quality information should a buyer send with an RFQ?",
    answer:
      "Send an itemized product list, model or existing reference, quantity and the technical details that affect fit. Add clear photos, labels, drawings, measured dimensions or sample information when the part is not fully identified.",
  },
  {
    question: "How is welding torch or plasma consumable compatibility reviewed?",
    answer:
      "Compatibility is reviewed from the torch or machine model, existing part reference, complete consumable stack, measured details, drawing or physical sample. A similar appearance or broad family name is not sufficient to confirm exact fit.",
  },
  {
    question: "Can buyers request inspection photos or measurement records?",
    answer:
      "Yes. State the required views, dimensions, quantity of samples and approval timing in the RFQ. ArcFort Weld will confirm which records are available and include the agreed scope in the quotation or order details.",
  },
  {
    question: "Can a sample be approved before a regular order?",
    answer:
      "A sample or pre-production approval can be discussed when product identification, fit, appearance or customized packing requires it. Sample availability, cost, dispatch method and approval effect on lead time are order-specific.",
  },
  {
    question: "How are private-label packaging details controlled?",
    answer:
      "The buyer should approve the logo, label content, barcode, packing unit, carton artwork and shipping marks. The quotation should identify the approved version and any customization-related MOQ or lead-time requirement.",
  },
  {
    question: "Does ArcFort Weld claim certifications for every product?",
    answer:
      "No. Certification and destination-market document requirements must be stated by product and order. Documents are only confirmed when they are available for the specific quoted item.",
  },
] as const;

export const qualityRfqPrompt = [
  "Welding product quality and inspection RFQ",
  "Product / SKU / existing reference:",
  "Torch or machine model:",
  "Critical size, thread, material or rating:",
  "Quantity by item:",
  "Drawing, label, photo or sample available:",
  "Required inspection evidence:",
  "Packing, label or OEM requirement:",
  "Destination country and target schedule:",
].join("\n");
