type ProductCopyProfile = {
  purpose: string;
  selection: string;
  seoSelection: string;
  application: string;
};

export type ProductEditorialCopy = {
  shortDescription: string;
  description: string;
  metaDescription: string;
  application: string;
  profileMatched: boolean;
};

const productCopyProfiles: Record<string, ProductCopyProfile> = {
  "mig contact tip": {
    purpose:
      "replaceable torch-front consumable that guides welding wire toward the arc area and transfers welding current to the wire",
    selection: "wire diameter, thread, tip length, torch series and required material grade",
    seoSelection: "wire size, thread and torch series",
    application: "MIG/MAG torch maintenance and contact tip replacement",
  },
  "mig tip holder": {
    purpose:
      "torch-front component that supports and retains the contact tip within the current-carrying consumable assembly",
    selection:
      "torch series, holder thread, contact tip connection, overall dimensions and required finish",
    seoSelection: "torch series, thread and tip connection",
    application: "MIG/MAG torch front-end repair and consumable assembly",
  },
  "mig gas nozzle": {
    purpose:
      "torch-front consumable that directs shielding gas around the welding zone and covers the internal consumable stack",
    selection: "torch series, nozzle profile, bore, length, connection style and surface finish",
    seoSelection: "torch series, nozzle profile and connection",
    application: "MIG/MAG shielding gas delivery and gas nozzle replacement",
  },
  "mig diffuser": {
    purpose:
      "torch-front component that distributes shielding gas through the nozzle area and supports the consumable stack",
    selection: "torch series, thread, length, gas passage layout and material requirement",
    seoSelection: "torch series, thread and dimensions",
    application: "MIG/MAG torch gas distribution and diffuser replacement",
  },
  "mig torch liner": {
    purpose:
      "replaceable guide that carries welding wire from the feeder through the torch cable toward the contact tip",
    selection: "wire diameter, liner type, liner length, torch connection and feeder setup",
    seoSelection: "wire size, liner length and torch connection",
    application: "MIG/MAG wire feeding, torch maintenance and liner replacement",
  },
  "mig swan neck": {
    purpose:
      "torch assembly component that positions the front-end consumables relative to the handle and cable assembly",
    selection: "torch series, neck angle, length, front connection and cooling arrangement",
    seoSelection: "torch series, neck angle and connection",
    application: "MIG/MAG torch neck repair and front-end replacement",
  },
  "tig ceramic cup": {
    purpose:
      "heat-resistant torch consumable that directs shielding gas around the tungsten electrode and weld zone",
    selection:
      "cup number, opening size, torch series, connection style and gas lens configuration",
    seoSelection: "cup number, torch series and connection",
    application: "TIG shielding gas control and ceramic cup replacement",
  },
  "tig collet": {
    purpose:
      "torch-head consumable that grips the tungsten electrode when the TIG torch assembly is tightened",
    selection: "tungsten diameter, torch series, collet length and matching collet body",
    seoSelection: "tungsten size, torch series and collet body",
    application: "TIG tungsten holding and collet replacement",
  },
  "tig collet body": {
    purpose:
      "torch-head component that seats the collet, supports the cup assembly and forms part of the shielding gas path",
    selection: "tungsten diameter, torch series, thread and cup or gas lens configuration",
    seoSelection: "tungsten size, torch series and thread",
    application: "TIG torch-head assembly and collet body replacement",
  },
  "tig gas lens": {
    purpose:
      "torch-head consumable that distributes shielding gas through a mesh assembly before it reaches the weld zone",
    selection: "tungsten diameter, torch series, thread, gas lens type and ceramic cup style",
    seoSelection: "tungsten size, torch series and gas lens type",
    application: "TIG shielding gas distribution and gas lens replacement",
  },
  "tig back cap": {
    purpose:
      "rear torch-head component that closes the TIG torch body and secures the tungsten electrode assembly",
    selection: "torch series, cap length, thread and available rear clearance",
    seoSelection: "torch series, cap length and thread",
    application: "TIG torch-head maintenance and back cap replacement",
  },
  "tig tungsten electrode": {
    purpose:
      "non-consumable welding electrode used to establish and maintain the arc in TIG welding",
    selection:
      "electrode diameter, length, tungsten type, color identification and welding application",
    seoSelection: "diameter, tungsten type and application",
    application: "TIG arc welding and tungsten electrode supply",
  },
  "plasma electrode": {
    purpose:
      "replaceable torch consumable that forms part of the internal plasma arc circuit together with the nozzle",
    selection:
      "plasma torch model, electrode design, required cutting current and matching consumable stack",
    seoSelection: "torch model, electrode design and cutting current",
    application: "plasma cutting torch maintenance and electrode replacement",
  },
  "plasma nozzle": {
    purpose:
      "replaceable torch consumable that constricts and directs the plasma arc through the torch outlet",
    selection:
      "plasma torch model, nozzle reference, orifice, cutting current and consumable stack",
    seoSelection: "torch model, nozzle reference and cutting current",
    application: "plasma arc control and cutting nozzle replacement",
  },
  "plasma swirl ring": {
    purpose:
      "internal torch consumable that controls plasma gas flow direction and spacing within the consumable stack",
    selection: "plasma torch model, ring geometry, gas passage layout and matching consumables",
    seoSelection: "torch model, ring geometry and consumable stack",
    application: "plasma gas flow control and swirl ring replacement",
  },
  "plasma shield": {
    purpose:
      "outer torch consumable that helps protect the nozzle area and manage gas flow around the cutting zone",
    selection: "plasma torch model, shield style, reference number and cutting process",
    seoSelection: "torch model, shield style and reference",
    application: "plasma torch front-end protection and shield replacement",
  },
  "plasma retaining cap": {
    purpose:
      "torch-front component that retains the plasma consumable stack in the correct assembly position",
    selection:
      "plasma torch model, retaining method, thread, cooling arrangement and consumable stack",
    seoSelection: "torch model, thread and consumable stack",
    application: "plasma torch consumable retention and cap replacement",
  },
  "plasma cutting tip": {
    purpose:
      "replaceable torch outlet consumable used to shape and direct the plasma jet during cutting",
    selection:
      "plasma torch model, tip reference, opening, required cutting current and matching electrode",
    seoSelection: "torch model, tip reference and cutting current",
    application: "plasma cutting tip replacement and torch maintenance",
  },
  "plasma torch spacer": {
    purpose:
      "torch accessory used in suitable cutting setups to maintain physical spacing between the torch and workpiece",
    selection: "plasma torch model, mounting style, required stand-off and cutting method",
    seoSelection: "torch model, mounting style and stand-off",
    application: "plasma torch positioning and spacer replacement",
  },
  "electrode holder": {
    purpose:
      "handheld welding accessory that grips a stick electrode and connects it to the welding cable",
    selection:
      "required current rating, electrode size range, head style, cable connection and insulation design",
    seoSelection: "current rating, head style and cable connection",
    application: "MMA or stick welding electrode holding",
  },
  "welding electrode": {
    purpose:
      "coated consumable rod used as filler metal and arc carrier in manual metal arc welding",
    selection:
      "electrode classification, diameter, length, coating type, base material and welding position",
    seoSelection: "classification, diameter and welding application",
    application: "MMA or stick welding consumable supply",
  },
  "welding wire": {
    purpose:
      "continuous filler metal supplied for wire-feed welding processes and production welding programs",
    selection:
      "welding process, wire classification, alloy, diameter, spool format and shielding gas requirement",
    seoSelection: "wire classification, diameter and spool format",
    application: "MIG/MAG and wire-feed welding consumable supply",
  },
  "ground clamp": {
    purpose:
      "work-return accessory that connects the welding cable to the workpiece or welding table",
    selection: "required current rating, jaw opening, clamp construction and cable connection",
    seoSelection: "current rating, jaw opening and cable connection",
    application: "welding work-return connection and workshop replacement",
  },
  "welding cable connector": {
    purpose:
      "removable electrical connector used between welding cable, equipment and compatible accessories",
    selection:
      "connector interface, cable cross-section, plug or socket format and equipment receptacle",
    seoSelection: "connector interface, cable size and plug format",
    application: "welding cable assembly and equipment connection",
  },
  "welding cable": {
    purpose:
      "flexible insulated conductor used to carry welding current between the power source and welding accessories",
    selection:
      "conductor cross-section, cable length, jacket requirement and connector configuration",
    seoSelection: "cable size, length and connector configuration",
    application: "welding power cable assembly and workshop replacement",
  },
  "dinse connector": {
    purpose:
      "twist-lock welding cable connector used for removable power connections on compatible equipment",
    selection: "connector size, interface, cable cross-section and plug or socket requirement",
    seoSelection: "connector size, cable size and plug format",
    application: "welding cable connection and equipment maintenance",
  },
  "welding magnet": {
    purpose:
      "magnetic positioning accessory used to hold ferrous workpieces during fit-up and tack welding",
    selection: "required angle, holding force, magnet size and workpiece arrangement",
    seoSelection: "angle, holding force and magnet size",
    application: "metal fabrication fit-up and welding positioning",
  },
};

