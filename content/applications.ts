import { roboticMigTorchApplicationResourceSection } from "../lib/content/buyer-resource-links.ts";
import type { ApplicationPage } from "../lib/content/schemas.ts";

export const applications: ApplicationPage[] = [
  {
    slug: "shipbuilding",
    title: "Shipbuilding Welding Parts",
    seoTitle: "Shipbuilding Welding Parts and Cutting Consumables",
    description:
      "Welding and plasma cutting consumables for shipbuilding repair, fabrication and maintenance sourcing programs.",
    seoDescription:
      "Explore ArcFort Weld welding torch parts, plasma cutting consumables and accessories for shipbuilding-related sourcing and RFQ preparation.",
    overview:
      "Shipbuilding buyers often need organized consumable lists for welding, repair and cutting workflows. Product fit, packaging, MOQ and delivery must be confirmed before quotation.",
    industries: ["Ship repair", "Marine fabrication", "Steel structure workshops"],
    buyerNeeds: [
      "Repeat consumable supply for welding and cutting work",
      "Clear product lists by torch model or reference number",
      "RFQ support for mixed welding parts and plasma consumables",
    ],
    operatingContext: [
      "Steel fabrication and repair work using welding and plasma cutting product families",
      "Repeat replacement of torch-front consumables during maintenance purchasing",
      "Mixed welding, cutting and workshop-accessory lists prepared by vessel, workshop or order",
    ],
    selectionConsiderations: [
      {
        label: "Process and installed equipment",
        guidance:
          "State the welding or cutting process, torch or machine model and the current component reference when available.",
      },
      {
        label: "Consumable identity",
        guidance:
          "Keep electrodes, nozzles, shields, contact tips and related stack components in installation order for review.",
      },
      {
        label: "Working and documentation requirements",
        guidance:
          "Provide buyer drawings, approved specifications and any project documentation requirement with the RFQ.",
      },
      {
        label: "Repeat-order control",
        guidance:
          "Separate trial quantities from repeat quantities and retain the approved product, label and packing reference.",
      },
    ],
    rfqFields: [
      "Shipyard, vessel-repair or fabrication work scope",
      "Welding or cutting process and installed torch or machine reference",
      "Product list, existing part numbers, drawings or arranged sample photos",
      "Quantity by item, trial or repeat-order plan and packaging requirement",
      "Destination country and required buyer documentation",
    ],
    relatedCategorySlugs: [
      "mig-mag-torch-parts",
      "plasma-cutting-consumables",
      "welding-accessories",
    ],
    relatedProductSlugs: [
      "mig-contact-tip-m6-0-8mm",
      "plasma-electrode",
      "mig-gas-nozzle-for-mb15",
    ],
    faq: [
      {
        question: "What should shipbuilding buyers include in an RFQ?",
        answer:
          "Include product list, torch models, reference numbers, drawings, quantities, packaging needs and destination country.",
      },
      {
        question: "Are shipbuilding certifications listed?",
        answer:
          "No certifications are invented. Any certification requirement must be confirmed with official documents.",
      },
    ],
    keywords: [
      "shipbuilding welding parts",
      "marine welding consumables",
      "plasma cutting consumables",
    ],
  },
  {
    slug: "automotive",
    title: "Automotive Welding Consumables",
    seoTitle: "Automotive Welding Consumables and Torch Parts",
    description:
      "MIG/MAG, TIG and accessory sourcing support for automotive repair, fabrication and production supply channels.",
    seoDescription:
      "Browse automotive welding consumable sourcing content for MIG/MAG torch parts, TIG parts and welding accessories.",
    overview:
      "Automotive welding buyers often compare consumable fit, repeat-order stability and packaging needs across repair, fabrication and automated production maintenance. Robotic MIG/MAG torch front ends require installed-cell, interface and consumable evidence before a replacement can be reviewed.",
    industries: ["Automotive repair", "Parts fabrication", "Automated welding cell maintenance"],
    buyerNeeds: [
      "MIG/MAG torch consumables for repeat replacement",
      "Robotic welding torch front-end evidence for automated cell maintenance",
      "Accessory lists for workshop maintenance",
      "Packaging and quantity details for distributor programs",
    ],
    operatingContext: [
      "Repair and body-work purchasing for manual welding equipment",
      "Parts fabrication using repeat torch consumables and workshop accessories",
      "Automated welding-cell maintenance where installed interfaces must be documented",
    ],
    selectionConsiderations: [
      {
        label: "Manual or automated use",
        guidance:
          "Identify whether the request is for a hand torch, repair workshop or robotic welding-cell replacement.",
      },
      {
        label: "Installed torch reference",
        guidance:
          "Provide the torch label, connection photos, front-end component stack and approved drawing when available.",
      },
      {
        label: "Replacement scope",
        guidance:
          "Separate complete torch, neck, cable package, loose consumables and workshop accessories by line item.",
      },
      {
        label: "Trial and repeat supply",
        guidance:
          "Record the approved trial item before releasing larger repeat or distributor quantities.",
      },
    ],
    rfqFields: [
      "Repair, fabrication or automated-cell application",
      "Installed welding equipment and torch model or label",
      "Required product scope and current component stack",
      "Interface drawing, connection photos, sample or existing part reference",
      "Trial quantity, repeat quantity, packaging and destination country",
    ],
    relatedCategorySlugs: ["mig-mag-torch-parts", "tig-torch-parts", "welding-accessories"],
    relatedProductSlugs: [
      "mig-contact-tip-m6-0-8mm",
      "mig-gas-nozzle-for-mb15",
      "robot-welding-torch",
    ],
    buyerResourceSection: roboticMigTorchApplicationResourceSection,
    faq: [
      {
        question: "Can automotive buyers request mixed welding consumables?",
        answer:
          "Yes. Mixed product lists can be submitted through the RFQ form with quantity and packaging requirements.",
      },
      {
        question: "Can ArcFort Weld confirm compatibility by torch model?",
        answer:
          "Compatibility can be reviewed when buyers provide torch model, reference number, drawing or reference part details.",
      },
      {
        question: "What should an automotive robotic torch replacement inquiry include?",
        answer:
          "Send the welding-cell reference, installed torch label, photos of both connection ends, approved interface or neck drawing, cooling and cable references, consumable stack and trial quantity.",
      },
    ],
    keywords: [
      "automotive welding consumables",
      "MIG/MAG torch parts",
      "robotic MIG welding torch",
      "welding wire",
    ],
  },
  {
    slug: "pipeline",
    title: "Pipeline Welding Solutions",
    seoTitle: "Pipeline Welding Consumables and Accessories",
    description:
      "Welding consumable and accessory sourcing content for pipeline construction, maintenance and repair RFQs.",
    seoDescription:
      "Prepare pipeline welding RFQs with welding consumables, accessories and confirmed technical requirements for B2B sourcing.",
    overview:
      "Pipeline-related inquiries should be based on confirmed process, material, quantity, application and project requirements. Open technical points can be evaluated against the buyer's drawing, sample or project requirements before quotation.",
    industries: ["Pipeline construction", "Field repair", "Industrial maintenance"],
    buyerNeeds: [
      "Consumable sourcing by process and application",
      "Accessory and clamp support for field work",
      "Clear RFQ details for delivery planning",
    ],
    operatingContext: [
      "Construction and maintenance requests governed by buyer welding procedures and project requirements",
      "Field-repair purchasing where equipment, accessories and consumables must be listed separately",
      "Replacement and replenishment orders that require clear destination and delivery planning",
    ],
    selectionConsiderations: [
      {
        label: "Buyer welding procedure",
        guidance:
          "Provide the approved process, base-material requirement and consumable specification instead of selecting from appearance.",
      },
      {
        label: "Field equipment",
        guidance:
          "Identify the installed power source, torch, holder, cable or connector references included in the request.",
      },
      {
        label: "Project controls",
        guidance:
          "Attach buyer drawings, required standards and document lists; ArcFort Weld does not infer project compliance.",
      },
      {
        label: "Order breakdown",
        guidance:
          "Separate consumables, accessories, equipment and spare quantities so the quotation scope is clear.",
      },
    ],
    rfqFields: [
      "Pipeline construction, maintenance or repair scope",
      "Approved welding process and buyer consumable requirement",
      "Installed equipment, torch and accessory references",
      "Drawings, project specifications and required document list",
      "Quantity by line item, destination and delivery requirement",
    ],
    relatedCategorySlugs: ["welding-consumables", "welding-accessories", "welding-machines"],
    relatedProductSlugs: ["tig-gas-lens-1-6mm", "tig-ceramic-cup-6", "plasma-electrode"],
    faq: [
      {
        question: "Can pipeline applications be quoted without confirmed specs?",
        answer:
          "A preliminary RFQ can be reviewed, but final quotation requires confirmed product and application details.",
      },
      {
        question: "Should project standards be included?",
        answer:
          "Yes. Any required standards, documents or buyer specifications should be included in the RFQ.",
      },
    ],
    keywords: ["pipeline welding consumables", "pipeline welding accessories", "welding RFQ"],
  },
  {
    slug: "metal-fabrication",
    title: "Metal Fabrication Welding Parts",
    seoTitle: "Metal Fabrication Welding Parts and Plasma Consumables",
    description:
      "MIG/MAG torch parts, plasma cutting consumables and welding accessories for metal fabrication sourcing.",
    seoDescription:
      "Explore welding and cutting consumable content for metal fabrication shops, distributors and industrial users.",
    overview:
      "Fabrication shops need stable welding and cutting consumables for daily use. Product dimensions, compatibility and packaging should be confirmed before quotation.",
    industries: ["Fabrication shops", "Steel processing", "Industrial workshops"],
    buyerNeeds: [
      "MIG/MAG torch replacement parts",
      "Plasma electrode and nozzle sourcing",
      "Workshop accessory and clamp product lists",
    ],
    operatingContext: [
      "Daily workshop welding and cutting with repeat consumable replacement",
      "Mixed MIG/MAG, TIG and plasma purchasing across fabrication workstations",
      "Maintenance and distributor replenishment lists organized by installed equipment",
    ],
    selectionConsiderations: [
      {
        label: "Process mix",
        guidance:
          "List each welding and cutting process separately with the installed torch or machine reference.",
      },
      {
        label: "Front-end geometry",
        guidance:
          "Confirm thread, size, visible profile and assembly relationship from a drawing, sample or measured reference.",
      },
      {
        label: "Consumption pattern",
        guidance:
          "Separate high-frequency consumables from occasional maintenance parts and workshop accessories.",
      },
      {
        label: "Packing plan",
        guidance:
          "State trial quantity, repeat quantity and any item labeling or private-label requirement.",
      },
    ],
    rfqFields: [
      "Fabrication process and workstation or equipment reference",
      "Product name, model, size, thread or current part number",
      "Drawing, sample photo or parts arranged in assembly order",
      "Quantity by item and expected repeat-purchase pattern",
      "Packaging, labeling and destination country",
    ],
    relatedCategorySlugs: [
      "mig-mag-torch-parts",
      "plasma-cutting-consumables",
      "welding-accessories",
    ],
    relatedProductSlugs: ["mig-contact-tip-m6-1-0mm", "plasma-nozzle", "tig-ceramic-cup-5"],
    faq: [
      {
        question: "Can fabrication shops submit product photos?",
        answer:
          "Photos can help initial review, but drawings, reference parts or reference numbers are recommended for accurate quotation.",
      },
      {
        question: "Can plasma parts and MIG parts be quoted together?",
        answer: "Yes. Buyers can send a combined RFQ list for welding and cutting consumables.",
      },
    ],
    keywords: ["metal fabrication welding parts", "plasma consumables", "MIG parts"],
  },
  {
    slug: "construction",
    title: "Construction Welding Accessories",
    seoTitle: "Construction Welding Accessories and Consumables",
    description:
      "Welding accessories, consumables and cutting parts for construction-related sourcing and maintenance channels.",
    seoDescription:
      "Prepare construction welding accessory RFQs for clamps, holders, consumables and cutting parts with confirmed requirements.",
    overview:
      "Construction buyers often need practical welding accessories and consumables for site work and maintenance. RFQs should include product list, quantity and delivery market.",
    industries: ["Construction steelwork", "Site maintenance", "Installation teams"],
    buyerNeeds: [
      "Accessory and clamp supply for site workflows",
      "Consumables for welding and cutting maintenance",
      "Packaging and delivery details for project purchasing",
    ],
    operatingContext: [
      "Structural steelwork and installation purchasing for workshop or site use",
      "Maintenance orders combining holders, clamps, cables and replaceable consumables",
      "Project supply lists that require product, packing and delivery scope to be separated",
    ],
    selectionConsiderations: [
      {
        label: "Workshop or site use",
        guidance:
          "State the working environment and buyer-approved equipment requirement for each requested item.",
      },
      {
        label: "Cable and connection details",
        guidance:
          "Provide connector type, existing cable reference, holder or clamp photos and verified dimensions when relevant.",
      },
      {
        label: "Consumable fit",
        guidance:
          "Use the torch or machine model, drawing, current part and assembly photos to review replacement products.",
      },
      {
        label: "Project delivery scope",
        guidance:
          "Separate product lines, quantities, packing, destination and required buyer documents before quotation.",
      },
    ],
    rfqFields: [
      "Structural, installation or maintenance application",
      "Workshop or site-use requirement and installed equipment",
      "Accessory, cable, connector and consumable product list",
      "Photos, drawings, verified dimensions or existing part references",
      "Quantity, packaging, destination and buyer document requirement",
    ],
    relatedCategorySlugs: [
      "welding-accessories",
      "welding-consumables",
      "plasma-cutting-consumables",
    ],
    relatedProductSlugs: ["plasma-electrode", "plasma-nozzle", "mig-contact-tip-m6-1-2mm"],
    faq: [
      {
        question: "Can construction buyers request accessories in bulk?",
        answer:
          "Yes. Bulk accessory inquiries can be reviewed when quantity, packaging and product details are provided.",
      },
      {
        question: "Are delivery times listed?",
        answer:
          "Lead time depends on product details, order quantity, packaging requirements and current production schedule.",
      },
    ],
    keywords: ["construction welding accessories", "welding clamps", "welding consumables"],
  },
  {
    slug: "repair-workshop",
    title: "Repair Workshop Welding Supplies",
    seoTitle: "Repair Workshop Welding Supplies and Torch Consumables",
    description:
      "Welding torch consumables, accessories and plasma cutting consumables for repair workshops and maintenance buyers.",
    seoDescription:
      "Source repair workshop welding supplies including MIG/MAG parts, TIG parts, accessories and plasma cutting consumables.",
    overview:
      "Repair workshops often need broad but practical product coverage. ArcFort Weld pages are structured so buyers can prepare mixed RFQ lists with confirmed details.",
    industries: ["Repair workshops", "Maintenance teams", "Distributor counters"],
    buyerNeeds: [
      "Mixed consumable and accessory product lists",
      "Replacement parts by reference part, photo or reference number",
      "Repeat purchasing support for common workshop items",
    ],
    operatingContext: [
      "Repair and maintenance work involving several welding or cutting processes",
      "Unknown replacement parts that must be identified from the installed assembly",
      "Counter or workshop replenishment orders containing mixed low-volume product lines",
    ],
    selectionConsiderations: [
      {
        label: "Identify before matching",
        guidance:
          "Photograph the complete torch or tool, its label and the removed components in assembly order.",
      },
      {
        label: "Record measurable details",
        guidance:
          "Provide visible markings, thread, overall size and connection details from verified measurements or drawings.",
      },
      {
        label: "Separate process families",
        guidance:
          "Keep MIG/MAG, TIG, plasma, machine and general accessory items on separate RFQ lines.",
      },
      {
        label: "Control repeat orders",
        guidance:
          "Retain the approved SKU, sample, image and package reference after the first item is confirmed.",
      },
    ],
    rfqFields: [
      "Repair process and installed torch, machine or tool",
      "Complete product and label photos plus removed parts in assembly order",
      "Visible markings, drawings, verified dimensions or sample reference",
      "Quantity by item, trial or repeat-order requirement",
      "Packaging preference and destination country",
    ],
    relatedCategorySlugs: ["mig-mag-torch-parts", "tig-torch-parts", "welding-accessories"],
    relatedProductSlugs: [
      "mig-gas-nozzle-for-mb15",
      "tig-ceramic-cup-5",
      "mig-tip-holder-for-mb15",
    ],
    faq: [
      {
        question: "Can repair workshops send mixed product lists?",
        answer:
          "Yes. The RFQ form is prepared for mixed lists, drawings, photos, reference part notes and quantities.",
      },
      {
        question: "Can compatibility be checked before quotation?",
        answer:
          "Compatibility can be reviewed when torch models, photos, reference parts or reference numbers are provided.",
      },
    ],
    keywords: ["repair workshop welding supplies", "torch consumables", "welding accessories"],
  },
];
