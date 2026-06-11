export const productCategories = [
  {
    code: "MIG",
    name: "MIG Torch Parts",
    description:
      "Contact tips, nozzles, diffusers, liners, necks, and common torch replacement parts.",
    items: ["Contact tips and nozzles", "Gas diffusers and insulators", "Liners and neck parts"],
  },
  {
    code: "TIG",
    name: "TIG Torch Parts",
    description:
      "TIG torch consumables and replacement parts for industrial welding and repair channels.",
    items: ["Collets and collet bodies", "Ceramic cups and back caps", "Torch heads and cables"],
  },
  {
    code: "CUT",
    name: "Plasma Cutting Parts",
    description:
      "Plasma cutting consumables and torch parts for fabrication, maintenance, and distribution.",
    items: ["Electrodes and nozzles", "Swirl rings and shields", "Torch repair components"],
  },
  {
    code: "CON",
    name: "Welding Consumables",
    description:
      "Consumable products that support welding operations, maintenance, and repeat purchasing.",
    items: ["Welding wire and rods", "Electrodes and flux products", "General consumable kits"],
  },
  {
    code: "MAC",
    name: "Welding Machines",
    description:
      "Machine supply categories for buyers building welding equipment programs and channels.",
    items: ["MIG welding machines", "TIG welding machines", "Plasma cutting machines"],
  },
  {
    code: "ACC",
    name: "Welding Accessories",
    description:
      "Accessories that complete industrial welding, cutting, repair, and workshop workflows.",
    items: ["Ground clamps and holders", "Cables and connectors", "Safety and setup accessories"],
  },
] as const;