const fallbackProfiles: Record<string, ProductCopyProfile> = {
  "mig-mag-torch-parts": {
    purpose:
      "replacement component supplied for MIG/MAG torch maintenance and distributor programs",
    selection: "torch series, dimensions, connection, material and matching consumables",
    seoSelection: "torch series, dimensions and connection",
    application: "MIG/MAG torch maintenance and replacement",
  },
  "tig-torch-parts": {
    purpose: "replacement component supplied for TIG torch maintenance and distributor programs",
    selection: "torch series, tungsten size, dimensions, connection and matching consumables",
    seoSelection: "torch series, tungsten size and connection",
    application: "TIG torch maintenance and replacement",
  },
  "plasma-cutting-consumables": {
    purpose: "replacement component supplied for plasma cutting torch maintenance programs",
    selection: "torch model, reference number, cutting current and matching consumable stack",
    seoSelection: "torch model, reference and cutting current",
    application: "plasma cutting torch maintenance and replacement",
  },
  "welding-consumables": {
    purpose: "industrial consumable supplied for welding production and maintenance requirements",
    selection: "process, material classification, size, package and application",
    seoSelection: "process, classification and size",
    application: "industrial welding consumable supply",
  },
  "welding-machines": {
    purpose: "industrial equipment item supplied for welding or cutting applications",
    selection: "process, input supply, output requirement, duty cycle and accessory scope",
    seoSelection: "process, power supply and output requirement",
    application: "industrial welding and cutting equipment supply",
  },
  "welding-accessories": {
    purpose:
      "workshop accessory supplied for welding equipment connection, maintenance or handling",
    selection: "equipment interface, size, material, required rating and application",
    seoSelection: "interface, size and application",
    application: "welding workshop maintenance and accessory supply",
  },
};

