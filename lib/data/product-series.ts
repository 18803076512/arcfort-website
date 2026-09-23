import type { ProductSeries } from "../content/schemas.ts";
import { getProductSeriesReferencesForEvidence } from "../content/compatibility.ts";
import {
  getProductSeriesEvidenceById,
  fifteenAkSeriesEvidence,
} from "./product-series-evidence.ts";
import { getProductSeriesPublicationIssues } from "../content/product-series-publication.ts";
import { compatibilityRelationships } from "./compatibility-relationships.ts";
import { productImageAssets } from "./product-image-assets.ts";
import { arcfortProducts } from "./products.ts";

export const fifteenAkSeriesCandidate: ProductSeries = {
  evidenceId: fifteenAkSeriesEvidence.id,
  slug: "15ak-mig-mag-torch-parts",
  name: "15AK MIG/MAG Torch Parts",
  shortName: "15AK Series",
  categorySlug: "mig-mag-torch-parts",
  process: "MIG/MAG",
  description:
    "Review 15AK catalog-reference torch-front parts across documented air-valve and standard complete-torch arrangements.",
  overview:
    "The Renqiu Ailesen company catalog documents two 15AK sourcing arrangements: an air-valve torch and a standard complete torch. This page separates their assembly paths while linking only the currently governed public product records. A series name narrows the review but does not prove universal fit, so buyers should provide the torch label, installed component stack, sample, drawing or measured reference before ordering.",
  seoTitle: "15AK MIG/MAG Torch Parts & Consumables",
  seoDescription:
    "Review 15AK MIG/MAG torch parts for documented air-valve and standard arrangements. Compare component groups and send model evidence for RFQ.",
  keywords: [
    "15AK MIG torch parts",
    "15AK contact tip",
    "15AK gas nozzle",
    "15AK tip holder",
    "15AK air valve torch parts",
    "MIG/MAG torch consumables",
  ],
  referenceFamilyName: fifteenAkSeriesEvidence.name,
  documentedComponents: fifteenAkSeriesEvidence.documentedComponents,
  assemblyReferences: [
    {
      id: "air-valve-arrangement",
      name: "Air-Valve Torch Arrangement",
      sourceLabel: "Company catalog pages 7-8",
      description:
        "The company catalog separates an air-valve torch arrangement with valve, air-line, switch-line, liner and cable references alongside the torch-front consumables.",
      componentGroups: [
        "Complete air-valve torch",
        "Nozzle and contact-tip options",
        "Contact tip holder and insulator",
        "Swan neck and hexagon nut",
        "Air valve, air line and switch line",
        "Torch liner and cable assembly",
      ],
      buyerCheck:
        "Confirm the air-valve handle, valve and line connections from the complete torch. Do not select a replacement from the front-end appearance alone.",
    },
    {
      id: "standard-complete-torch-arrangement",
      name: "Standard Complete-Torch Arrangement",
      sourceLabel: "Company catalog pages 9-10",
      description:
        "The standard arrangement follows a rear-handle and Euro-connector path with cable support, connector hardware and separate liner references.",
      componentGroups: [
        "Complete MIG/MAG torch",
        "Nozzle and contact-tip options",
        "Holder spring, holder and insulator",
        "Swan neck and cable-support spring",
        "Rear handle and adaptor nut",
        "Euro connector, connector nut and liner",
      ],
      buyerCheck:
        "Confirm the rear handle, machine-side connector and front-end component order on the same torch before requesting a replacement.",
    },
  ],
  buyerCheck: fifteenAkSeriesEvidence.buyerCheck,
  compatibilityStatement:
    "15AK is used here as a company-catalog reference family. Final fit must be confirmed from the exact torch label, component stack, connection details, drawing, approved sample or verified reference number.",
  productReferences: getProductSeriesReferencesForEvidence(fifteenAkSeriesEvidence.id),
  heroProductSlug: "mig-contact-tip-m6-1-0mm",
  selectionVariables: [
    {
      label: "Exact torch label",
      whyItMatters:
        "A 15AK trade reference can cover more than one documented arrangement and does not identify every connection by itself.",
      confirmationMethod:
        "Photograph the complete torch label and provide the machine-side connection when a complete torch or cable assembly is required.",
    },
    {
      label: "Contact-tip wire size and thread",
      whyItMatters:
        "Wire bore, thread and overall geometry must match the tip holder and the welding-wire requirement.",
      confirmationMethod:
        "Provide the visible tip marking, measured approved sample, drawing or purchasing reference.",
    },
    {
      label: "Nozzle profile and opening",
      whyItMatters:
        "The company catalog shows multiple nozzle profiles and openings inside the 15AK reference group.",
      confirmationMethod:
        "Send front and side photographs, the opening measurement and the existing nozzle or drawing.",
    },
    {
      label: "Complete front-end stack",
      whyItMatters:
        "The nozzle, contact tip, holder, spring or insulator and swan neck must be reviewed as a connected assembly.",
      confirmationMethod:
        "Lay removed parts in installation order and photograph both ends of every connection before quotation.",
    },
  ],
  confirmationChecklist: [
    "Photograph the complete torch and its label before removing any front-end parts.",
    "Lay out the nozzle, contact tip, holder and spring or insulator in installation order.",
    "Record the wire size, visible markings and only dimensions measured from an approved sample.",
    "Show connection threads, seating surfaces and the swan-neck side of the assembly clearly.",
    "Approve the matched sample, drawing or complete component stack before repeat purchasing.",
  ],
  rfqFields: [
    "Torch label and model reference",
    "Required component names and quantities",
    "Wire diameter and visible contact-tip marking",
    "Front, side and connection photographs",
    "Measured sample or drawing when available",
    "Packaging requirement and destination country",
  ],
  applications: [
    "MIG/MAG torch maintenance",
    "Repair workshop replacement programs",
    "Distributor consumable assortments",
    "OEM and private-label torch-part sourcing",
  ],
  relatedGuideSlugs: [
    "mig-torch-front-end-parts-identification",
    "mig-contact-tip-size-thread-selection",
    "mig-gas-nozzle-diffuser-selection-guide",
  ],
  faq: [
    {
      question: "Does the 15AK series name confirm that every listed part will fit my torch?",
      answer:
        "No. The series name organizes company-catalog references. Final fit should be checked from the exact torch label, installed component stack, drawing, approved sample or verified reference number.",
    },
    {
      question: "What should I send for a 15AK contact-tip quotation?",
      answer:
        "Send the wire diameter, thread or visible marking, required quantity, torch label and a clear photograph or approved sample. A drawing or measured reference is useful when overall geometry matters.",
    },
    {
      question: "Can different 15AK gas nozzle profiles be reviewed?",
      answer:
        "Yes. The company catalog shows multiple nozzle profile references. Send the existing nozzle, side and front photographs, opening measurement and connection details so the requested version can be reviewed.",
    },
    {
      question: "How do I identify which documented 15AK arrangement I have?",
      answer:
        "Photograph the complete torch, handle and machine-side termination before removing parts. An air-valve arrangement should be reviewed from its valve and line connections, while the standard arrangement should be checked from the rear handle, connector path and complete front-end stack.",
    },
    {
      question: "Is OEM packaging available for 15AK torch parts?",
      answer:
        "Logo, private-label packaging and carton design can be discussed after the exact parts, quantities, artwork and packing requirements are confirmed.",
    },
  ],
  catalogUrl: fifteenAkSeriesEvidence.catalogUrl,
  sourceType: fifteenAkSeriesEvidence.sourceType,
  sourceReference: fifteenAkSeriesEvidence.sourceReference,
  sourceLevel: fifteenAkSeriesEvidence.sourceLevel,
  verificationStatus: fifteenAkSeriesEvidence.verificationStatus,
  reviewedBy: fifteenAkSeriesEvidence.reviewedBy,
  reviewedDate: fifteenAkSeriesEvidence.reviewedDate,
};

export const productSeriesCandidates: ProductSeries[] = [fifteenAkSeriesCandidate];

export const productSeries: ProductSeries[] = productSeriesCandidates.filter((series) => {
  const evidence = getProductSeriesEvidenceById(series.evidenceId);

  if (!evidence) {
    return false;
  }

  return (
    getProductSeriesPublicationIssues({
      series,
      evidence,
      products: arcfortProducts,
      imageAssets: productImageAssets,
      relationships: compatibilityRelationships,
    }).length === 0
  );
});
