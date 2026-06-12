import type { ApplicationPage } from "@/lib/content/schemas";

export const applications: ApplicationPage[] = [
  {
    slug: "shipbuilding",
    title: "Shipbuilding Welding Parts",
    seoTitle: "Shipbuilding Welding Parts and Cutting Consumables",
    description:
      "Welding and plasma cutting consumables for shipbuilding repair, fabrication and maintenance sourcing programs.",
    seoDescription:
      "Explore ARCFORT welding torch parts, plasma cutting consumables and accessories for shipbuilding-related sourcing and RFQ preparation.",
    overview:
      "Shipbuilding buyers often need organized consumable lists for welding, repair and cutting workflows. Product fit, packaging, MOQ and delivery must be confirmed before quotation.",
    industries: ["Ship repair", "Marine fabrication", "Steel structure workshops"],
    buyerNeeds: [
      "Repeat consumable supply for welding and cutting work",
      "Clear product lists by torch model or reference number",
      "RFQ support for mixed welding parts and plasma consumables",
    ],
    relatedCategorySlugs: ["mig-mag-torch-parts", "plasma-cutting-consumables", "welding-accessories"],
    relatedProductSlugs: ["mig-contact-tip", "plasma-electrode", "ground-clamp"],
    faq: [
      {
        question: "What should shipbuilding buyers include in an RFQ?",
        answer:
          "Include product list, torch models, reference numbers, drawings, quantities, packaging needs and destination country.",
      },
      {
        question: "Are shipbuilding certifications listed?",
        answer:
          "No certifications are invented. Any certification requirement must be confirmed with official documents.",
      },
    ],
    keywords: ["shipbuilding welding parts", "marine welding consumables", "plasma cutting parts"],
  },
  {
    slug: "automotive",
    title: "Automotive Welding Consumables",
    seoTitle: "Automotive Welding Consumables and Torch Parts",
    description:
      "MIG/MAG, TIG and accessory sourcing support for automotive repair, fabrication and production supply channels.",
    seoDescription:
      "Browse automotive welding consumable sourcing content for MIG/MAG torch parts, TIG parts and welding accessories.",
    overview:
      "Automotive welding buyers often compare consumable fit, repeat order stability and packaging needs. Confirm exact product details before quotation.",
    industries: ["Automotive repair", "Parts fabrication", "Maintenance workshops"],
    buyerNeeds: [
      "MIG/MAG torch consumables for repeat replacement",
      "Accessory lists for workshop maintenance",
      "Packaging and quantity details for distributor programs",
    ],
    relatedCategorySlugs: ["mig-mag-torch-parts", "tig-torch-parts", "welding-consumables"],
    relatedProductSlugs: ["mig-contact-tip", "mig-gas-nozzle", "welding-wire"],
    faq: [
      {
        question: "Can automotive buyers request mixed welding consumables?",
        answer:
          "Yes. Mixed product lists can be submitted through the RFQ form with quantity and packaging requirements.",
      },
      {
        question: "Can ARCFORT confirm compatibility by torch model?",
        answer:
          "Compatibility can be reviewed when buyers provide torch model, reference number, drawing or sample details.",
      },
    ],
    keywords: ["automotive welding consumables", "MIG torch parts", "welding wire"],
  },
  {
    slug: "pipeline",
    title: "Pipeline Welding Solutions",
    seoTitle: "Pipeline Welding Consumables and Accessories",
    description:
      "Welding consumable and accessory sourcing content for pipeline construction, maintenance and repair RFQs.",
    seoDescription:
      "Prepare pipeline welding RFQs with welding consumables, accessories and confirmed technical requirements for B2B sourcing.",
    overview:
      "Pipeline-related inquiries should be based on confirmed process, material, quantity, application and project requirements. Unconfirmed values remain To be confirmed.",
    industries: ["Pipeline construction", "Field repair", "Industrial maintenance"],
    buyerNeeds: [
      "Consumable sourcing by process and application",
      "Accessory and clamp support for field work",
      "Clear RFQ details for delivery planning",
    ],
    relatedCategorySlugs: ["welding-consumables", "welding-accessories", "welding-machines"],
    relatedProductSlugs: ["welding-wire", "ground-clamp", "mig-welding-machine"],
    faq: [
      {
        question: "Can pipeline applications be quoted without confirmed specs?",
        answer:
          "A preliminary RFQ can be reviewed, but final quotation requires confirmed product and application details.",
      },
      {
        question: "Should project standards be included?",
        answer:
          "Yes. Any required standards, documents or buyer specifications should be included in the RFQ.",
      },
    ],
    keywords: ["pipeline welding consumables", "pipeline welding accessories", "welding RFQ"],
  },
  {
    slug: "metal-fabrication",
    title: "Metal Fabrication Welding Parts",
    seoTitle: "Metal Fabrication Welding Parts and Plasma Consumables",
    description:
      "MIG/MAG torch parts, plasma cutting consumables and welding accessories for metal fabrication sourcing.",
    seoDescription:
      "Explore welding and cutting consumable content for metal fabrication shops, distributors and industrial users.",
    overview:
      "Fabrication shops need stable welding and cutting consumables for daily use. Product dimensions, compatibility and packaging should be confirmed before quotation.",
    industries: ["Fabrication shops", "Steel processing", "Industrial workshops"],
    buyerNeeds: [
      "MIG/MAG torch replacement parts",
      "Plasma electrode and nozzle sourcing",
      "Workshop accessory and clamp product lists",
    ],
    relatedCategorySlugs: ["mig-mag-torch-parts", "plasma-cutting-consumables", "welding-accessories"],
    relatedProductSlugs: ["mig-contact-tip", "plasma-nozzle", "ground-clamp"],
    faq: [
      {
        question: "Can fabrication shops submit product photos?",
        answer:
          "Photos can help initial review, but drawings, samples or reference numbers are recommended for accurate quotation.",
      },
      {
        question: "Can plasma parts and MIG parts be quoted together?",
        answer:
          "Yes. Buyers can send a combined RFQ list for welding and cutting consumables.",
      },
    ],
    keywords: ["metal fabrication welding parts", "plasma consumables", "MIG parts"],
  },
  {
    slug: "construction",
    title: "Construction Welding Accessories",
    seoTitle: "Construction Welding Accessories and Consumables",
    description:
      "Welding accessories, consumables and cutting parts for construction-related sourcing and maintenance channels.",
    seoDescription:
      "Prepare construction welding accessory RFQs for clamps, holders, consumables and cutting parts with confirmed requirements.",
    overview:
      "Construction buyers often need practical welding accessories and consumables for site work and maintenance. RFQs should include product list, quantity and delivery market.",
    industries: ["Construction steelwork", "Site maintenance", "Installation teams"],
    buyerNeeds: [
      "Accessory and clamp supply for site workflows",
      "Consumables for welding and cutting maintenance",
      "Packaging and delivery details for project purchasing",
    ],
    relatedCategorySlugs: ["welding-accessories", "welding-consumables", "plasma-cutting-consumables"],
    relatedProductSlugs: ["ground-clamp", "welding-wire", "plasma-electrode"],
    faq: [
      {
        question: "Can construction buyers request accessories in bulk?",
        answer:
          "Yes. Bulk accessory inquiries can be reviewed when quantity, packaging and product details are provided.",
      },
      {
        question: "Are delivery times listed?",
        answer:
          "Lead time is marked To be confirmed until product details and order quantity are confirmed.",
      },
    ],
    keywords: ["construction welding accessories", "welding clamps", "welding consumables"],
  },
  {
    slug: "repair-workshop",
    title: "Repair Workshop Welding Supplies",
    seoTitle: "Repair Workshop Welding Supplies and Torch Consumables",
    description:
      "Welding torch consumables, accessories and plasma cutting parts for repair workshops and maintenance buyers.",
    seoDescription:
      "Source repair workshop welding supplies including MIG/MAG parts, TIG parts, accessories and plasma cutting consumables.",
    overview:
      "Repair workshops often need broad but practical product coverage. ARCFORT pages are structured so buyers can prepare mixed RFQ lists with confirmed details.",
    industries: ["Repair workshops", "Maintenance teams", "Distributor counters"],
    buyerNeeds: [
      "Mixed consumable and accessory product lists",
      "Replacement parts by sample, photo or reference number",
      "Repeat purchasing support for common workshop items",
    ],
    relatedCategorySlugs: ["mig-mag-torch-parts", "tig-torch-parts", "welding-accessories"],
    relatedProductSlugs: ["mig-gas-nozzle", "tig-ceramic-cup", "ground-clamp"],
    faq: [
      {
        question: "Can repair workshops send mixed product lists?",
        answer:
          "Yes. The RFQ form is prepared for mixed lists, drawings, photos, sample notes and quantities.",
      },
      {
        question: "Can compatibility be checked before quotation?",
        answer:
          "Compatibility can be reviewed when torch models, photos, samples or reference numbers are provided.",
      },
    ],
    keywords: ["repair workshop welding supplies", "torch consumables", "welding accessories"],
  },
];