function normalizeProductName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function createMetaDescription(name: string, profile: ProductCopyProfile) {
  const detailedDescription = `Request ${name} quotation from ArcFort Weld. Confirm ${profile.seoSelection} by sample, drawing or model reference.`;

  if (detailedDescription.length <= 160) {
    return detailedDescription;
  }

  return `Request ${name} quotation from ArcFort Weld. Send a product reference, quantity and packing requirements for B2B supply.`;
}

export function createProductEditorialCopy(
  name: string,
  baseProductName: string,
  categorySlug: string,
): ProductEditorialCopy {
  const exactProfile = productCopyProfiles[normalizeProductName(baseProductName)];
  const profile =
    exactProfile ?? fallbackProfiles[categorySlug] ?? fallbackProfiles["welding-accessories"];

  const shortDescription = `${name} for ${profile.application}. Compatibility and ordering details can be confirmed by sample, drawing or model reference.`;
  const description = `${name} is a ${profile.purpose}. It is supplied for ${profile.application} in distributor, importer, repair workshop and OEM sourcing programs. Because industrial welding products can vary by model, size, material and application, buyers should confirm ${profile.selection} using an existing part, drawing, product photo or model reference before quotation. This review helps the sales team check the requested item without publishing unverified compatibility or technical specifications. ArcFort Weld can review mixed product lists and discuss standard export packing, small trial orders for standard items, and logo or private-label packaging when quantity and artwork requirements are available. Send the required quantity and destination country to receive MOQ, lead time and delivery options.`;
  const metaDescription = createMetaDescription(name, profile);

  return {
    shortDescription,
    description,
    metaDescription,
    application: profile.application,
    profileMatched: Boolean(exactProfile),
  };
}
