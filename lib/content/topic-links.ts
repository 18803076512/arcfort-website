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
    href: "/guides/tig-torch-parts-names-identification-guide",
    title: "TIG Torch Parts Names and Identification Guide",
    description:
      "Name unknown TIG torch parts from assembly zones, photos, markings and samples before compatibility review.",
  },
  "plasma-cutting-consumables": {
    href: "/guides/plasma-cutter-consumables-parts-guide",
    title: "Plasma Cutter Consumables and Parts Guide",
    description:
      "Identify electrodes, nozzles, swirl rings, shields and retaining caps as one compatible consumable stack.",
  },
  "welding-consumables": {
    href: "/guides/welding-electrode-wire-rfq-guide",
    title: "Welding Electrode and Wire RFQ Guide",
    description:
      "Prepare electrode, wire, classification, packaging and quantity details without guessing unconfirmed specifications.",
  },
  "welding-machines": {
    href: "/guides/welding-machine-sourcing-checklist",
    title: "Welding Machine Sourcing Checklist and RFQ Guide",
    description:
      "Define process, electrical requirements, interfaces, accessories and destination-market documents before RFQ.",
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
  "welding-consumables": guideByCategorySlug["welding-consumables"],
  "welding-machines": guideByCategorySlug["welding-machines"],
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
