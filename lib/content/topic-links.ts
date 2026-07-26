export type BuyerGuideLink = {
  href: string;
  title: string;
  description: string;
};

const generalRfqGuide: BuyerGuideLink = {
  href: "/guides/how-to-prepare-a-welding-parts-rfq",
  title: "How to Prepare a Welding Parts RFQ",
  description:
    "Prepare product references, quantities, drawings, packaging requirements and destination details for quotation review.",
};

const guideByCategorySlug: Record<string, BuyerGuideLink> = {
  "mig-mag-torch-parts": {
    href: "/guides/mig-vs-tig-torch-consumables",
    title: "MIG/MAG vs TIG Torch Consumables",
    description:
      "Compare common torch consumable families and the fit details buyers should confirm before ordering.",
  },
  "tig-torch-parts": {
    href: "/guides/mig-vs-tig-torch-consumables",
    title: "MIG/MAG vs TIG Torch Consumables",
    description:
      "Compare common torch consumable families and the fit details buyers should confirm before ordering.",
  },
  "plasma-cutting-consumables": {
    href: "/guides/plasma-electrode-nozzle-buying-guide",
    title: "Plasma Electrode and Nozzle Buying Guide",
    description:
      "Review torch model, reference number, consumable stack, quantity and packaging details before RFQ.",
  },
};

export function getBuyerGuideForCategory(categorySlug: string) {
  return guideByCategorySlug[categorySlug] ?? generalRfqGuide;
}
