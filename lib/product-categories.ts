export const productCategories = [
  {
    code: "MIG",
    slug: "mig-torch-parts",
    name: "MIG Torch Parts",
    description:
      "Contact tips, nozzles, diffusers, liners and torch consumables for MIG welding applications.",
    items: ["Contact tips and nozzles", "Gas diffusers and insulators", "Liners and neck parts"],
  },
  {
    code: "TIG",
    slug: "tig-torch-parts",
    name: "TIG Torch Parts",
    description: "Ceramic cups, collets, collet bodies, gas lenses and TIG torch accessories.",
    items: ["Collets and collet bodies", "Ceramic cups and back caps", "Torch heads and cables"],
  },
  {
    code: "CUT",
    slug: "plasma-cutting-parts",
    name: "Plasma Cutting Parts",
    description:
      "Electrodes, nozzles, swirl rings, shields and consumables for plasma cutting systems.",
    items: ["Electrodes and nozzles", "Swirl rings and shields", "Torch repair components"],
  },
  {
    code: "CON",
    slug: "welding-consumables",
    name: "Welding Consumables",
    description: "Welding wires, electrodes, holders, clamps and general welding consumables.",
    items: ["Welding wire and rods", "Electrodes and flux products", "General consumable kits"],
  },
  {
    code: "MAC",
    slug: "welding-machines",
    name: "Welding Machines",
    description: "MIG, TIG, MMA and plasma cutting machines for industrial applications.",
    items: ["MIG welding machines", "TIG welding machines", "Plasma cutting machines"],
  },
  {
    code: "ACC",
    slug: "welding-accessories",
    name: "Welding Accessories",
    description: "Cables, connectors, clamps, holders and workshop welding accessories.",
    items: ["Ground clamps and holders", "Cables and connectors", "Safety and setup accessories"],
  },
] as const;
