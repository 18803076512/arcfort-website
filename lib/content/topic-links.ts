import { guides } from "@/content/guides";

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
    href: "/guides/mig-contact-tip-size-thread-selection",
    title: "MIG Contact Tip Size and Thread Selection",
    description:
      "Review wire size, thread, geometry and torch references before sourcing MIG/MAG contact tips.",
  },
  "tig-torch-parts": {
    href: "/guides/tig-torch-consumable-stack-selection",
    title: "TIG Torch Consumable Stack Selection",
    description:
      "Identify ceramic cups, collets, collet bodies, gas lenses and related TIG torch references.",
  },
  "plasma-cutting-consumables": {
    href: "/guides/plasma-electrode-nozzle-buying-guide",
    title: "Plasma Electrode and Nozzle Buying Guide",
    description:
      "Review torch model, reference number, consumable stack, quantity and packaging details before RFQ.",
  },
  "welding-consumables": {
    href: "/guides/welding-cable-connector-selection",
    title: "Welding Cable and Connector Selection",
    description:
      "Prepare cable, connector, ground clamp and electrode holder requirements for a structured RFQ.",
  },
  "welding-accessories": {
    href: "/guides/welding-cable-connector-selection",
    title: "Welding Cable and Connector Selection",
    description:
      "Prepare cable, connector, ground clamp and electrode holder requirements for a structured RFQ.",
  },
};

const productFallbackGuideByCategorySlug: Record<string, BuyerGuideLink> = {
  "mig-mag-torch-parts": {
    href: "/guides/mig-vs-tig-torch-consumables",
    title: "MIG/MAG vs TIG Torch Consumables",
    description:
      "Compare torch consumable families and the fit details buyers should confirm before ordering.",
  },
  "tig-torch-parts": guideByCategorySlug["tig-torch-parts"],
  "plasma-cutting-consumables": guideByCategorySlug["plasma-cutting-consumables"],
};

export function getBuyerGuideForCategory(categorySlug: string) {
  return guideByCategorySlug[categorySlug] ?? generalRfqGuide;
}

export function getBuyerGuideForProduct(productSlug: string, categorySlug: string) {
  const matchedGuide = guides
    .filter((guide) => guide.productSlugs.includes(productSlug))
    .sort((left, right) => {
      const categoryDifference = left.categorySlugs.length - right.categorySlugs.length;

      if (categoryDifference !== 0) {
        return categoryDifference;
      }

      return left.productSlugs.length - right.productSlugs.length;
    })[0];

  if (!matchedGuide) {
    return productFallbackGuideByCategorySlug[categorySlug] ?? generalRfqGuide;
  }

  return {
    href: `/guides/${matchedGuide.slug}`,
    title: matchedGuide.title,
    description: matchedGuide.description,
  };
}
