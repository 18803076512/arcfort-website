export type NavigationItem = {
  href: string;
  label: string;
  description?: string;
};

export type ProductNavigationGroup = {
  title: string;
  href: string;
  items: NavigationItem[];
};

export const productNavigationGroups: ProductNavigationGroup[] = [
  {
    title: "MIG/MAG",
    href: "/products/mig-mag-torch-parts",
    items: [
      {
        href: "/products/mig-mag-torch-parts/series/15ak-mig-mag-torch-parts",
        label: "15AK Series",
      },
      { href: "/products/mig-mag-torch-parts/mig-mag-welding-torch", label: "Welding Torches" },
      { href: "/products/mig-mag-torch-parts/mig-contact-tip-m6-1-0mm", label: "Contact Tips" },
      { href: "/products/mig-mag-torch-parts/mig-tip-holder-for-mb15", label: "Tip Holders" },
      { href: "/products/mig-mag-torch-parts/mig-gas-nozzle-for-mb15", label: "Gas Nozzles" },
      { href: "/products/mig-mag-torch-parts/mig-torch-liner", label: "Torch Liners" },
      { href: "/products/mig-mag-torch-parts/mig-swan-neck", label: "Swan Necks" },
    ],
  },
  {
    title: "TIG",
    href: "/products/tig-torch-parts",
    items: [
      { href: "/products/tig-torch-parts/tig-welding-torch", label: "TIG Torches" },
      { href: "/products/tig-torch-parts/tig-ceramic-cup-5", label: "Ceramic Cups" },
      { href: "/products/tig-torch-parts/tig-gas-lens-1-6mm", label: "Gas Lenses" },
      { href: "/products/tig-torch-parts/tig-collet", label: "Collets" },
      { href: "/products/tig-torch-parts/tig-collet-body", label: "Collet Bodies" },
      { href: "/products/tig-torch-parts/tig-back-cap", label: "Back Caps" },
    ],
  },
  {
    title: "Plasma",
    href: "/products/plasma-cutting-consumables",
    items: [
      {
        href: "/products/plasma-cutting-consumables/plasma-cutting-torch",
        label: "Plasma Torches",
      },
      { href: "/products/plasma-cutting-consumables/plasma-electrode", label: "Electrodes" },
      { href: "/products/plasma-cutting-consumables/plasma-nozzle", label: "Nozzles" },
      { href: "/products/plasma-cutting-consumables/plasma-shield", label: "Shields" },
      { href: "/products/plasma-cutting-consumables/plasma-cutting-tip", label: "Cutting Tips" },
      { href: "/products/plasma-cutting-consumables/plasma-swirl-ring", label: "Swirl Rings" },
    ],
  },
  {
    title: "Equipment",
    href: "/products/welding-machines",
    items: [
      { href: "/products/welding-machines", label: "Welding Machines" },
      { href: "/products/welding-machines/wire-feeder", label: "Wire Feeders" },
      { href: "/products/welding-machines/stud-welding-gun", label: "Stud Welding Guns" },
      {
        href: "/products/plasma-cutting-consumables/plasma-cutting-torch",
        label: "Cutting Torches",
      },
    ],
  },
  {
    title: "Consumables",
    href: "/products/welding-consumables",
    items: [
      { href: "/products/welding-consumables/welding-electrode", label: "Welding Electrodes" },
      { href: "/products/welding-consumables/welding-wire", label: "Welding Wire" },
      { href: "/products/welding-consumables/electrode-holder", label: "Electrode Holders" },
      {
        href: "/products/welding-consumables/spot-welding-electrode",
        label: "Spot Welding Electrodes",
      },
    ],
  },
  {
    title: "Accessories",
    href: "/products/welding-accessories",
    items: [
      { href: "/products/welding-accessories/welding-cable", label: "Welding Cables" },
      { href: "/products/welding-accessories/welding-cable-connector", label: "Cable Connectors" },
      { href: "/products/welding-accessories/ground-clamp", label: "Ground Clamps" },
      { href: "/products/welding-accessories/dinse-connector", label: "Dinse Connectors" },
      {
        href: "/products/welding-accessories/wire-feeder-accessories",
        label: "Feeder Accessories",
      },
    ],
  },
];

export const solutionNavigation: NavigationItem[] = [
  {
    href: "/quality-control",
    label: "Quality Coordination",
    description: "Order-specific product, packing and pre-shipment checks.",
  },
  {
    href: "/oem-service",
    label: "OEM / ODM",
    description: "Product, logo, private-label and packaging projects.",
  },
  {
    href: "/distributor-supply",
    label: "Distributor Supply",
    description: "Mixed product lists and repeat purchasing preparation.",
  },
  {
    href: "/shipping-payment",
    label: "Order & Shipping",
    description: "Commercial terms and shipment planning information.",
  },
];

export const resourceNavigation: NavigationItem[] = [
  { href: "/guides", label: "Technical Guides" },
  { href: "/downloads", label: "Catalogs & Downloads" },
  { href: "/contact", label: "Contact Sales" },
];

export const mobilePrimaryNavigation: NavigationItem[] = [
  { href: "/applications", label: "Industries" },
  { href: "/oem-service", label: "OEM / ODM" },
  { href: "/distributor-supply", label: "Distributors" },
  { href: "/guides", label: "Resources" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
