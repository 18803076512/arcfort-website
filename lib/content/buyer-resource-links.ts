import type { BuyerResourceLink, BuyerResourceSection } from "./schemas.ts";

export const roboticMigTorchResources: BuyerResourceLink[] = [
  {
    href: "/products/welding-accessories/robot-welding-torch",
    label: "Robotic MIG/MAG Supply",
    title: "Robotic MIG/MAG Welding Torch Front End",
    description:
      "Review the catalog-supported torch neck and front-end family, then confirm the installed interface, cooling, cable arrangement and consumable stack before quotation.",
    actionLabel: "Review Product",
  },
  {
    href: "/guides/robotic-mig-welding-torch-replacement-guide",
    label: "Replacement Guide",
    title: "Robotic MIG/MAG Torch Replacement Evidence",
    description:
      "Prepare the installed cell reference, torch label, interface drawing, neck geometry, connector photos and trial quantity for a controlled replacement review.",
    actionLabel: "Read Buyer Guide",
  },
];

export const roboticMigTorchCategoryResourceSection: BuyerResourceSection = {
  eyebrow: "Automated Welding Supply",
  title: "Source robotic MIG/MAG torch front ends with the evidence needed for replacement review.",
  description:
    "Automated welding cells add interface, torch-position, cooling and cable requirements beyond the loose front-end consumables used in manual torch maintenance. Use the product path for quotation scope and the guide path to prepare the installed-system evidence.",
  links: roboticMigTorchResources,
};

export const roboticMigTorchApplicationResourceSection: BuyerResourceSection = {
  eyebrow: "Automated Welding Maintenance",
  title: "Document robotic MIG/MAG torch replacements before trial installation.",
  description:
    "For automated welding cells, identify the requested front-end scope and connect it to the installed torch, mechanical interface, neck geometry, cooling, cable and consumable evidence before requesting a replacement quotation.",
  links: roboticMigTorchResources,
};
