import type { ProductCategory } from "@/lib/content/schemas";

export const productCategories: ProductCategory[] = [
  {
    slug: "mig-mag-torch-parts",
    code: "MIG",
    title: "MIG/MAG Torch Parts",
    shortTitle: "MIG/MAG Parts",
    description:
      "Contact tips, gas nozzles, diffusers, liners and torch consumables for MIG/MAG welding applications.",
    seoTitle: "MIG Welding Torch Parts & Consumables",
    seoDescription:
      "Source MIG/MAG welding torch parts including contact tips, tip holders, gas diffusers, nozzles, liners and switches for distributor and repair supply.",
    seoIntro:
      "ArcFort Weld supplies MIG/MAG torch parts for distributors, importers, OEM buyers and repair workshops that need organized product references for repeat purchasing. Product specifications should be confirmed against torch model, drawing or reference part before quotation.",
    productRange: [
      "MIG/MAG contact tips by thread and wire size",
      "Gas nozzles, tip holders, diffusers and torch liners",
      "MB series torch consumables and replacement part lists",
      "OEM packaging and mixed distributor RFQ programs",
    ],
    commonSpecifications: [
      "Thread type such as M6 or other sizes confirmed by reference part or drawing",
      "Wire size, tip length, material grade and package quantity confirmed before quotation",
      "Compatible torch model or reference number required for accurate matching",
      "Private label packaging and carton design available after order details are confirmed",
    ],
    compatibilityNote:
      "MIG/MAG torch parts are available in different sizes and fit requirements. Compatibility can be confirmed by sample, drawing, torch model, model number or existing reference part before quotation. ArcFort Weld does not claim exact brand compatibility unless the buyer provides confirmed references.",
    oemServiceNote:
      "OEM packaging is available for MIG/MAG torch parts, including logo label discussion, private label bag or box packing and carton design after product details, artwork and quantity are confirmed.",
    packagingMoqNote:
      "Standard export packing or customized packaging can be discussed by product type and order quantity. Small trial orders are accepted for standard products, while OEM packaging MOQ depends on the item and packaging requirement.",
    applications: [
      "Metal fabrication workshops",
      "Automotive repair and body shop welding",
      "Industrial maintenance and distributor replacement programs",
      "Construction and general MIG/MAG welding supply",
    ],
    buyerGuide: [
      "Confirm the torch model, thread, diameter and material before ordering contact tips or gas nozzles.",
      "Send existing part numbers, drawings or reference parts when compatible brand information is required.",
      "For distributor programs, group fast-moving consumables by torch series and packaging requirement.",
    ],
    componentGuide: [
      {
        name: "Contact Tip",
        role: "Guides the welding wire through the torch front end and transfers welding current to the wire.",
        buyerCheck:
          "Confirm wire diameter, thread, overall geometry, material reference and the tip holder used in the assembly.",
        productSlug: "mig-contact-tip-m6-1-0mm",
      },
      {
        name: "Tip Holder",
        role: "Positions the contact tip and connects it to the compatible torch front-end assembly.",
        buyerCheck:
          "Confirm contact-tip thread, torch family, holder profile, gas openings and the adjacent diffuser or insulator.",
        productSlug: "mig-tip-holder-for-mb15",
      },
      {
        name: "Gas Diffuser",
        role: "Distributes shielding gas within a compatible MIG/MAG torch front end.",
        buyerCheck:
          "Show the gas openings, connection, seating surfaces and matching nozzle, tip holder and insulator arrangement.",
        productSlug: "mig-diffuser",
      },
      {
        name: "Gas Nozzle",
        role: "Directs shielding gas around the wire and weld area while protecting the inner front-end parts.",
        buyerCheck:
          "Confirm nozzle profile, opening, length, attachment style, torch family and contact-tip position when documented.",
        productSlug: "mig-gas-nozzle-for-mb15",
      },
      {
        name: "Torch Liner",
        role: "Supports welding-wire feeding through the torch cable toward the contact tip.",
        buyerCheck:
          "Confirm wire type and diameter, torch cable length, liner construction, connector end and finished length.",
        productSlug: "mig-torch-liner",
      },
      {
        name: "Swan Neck",
        role: "Connects the torch body to the front-end consumables and establishes the working angle.",
        buyerCheck:
          "Confirm torch family, neck geometry, connection at both ends, cooling arrangement and complete front-end stack.",
        productSlug: "mig-swan-neck",
      },
      {
        name: "Torch Switch",
        role: "Provides the torch-handle control input used with a compatible welding power source.",
        buyerCheck:
          "Send the torch model, switch profile, mounting method, lead arrangement and clear photos of the connection.",
        productSlug: "mig-torch-switch",
      },
    ],
    selectionVariables: [
      {
        label: "Torch model and front-end family",
        whyItMatters:
          "Parts with similar trade names may use different connections, lengths and assembly relationships.",
        confirmationMethod:
          "Torch label, existing parts list, assembled photo, approved sample or drawing.",
      },
      {
        label: "Welding wire diameter",
        whyItMatters:
          "The documented wire size affects contact-tip selection and the required liner range.",
        confirmationMethod:
          "Wire package, approved welding procedure, existing tip marking or purchasing record.",
      },
      {
        label: "Thread and component geometry",
        whyItMatters:
          "A thread reference alone does not confirm length, seat, outside profile or gas-path alignment.",
        confirmationMethod:
          "Drawing, measured approved sample, reference number or scale photographs.",
      },
      {
        label: "Nozzle, diffuser and tip-holder stack",
        whyItMatters:
          "The surrounding components must connect correctly and preserve the intended shielding-gas path.",
        confirmationMethod:
          "Disassembled parts kept in order, plus photos of connections and the assembled front end.",
      },
      {
        label: "Cable, liner and control details",
        whyItMatters:
          "Complete torch and repair-part inquiries may depend on cable length, liner termination and switch connection.",
        confirmationMethod:
          "Complete-torch photo, cable reference, connector views and documented length requirement.",
      },
    ],
    compatibilityChecklist: [
      "Record the torch model and photograph the assembled front end before removing parts.",
      "Lay out the nozzle, diffuser or holder, contact tip and insulator in installation order.",
      "Record only verified wire sizes, threads, lengths, markings and reference numbers.",
      "Photograph liner ends, cable connections and torch switches separately when they are part of the request.",
      "Approve the complete matched assembly or sample reference before repeat purchasing.",
    ],
    features: [
      "Suitable for distributor product lines",
      "Structured category references for repeat sourcing",
      "Supports OEM and private label discussion",
    ],
    relatedCategorySlugs: ["tig-torch-parts", "plasma-cutting-consumables"],
    faq: [
      {
        question: "Can ArcFort Weld quote MIG/MAG torch parts by reference part or drawing?",
        answer:
          "Yes. Buyers can send reference parts, drawings, product lists or reference numbers so the technical details can be confirmed before quotation.",
      },
      {
        question: "Are compatible brands listed on every MIG/MAG part page?",
        answer:
          "Compatibility data is added only after it is confirmed by torch model, reference number, drawing or reference part.",
      },
      {
        question: "Can MIG/MAG torch parts be supplied with OEM packaging?",
        answer:
          "Yes. OEM packaging is available after product details, quantity, label artwork and carton requirements are confirmed.",
      },
      {
        question: "What are the main parts of a MIG/MAG welding torch?",
        answer:
          "Common replacement items include the contact tip, tip holder or gas diffuser, gas nozzle, torch liner, swan neck and torch switch. The exact assembly varies by torch system and should be confirmed from a model, drawing or sample.",
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
    seoTitle: "TIG Welding Torch Parts & Components",
    seoDescription:
      "Source TIG welding torch parts and components including ceramic cups, collets, gas lenses, back caps and switches. Confirm fit by model, sample or drawing.",
    seoIntro:
      "ArcFort Weld organizes TIG torch parts by component role, torch-family reference and the fit details buyers need for repeat purchasing. Ceramic cups, collets, collet bodies, gas lenses, back caps, tungsten electrodes and torch switches should be identified as part of a complete TIG torch assembly. Unknown technical fields are reviewed against a drawing, reference part, sample or model before quotation.",
    productRange: [
      "TIG ceramic cups by cup number and torch series",
      "Collets, collet bodies, gas lenses and torch accessories",
      "Tungsten-size related TIG consumable assortments",
      "OEM packaging for distributor and repair workshop supply",
    ],
    commonSpecifications: [
      "Cup size, tungsten size and torch series should be confirmed before quotation",
      "Material, thread and reference number are confirmed by drawing, reference part or model",
      "Standard export packing or customized packaging can be discussed by quantity",
      "Mixed TIG torch part lists can include cups, gas lenses, collets and collet bodies",
    ],
    compatibilityNote:
      "TIG torch parts should be checked by torch series, cup number, tungsten size, model number or drawing. Compatibility can be confirmed by sample, drawing or model number before final quotation.",
    oemServiceNote:
      "OEM packaging is available for TIG ceramic cups, collets, collet bodies, gas lenses and related TIG accessories when buyers provide packaging style, label artwork and order quantity.",
    packagingMoqNote:
      "Small trial orders are accepted for standard TIG torch parts. Customized packing, private labels and mixed item cartons are reviewed according to quantity, product type and export packing requirements.",
    applications: [
      "Precision TIG welding",
      "Pipeline maintenance and repair",
      "Stainless steel and aluminum fabrication",
      "Repair workshop TIG torch replacement programs",
    ],
    buyerGuide: [
      "Check torch series and cup size before selecting ceramic cups or gas lens parts.",
      "Confirm collet and collet body dimensions for the required tungsten size.",
      "Provide packaging and labeling requirements when preparing distributor programs.",
      "Use the TIG parts identification guide to name each component and keep the removed front-end stack in assembly order.",
    ],
    componentGuide: [
      {
        name: "Ceramic Cup",
        role: "Directs shielding gas around the tungsten and weld area.",
        buyerCheck:
          "Record cup number, connection style, torch family and whether a standard body or gas lens is used.",
        productSlug: "tig-ceramic-cup-5",
      },
      {
        name: "Collet",
        role: "Grips and centers the tungsten electrode inside the torch head.",
        buyerCheck:
          "Confirm tungsten diameter, collet length, torch series and matching collet body or gas lens.",
        productSlug: "tig-collet",
      },
      {
        name: "Collet Body",
        role: "Supports the collet and forms part of the shielding-gas path.",
        buyerCheck:
          "Confirm torch series, thread, tungsten size and the ceramic cup used with the assembly.",
        productSlug: "tig-collet-body",
      },
      {
        name: "Gas Lens",
        role: "Uses an internal mesh arrangement to distribute shielding gas before it exits the cup.",
        buyerCheck:
          "Confirm gas-lens family, torch series, thread, tungsten bore and compatible cup arrangement.",
        productSlug: "tig-gas-lens-1-6mm",
      },
      {
        name: "Back Cap",
        role: "Secures the rear torch-head assembly and accommodates the tungsten length.",
        buyerCheck:
          "Confirm rear thread, cap length, torch series and available working clearance.",
        productSlug: "tig-back-cap",
      },
      {
        name: "Tungsten Electrode",
        role: "Carries the TIG welding arc and must match the documented welding procedure.",
        buyerCheck:
          "State confirmed diameter, length, type or color reference and application requirement.",
        productSlug: "tig-tungsten-electrode",
      },
      {
        name: "Torch Switch",
        role: "Provides a torch-mounted control input where the torch and machine configuration supports it.",
        buyerCheck:
          "Send the torch model, switch shape, connector or wiring reference and photos of both sides.",
      },
    ],
    selectionVariables: [
      {
        label: "Torch series",
        whyItMatters: "Controls the physical interface used by the front-end and rear components.",
        confirmationMethod: "Torch label, complete-torch photo, approved model record or sample.",
      },
      {
        label: "Tungsten diameter",
        whyItMatters: "Affects collet, collet body and gas-lens bore selection.",
        confirmationMethod:
          "Documented electrode size, packaging label or measured approved sample.",
      },
      {
        label: "Cup and gas arrangement",
        whyItMatters:
          "Cup number alone does not confirm whether the stack uses a standard body or gas lens.",
        confirmationMethod:
          "Photo of the disassembled stack kept in order, plus cup and body references.",
      },
      {
        label: "Thread and component length",
        whyItMatters: "Similar-looking parts can use different interfaces or overall lengths.",
        confirmationMethod: "Drawing, supplier reference, measured sample or clear scale photo.",
      },
      {
        label: "Order and packing unit",
        whyItMatters:
          "Cups, collets, bodies and back caps may use different replacement quantities.",
        confirmationMethod:
          "Item-by-item quantity list with standard or OEM packaging requirement.",
      },
    ],
    compatibilityChecklist: [
      "Photograph the complete torch and model label before removing any components.",
      "Keep the cup, body or gas lens, collet, tungsten and back cap in assembly order.",
      "Record only verified cup numbers, tungsten sizes, threads and lengths.",
      "Use a sample, drawing or approved reference when the torch label is unavailable.",
      "Approve the complete matching stack before placing a repeat order.",
    ],
    features: [
      "Clear product family structure",
      "Useful for repair workshop sourcing",
      "Suitable for distributor item list development",
    ],
    relatedCategorySlugs: ["mig-mag-torch-parts", "plasma-cutting-consumables"],
    faq: [
      {
        question: "What are the main parts of a TIG welding torch?",
        answer:
          "Common TIG torch components include a ceramic cup, collet, collet body or gas lens, tungsten electrode, back cap, torch head, handle, switch and cable or hose assembly. The exact arrangement depends on the documented torch system.",
      },
      {
        question: "What TIG torch information should buyers send?",
        answer:
          "Please send torch series, tungsten size, cup size, reference number or drawings so ArcFort Weld can confirm the requested item.",
      },
      {
        question: "Can TIG parts be prepared for OEM packaging?",
        answer:
          "OEM packaging can be discussed after product details, quantity and artwork requirements are confirmed.",
      },
      {
        question: "How should buyers choose TIG ceramic cups or gas lens parts?",
        answer:
          "Buyers should confirm torch series, cup number, tungsten size, gas lens requirement and package quantity before sending an RFQ.",
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
    seoTitle: "Plasma Cutter Consumables & Torch Parts",
    seoDescription:
      "Source plasma cutter and plasma torch consumables including electrodes, nozzles, swirl rings, shields and retaining caps. Confirm fit by model or sample.",
    seoIntro:
      "ArcFort Weld structures plasma cutter consumables by front-end component, torch-family reference and the evidence needed for compatibility review. Electrodes, nozzles, swirl rings, shields, retaining caps and stand-off parts should be checked as one consumable stack. Global distributors and repair buyers can send model labels, reference numbers, drawings, photos or samples before quotation.",
    productRange: [
      "Plasma electrodes and nozzles for cutting torch consumable replacement",
      "Swirl rings, shields and related consumable stack items",
      "Individual item RFQs and plasma consumable kit discussions",
      "Reference-number based sourcing for distributors and repair channels",
    ],
    commonSpecifications: [
      "Torch model, reference number and amperage range should be confirmed when available",
      "Nozzle size, electrode type and material grade are confirmed before quotation",
      "Kit content, package quantity and labeling are confirmed by buyer item list",
      "Reference parts, photos or drawings are recommended for compatibility review",
    ],
    compatibilityNote:
      "Plasma cutting consumables should be matched by torch model, model number, drawing, product photo or sample. Compatibility can be confirmed before quotation, and exact brand compatibility is not claimed unless confirmed by buyer references.",
    oemServiceNote:
      "OEM packaging is available for plasma electrodes, nozzles, swirl rings, shields and consumable kits. Private label packing and kit structure can be reviewed after item list and quantity are confirmed.",
    packagingMoqNote:
      "Standard export packing or customized kit packing can be discussed for plasma consumables. Small trial orders are accepted for standard products, while customized packaging MOQ depends on item mix and packing style.",
    applications: [
      "Industrial metal cutting",
      "Fabrication and maintenance workshops",
      "Construction steelwork",
      "Repair channel plasma cutting consumable supply",
    ],
    buyerGuide: [
      "Confirm cutting torch model, amperage range and consumable stack before selecting electrodes or nozzles.",
      "Check whether the buyer needs nozzles, electrodes, swirl rings and shields as individual items or kits.",
      "Include drawings or reference numbers when replacing existing plasma cutting consumables.",
    ],
    componentGuide: [
      {
        name: "Electrode",
        role: "Forms part of the internal arc circuit and works with the matching torch consumable system.",
        buyerCheck:
          "Confirm torch model, reference number, electrode profile and the nozzle normally used with it.",
        productSlug: "plasma-electrode",
      },
      {
        name: "Nozzle or Cutting Tip",
        role: "Constrains and directs the plasma arc through a model-specific opening and geometry.",
        buyerCheck:
          "Confirm torch model, documented opening or rating reference, profile and electrode pairing.",
        productSlug: "plasma-nozzle",
      },
      {
        name: "Swirl Ring",
        role: "Forms part of the torch gas-distribution and consumable-alignment arrangement.",
        buyerCheck:
          "Confirm torch family, ring geometry, material reference and orientation in the stack.",
        productSlug: "plasma-swirl-ring",
      },
      {
        name: "Shield",
        role: "Protects compatible front-end components and supports the intended torch-to-work interface.",
        buyerCheck:
          "Confirm torch model, shield profile, connection and the cap or nozzle arrangement used with it.",
        productSlug: "plasma-shield",
      },
      {
        name: "Retaining Cap",
        role: "Secures compatible front-end consumables in the torch assembly.",
        buyerCheck:
          "Confirm torch model, thread or connection, internal profile and complete stack photo.",
      },
      {
        name: "Torch Spacer or Stand-off Guide",
        role: "Supports a repeatable torch stand-off in compatible manual cutting setups.",
        buyerCheck:
          "Confirm torch family, attachment style, working position and approved reference part.",
        productSlug: "plasma-torch-spacer",
      },
    ],
    selectionVariables: [
      {
        label: "Torch model and reference",
        whyItMatters:
          "Plasma consumables are selected by torch system rather than appearance alone.",
        confirmationMethod:
          "Torch label, machine/torch record, reference number, sample or drawing.",
      },
      {
        label: "Complete consumable stack",
        whyItMatters:
          "Electrode, nozzle, ring, cap and shield must work as one compatible arrangement.",
        confirmationMethod:
          "Photo of components in removal order and an item-by-item requirement list.",
      },
      {
        label: "Documented cutting setup",
        whyItMatters: "Nozzle and electrode selection may depend on the approved operating setup.",
        confirmationMethod:
          "Known current reference, cutting method and material requirement from buyer records.",
      },
      {
        label: "Geometry and interface",
        whyItMatters:
          "Similar-looking parts may differ in opening, length, thread, seat or shield profile.",
        confirmationMethod:
          "Drawing, measured approved sample, reference number or scale photographs.",
      },
      {
        label: "Replacement ratio and packing",
        whyItMatters:
          "Electrodes, nozzles, rings and caps may be reordered in different quantities.",
        confirmationMethod:
          "Quantity by item, kit requirement, label format and destination country.",
      },
    ],
    compatibilityChecklist: [
      "Record the torch model and existing reference numbers before disassembly.",
      "Lay out the electrode, nozzle, ring, cap and shield in their original assembly order.",
      "Photograph front, side, connection and marking details with a scale when possible.",
      "State only documented operating references; do not estimate a rating from appearance.",
      "Approve a sample or complete matching stack before repeat purchasing.",
    ],
    buyerTool: {
      href: "/downloads/arcfort-plasma-consumables-rfq.xlsx",
      title: "Plasma Consumables RFQ Workbook",
      description:
        "Organize torch references, consumable line items, quantities, evidence files, compatibility status and packing requirements in one buyer-ready XLSX.",
      buttonLabel: "Download Plasma RFQ Workbook",
    },
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
          "Yes. Reference numbers, drawings, photos and reference part details help confirm compatibility before quotation.",
      },
      {
        question: "Are plasma consumables sold as kits?",
        answer:
          "Kit structure, packaging and quantity should be confirmed during RFQ based on the buyer's item list and target market.",
      },
      {
        question: "What information is needed for plasma consumable compatibility?",
        answer:
          "Please provide torch model, model number, product photo, drawing or reference part details so compatibility can be reviewed before quotation.",
      },
    ],
    keywords: [
      "plasma cutter consumables",
      "plasma torch consumables",
      "plasma consumable parts",
      "plasma cutting consumables",
      "plasma electrode",
      "plasma nozzle",
      "swirl ring",
    ],
  },
  {
    slug: "welding-consumables",
    code: "CON",
    title: "Welding Consumables",
    shortTitle: "Consumables",
    description:
      "Welding wires, electrodes, holders, clamps and general consumables for industrial welding supply programs.",
    seoTitle: "Welding Consumables for Industrial B2B Sourcing",
    seoDescription:
      "Source welding consumables including welding wires, electrodes, holders, clamps and related items for distributors, importers and repair workshops.",
    seoIntro:
      "ArcFort Weld structures welding consumables for buyers who need practical product lists, repeat purchasing programs and clear quotation information. Exact specifications, packaging, MOQ and lead time are confirmed before quotation.",
    productRange: [
      "Welding wires, electrodes and general arc welding consumables",
      "Electrode holders, ground clamps and related workshop consumables",
      "Fast-moving consumable assortments for distributors and repair shops",
      "Mixed product lists for repeat purchasing and OEM packaging review",
    ],
    commonSpecifications: [
      "Welding process, size, material and packaging should be stated in the RFQ",
      "Consumable grade, carton packing and labeling are confirmed before production",
      "MOQ depends on product type, model and customization requirements",
      "Lead time depends on material availability, quantity and packaging schedule",
    ],
    compatibilityNote:
      "Welding consumables should be selected by process, material, size, usage environment and packaging requirement. If compatibility or grade is uncertain, it can be confirmed by sample, drawing, model number or buyer item list.",
    oemServiceNote:
      "OEM packaging is available for selected welding consumables and workshop items. Logo labels, private label cartons and distributor packing can be discussed after product type and quantity are confirmed.",
    packagingMoqNote:
      "Small trial orders are accepted for standard welding consumables. MOQ for OEM packaging or customized product combinations depends on product type, model, carton design and order quantity.",
    applications: [
      "Industrial welding supply distribution",
      "Repair workshop consumable replenishment",
      "Metal fabrication and maintenance",
      "Construction and general welding operations",
    ],
    buyerGuide: [
      "Confirm welding process, material requirement, size and packaging before requesting quotation.",
      "Send product list, reference photos or existing item numbers when replacing current consumables.",
      "Group fast-moving consumables by workshop use, distributor carton packing or target market demand.",
    ],
    features: [
      "Prepared for repeat consumable sourcing",
      "Suitable for distributors and repair workshops",
      "Supports mixed RFQ product lists",
    ],
    relatedCategorySlugs: ["mig-mag-torch-parts", "tig-torch-parts", "welding-accessories"],
    faq: [
      {
        question: "Can welding consumables be quoted as a mixed list?",
        answer:
          "Yes. Buyers can send a mixed product list with quantities, packaging needs and destination country for review.",
      },
      {
        question: "Are consumable specifications confirmed on this site?",
        answer:
          "Only confirmed fields should be used for quotation. Unknown fields are reviewed during RFQ confirmation before final offer.",
      },
      {
        question: "Can welding consumables be packed for private label programs?",
        answer:
          "Private label packing can be discussed after item list, quantity, label artwork and carton requirements are confirmed.",
      },
    ],
    keywords: [
      "welding consumables",
      "welding wire",
      "welding electrodes",
      "welding holder",
      "ground clamp",
    ],
  },
  {
    slug: "welding-machines",
    code: "MAC",
    title: "Welding Machines",
    shortTitle: "Machines",
    description:
      "MIG, TIG, MMA and plasma cutting machines for industrial applications and distributor sourcing programs.",
    seoTitle: "Welding Machines for Industrial Buyers and Distributors",
    seoDescription:
      "Explore welding machine sourcing categories including MIG, TIG, MMA and plasma cutting machines for industrial B2B RFQs.",
    seoIntro:
      "ArcFort Weld organizes welding machine content for buyers who compare process type, input requirements, application scenarios, accessory needs and delivery options. Machine parameters should be confirmed by official specification sheets before quotation.",
    productRange: [
      "MIG, TIG, MMA and plasma cutting machine sourcing discussions",
      "Industrial machine options for distributor and OEM inquiry programs",
      "Machine accessory and consumable matching lists",
      "Specification-sheet based RFQs for confirmed technical parameters",
    ],
    commonSpecifications: [
      "Input voltage, output range, duty cycle and process type require official confirmation",
      "Certifications are listed only after official documents are provided",
      "Accessory package, plug type, language labeling and carton requirements are confirmed by market",
      "MOQ, payment term and delivery schedule depend on model and order quantity",
    ],
    compatibilityNote:
      "Welding machine selection should be based on welding process, input requirements, output range, accessory package and target application. Technical parameters must be confirmed by official specification sheet or buyer-approved documents before quotation.",
    oemServiceNote:
      "OEM service for welding machines can include logo, panel label, carton design and accessory package discussion after model, market requirement, artwork and order quantity are confirmed.",
    packagingMoqNote:
      "Packaging, MOQ and lead time for welding machines depend on model, accessory package, customization requirement and shipment plan. Small trial orders can be discussed for standard models when available.",
    applications: [
      "Industrial fabrication",
      "Repair and maintenance workshops",
      "Distributor machine sourcing",
      "MIG, TIG, MMA and plasma cutting equipment programs",
    ],
    buyerGuide: [
      "Confirm welding process, input voltage, output range and target application before RFQ.",
      "Send required accessory list, destination market standards and packaging requirements.",
      "Do not assume certifications or performance data unless official documents are provided.",
      "Separate buyer requirements from supplier-confirmed configuration data and retain the approved comparison for repeat orders.",
    ],
    componentGuide: [
      {
        name: "Power Source / Machine",
        role: "Provides the documented welding or cutting process and available machine configuration.",
        buyerCheck:
          "Process, destination electrical input, documented output requirements, operating environment and proposed supplier data sheet.",
      },
      {
        name: "Wire Feeder",
        role: "Advances welding wire toward a compatible MIG/MAG torch where the machine arrangement uses a feeder.",
        buyerCheck:
          "Wire range, drive arrangement, control interface, cable connection and integrated or separate configuration from approved references.",
        productSlug: "wire-feeder",
      },
      {
        name: "Torch or Welding Gun",
        role: "Connects the operator and welding process to the compatible machine and consumable system.",
        buyerCheck:
          "Process, interface, cooling arrangement when documented, cable length and included consumable or spare-part scope.",
        productSlug: "stud-welding-gun",
      },
      {
        name: "Work Lead and Clamp",
        role: "Completes part of the welding circuit in the approved machine and cable arrangement.",
        buyerCheck:
          "Connector interface, cable requirement, clamp type and whether the item is included, optional or required as a spare.",
      },
      {
        name: "Electrode Holder or Process Accessory",
        role: "Supports the documented welding process where the proposed machine configuration includes one.",
        buyerCheck:
          "Required process, connector, cable reference, rating only when documented and included or optional status.",
      },
      {
        name: "Control, Label and Documentation Set",
        role: "Defines destination-market operation, identification and evidence for the exact quoted configuration.",
        buyerCheck:
          "Panel language, nameplate, manual, labels, test records and certification evidence available for the proposed machine.",
      },
    ],
    selectionVariables: [
      {
        label: "Process and application",
        whyItMatters:
          "A machine name alone does not define the welding method, material range or working environment the buyer needs.",
        confirmationMethod:
          "Buyer process specification, application description and approved existing-equipment reference.",
      },
      {
        label: "Destination electrical input",
        whyItMatters:
          "Voltage, frequency, phase and connection requirements vary by market and installation.",
        confirmationMethod:
          "Destination-country electrical requirement, site record or approved connection specification.",
      },
      {
        label: "Documented performance requirement",
        whyItMatters:
          "Output range, duty cycle and process modes must be compared against supplier data rather than inferred from appearance.",
        confirmationMethod:
          "Buyer requirement and the supplier specification sheet for the exact proposed configuration.",
      },
      {
        label: "Interfaces and accessory scope",
        whyItMatters:
          "A commercial quotation can differ significantly when torch, feeder, cables, controls or spares are included or optional.",
        confirmationMethod:
          "Line-item accessory list, interface drawing, model reference and supplier confirmation.",
      },
      {
        label: "Market documents and approvals",
        whyItMatters:
          "A requested certificate or label is not proof that supporting evidence exists for the quoted machine.",
        confirmationMethod:
          "Destination requirement, supplier evidence, sample review and controlled approval record.",
      },
    ],
    compatibilityChecklist: [
      "Record the welding or cutting process, application and destination market before comparing models.",
      "Provide approved voltage, frequency, phase and plug or power-connection requirements.",
      "Separate required performance fields from supplier-proposed values and keep both evidence-based.",
      "List every included or optional accessory, interface and spare part on its own line.",
      "Review available data sheets, labels, manuals and certification evidence for the exact quoted configuration.",
      "Retain the approved machine, accessories, documents and packing record before repeat ordering.",
    ],
    buyerTool: {
      href: "/downloads/arcfort-welding-machine-rfq.xlsx",
      title: "Welding Machine RFQ Workbook",
      description:
        "Define the process, destination electrical input, machine requirements, accessories, documents and approval checkpoints in one buyer-ready XLSX.",
      buttonLabel: "Download Machine RFQ Workbook",
    },
    features: [
      "Supports machine sourcing discussions",
      "Prepared for OEM and distributor inquiry workflows",
      "Keeps unconfirmed parameters explicit",
    ],
    relatedCategorySlugs: [
      "welding-consumables",
      "welding-accessories",
      "plasma-cutting-consumables",
    ],
    faq: [
      {
        question: "Can ArcFort Weld quote welding machines by target process?",
        answer:
          "Yes. Buyers can provide MIG, TIG, MMA or plasma cutting requirements, but technical parameters must be confirmed before quotation.",
      },
      {
        question: "Are machine certifications listed?",
        answer:
          "Certifications are not invented. Certification fields should only be added after official documents are confirmed.",
      },
      {
        question: "What should buyers send for a welding machine RFQ?",
        answer:
          "Please send process type, input voltage requirement, target application, accessory package, quantity, destination country and packaging requirement.",
      },
    ],
    keywords: [
      "welding machines",
      "MIG welding machine",
      "TIG welding machine",
      "MMA welding machine",
      "plasma cutting machine",
    ],
  },
  {
    slug: "welding-accessories",
    code: "ACC",
    title: "Welding Accessories",
    shortTitle: "Accessories",
    description:
      "Cables, connectors, clamps, holders and workshop welding accessories for industrial repair and fabrication users.",
    seoTitle: "Welding Accessories for Workshops and Industrial Buyers",
    seoDescription:
      "Browse welding accessories such as cables, connectors, clamps and holders for B2B welding supply and repair workshop sourcing.",
    seoIntro:
      "ArcFort Weld welding accessories pages help buyers organize workshop support items, accessory kits and replacement product lists. Dimensions, material, compatible equipment and packaging details should be confirmed by RFQ.",
    productRange: [
      "Welding cables, connectors, holders and ground clamps",
      "Workshop accessories for welding machine and torch supply programs",
      "Accessory kits and mixed replacement item lists",
      "Private label packaging and distributor carton review",
    ],
    commonSpecifications: [
      "Cable size, connection type, current rating and material should be confirmed by RFQ",
      "Compatible machine model or accessory dimensions are confirmed by drawing or reference part",
      "Packaging, labeling and carton design can be customized after order details are confirmed",
      "Mixed accessory lists should include quantity, photos and destination country",
    ],
    compatibilityNote:
      "Welding accessories should be confirmed by size, connection type, cable requirement, machine model or drawing. Compatibility can be confirmed by sample, drawing, product photo or model number before quotation.",
    oemServiceNote:
      "OEM packaging is available for selected welding accessories, including label, carton and private label discussion for distributor programs after item list and quantity are confirmed.",
    packagingMoqNote:
      "Standard export packing is available for common accessories, and small trial orders are accepted for standard products. Customized packing or mixed accessory kits require MOQ confirmation by item type and packaging plan.",
    applications: [
      "Repair workshop supply",
      "Industrial welding accessory replacement",
      "Distributor mixed accessory programs",
      "Metal fabrication and maintenance support",
    ],
    buyerGuide: [
      "Confirm accessory size, cable connection, current rating requirement or compatible machine model when available.",
      "Send photos or reference part details for clamps, holders and connectors that must match existing products.",
      "Use the RFQ form for mixed accessory lists and packaging requirements.",
    ],
    features: [
      "Useful for workshop supply programs",
      "Supports mixed accessory RFQs",
      "Suitable for distributor accessory programs",
    ],
    relatedCategorySlugs: ["welding-consumables", "welding-machines", "mig-mag-torch-parts"],
    faq: [
      {
        question: "Can accessories be sourced together with consumables?",
        answer:
          "Yes. Buyers can combine accessories and consumables in one RFQ list with quantities and package details.",
      },
      {
        question: "What details are needed for welding accessory quotation?",
        answer:
          "Please provide product name, size, connection type, quantity, photos, drawings or reference parts when available.",
      },
      {
        question: "Can accessories be supplied with customized packaging?",
        answer:
          "Yes. Customized packaging can be discussed after product list, package style, artwork and quantity are confirmed.",
      },
    ],
    keywords: [
      "welding accessories",
      "welding cable",
      "ground clamp",
      "welding holder",
      "welding connector",
    ],
  },
];
