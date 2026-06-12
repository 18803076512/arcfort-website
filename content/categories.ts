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
];
