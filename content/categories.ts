import type { ProductCategory } from "@/lib/content/schemas";

export const productCategories: ProductCategory[] = [
  {
    slug: "mig-mag-torch-parts",
    code: "MIG",
    title: "MIG/MAG Torch Parts",
    shortTitle: "MIG/MAG Parts",
    description:
      "Contact tips, gas nozzles, diffusers, liners and torch consumables for MIG/MAG welding applications.",
    seoTitle: "MIG/MAG Torch Parts for Industrial Welding Buyers",
    seoDescription:
      "Explore ARCFORT MIG/MAG torch parts including contact tips, gas nozzles, diffusers, liners and related welding consumables for B2B RFQ programs.",
    seoIntro:
      "ARCFORT supplies MIG/MAG torch parts for distributors, importers, OEM buyers and repair workshops that need organized product references for repeat purchasing. Product specifications should be confirmed against torch model, drawing or sample before quotation.",
    buyerGuide: [
      "Confirm the torch model, thread, diameter and material before ordering contact tips or gas nozzles.",
      "Send existing part numbers, drawings or samples when compatible brand information is required.",
      "For distributor programs, group fast-moving consumables by torch series and packaging requirement.",
    ],
    features: [
      "Suitable for distributor product lines",
      "RFQ-ready category structure",
      "Supports OEM and private label discussion",
    ],
    relatedCategorySlugs: ["tig-torch-parts", "plasma-cutting-consumables"],
    faq: [
      {
        question: "Can ARCFORT quote MIG/MAG torch parts by sample or drawing?",
        answer:
          "Yes. Buyers can send samples, drawings, product lists or reference numbers so the technical details can be confirmed before quotation.",
      },
      {
        question: "Are compatible brands listed on every MIG/MAG part page?",
        answer:
          "Compatibility data is added when confirmed. Missing compatibility fields are marked as To be confirmed.",
      },
    ],
    keywords: [
      "MIG/MAG torch parts",
      "MIG contact tip",
      "MIG gas nozzle",
      "torch liner",
      "welding diffuser",
    ],
  },
  {
    slug: "tig-torch-parts",
    code: "TIG",
    title: "TIG Torch Parts",
    shortTitle: "TIG Parts",
    description:
      "Ceramic cups, collets, collet bodies, gas lenses and TIG torch accessories for industrial welding supply.",
    seoTitle: "TIG Torch Parts and Consumables for B2B Supply",
    seoDescription:
      "Browse TIG torch parts such as ceramic cups, collets, collet bodies, gas lenses and TIG welding accessories for industrial sourcing and RFQ.",
    seoIntro:
      "ARCFORT organizes TIG torch parts for buyers who compare product fit, packaging, MOQ and delivery requirements before placing repeat orders. Unknown technical fields are kept as To be confirmed until validated by drawing, sample or model reference.",
    buyerGuide: [
      "Check torch series and cup size before selecting ceramic cups or gas lens parts.",
      "Confirm collet and collet body dimensions for the required tungsten size.",
      "Provide packaging and labeling requirements when preparing distributor programs.",
    ],
    features: [
      "Clear product family structure",
      "Useful for repair workshop sourcing",
      "Prepared for future SKU expansion",
    ],
    relatedCategorySlugs: ["mig-mag-torch-parts", "plasma-cutting-consumables"],
    faq: [
      {
        question: "What TIG torch information should buyers send?",
        answer:
          "Please send torch series, tungsten size, cup size, reference number or drawings so ARCFORT can confirm the requested item.",
      },
      {
        question: "Can TIG parts be prepared for OEM packaging?",
        answer:
          "OEM packaging can be discussed after product details, quantity and artwork requirements are confirmed.",
      },
    ],
    keywords: [
      "TIG torch parts",
      "TIG ceramic cup",
      "TIG collet body",
      "gas lens",
      "TIG welding accessories",
    ],
  },
  {
    slug: "plasma-cutting-consumables",
    code: "CUT",
    title: "Plasma Cutting Consumables",
    shortTitle: "Plasma Consumables",
    description:
      "Electrodes, nozzles, swirl rings, shields and consumables for plasma cutting systems.",
    seoTitle: "Plasma Cutting Consumables for Industrial Buyers",
    seoDescription:
      "Source plasma cutting consumables including electrodes, nozzles, swirl rings and shields for distributors, OEM buyers and industrial users.",
    seoIntro:
      "ARCFORT structures plasma cutting consumables by product family, compatibility and RFQ requirements so global buyers can prepare clear sourcing lists. Technical compatibility should be confirmed before production or quotation.",
    buyerGuide: [
      "Confirm cutting torch model, amperage range and consumable stack before selecting electrodes or nozzles.",
      "Check whether the buyer needs nozzles, electrodes, swirl rings and shields as individual items or kits.",
      "Include drawings or reference numbers when replacing existing plasma cutting consumables.",
    ],
    features: [
      "Designed for repeat consumable sourcing",
      "Supports kit and individual item RFQs",
      "Useful for fabrication and maintenance channels",
    ],
    relatedCategorySlugs: ["mig-mag-torch-parts", "tig-torch-parts"],
    faq: [
      {
        question: "Can plasma consumables be quoted by reference number?",
        answer:
          "Yes. Reference numbers, drawings, photos and sample details help confirm compatibility before quotation.",
      },
      {
        question: "Are plasma consumables sold as kits?",
        answer:
          "Kit structure, packaging and quantity should be confirmed during RFQ. Missing details are marked as To be confirmed.",
      },
    ],
    keywords: [
      "plasma cutting consumables",
      "plasma electrode",
      "plasma nozzle",
      "swirl ring",
      "plasma cutting parts",
    ],
  },
  {
    slug: "welding-consumables",
    code: "CON",
    title: "Welding Consumables",
    shortTitle: "Consumables",
    description:
      "Welding wires, electrodes, holders, clamps and general consumables for industrial welding supply programs.",
    seoTitle: "Welding Consumables for Industrial B2B Sourcing",
    seoDescription:
      "Source welding consumables including welding wires, electrodes, holders, clamps and related items for distributors, importers and repair workshops.",
    seoIntro:
      "ARCFORT structures welding consumables for buyers who need practical product lists, repeat purchasing programs and RFQ-ready information. Exact specifications, packaging, MOQ and lead time should be confirmed before quotation.",
    buyerGuide: [
      "Confirm welding process, material requirement, size and packaging before requesting quotation.",
      "Send product list, reference photos or existing item numbers when replacing current consumables.",
      "Group fast-moving consumables by workshop use, distributor carton packing or target market demand.",
    ],
    features: [
      "Prepared for repeat consumable sourcing",
      "Suitable for distributors and repair workshops",
      "Supports mixed RFQ product lists",
    ],
    relatedCategorySlugs: ["mig-mag-torch-parts", "tig-torch-parts", "welding-accessories"],
    faq: [
      {
        question: "Can welding consumables be quoted as a mixed list?",
        answer:
          "Yes. Buyers can send a mixed product list with quantities, packaging needs and destination country for review.",
      },
      {
        question: "Are consumable specifications confirmed on this site?",
        answer:
          "Only confirmed fields should be used for quotation. Unknown fields remain marked as To be confirmed.",
      },
    ],
    keywords: [
      "welding consumables",
      "welding wire",
      "welding electrodes",
      "welding holder",
      "ground clamp",
    ],
  },
  {
    slug: "welding-machines",
    code: "MAC",
    title: "Welding Machines",
    shortTitle: "Machines",
    description:
      "MIG, TIG, MMA and plasma cutting machines for industrial applications and distributor sourcing programs.",
    seoTitle: "Welding Machines for Industrial Buyers and Distributors",
    seoDescription:
      "Explore welding machine sourcing categories including MIG, TIG, MMA and plasma cutting machines for industrial B2B RFQs.",
    seoIntro:
      "ARCFORT organizes welding machine content for buyers who compare process type, input requirements, application scenarios, accessory needs and delivery options. Machine parameters should be confirmed by official specification sheets before quotation.",
    buyerGuide: [
      "Confirm welding process, input voltage, output range and target application before RFQ.",
      "Send required accessory list, destination market standards and packaging requirements.",
      "Do not assume certifications or performance data unless official documents are provided.",
    ],
    features: [
      "Supports machine sourcing discussions",
      "Prepared for OEM and distributor inquiry workflows",
      "Keeps unconfirmed parameters explicit",
    ],
    relatedCategorySlugs: ["welding-consumables", "welding-accessories", "plasma-cutting-consumables"],
    faq: [
      {
        question: "Can ARCFORT quote welding machines by target process?",
        answer:
          "Yes. Buyers can provide MIG, TIG, MMA or plasma cutting requirements, but technical parameters must be confirmed before quotation.",
      },
      {
        question: "Are machine certifications listed?",
        answer:
          "Certifications are not invented. Certification fields should only be added after official documents are confirmed.",
      },
    ],
    keywords: [
      "welding machines",
      "MIG welding machine",
      "TIG welding machine",
      "MMA welding machine",
      "plasma cutting machine",
    ],
  },
  {
    slug: "welding-accessories",
    code: "ACC",
    title: "Welding Accessories",
    shortTitle: "Accessories",
    description:
      "Cables, connectors, clamps, holders and workshop welding accessories for industrial repair and fabrication users.",
    seoTitle: "Welding Accessories for Workshops and Industrial Buyers",
    seoDescription:
      "Browse welding accessories such as cables, connectors, clamps and holders for B2B welding supply and repair workshop sourcing.",
    seoIntro:
      "ARCFORT welding accessories pages help buyers organize workshop support items, accessory kits and replacement product lists. Dimensions, material, compatible equipment and packaging details should be confirmed by RFQ.",
    buyerGuide: [
      "Confirm accessory size, cable connection, current rating requirement or compatible machine model when available.",
      "Send photos or sample details for clamps, holders and connectors that must match existing products.",
      "Use the RFQ form for mixed accessory lists and packaging requirements.",
    ],
    features: [
      "Useful for workshop supply programs",
      "Supports mixed accessory RFQs",
      "Prepared for future SKU expansion",
    ],
    relatedCategorySlugs: ["welding-consumables", "welding-machines", "mig-mag-torch-parts"],
    faq: [
      {
        question: "Can accessories be sourced together with consumables?",
        answer:
          "Yes. Buyers can combine accessories and consumables in one RFQ list with quantities and package details.",
      },
      {
        question: "What details are needed for welding accessory quotation?",
        answer:
          "Please provide product name, size, connection type, quantity, photos, drawings or samples when available.",
      },
    ],
    keywords: [
      "welding accessories",
      "welding cable",
      "ground clamp",
      "welding holder",
      "welding connector",
    ],
  },
];
