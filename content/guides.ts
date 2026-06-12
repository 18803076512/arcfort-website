import type { GuideArticle } from "@/lib/content/schemas";

export const guides: GuideArticle[] = [
  {
    slug: "how-to-prepare-a-welding-parts-rfq",
    title: "How to Prepare a Welding Parts RFQ",
    seoTitle: "How to Prepare a Welding Parts RFQ for B2B Suppliers",
    description:
      "A practical guide for sending clear welding torch parts, consumables and accessory inquiries to suppliers.",
    seoDescription:
      "Learn what information to include when sending welding parts RFQs, including product references, quantities, drawings, compatibility and packaging needs.",
    sections: [
      {
        title: "Start with the product list",
        body: "List product names, part numbers, compatible references and quantities. If a field is unknown, mark it clearly instead of guessing.",
      },
      {
        title: "Attach drawings or samples when possible",
        body: "Drawings, photos and sample details help confirm dimensions, material and compatibility before quotation.",
      },
      {
        title: "Confirm packaging and market requirements",
        body: "Distributors should include packaging style, labeling needs, destination country and expected order frequency.",
      },
    ],
    categorySlugs: ["mig-mag-torch-parts", "welding-consumables", "welding-accessories"],
    productSlugs: ["mig-contact-tip", "welding-wire", "ground-clamp"],
    faq: [
      {
        question: "Can I submit an RFQ with incomplete information?",
        answer:
          "Yes. Missing details can be marked as To be confirmed, but final quotation depends on confirmed product requirements.",
      },
      {
        question: "Should I include target quantity?",
        answer:
          "Yes. Quantity helps suppliers review MOQ, packaging and delivery options.",
      },
    ],
    keywords: ["welding parts RFQ", "welding consumables inquiry", "B2B welding supplier"],
  },
  {
    slug: "mig-vs-tig-torch-consumables",
    title: "MIG/MAG vs TIG Torch Consumables",
    seoTitle: "MIG/MAG vs TIG Torch Consumables Buying Guide",
    description:
      "A buyer-focused comparison of MIG/MAG and TIG torch consumable categories for industrial sourcing.",
    seoDescription:
      "Compare MIG/MAG and TIG torch consumables including contact tips, nozzles, ceramic cups, collets and gas lenses for B2B purchasing.",
    sections: [
      {
        title: "MIG/MAG consumables",
        body: "MIG/MAG torch parts commonly include contact tips, gas nozzles, diffusers, liners and related replacement items.",
      },
      {
        title: "TIG consumables",
        body: "TIG torch parts commonly include ceramic cups, collets, collet bodies, gas lenses and back caps.",
      },
      {
        title: "How buyers should compare",
        body: "Compare by torch series, size, thread, tungsten size, packaging and confirmed compatible references.",
      },
    ],
    categorySlugs: ["mig-mag-torch-parts", "tig-torch-parts"],
    productSlugs: ["mig-contact-tip", "mig-gas-nozzle", "tig-ceramic-cup"],
    faq: [
      {
        question: "Can MIG/MAG and TIG parts be quoted together?",
        answer:
          "Yes. Buyers can send one mixed RFQ list with separate quantities and product details.",
      },
      {
        question: "Is compatibility guaranteed by category name?",
        answer:
          "No. Compatibility should be confirmed by torch model, drawing, sample or reference number.",
      },
    ],
    keywords: ["MIG torch consumables", "TIG torch consumables", "welding torch parts"],
  },
  {
    slug: "plasma-electrode-nozzle-buying-guide",
    title: "Plasma Electrode and Nozzle Buying Guide",
    seoTitle: "Plasma Electrode and Nozzle Buying Guide for B2B Buyers",
    description:
      "A practical guide for preparing plasma cutting electrode and nozzle RFQs with confirmed compatibility details.",
    seoDescription:
      "Learn how to prepare plasma electrode and nozzle inquiries with torch model, reference numbers, quantity and packaging requirements.",
    sections: [
      {
        title: "Confirm torch model first",
        body: "Plasma consumables should be checked against torch model, compatible reference number, amperage range and consumable stack.",
      },
      {
        title: "Quote electrodes and nozzles together when needed",
        body: "Many buyers source electrodes, nozzles, swirl rings and shields as a set. Include each item and quantity in the RFQ.",
      },
      {
        title: "Keep unknown data visible",
        body: "If compatibility or OEM number is missing, mark it as To be confirmed until drawings, samples or references are reviewed.",
      },
    ],
    categorySlugs: ["plasma-cutting-consumables", "welding-accessories"],
    productSlugs: ["plasma-electrode", "plasma-nozzle", "ground-clamp"],
    faq: [
      {
        question: "What details are needed for plasma consumables?",
        answer:
          "Send torch model, reference number, item type, quantity, package requirement, drawings or sample details.",
      },
      {
        question: "Can plasma consumables be supplied as kits?",
        answer:
          "Kit structure can be discussed after item list, compatibility and packaging details are confirmed.",
      },
    ],
    keywords: ["plasma electrode", "plasma nozzle", "plasma cutting consumables"],
  },
];
