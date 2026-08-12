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
    modifiedDate: "2026-08-09",
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
    modifiedDate: "2026-08-09",
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
    modifiedDate: "2026-08-09",
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
    slug: "plasma-cutter-consumables-parts-guide",
    title: "Plasma Cutter Consumables and Parts Guide",
    seoTitle: "Plasma Cutter Consumables & Torch Parts Guide",
    description:
      "A component-by-component guide to plasma electrodes, nozzles, swirl rings, shields, retaining caps and the information buyers need before ordering.",
    seoDescription:
      "Identify plasma cutter consumables including electrodes, nozzles, swirl rings, shields and retaining caps, then prepare a compatible parts RFQ.",
    publishedDate: "2026-08-12",
    modifiedDate: "2026-08-12",
    sections: [
      {
        title: "Understand the plasma consumable stack",
        body: "Plasma cutter consumables work as a model-specific front-end stack rather than as isolated parts. Depending on the torch system, the stack may include an electrode, nozzle or cutting tip, swirl ring, retaining cap, shield and stand-off guide. Each component has a different role, but the interfaces, gas path and assembly order must work together. Record the plasma torch model and photograph the complete front end before disassembly. Keep removed components in installation order so a supplier can review the relationship between the parts instead of trying to identify one loose item from appearance alone.",
      },
      {
        title: "Identify the electrode and nozzle",
        body: "The electrode forms part of the internal arc circuit, while the nozzle constricts and directs the plasma arc through a model-specific geometry. Buyers should record any existing reference number, overall profile, connection and the electrode-nozzle pairing already used in the torch. A nozzle opening, operating-current reference or other technical value should be included only when it comes from an approved drawing, parts list or measured sample. Do not infer a rating from color or appearance. When the exact reference is unavailable, send photos of both ends and the assembled position for compatibility review before quotation.",
      },
      {
        title: "Check swirl rings, caps and shields",
        body: "The swirl ring supports the intended gas-distribution arrangement, the retaining cap secures compatible consumables, and the shield protects or positions the front-end system where the torch design uses one. These components can look less important than the electrode and nozzle, but a missing or incorrect ring, cap or shield can prevent the stack from assembling correctly. Show the ring orientation, cap connection, shield profile and all seating surfaces. If the request includes a spacer or stand-off guide, photograph its attachment to the torch and state whether it is required for manual cutting setup or replacement supply.",
      },
      {
        title: "Confirm compatibility from evidence",
        body: "Compatibility should be reviewed from the plasma torch model, existing reference numbers, official parts information, drawing, sample or an organized photo set. A machine brand or generic phrase such as plasma nozzle is not enough because different torch systems can be installed on similar equipment. State whether each model reference is confirmed, reference-only or unverified. For an unknown stack, submit a photo of the torch label, the assembled front end, each loose component from several angles and a clearly shown scale when dimensions can be measured reliably. Final approval should remain subject to the evidence available for the exact requested item.",
      },
      {
        title: "Plan replacement quantities and kits",
        body: "Electrodes, nozzles, swirl rings, caps and shields may be replaced at different rates, so the RFQ should show a separate quantity for every line item. Do not assume that all parts belong in equal-count kits. Distributors can request individual packing, grouped consumable kits or private label packaging after the exact item list is confirmed. State the packing unit, label or barcode requirement, trial quantity, expected repeat quantity and destination country. Small trial orders can be discussed for standard products, while customized packaging MOQ depends on the confirmed product mix and artwork scope.",
      },
      {
        title: "Prepare a plasma consumables RFQ",
        body: "Use one RFQ row for each electrode, nozzle, ring, cap, shield or accessory. Include product name, torch model, verified reference, required quantity, package requirement and a filename that links every photo or drawing to the correct row. State the documented cutting setup only when known from the buyer's approved process. ArcFort Weld can review a mixed plasma consumables list and identify which fields still require a sample, drawing or model confirmation before quotation. Retain the approved sample, matched stack and packing reference as the control record for future repeat orders.",
      },
    ],
    categorySlugs: ["plasma-cutting-consumables"],
    productSlugs: [
      "plasma-electrode",
      "plasma-nozzle",
      "plasma-swirl-ring",
      "plasma-shield",
      "plasma-torch-spacer",
    ],
    faq: [
      {
        question: "What are the main consumable parts of a plasma cutter torch?",
        answer:
          "Common front-end parts include an electrode, nozzle or cutting tip, swirl ring, retaining cap and shield. Some torch systems also use stand-off or spacer components. The exact stack depends on the torch model.",
      },
      {
        question: "Can plasma torch consumables be matched by machine brand alone?",
        answer:
          "No. Provide the plasma torch model, existing reference number, drawing, sample or clear assembly photos because different torch systems may be installed on similar machines.",
      },
      {
        question: "Should plasma electrodes and nozzles be ordered as equal-count kits?",
        answer:
          "Not automatically. Provide the required quantity for each component according to the buyer's approved replacement plan or purchasing history.",
      },
      {
        question: "What photos help identify an unknown plasma consumable?",
        answer:
          "Send the torch label, assembled front end, removal order, both ends of each component, visible markings and a clearly shown scale when measurements can be taken reliably.",
      },
    ],
    keywords: [
      "plasma cutter consumables",
      "plasma torch consumables",
      "plasma cutting consumable parts",
      "plasma electrode and nozzle",
      "plasma torch parts",
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
    modifiedDate: "2026-08-09",
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
    modifiedDate: "2026-08-09",
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
    slug: "tig-torch-parts-names-identification-guide",
    title: "TIG Torch Parts Names and Identification Guide",
    seoTitle: "TIG Torch Parts Names, Components & Identification",
    description:
      "A component-by-component reference for naming TIG torch parts, understanding their assembly positions and preparing evidence for compatibility review.",
    seoDescription:
      "Identify TIG torch parts and components including ceramic cups, collets, gas lenses, back caps and switches, then prepare evidence for an accurate RFQ.",
    publishedDate: "2026-08-12",
    modifiedDate: "2026-08-12",
    sections: [
      {
        title: "Separate the torch into identification zones",
        body: "Begin with the complete torch instead of one loose component. Record the front-end consumable stack, torch head and body, handle and control area, rear cap, cable or hose assembly, and machine-side connector. This zone-based view helps distinguish a ceramic cup from an internal collet part and a torch switch from a cable or connector item. Keep the original assembly intact until the complete torch and model label have been photographed.",
      },
      {
        title: "Use consistent TIG torch part names",
        body: "Name each requested item by its function before adding a model reference. Common front-end TIG welding torch components include the ceramic cup, collet, collet body, gas lens and tungsten electrode. The rear torch-head item is normally described as a back cap. Other service items can include the torch head or body, handle, torch switch, cable or hose assembly and machine-side connector. A descriptive part name is useful for communication, but it is not proof of compatibility.",
      },
      {
        title: "Photograph unknown parts for identification",
        body: "Provide one photo of the complete torch, one of the model or label area, and clear front, side and connection views of every loose part. Place the removed front-end components in assembly order so the relationship between cup, body or gas lens, collet and tungsten remains visible. Include a ruler or scale where practical, but do not report a dimension as final unless the measurement method and reference points are clear.",
      },
      {
        title: "Record markings and measured references",
        body: "Copy visible cup numbers, model labels, thread references, package labels and existing part numbers exactly as shown. Record tungsten diameter, component length, thread or connector details only from an approved drawing, catalog reference or measured sample. If a marking is incomplete, provide a close photograph and label the value as uncertain rather than completing it from memory or appearance.",
      },
      {
        title: "Keep identification separate from compatibility",
        body: "Correctly naming a part does not confirm that it fits a particular torch. A #5 ceramic cup, 1.6 mm collet or gas lens description still needs the related torch series, connection and complete consumable arrangement. Use the identification record to narrow the review, then confirm compatibility by torch model, drawing, approved reference, complete stack or physical sample before ordering.",
      },
      {
        title: "Identify switches, cables and torch assemblies",
        body: "For a TIG torch switch, photograph the visible switch shape, mounting area, lead and connector or wiring reference without altering the assembly. For a complete torch, state whether the request covers the torch body only or includes the cable, hose, connector, switch and front-end consumables. Cable length, connection and machine interface should remain buyer-provided or document-based fields rather than estimates from a photograph.",
      },
      {
        title: "Build an identification-ready TIG RFQ",
        body: "Give every part its own line with a provisional name, quantity and evidence reference. Attach the complete-torch photo, label photo, disassembly-order image and any drawing or sample details. Mark which values are confirmed and which require supplier review. Add destination country, standard or OEM packaging request and whether the order is a trial or repeat requirement so product review and commercial quotation can proceed together.",
      },
    ],
    componentReference: {
      title: "TIG torch parts and component reference",
      description:
        "Use this assembly-based reference to name each item before comparing dimensions or model information. The component name and function help organize an inquiry; compatibility still requires evidence from the exact torch, drawing, approved reference or sample.",
      rows: [
        {
          name: "Ceramic Cup",
          assemblyArea: "Torch front end",
          role: "Surrounds the electrode area and directs shielding gas toward the weld zone.",
          buyerCheck:
            "Cup number, connection style, torch family and standard collet-body or gas-lens arrangement.",
          productSlug: "tig-ceramic-cup-5",
        },
        {
          name: "Collet",
          assemblyArea: "Inside the torch head",
          role: "Grips and centers the tungsten electrode when the back cap is tightened.",
          buyerCheck:
            "Tungsten diameter, collet length, torch family and matching collet body or gas lens.",
          productSlug: "tig-collet",
        },
        {
          name: "Collet Body",
          assemblyArea: "Inside the ceramic cup",
          role: "Supports the collet and forms part of the shielding-gas path through the torch head.",
          buyerCheck:
            "Thread, overall form, tungsten diameter, torch family and ceramic cup arrangement.",
          productSlug: "tig-collet-body",
        },
        {
          name: "Gas Lens",
          assemblyArea: "Inside the ceramic cup",
          role: "Uses an internal screen arrangement to distribute shielding gas before it exits the cup.",
          buyerCheck:
            "Gas-lens family, thread, tungsten bore, torch series and compatible cup arrangement.",
          productSlug: "tig-gas-lens-1-6mm",
        },
        {
          name: "Back Cap",
          assemblyArea: "Rear of the torch head",
          role: "Secures the collet system and accommodates the tungsten projecting through the torch head.",
          buyerCheck: "Rear thread, cap length, torch family and available working clearance.",
          productSlug: "tig-back-cap",
        },
        {
          name: "Tungsten Electrode",
          assemblyArea: "Centered through the torch head",
          role: "Carries the TIG welding arc as a non-consumable electrode in the approved welding setup.",
          buyerCheck:
            "Documented diameter, length, type or color reference and the buyer's approved application requirement.",
          productSlug: "tig-tungsten-electrode",
        },
        {
          name: "Torch Head or Body",
          assemblyArea: "Front torch assembly",
          role: "Houses the front-end parts and connects them to the torch cable or hose assembly.",
          buyerCheck:
            "Torch family, head form or angle, cooling configuration when documented and cable-side interface.",
          productSlug: "tig-welding-torch",
        },
        {
          name: "Torch Switch",
          assemblyArea: "Handle and control area",
          role: "Provides a torch-mounted control input where the torch and welding machine arrangement supports it.",
          buyerCheck:
            "Switch shape, mounting position, lead length and connector or wiring reference from the existing assembly.",
          productSlug: "tig-torch-switch",
        },
        {
          name: "Cable or Hose Assembly",
          assemblyArea: "Torch handle to machine",
          role: "Carries the services required by the documented torch configuration, which can include current, gas, coolant or control wiring.",
          buyerCheck:
            "Required length, torch-side connection, machine-side connection and the exact service lines shown by the existing torch.",
        },
        {
          name: "Machine-Side Connector",
          assemblyArea: "End of the cable assembly",
          role: "Connects the torch assembly to the compatible welding equipment interface.",
          buyerCheck:
            "Connector body, power interface, gas fitting and any control pins from a drawing, sample or approved reference.",
        },
      ],
    },
    buyerChecklist: {
      title: "TIG parts identification checklist",
      description:
        "Prepare one traceable evidence set before asking a supplier to confirm the requested parts.",
      items: [
        "Photograph the complete TIG torch, handle and machine-side connection before disassembly.",
        "Capture the torch model label and every visible marking without completing unclear values from memory.",
        "Lay out the ceramic cup, collet body or gas lens, collet, tungsten and back cap in assembly order.",
        "Show front, side, thread and connection views with a clear scale when a measurement can be taken reliably.",
        "List every part, size or model on a separate RFQ line with its own quantity and evidence filename.",
        "Mark model references as confirmed, reference-only or unverified, then state packaging and destination requirements.",
      ],
    },
    rfqFields: [
      "Torch series / complete torch label:",
      "Requested TIG torch parts:",
      "Tungsten diameter if documented:",
      "Cup / thread / connection references:",
      "Quantity by item:",
      "Standard or OEM packaging:",
      "Destination country:",
      "Attached photo / drawing / sample reference:",
    ],
    categorySlugs: ["tig-torch-parts"],
    productSlugs: [
      "tig-ceramic-cup-5",
      "tig-ceramic-cup-6",
      "tig-collet",
      "tig-collet-body",
      "tig-gas-lens-1-6mm",
      "tig-back-cap",
      "tig-tungsten-electrode",
      "tig-welding-torch",
      "tig-torch-switch",
    ],
    faq: [
      {
        question: "Can a TIG torch part be identified from one photo?",
        answer:
          "One photo may suggest a part family, but reliable review normally needs the complete torch, model label, assembly order, connection views and a drawing or sample when available.",
      },
      {
        question: "Is a TIG ceramic cup number enough to confirm compatibility?",
        answer:
          "No. The cup number should be checked with the torch series, connection style and the standard collet-body or gas-lens arrangement.",
      },
      {
        question: "What is the difference between identification and compatibility?",
        answer:
          "Identification establishes what kind of part is being discussed. Compatibility confirms that its dimensions, interfaces and assembly match the required torch reference.",
      },
      {
        question: "What should be included in a TIG parts identification RFQ?",
        answer:
          "Send part names, quantities, complete-torch and label photos, components in assembly order, available measurements, drawing or sample references, packaging needs and destination country.",
      },
    ],
    keywords: [
      "TIG torch parts names",
      "TIG torch parts identification",
      "parts of a TIG welding torch",
      "TIG torch components",
      "TIG torch parts diagram",
      "TIG torch consumables chart",
      "TIG welding torch components",
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
    modifiedDate: "2026-08-09",
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
  {
    slug: "mig-torch-front-end-parts-identification",
    title: "MIG Torch Front-End Parts Identification",
    seoTitle: "MIG Torch Front-End Parts Identification Guide",
    description:
      "A practical guide to identifying contact tips, tip holders, diffusers, gas nozzles, swan necks and liners before quotation.",
    seoDescription:
      "Identify MIG torch front-end parts using torch references, component order, photos, drawings and measured details before requesting a quotation.",
    publishedDate: "2026-07-26",
    modifiedDate: "2026-08-09",
    sections: [
      {
        title: "Map the complete front-end assembly",
        body: "Start by recording the order in which the existing torch parts are assembled. A MIG/MAG torch front end can include the contact tip, tip holder, gas diffuser, gas nozzle and swan neck, with a torch liner supporting wire feeding through the cable assembly. Product names vary between markets, so the assembly order and connection points are often more useful than a generic name. Photograph the complete front end before removing individual components.",
      },
      {
        title: "Identify the contact tip and tip holder",
        body: "The contact tip guides the welding wire and connects to the surrounding holder arrangement. Record the welding wire size, thread reference, overall length and seating profile only when these fields can be measured or verified. The tip holder must match the contact tip connection and the related torch front end. If either component is worn, provide an unused sample, drawing or approved purchasing reference instead of relying only on dimensions from the damaged part.",
      },
      {
        title: "Differentiate the diffuser and gas nozzle",
        body: "The gas diffuser and gas nozzle form part of the shielding gas path, but they are separate components. A diffuser may also support the tip holder arrangement, while the nozzle surrounds the front end and directs shielding gas around the welding area. Include side and end photos, connection details and the relationship between both parts. Do not assume that a similar nozzle profile confirms the internal diffuser, thread or torch-series match.",
      },
      {
        title: "Check the swan neck and torch liner",
        body: "The swan neck positions the front-end assembly and connects it to the torch body. The torch liner guides welding wire through the cable toward the contact tip. Buyers should provide the torch model, liner type or range, cable length and end details when known from existing records. A swan neck photo should show both connection ends and its overall shape. Liner or neck compatibility should be confirmed from documented references, samples or drawings.",
      },
      {
        title: "Build a traceable photo and drawing set",
        body: "Use one file group for each torch family. Include an assembled view, individual component views, visible markings and measured connection details. Add a scale beside small parts without covering the threads or gas passages. Name each file with the buyer line-item number so the supplier can connect it to the correct quantity. Keep uncertain dimensions and market references clearly marked as unverified until the supplier and buyer review the matching evidence.",
      },
      {
        title: "Prepare a mixed front-end parts RFQ",
        body: "List every contact tip, holder, diffuser, nozzle, neck and liner as a separate line item with quantity. Add torch series, wire size, confirmed thread, destination country and packing requirement where available. State whether the products are required as loose spares, maintenance sets or private label packs. Ask the supplier to identify missing compatibility details, then confirm MOQ, lead time and packaging after the exact component list has been reviewed.",
      },
    ],
    categorySlugs: ["mig-mag-torch-parts"],
    productSlugs: [
      "mig-contact-tip-m6-1-0mm",
      "mig-diffuser",
      "mig-gas-nozzle-for-mb15",
      "mig-tip-holder-for-mb15",
      "mig-torch-liner",
      "mig-swan-neck",
      "mig-mag-welding-torch",
    ],
    faq: [
      {
        question: "Can a MIG gas nozzle be identified by outside shape alone?",
        answer:
          "No. The connection, length, internal arrangement, related diffuser and torch reference may also need confirmation.",
      },
      {
        question: "Should the complete torch front end be photographed before disassembly?",
        answer:
          "Yes. An assembled photo records component order and helps the supplier understand how the requested parts connect.",
      },
      {
        question: "What details are useful for a torch liner inquiry?",
        answer:
          "Provide the torch or cable reference, cable length, welding wire range, liner end details and a photo or approved sample when available.",
      },
      {
        question: "Can different MIG front-end parts be quoted in one RFQ?",
        answer:
          "Yes. Keep each component and variant on a separate line with its own quantity, reference and packaging requirement.",
      },
    ],
    keywords: [
      "MIG torch front end parts",
      "MIG gas nozzle and diffuser",
      "MIG tip holder",
      "MIG torch liner",
      "MIG torch spare parts",
    ],
  },
  {
    slug: "mig-torch-liner-selection-guide",
    title: "MIG Torch Liner Selection Guide",
    seoTitle: "MIG Torch Liner Selection Guide for B2B Buyers",
    description:
      "A practical guide for distributors and repair buyers specifying MIG torch liners by wire, cable and connection evidence before quotation.",
    seoDescription:
      "Select MIG torch liners by wire type, diameter, cable length, torch connection and sample or model evidence before requesting a B2B quotation.",
    publishedDate: "2026-08-09",
    modifiedDate: "2026-08-09",
    sections: [
      {
        title: "Start with the wire feeding requirement",
        body: "A MIG/MAG torch liner guides welding wire from the feeder through the gun cable toward the contact tip. Begin the inquiry with the welding wire type and diameter used by the application. Keep each wire diameter on a separate RFQ line and distinguish solid wire, flux-cored wire and softer non-ferrous wire when that information is confirmed. A torch model alone may not identify the installed liner because gun length, connection system and wire setup can vary. Do not infer the liner bore, construction or part number from the outside color unless the color code is supported by the relevant manufacturer documentation.",
      },
      {
        title: "Match the liner range to the wire diameter",
        body: "Select a liner range that is approved for the welding wire diameter rather than assuming one liner covers every wire used in the workshop. Supplier and torch-manufacturer tables normally organize liners by a stated wire range, cable length and connection family. Record the wire diameter exactly as used in the purchasing document or equipment setup, and ask the supplier to identify the applicable range. When several wire sizes are required, list them separately so the quotation can show whether one reviewed liner family or multiple liner variants are needed. Final sizing must follow the confirmed torch and wire references, not a generic market comparison.",
      },
      {
        title: "Confirm liner construction for the wire type",
        body: "Liner construction is part of the wire-delivery system. Wound metallic liners are commonly associated with steel-wire applications, while polymer liner options are used in applications where lower friction or protection of softer wire is required. This is a selection principle, not a universal compatibility claim. Buyers should provide the wire material, torch arrangement and current liner reference, then ask the supplier to confirm the suitable construction. Do not state PTFE, nylon, steel or another liner material as confirmed unless it is supported by the requested model, an approved document, a drawing or a sample review.",
      },
      {
        title: "Verify cable length and finished liner length",
        body: "The ordered liner must suit the gun cable and the approved installation method. Provide the complete torch or gun length, current liner length when it can be measured reliably, and clear photos of both liner ends. Do not treat a nominal catalog length as the finished installation dimension because some systems require an installation or trimming procedure. A replacement inquiry should identify whether the existing liner is front-loading, rear-loading or another documented arrangement when that detail is known. The supplier should confirm the supplied length and end preparation against the torch reference before the buyer approves the item.",
      },
      {
        title: "Record the connector and termination details",
        body: "Two liners with a similar coil or tube appearance may use different rear connections, seals, retaining parts, neck interfaces or end treatments. Photograph the feeder end, torch end and any visible marking without removing useful labels. Add the torch model, connector family, existing product reference and a simple dimensioned sketch when available. If the liner is supplied as part of a repair set, list the related collet, retaining nut, guide or seal as separate items. Compatibility should remain subject to model, sample or drawing confirmation whenever the termination details cannot be verified from current records.",
      },
      {
        title: "Review the complete wire path before replacement",
        body: "Wire-feeding problems should not automatically be attributed to the liner alone. The buyer or service technician should review the approved drive-roll setup, wire condition, cable routing, contact tip and other documented parts of the feed path. Record the observed issue, but avoid asking a supplier to confirm a root cause from a short description. For a replacement-parts RFQ, explain whether the liner is planned maintenance, a direct replacement for a known reference or part of a wider troubleshooting program. This distinction helps the supplier quote the requested product without making unsupported performance or repair claims.",
      },
      {
        title: "Prepare a quotation-ready liner RFQ",
        body: "A useful liner RFQ includes the wire type and diameter, torch or gun model, cable length, liner arrangement, connection details, required quantity and destination country. Add photos of both ends, the existing label, an approved drawing or a physical sample reference when possible. State whether standard export packing is acceptable or whether product labels, private packaging or carton artwork are required. ArcFort Weld can review mixed MIG/MAG torch-parts lists, but every liner variant should remain on its own line. MOQ, lead time, packing and compatibility can then be confirmed against the submitted evidence before quotation and production approval.",
      },
    ],
    categorySlugs: ["mig-mag-torch-parts"],
    productSlugs: ["mig-torch-liner"],
    faq: [
      {
        question: "What information is needed for a MIG torch liner quotation?",
        answer:
          "Provide the welding wire type and diameter, torch or gun model, cable length, liner end details, quantity and destination country. Photos, a drawing or an existing sample reference can help confirm the requested variant.",
      },
      {
        question: "Can the same liner be used for different wire diameters?",
        answer:
          "Do not assume this from appearance alone. The applicable wire range must be checked against the liner and torch documentation or confirmed by sample, drawing or model reference.",
      },
      {
        question: "Is a polymer liner always required for aluminium wire?",
        answer:
          "Polymer liner options are commonly considered for softer wire, but the exact construction must be selected for the confirmed wire, torch and feeding system. Request model-specific confirmation rather than treating one material as universal.",
      },
      {
        question: "How should distributors list several liner variants in one RFQ?",
        answer:
          "Use a separate line for each wire range, torch reference, cable length or termination. Add quantity and packaging requirements to every line so the variants remain traceable during quotation.",
      },
    ],
    keywords: [
      "MIG torch liner",
      "MIG gun liner",
      "MIG liner selection",
      "welding torch liner supplier",
      "PTFE welding liner",
    ],
  },
  {
    slug: "welding-electrode-wire-rfq-guide",
    title: "Welding Electrode and Wire RFQ Guide",
    seoTitle: "Welding Electrode and Wire RFQ Guide for Buyers",
    description:
      "A B2B guide to preparing welding electrode, welding wire and related consumable inquiries without guessing classifications or ratings.",
    seoDescription:
      "Prepare welding electrode and wire RFQs using documented process, classification, size, packaging, quantity and destination requirements.",
    publishedDate: "2026-07-26",
    modifiedDate: "2026-08-09",
    sections: [
      {
        title: "Separate electrodes, wire and related accessories",
        body: "Begin by separating stick electrodes, continuous welding wire, spot welding electrodes and related holders or feeding accessories. These products serve different welding processes and require different purchasing fields. Use one line for each product form, size and package. A general request for welding consumables is not enough for a reliable quotation. The supplier should be able to trace every requested item to a documented process, buyer reference, photo or existing package label.",
      },
      {
        title: "Use documented classification information",
        body: "Provide the consumable classification, grade, standard or manufacturer reference only when it appears on an approved specification, package label, purchase record or drawing. Do not create a classification from product color, application description or an online comparison. If the buyer does not know the exact designation, send clear label photos and explain the welding process and base material requirement. The supplier can then identify which additional technical information is needed before quotation.",
      },
      {
        title: "Confirm size and package format",
        body: "Record diameter, length, spool or package format and package weight from verified documents or existing product labels. Keep different diameters and package formats as separate SKU lines. For wire, include the required spool or drum reference when documented. For electrodes, show the package label and product length if available. When these fields are unknown, request available options instead of publishing or ordering an assumed dimension or package quantity.",
      },
      {
        title: "State application and handling requirements",
        body: "Describe the welding process, general application, destination market and any documented storage or handling requirement from the buyer's quality system. These details support quotation review but do not replace the product classification. Buyers should also state whether batch identification, package labels or product documents are required. The supplier must confirm which records can be supplied; the website or RFQ should not imply certificates or test documents that have not been verified.",
      },
      {
        title: "Plan trials and repeat orders",
        body: "Provide the initial trial quantity and expected repeat quantity by item. A trial order can support buyer review of packaging, identification and welding performance under the buyer's own procedure. Repeat purchasing should use the approved product reference, package label and sample record. If private labels are required, send artwork, language, barcode and packing-unit information early so the supplier can discuss MOQ and lead time separately from standard export packing.",
      },
      {
        title: "Prepare the consumables RFQ",
        body: "For each line, include product type, documented classification or reference, size, package, quantity and destination country. Attach label photos, existing data sheets or drawings when available. Explain whether an electrode holder, ground clamp, cable or feeder accessory is also required. Ask the supplier to list unconfirmed fields, available documentation, MOQ, estimated lead time and packing basis before the buyer approves samples or a commercial order.",
      },
    ],
    categorySlugs: ["welding-consumables"],
    productSlugs: [
      "welding-electrode",
      "welding-wire",
      "spot-welding-electrode",
      "electrode-holder",
    ],
    faq: [
      {
        question: "Can an electrode classification be selected from a product photo?",
        answer:
          "No. Use an approved label, specification, purchase record or supplier document. A photo can support identification but should not create an unverified classification.",
      },
      {
        question: "Should different wire diameters be listed separately?",
        answer:
          "Yes. Keep each diameter, product designation and package format on its own RFQ line with a separate quantity.",
      },
      {
        question: "Can private label packaging be discussed for welding consumables?",
        answer:
          "Yes. Artwork, language, barcode, packing unit, quantity and product details should be reviewed before MOQ and lead time are confirmed.",
      },
      {
        question: "What information is needed when the exact grade is unknown?",
        answer:
          "Send the existing label, process, application, base material requirement and any approved purchasing reference, then ask which additional fields are needed.",
      },
    ],
    keywords: [
      "welding electrode RFQ",
      "welding wire supplier inquiry",
      "welding consumables buying guide",
      "welding electrode packaging",
      "welding wire quotation",
    ],
  },
  {
    slug: "welding-machine-sourcing-checklist",
    title: "Welding Machine RFQ and Sourcing Checklist",
    seoTitle: "Welding Machine Sourcing Checklist for Distributors",
    description:
      "A distributor-focused checklist for defining MIG/MAG, TIG, MMA or plasma equipment requirements before a welding machine RFQ.",
    seoDescription:
      "Use this welding machine sourcing checklist to compare process, input power, documented output requirements, accessories, packing and market needs.",
    publishedDate: "2026-07-26",
    modifiedDate: "2026-08-12",
    sections: [
      {
        title: "Define the welding or cutting process",
        body: "State whether the buyer requires MIG/MAG, TIG, MMA, plasma cutting, stud welding or another documented process. Explain the industrial application, expected operating environment and whether the equipment is intended for production, repair, site work or distributor resale. Avoid selecting a machine only from a marketing name. The required process, material range and operating procedure should come from the buyer's technical team or existing approved equipment reference.",
      },
      {
        title: "Document destination electrical requirements",
        body: "Provide the destination country and the required input voltage, frequency, phase and plug arrangement from the buyer's electrical specification. Do not assume that equipment supplied for one market can be used in another. If several input configurations are acceptable, list them as options for quotation. The supplier should confirm the available configuration, power connection and labeling before production. Exact electrical ratings must remain document-based rather than inferred from a product photo.",
      },
      {
        title: "Confirm performance fields from approved data",
        body: "List required output range, duty cycle, process modes and other technical ratings only when they are part of an approved buyer requirement. Ask the supplier to provide the available machine data sheet for comparison. Marketing descriptions should not replace documented values. When the buyer is replacing existing equipment, include the model, nameplate photo and key application conditions, while clearly stating that the existing model is a reference and not an automatic compatibility approval.",
      },
      {
        title: "Identify interfaces and included accessories",
        body: "Define whether the quotation should include a torch, wire feeder, ground lead, electrode holder, regulator, cable connector, remote control or other accessory. Record required connector and feeder interfaces from drawings or equipment references. Separate included items from optional spares so the commercial comparison is clear. For torch and cable assemblies, provide length and connection details when documented. Unconfirmed interfaces should be reviewed before sample or production approval.",
      },
      {
        title: "Specify market documents and labeling",
        body: "Tell the supplier which language, manual, nameplate, carton marks and product documents the destination market requires. Certification or regulatory requirements must be stated by the buyer and confirmed against real supplier evidence before any claim is published or accepted. Do not assume CE, ISO, RoHS, UL or another certificate is available. Ask the supplier to list exactly which documents, test records and markings can be provided for the quoted configuration.",
      },
      {
        title: "Plan sample review, packing and support",
        body: "For a new machine program, define sample quantity, inspection points, packing requirement, spare-parts request and after-sales document needs. Provide target order quantity and delivery destination so MOQ, lead time and shipping options can be discussed. Before repeat purchasing, retain the approved configuration, nameplate, accessories list, manual version and packing record. A complete RFQ should separate confirmed requirements, requested options and fields that still require technical review.",
      },
    ],
    categorySlugs: ["welding-machines"],
    productSlugs: ["wire-feeder", "stud-welding-gun"],
    faq: [
      {
        question: "What electrical information should be included in a welding machine RFQ?",
        answer:
          "Provide destination country, required input voltage, frequency, phase and plug arrangement from the buyer's approved electrical requirements.",
      },
      {
        question: "Should certification be assumed for an export welding machine?",
        answer:
          "No. State the destination requirement and ask the supplier to confirm available certificates and supporting evidence for the quoted configuration.",
      },
      {
        question: "How should included accessories be compared?",
        answer:
          "Use a separate list for the torch, feeder, cables, connectors, holder, clamp, regulator, spare parts and other included or optional items.",
      },
      {
        question: "Is an existing machine model enough for quotation?",
        answer:
          "It is a useful reference, but the buyer should also provide process, electrical requirements, application, interfaces and the required accessory scope.",
      },
    ],
    keywords: [
      "industrial welding machine sourcing",
      "welding machine RFQ",
      "welding equipment buying checklist",
      "export welding machine supplier",
      "welding machine distributor",
    ],
  },
  {
    slug: "oem-welding-products-private-label-guide",
    title: "OEM Welding Products and Private Label Guide",
    seoTitle: "OEM Welding Products and Private Label Buying Guide",
    description:
      "A practical guide for distributors planning welding product customization, logo artwork, labels, cartons, samples and repeat orders.",
    seoDescription:
      "Plan OEM welding products and private label packaging with confirmed product references, artwork control, MOQ, samples and export packing.",
    publishedDate: "2026-07-26",
    modifiedDate: "2026-08-09",
    sections: [
      {
        title: "Confirm the base product first",
        body: "OEM work should begin with a clearly identified base product. Confirm the product name, model, size, material, compatibility reference and required quantity using samples, drawings, photos or approved records. Packaging artwork cannot correct an uncertain product match. Keep unknown technical fields visible during quotation review and approve the physical or documented product reference before finalizing labels, cartons or a private label SKU.",
      },
      {
        title: "Define the customization scope",
        body: "Separate product customization from packaging customization. Product work may include a documented model, color, component or marking request, while packaging work may include logo printing, labels, inner packs and carton design. List every requested change and identify which details are mandatory or optional. The supplier should review feasibility, MOQ and lead time for the actual scope rather than treating the word OEM as one fixed service package.",
      },
      {
        title: "Control logos, labels and artwork",
        body: "Provide approved vector artwork where available, target dimensions, colors, label location, market language, barcode and importer information required by the buyer. Use version numbers or dates for artwork files so old and new designs are not confused. The buyer is responsible for confirming brand rights and destination-market label content. Ask for an artwork proof or packing sample before production, and retain the approved version for repeat orders.",
      },
      {
        title: "Review MOQ and lead time by requirement",
        body: "Standard product, printed product, private label package and custom carton requests can have different production conditions. State the trial quantity and expected repeat quantity for every SKU. ArcFort Weld accepts small trial orders for standard products when available, while OEM MOQ depends on the product and packaging requirement. Final lead time should be confirmed after materials, artwork, quantity and production schedule are reviewed.",
      },
      {
        title: "Approve samples and packing references",
        body: "Use a pre-production sample, approved product reference or documented confirmation appropriate to the order. Review product identity, visible marking, label content, pack quantity, carton artwork and shipping marks before volume production. Do not approve compatibility, certification or exact technical ratings from packaging appearance alone. Record any corrections in a controlled approval message or file so both buyer and supplier can trace the final requirement.",
      },
      {
        title: "Build a repeat-order control file",
        body: "For each approved OEM SKU, retain the product reference, artwork version, label position, packing unit, carton specification, shipping marks and sample confirmation. Include destination country and contact details for future review. Repeat orders should reference this control file and identify any requested changes before production. A stable record reduces artwork errors and helps distributors compare quotation, packing and delivery details across purchasing cycles.",
      },
    ],
    categorySlugs: [
      "mig-mag-torch-parts",
      "tig-torch-parts",
      "plasma-cutting-consumables",
      "welding-accessories",
    ],
    productSlugs: [
      "mig-mag-welding-torch",
      "tig-welding-torch",
      "plasma-cutting-torch",
      "welding-protective-cover",
      "wire-feeder-accessories",
    ],
    faq: [
      {
        question: "Is OEM MOQ the same for every welding product?",
        answer:
          "No. MOQ depends on product type, model, marking, packaging, artwork and other customization requirements.",
      },
      {
        question: "What artwork should a private label buyer provide?",
        answer:
          "Provide the approved logo file, colors, dimensions, label text, barcode, language and carton requirements applicable to the target market.",
      },
      {
        question: "Can a small trial order use custom packaging?",
        answer:
          "It can be discussed, but custom printing or cartons may require a different MOQ from standard products. The supplier should confirm options after reviewing the request.",
      },
      {
        question: "What should be retained for repeat OEM orders?",
        answer:
          "Keep the approved product reference, artwork version, label position, packing unit, carton details, shipping marks and sample confirmation.",
      },
    ],
    keywords: [
      "OEM welding products",
      "private label welding accessories",
      "welding product packaging",
      "custom welding consumables",
      "OEM welding supplier",
    ],
  },
  {
    slug: "identify-welding-torch-consumables-from-photos-samples",
    title: "How to Identify Welding Torch Consumables from Photos and Samples",
    seoTitle: "Identify Welding Torch Consumables from Photos & Samples",
    description:
      "A practical identification workflow for buyers sourcing MIG/MAG, TIG and plasma torch consumables from photos, samples, drawings or model references.",
    seoDescription:
      "Identify MIG/MAG, TIG and plasma torch consumables using clear photos, samples, drawings and model references before requesting a supplier quotation.",
    publishedDate: "2026-08-09",
    modifiedDate: "2026-08-09",
    sections: [
      {
        title: "Start with the welding or cutting process",
        body: "First separate the requested parts into MIG/MAG, TIG or plasma cutting families. MIG/MAG torch consumables commonly include contact tips, tip holders, diffusers, gas nozzles, torch liners and swan necks. TIG torch assemblies use parts such as ceramic cups, collets, collet bodies, gas lenses and back caps. Plasma front ends may include electrodes, nozzles, swirl rings, shields and retaining caps. Similar color or shape does not prove that two parts belong to the same system. Record the process shown on the existing package, equipment document or purchasing record before comparing individual components.",
      },
      {
        title: "Photograph the complete assembly before disassembly",
        body: "When possible, photograph the torch front end and the assembled consumable stack before removing parts. Add a second image after disassembly with the components arranged in installation order. This gives the supplier context that a single loose-part photo cannot provide. Keep the original package, label and used reference parts together until identification is complete. For a mixed workshop collection, assign a temporary line number to each part and show that number in every related photo. Do not clean away useful markings or combine visually similar items into one bag before their references have been recorded.",
      },
      {
        title: "Build a photo set that can be reviewed",
        body: "Use a plain, well-lit background and keep the product in focus. Capture the complete side profile, both ends, the connection or thread area, gas openings and every visible marking. Add a ruler or caliper reading only when the measuring method is clear, and keep the scale in the same plane as the part to reduce perspective error. Include one image of the package label or equipment nameplate when available. Avoid screenshots with seller logos, watermarks, prices or unrelated product claims. Original photos of the buyer's sample are more useful for matching work because the supplier can trace them directly to the requested line item.",
      },
      {
        title: "Record markings and dimensions without guessing",
        body: "Copy legible part numbers, cup numbers, wire sizes, thread references and other markings exactly as shown. If a marking is incomplete, state which characters are uncertain instead of completing the number from memory. Record dimensions only when the buyer can measure them reliably and label each value, such as overall length, outside diameter, opening diameter or thread. Appearance alone cannot confirm copper grade, surface treatment, exact thread, electrical rating or OEM number. Leave those fields open for review and ask the supplier which additional drawing, sample or measurement is required.",
      },
      {
        title: "Use model, drawing or sample evidence for compatibility",
        body: "A common trade name can narrow the search, but it does not guarantee fit. Provide the torch model, machine model when relevant, existing part reference, assembly photo and drawing or physical sample details. Explain whether the model is an approved requirement, a reference from the current installation or only a possible market comparison. The supplier should confirm compatibility against the evidence available for the exact requested item. When the reference remains incomplete, request a conditional quotation and keep the final match subject to sample, drawing or model confirmation before production approval.",
      },
      {
        title: "Organize mixed SKU inquiries for quotation",
        body: "Create one RFQ row for every product, size or model rather than grouping several consumables under a generic description. Include a line number, product family, current reference, required quantity, package requirement and destination country. Use filenames such as line-01-front, line-01-thread and line-01-label so attachments can be matched to the correct row. State the trial quantity and expected repeat quantity separately. For OEM requests, add logo, label, inner pack and carton requirements, but keep product confirmation separate from packaging approval. This structure helps purchasing and technical teams review the same information without losing traceability.",
      },
      {
        title: "Send the evidence required for an actionable RFQ",
        body: "Before submission, check that every RFQ row has a clear product name, quantity and at least one usable identification reference. Add the destination country, requested delivery window and whether standard export packing or customized packaging is required. ArcFort Weld can review product lists, drawings, photos and sample details for welding torch consumables and plasma cutting parts. The quotation should identify available products, fields that still require technical confirmation, MOQ, packing basis, expected lead time and delivery options. For standard products, small trial orders can be discussed; OEM MOQ depends on the product and packaging requirements.",
      },
    ],
    categorySlugs: ["mig-mag-torch-parts", "tig-torch-parts", "plasma-cutting-consumables"],
    productSlugs: [
      "mig-contact-tip-m6-1-0mm",
      "mig-gas-nozzle-for-mb15",
      "tig-ceramic-cup-5",
      "tig-gas-lens-1-6mm",
      "plasma-electrode",
      "plasma-nozzle",
    ],
    faq: [
      {
        question: "Can a welding torch consumable be identified from one photo?",
        answer:
          "A photo can support identification, but one image normally cannot confirm every connection, dimension or compatibility detail. Provide multiple views plus a model, drawing or sample reference when available.",
      },
      {
        question: "Which photos are most useful for a supplier quotation?",
        answer:
          "Send the complete part, both ends, connection or thread area, visible markings, package label and the assembled position. Add a clearly shown scale only when dimensions can be measured reliably.",
      },
      {
        question: "Should I send the welding machine model or the torch model?",
        answer:
          "Send the torch model first for torch consumables and include the machine model when it helps identify the installed system. A drawing, current part reference or physical sample can provide additional evidence.",
      },
      {
        question: "Can ArcFort Weld review a mixed list of MIG/MAG, TIG and plasma parts?",
        answer:
          "Yes. Put each product, size or model on a separate RFQ row with its own quantity and photo references so every item can be reviewed independently.",
      },
    ],
    keywords: [
      "identify welding torch consumables",
      "welding parts identification",
      "MIG torch parts by photo",
      "TIG consumables sample matching",
      "plasma consumables identification",
    ],
  },
  {
    slug: "mig-gas-nozzle-diffuser-selection-guide",
    title: "MIG Gas Nozzle and Diffuser Selection Guide",
    seoTitle: "MIG Gas Nozzle and Diffuser Selection Guide",
    description:
      "A B2B sourcing guide for identifying MIG/MAG gas nozzles, gas diffusers and tip holders as a matched torch front-end system.",
    seoDescription:
      "Prepare MIG gas nozzle, diffuser and tip holder RFQs using torch references, assembly photos, connection details, quantities and packaging needs.",
    publishedDate: "2026-08-09",
    modifiedDate: "2026-08-09",
    sections: [
      {
        title: "Identify the complete MIG/MAG front end",
        body: "Start with the assembled torch front end rather than one loose component. A typical sourcing list may include a contact tip, tip holder or gas diffuser, insulator, gas nozzle and swan neck, but the names and arrangement can vary by system. Photograph the assembly before disassembly and place removed parts in installation order. Record the torch model, existing reference numbers and every visible marking. A familiar nozzle profile or trade name can narrow the search, but it does not confirm that the connection, gas path and adjacent consumables will fit together.",
      },
      {
        title: "Record the nozzle shape and attachment",
        body: "The gas nozzle directs shielding gas around the wire and weld area. For purchasing, document the complete profile, opening, overall length, attachment style and the position of the contact tip relative to the nozzle only when these details can be verified. Straight, tapered and other nozzle profiles are selected for different access and gas-coverage requirements, but no profile should be presented as universally correct. Buyers should follow the approved welding procedure and torch manufacturer information, then ask the supplier to confirm the available nozzle against the submitted model, drawing or sample.",
      },
      {
        title: "Distinguish the diffuser from the tip holder",
        body: "Market terminology for gas diffusers, tip holders and tip adaptors is not always consistent. Some front-end components both support the contact tip and distribute shielding gas, while other systems separate these functions. Do not approve a replacement from the product name alone. Show the gas openings, thread or locking connection, seating surfaces, insulator and contact-tip interface. State the wording used on the current package or parts list, but keep the final product identity subject to the actual assembly evidence supplied with the RFQ.",
      },
      {
        title: "Confirm the matched consumable system",
        body: "Nozzles, diffusers, insulators and contact tips should be reviewed as a connected consumable system. Official manufacturer parts guides use model-specific combinations and may require a different diffuser or insulator when changing consumable families. This means similar-looking parts should not be mixed without confirmation. Provide the torch or gun model, neck reference, current consumable stack and a photo of the assembled position. If MB15 or another common family name is used as a market reference, clearly state that compatibility still requires model, sample or drawing confirmation.",
      },
      {
        title: "Check condition without making diagnosis claims",
        body: "Spatter, blocked gas openings, deformation, damaged insulation and loose connections are useful observations to record when preparing a replacement inquiry. Photograph the used parts before cleaning and explain whether the request is planned maintenance, repeat purchasing or troubleshooting. These observations do not prove the root cause of a welding problem. The buyer's welding and maintenance team should follow the approved procedure and equipment guidance, while the supplier uses the evidence to identify and quote the requested replacement parts.",
      },
      {
        title: "Plan quantities, packing and OEM labels",
        body: "List a separate quantity for every nozzle, diffuser, tip holder, insulator and contact-tip variant. Replacement ratios can differ between workshops, so do not assume that all components require the same quantity. State whether standard export packing is acceptable or whether inner labels, private packaging, barcodes or carton artwork are required. Small trial orders can be discussed for standard products. OEM MOQ and lead time depend on the confirmed product, quantity and packaging scope, and should be reviewed after the technical match is clear.",
      },
      {
        title: "Prepare a quotation-ready front-end RFQ",
        body: "For each requested item, provide the product name, torch or gun reference, existing part number when verified, required quantity and destination country. Attach an assembled photo, individual views of both ends, visible markings and a drawing or sample reference when available. Include the welding wire size for the contact tip and any documented nozzle position or application requirement. ArcFort Weld can review mixed MIG/MAG torch-part lists and confirm which technical details remain open before quotation, sample approval and repeat-order planning.",
      },
    ],
    categorySlugs: ["mig-mag-torch-parts"],
    productSlugs: [
      "mig-gas-nozzle-for-mb15",
      "mig-diffuser",
      "mig-tip-holder-for-mb15",
      "mig-contact-tip-m6-1-0mm",
    ],
    faq: [
      {
        question: "Can a MIG gas nozzle be matched from its shape alone?",
        answer:
          "No. Provide the torch model, attachment style, dimensions when reliably measured, assembly photos and the adjacent diffuser or tip holder reference.",
      },
      {
        question: "Are a gas diffuser and a tip holder always the same part?",
        answer:
          "Terminology and component functions vary by torch system. Use the current parts list, connection details, photos or sample to confirm the requested component.",
      },
      {
        question: "What should be included in an MB15 nozzle inquiry?",
        answer:
          "Treat MB15 as a reference and send the existing nozzle profile, attachment, torch or neck details, adjacent consumable photos, quantity and packaging requirement for confirmation.",
      },
      {
        question: "Can nozzles and diffusers from different consumable systems be mixed?",
        answer:
          "Do not assume interchangeability. The complete front-end combination should be confirmed against the torch model, manufacturer documentation, drawing or physical sample.",
      },
    ],
    keywords: [
      "MIG gas nozzle",
      "MIG gas diffuser",
      "MIG tip holder",
      "MIG torch front end",
      "MIG consumables supplier",
    ],
  },
];
