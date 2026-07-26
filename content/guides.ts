import type { GuideArticle } from "@/lib/content/schemas";

export const guides: GuideArticle[] = [
  {
    slug: "how-to-prepare-a-welding-parts-rfq",
    title: "How to Prepare a Welding Parts RFQ",
    seoTitle: "How to Prepare a Welding Parts RFQ for B2B Suppliers",
    description:
      "A practical guide for sending clear welding torch parts, consumables and accessory inquiries to international suppliers.",
    seoDescription:
      "Prepare a clear welding parts RFQ with product references, quantities, drawings, compatibility details, packaging needs and destination country.",
    publishedDate: "2026-06-12",
    modifiedDate: "2026-07-26",
    sections: [
      {
        title: "Build a line-item product list",
        body: "Start with one row for each requested item. Include the product name, your internal reference, supplier reference when available, required quantity and unit of measure. Keep different sizes or models on separate rows so the supplier can quote them accurately. If the order contains MIG/MAG, TIG, plasma and workshop products, group the rows by product family rather than combining several parts into one description.",
      },
      {
        title: "Identify the part without guessing",
        body: "Use the information that can be verified from the existing part, package, drawing or machine documentation. A clear photo should show the complete product and important connection areas. For small torch consumables, add a scale reference and photograph both ends. Unknown material grades, dimensions, OEM numbers or ratings should remain unknown until they can be checked; guessed data can lead to the wrong quotation.",
      },
      {
        title: "Provide compatibility evidence",
        body: "Category names alone do not confirm compatibility. Send the torch model, machine model, consumable stack, reference number, drawing or physical sample details that the supplier should review. For assemblies, explain which components must connect together. If the reference is only a market comparison, label it as reference-only rather than approved compatibility. This distinction helps the supplier separate matching work from normal commercial quotation.",
      },
      {
        title: "Define quantity and delivery needs",
        body: "State the trial quantity, expected repeat quantity and destination country. Quantity affects production planning, packing method, freight options and MOQ discussion. Include the requested delivery window, but allow the supplier to confirm lead time after materials and product details are reviewed. For mixed orders, show quantities per SKU instead of providing only a total carton or order value.",
      },
      {
        title: "Describe packaging and OEM requirements",
        body: "Distributors should state whether standard export packing is acceptable or whether labels, logo printing, private packaging or carton artwork are required. Include target market language, barcode needs and packaging unit when these are known. OEM requests should be reviewed together with quantity and artwork because the MOQ and lead time can differ from standard products. Do not assume a customized package is included in a standard quotation.",
      },
      {
        title: "Run a final RFQ check",
        body: "Before sending the inquiry, confirm that contact details, destination country, quantities and attachments are complete. Name each file so it can be matched to a line item. Ask the supplier to identify unanswered technical fields, quotation validity, MOQ, packing basis, estimated lead time and delivery options. A structured RFQ reduces repeated email exchanges and gives both sides a clearer record for sample confirmation and order review.",
      },
    ],
    categorySlugs: [
      "mig-mag-torch-parts",
      "tig-torch-parts",
      "plasma-cutting-consumables",
      "welding-accessories",
    ],
    productSlugs: [
      "mig-contact-tip-m6-0-8mm",
      "tig-gas-lens-1-6mm",
      "plasma-electrode",
      "ground-clamp",
    ],
    faq: [
      {
        question: "Can I submit an RFQ with incomplete information?",
        answer:
          "Yes. Mark missing fields clearly and send the available photo, drawing, model or reference part. Final quotation still depends on the details required to identify the product.",
      },
      {
        question: "Should I include both trial and repeat quantities?",
        answer:
          "Yes. Trial quantity helps with sample or first-order planning, while expected repeat quantity helps the supplier discuss production packing and longer-term supply options.",
      },
      {
        question: "What file types are useful for a welding parts RFQ?",
        answer:
          "Product lists, PDF drawings, clear product photos, spreadsheets and existing part labels are useful when each file can be matched to a requested line item.",
      },
      {
        question: "When should OEM packaging be discussed?",
        answer:
          "Include OEM packaging requirements in the first RFQ so artwork, packing unit, MOQ and lead time can be reviewed together with the product.",
      },
    ],
    keywords: [
      "welding parts RFQ",
      "welding consumables inquiry",
      "welding parts quotation checklist",
      "B2B welding supplier",
    ],
  },
  {
    slug: "mig-vs-tig-torch-consumables",
    title: "MIG/MAG vs TIG Torch Consumables",
    seoTitle: "MIG/MAG vs TIG Torch Consumables Buying Guide",
    description:
      "A buyer-focused comparison of MIG/MAG and TIG torch consumable families for industrial sourcing and repair programs.",
    seoDescription:
      "Compare MIG/MAG and TIG torch consumables, selection fields, component functions and RFQ requirements for distributor and repair supply.",
    publishedDate: "2026-06-12",
    modifiedDate: "2026-07-26",
    sections: [
      {
        title: "Separate the two torch systems",
        body: "MIG/MAG and TIG torches use different wire or electrode arrangements, gas delivery components and front-end consumable stacks. A part should first be assigned to the correct process and torch family before dimensions are compared. Similar appearance does not mean the parts are interchangeable. Buyers managing both product lines should keep separate model references and photos for each torch system in the sourcing worksheet.",
      },
      {
        title: "Understand the MIG/MAG front end",
        body: "Common MIG/MAG replacement items include the contact tip, tip holder, gas diffuser, gas nozzle, torch liner and swan neck. The contact tip guides the welding wire and carries current to it, while the surrounding parts support gas delivery and mechanical positioning. Selection normally requires wire size, thread, length, torch series and the relationship between parts in the front-end assembly.",
      },
      {
        title: "Understand the TIG torch head",
        body: "Common TIG parts include ceramic cups, collets, collet bodies, gas lenses, back caps and tungsten electrodes. These components secure the tungsten and direct shielding gas around the weld zone. Buyers should identify the torch series, tungsten diameter, cup reference, thread and whether a standard collet body or gas lens arrangement is required. Cup number alone does not establish complete compatibility.",
      },
      {
        title: "Compare the correct selection fields",
        body: "MIG/MAG inquiries usually emphasize welding wire diameter, contact tip thread, liner range, nozzle profile and torch model. TIG inquiries usually emphasize tungsten diameter, ceramic cup size, collet or gas lens type and torch-head thread. Material grade and surface treatment should be confirmed when relevant rather than inferred from color. A drawing or sample remains useful when model naming differs between markets.",
      },
      {
        title: "Prepare a mixed consumables order",
        body: "Distributors can request MIG/MAG and TIG parts in one RFQ, but each line should keep its process, model, size and quantity. Ask for separate packing references so receiving staff can identify the parts. If private labels or carton artwork are needed, specify whether one brand system will cover both product families. Mixed orders can simplify purchasing, but product confirmation still happens at SKU level.",
      },
      {
        title: "Avoid compatibility assumptions",
        body: "A category, common trade name or visual resemblance is not enough to approve a replacement part. Torch series can contain different threads, lengths, gas passages or cable connections. Request confirmation against a model number, drawing, reference part or sample before ordering. For unverified references, use wording such as compatibility can be confirmed by sample or drawing rather than presenting a market reference as a guaranteed fit.",
      },
    ],
    categorySlugs: ["mig-mag-torch-parts", "tig-torch-parts"],
    productSlugs: [
      "mig-contact-tip-m6-1-0mm",
      "mig-gas-nozzle-for-mb15",
      "tig-ceramic-cup-5",
      "tig-collet-body",
    ],
    faq: [
      {
        question: "Can MIG/MAG and TIG parts be quoted together?",
        answer:
          "Yes. Use one mixed RFQ with separate line items, process names, model references and quantities for each product.",
      },
      {
        question: "Is compatibility guaranteed by the category name?",
        answer:
          "No. Compatibility should be confirmed by torch model, dimensions, drawing, sample or reference part.",
      },
      {
        question: "What is the most important MIG/MAG contact tip information?",
        answer:
          "Provide welding wire size, tip thread, tip length, torch series and a reference photo or drawing when available.",
      },
      {
        question: "What should be provided for TIG torch parts?",
        answer:
          "Provide torch series, tungsten diameter, cup or gas lens arrangement, thread and a photo or drawing of the current parts.",
      },
    ],
    keywords: [
      "MIG torch consumables",
      "TIG torch consumables",
      "MIG vs TIG torch parts",
      "welding torch parts",
    ],
  },
  {
    slug: "plasma-electrode-nozzle-buying-guide",
    title: "Plasma Electrode and Nozzle Buying Guide",
    seoTitle: "Plasma Electrode and Nozzle Buying Guide for B2B Buyers",
    description:
      "A practical guide for preparing plasma electrode, nozzle and consumable stack inquiries with traceable compatibility information.",
    seoDescription:
      "Prepare plasma electrode and nozzle inquiries with torch model, consumable references, cutting requirements, quantities and packaging details.",
    publishedDate: "2026-06-12",
    modifiedDate: "2026-07-26",
    sections: [
      {
        title: "Identify the plasma torch first",
        body: "Plasma consumables should be sourced from the torch and consumable system, not from appearance alone. Record the torch model, machine model when relevant, existing part references and any label information. Photograph the complete torch front end before disassembly and keep the used components in their original order. This evidence helps the supplier understand which consumable family must be reviewed.",
      },
      {
        title: "Document the consumable stack",
        body: "A plasma torch front end may use an electrode, nozzle, swirl ring, retaining cap, shield and other model-specific components. List every requested item separately and show how the components assemble when the reference is uncertain. A missing ring or cap reference can prevent a reliable match even when the electrode and nozzle look familiar. Do not combine the complete stack under one generic nozzle description.",
      },
      {
        title: "Match electrodes and nozzles carefully",
        body: "The electrode forms part of the internal arc circuit, while the nozzle constricts and directs the plasma arc. Both items must be reviewed against the torch model and intended cutting setup. Include the reference number, nozzle opening or other measured details only when they are verified. If an electrode and nozzle are normally purchased as a pair, state the required quantity ratio in the RFQ.",
      },
      {
        title: "State the cutting requirement",
        body: "Provide the material type, general thickness range, cutting method and required operating current when these details are known from the application. These fields help narrow the consumable configuration, but they do not replace the torch model or reference number. Do not select an exact rating from a photo. The supplier should confirm which technical information is required before proposing a replacement.",
      },
      {
        title: "Plan quantities and packaging",
        body: "Plasma electrodes and nozzles are often purchased in repeat quantities, while rings, caps and shields may use a different replacement ratio. Show the quantity for each item and specify whether individual labels, grouped kits or standard export packing are required. OEM packaging can be discussed after the exact item list, packing unit and artwork are reviewed. Small trial orders may be used for standard items when available.",
      },
      {
        title: "Submit a traceable RFQ",
        body: "A useful plasma consumables RFQ links each requested item to a torch model, photo, drawing or existing reference. Include destination country, target quantity and required delivery window. Ask the supplier to identify any unconfirmed compatibility, dimensions or material details before quotation. Keep the approved sample or confirmed reference as the control record for repeat orders and future quality checks.",
      },
    ],
    categorySlugs: ["plasma-cutting-consumables", "welding-accessories"],
    productSlugs: ["plasma-electrode", "plasma-nozzle", "plasma-swirl-ring", "plasma-shield"],
    faq: [
      {
        question: "What details are needed for plasma consumables?",
        answer:
          "Send the plasma torch model, existing references, item names, quantities, product photos and packaging requirements.",
      },
      {
        question: "Should electrodes and nozzles be ordered in the same quantity?",
        answer:
          "Not automatically. State the required quantity for each item based on the buyer's maintenance plan or approved replacement ratio.",
      },
      {
        question: "Can plasma consumables be supplied as kits?",
        answer:
          "Kit packing can be discussed after the complete item list, compatibility references, quantities and packing unit are confirmed.",
      },
      {
        question: "Can a plasma nozzle be identified from a photo only?",
        answer:
          "A photo is useful, but the torch model, reference number, dimensions or physical sample may still be required for reliable confirmation.",
      },
    ],
    keywords: [
      "plasma electrode",
      "plasma nozzle",
      "plasma consumable stack",
      "plasma cutting consumables",
    ],
  },
  {
    slug: "mig-contact-tip-size-thread-selection",
    title: "MIG Contact Tip Size and Thread Selection",
    seoTitle: "MIG Contact Tip Size and Thread Selection Guide",
    description:
      "A distributor and repair buyer guide to reading contact tip size, thread and torch references before requesting a quotation.",
    seoDescription:
      "Learn how to identify MIG contact tip wire size, thread, length and torch reference before ordering M6 0.8mm, 1.0mm or 1.2mm tips.",
    publishedDate: "2026-07-26",
    modifiedDate: "2026-07-26",
    sections: [
      {
        title: "Read the product name correctly",
        body: "A contact tip description can contain several independent fields. In a name such as M6 1.0mm, M6 identifies the thread reference and 1.0mm identifies the welding wire size reference supplied by the buyer. These values do not confirm the complete tip geometry. Tip length, body diameter, seating surface and torch series still need to match the existing front-end assembly.",
      },
      {
        title: "Match the welding wire size",
        body: "The contact tip bore is selected for the welding wire used by the application. Buyers should provide the wire diameter and keep different wire sizes as separate SKU lines. A 0.8mm, 1.0mm and 1.2mm requirement should not be combined as one product unless the quotation clearly lists each variant. Wire type and feeding condition may also affect the final selection and should be discussed when relevant.",
      },
      {
        title: "Confirm thread and overall geometry",
        body: "The M6 thread reference is only one part of the mechanical match. Confirm the tip length, threaded section, body profile and the way the tip seats in the holder. A clear side photo with a scale and an end photo can support review. When the current tip is damaged or worn, a drawing or unused sample gives a more reliable dimensional reference than the used part alone.",
      },
      {
        title: "Keep material claims document-based",
        body: "Contact tips may be offered in different copper-based materials, but the exact grade should not be inferred from color or appearance. State the required material grade only when it comes from an approved drawing, specification or existing purchase record. Otherwise ask the supplier to confirm the available material option for the requested application and show it clearly in the quotation or sample record.",
      },
      {
        title: "Check the complete torch front end",
        body: "A correct contact tip must work with the tip holder, diffuser, nozzle and torch neck used by the buyer. Provide the torch series and the reference for adjacent parts when available. If the request uses MB15 as a market reference, treat it as a starting point and confirm the actual tip and holder connection. A common family name should not be presented as guaranteed compatibility.",
      },
      {
        title: "Prepare the contact tip RFQ",
        body: "List thread, wire size, required quantity, destination country and packing preference for every variant. Add the current tip photo, drawing, sample details or model reference. Ask for MOQ, regular lead time and OEM packing options separately. For an initial order, a small trial quantity can help the buyer review fit and feeding performance before planning a repeat distributor order.",
      },
    ],
    categorySlugs: ["mig-mag-torch-parts"],
    productSlugs: [
      "mig-contact-tip-m6-0-8mm",
      "mig-contact-tip-m6-1-0mm",
      "mig-contact-tip-m6-1-2mm",
      "mig-tip-holder-for-mb15",
    ],
    faq: [
      {
        question: "Does M6 describe the welding wire size?",
        answer:
          "No. M6 is the thread reference in these product names. The 0.8mm, 1.0mm or 1.2mm value identifies the wire size reference.",
      },
      {
        question: "Is thread and wire size enough to confirm a contact tip?",
        answer:
          "No. Tip length, body geometry, seating surface, holder connection and torch series may also need confirmation.",
      },
      {
        question: "Can contact tip material be identified by color?",
        answer:
          "No. Exact material grade should come from a specification, drawing, supplier document or confirmed sample record.",
      },
      {
        question: "What should be included in a contact tip RFQ?",
        answer:
          "Include thread, wire size, quantity, torch reference, product photo or drawing, packaging requirement and destination country.",
      },
    ],
    keywords: [
      "MIG contact tip size",
      "M6 contact tip",
      "0.8mm contact tip",
      "1.0mm contact tip",
      "1.2mm contact tip",
    ],
  },
  {
    slug: "tig-torch-consumable-stack-selection",
    title: "TIG Torch Consumable Stack Selection",
    seoTitle: "TIG Torch Consumable Stack Selection Guide",
    description:
      "A practical guide to identifying TIG ceramic cups, collets, collet bodies, gas lenses, back caps and tungsten size references.",
    seoDescription:
      "Identify TIG torch consumable stack parts and prepare RFQs using torch series, tungsten size, cup number, thread, drawing or sample.",
    publishedDate: "2026-07-26",
    modifiedDate: "2026-07-26",
    sections: [
      {
        title: "Treat the parts as one assembly",
        body: "TIG torch consumables work as a connected stack rather than as isolated items. The tungsten passes through the collet, the collet is supported by a collet body or gas lens, the ceramic cup directs shielding gas, and the back cap secures the rear assembly. When one component changes, the matching parts should be checked so thread, length and tungsten alignment remain consistent.",
      },
      {
        title: "Start with torch series and tungsten size",
        body: "Record the TIG torch series and tungsten electrode diameter before selecting the internal parts. Collets, collet bodies and gas lenses are commonly organized around tungsten size, while the torch series controls the physical interface. If the model label is unavailable, photograph the torch head and current consumable stack, then provide measured details or a sample for review instead of assigning an assumed model.",
      },
      {
        title: "Use ceramic cup numbers as references",
        body: "Cup numbers such as #5 or #6 help identify the requested ceramic cup size, but they do not establish complete compatibility by themselves. The buyer should also confirm the torch family, connection style and whether the cup is used with a standard collet body or gas lens arrangement. A cup photo should show the opening, side profile and threaded or push-on connection area.",
      },
      {
        title: "Differentiate collet bodies and gas lenses",
        body: "A standard collet body supports the collet and cup while forming part of the gas path. A gas lens uses an internal mesh arrangement to distribute shielding gas before it exits the cup. Buyers should state which configuration is required and provide the tungsten size, thread and matching cup reference. Do not replace one arrangement with another without confirming the complete compatible stack.",
      },
      {
        title: "Check collets, back caps and tungsten",
        body: "The collet must match the tungsten diameter and the related torch-head parts. The back cap must match the rear thread, cap length and available working clearance. Tungsten electrode requirements should include diameter, length, type or color identification when documented, and intended application. Exact tungsten composition should not be inferred from an unverified photo or from the color of used material.",
      },
      {
        title: "Prepare a TIG consumables RFQ",
        body: "List each ceramic cup, collet, collet body, gas lens, back cap and tungsten item on its own line with quantity. Add torch series, tungsten size, photos and any confirmed references. Explain whether the parts will be ordered individually or packed as a maintenance set. Ask the supplier to mark unconfirmed compatibility and provide MOQ, lead time, export packing and OEM packaging options.",
      },
    ],
    categorySlugs: ["tig-torch-parts"],
    productSlugs: [
      "tig-ceramic-cup-5",
      "tig-ceramic-cup-6",
      "tig-collet-body",
      "tig-gas-lens-1-6mm",
    ],
    faq: [
      {
        question: "Does a TIG ceramic cup number confirm the torch model?",
        answer:
          "No. Cup number is a size reference. Torch series, connection and the collet body or gas lens arrangement should also be checked.",
      },
      {
        question: "Can a gas lens replace a standard collet body directly?",
        answer:
          "Only after the matching torch thread, tungsten size, cup and complete consumable arrangement are confirmed.",
      },
      {
        question: "What information is needed for a TIG collet?",
        answer:
          "Provide tungsten diameter, torch series, collet length or photo, and the matching collet body or gas lens reference.",
      },
      {
        question: "Should TIG consumables be quoted as a set?",
        answer:
          "They can be quoted individually or as a requested maintenance set after each component and quantity is confirmed.",
      },
    ],
    keywords: [
      "TIG torch consumables",
      "TIG ceramic cup size",
      "TIG collet body",
      "TIG gas lens",
      "TIG consumable stack",
    ],
  },
  {
    slug: "welding-cable-connector-selection",
    title: "Welding Cable and Connector Selection",
    seoTitle: "Welding Cable and Connector Selection Guide",
    description:
      "A B2B sourcing guide for welding cable, cable connectors, Dinse connectors, ground clamps and electrode holder assemblies.",
    seoDescription:
      "Prepare welding cable and connector RFQs using cable size, length, connector interface, plug format, clamp or holder and quantity.",
    publishedDate: "2026-07-26",
    modifiedDate: "2026-07-26",
    sections: [
      {
        title: "Define the complete cable assembly",
        body: "A welding cable request may cover bare cable, a machine connector, an electrode holder, a ground clamp or a complete assembled lead. State which components are included at each end and whether assembly is required. A photo of the existing lead should show the cable marking, connector, clamp or holder and the way each component is attached. This prevents a loose component quotation from being mistaken for a finished cable assembly.",
      },
      {
        title: "Confirm cable requirements",
        body: "Provide the conductor cross-section or approved cable size, required length, jacket requirement and working environment when these details are known. Do not estimate an exact current rating from cable appearance. The required welding process, equipment and duty should be reviewed with the documented cable specification. For repeat orders, retain the approved cable marking and assembly drawing as the purchasing reference.",
      },
      {
        title: "Identify the connector interface",
        body: "Welding cable connectors vary by interface size, cable capacity and plug or socket format. Dinse is a common trade description for a twist-lock connector family, but the name alone does not confirm the exact interface. Photograph the equipment receptacle and existing connector, record any markings, and provide measurements or a sample when the size is uncertain. Both mating sides should be checked before ordering.",
      },
      {
        title: "Match ground clamps and electrode holders",
        body: "A ground clamp connects the work-return cable to the workpiece or table, while an electrode holder grips the stick electrode on the welding lead. Buyers should provide the required rating, jaw or head style, cable connection and insulation requirement from an approved specification. If the clamp or holder will be assembled by the supplier, state the cable size and attachment method required for the finished lead.",
      },
      {
        title: "Choose assembled or loose supply",
        body: "Loose connectors and accessories can support local assembly and repair programs. Preassembled leads can reduce installation work but require confirmed cable length, end components, orientation and packing. State whether crimping, fastening or another documented assembly method is required. The supplier should confirm which assembly details and test requirements are available instead of assuming a standard construction for every market.",
      },
      {
        title: "Prepare the cable RFQ",
        body: "List cable, connector, ground clamp and electrode holder quantities separately, then describe any required finished assemblies. Include equipment interface photos, cable size, length, destination country and packing requirement. For OEM programs, add label, logo and carton artwork information. Ask for MOQ, lead time and delivery options after the complete configuration is reviewed, and approve a sample assembly before repeat purchasing when appropriate.",
      },
    ],
    categorySlugs: ["welding-accessories", "welding-consumables"],
    productSlugs: [
      "welding-cable",
      "welding-cable-connector",
      "dinse-connector",
      "ground-clamp",
      "electrode-holder",
    ],
    faq: [
      {
        question: "Is a Dinse connector size confirmed by appearance?",
        answer:
          "No. Check the connector interface, equipment receptacle, cable size, markings, dimensions or physical sample.",
      },
      {
        question: "Can welding leads be supplied as complete assemblies?",
        answer:
          "Assembly can be discussed after cable size, length, both end components and the required assembly method are confirmed.",
      },
      {
        question: "What information is needed for a ground clamp?",
        answer:
          "Provide the required rating, jaw opening or style, cable connection, quantity and a photo or specification when available.",
      },
      {
        question: "Should cable current rating be estimated from a photo?",
        answer:
          "No. Use documented cable size, equipment requirements and an approved specification rather than visual estimation.",
      },
    ],
    keywords: [
      "welding cable",
      "welding cable connector",
      "Dinse connector",
      "ground clamp",
      "electrode holder",
    ],
  },
];
