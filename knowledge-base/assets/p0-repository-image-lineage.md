# P0 Repository Image Lineage

Date: 2026-08-25

## Purpose

Identify whether the four unresolved P0 public main images were copied or re-encoded from files that
still exist elsewhere in the repository. This narrows the file search; it does not identify the
original photographer, owner, supplier, exact product variant or permitted website use.

## Method

The audit compared Git blob SHA-1 identifiers for byte identity. It also used normalized pixel
comparison to locate likely matches after the three contact-tip files were re-exported from PNG
content to real JPEG encoding.

## Findings

| Public asset                                                      | Repository candidate                   | Reproducible evidence                                                    | Result                         |
| ----------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------ | ------------------------------ |
| AF-MIG-CT-0004 main image before the 2026-08-25 format correction | `/images/products/mig-contact-tip.jpg` | Git blob `1876a63cce63de1ba2626d865950a9e13e2bceb1` at commit `1c3fdca2` | Byte-identical repository copy |
| AF-MIG-CT-0005 main image before the 2026-08-25 format correction | `/images/products/mig-contact-tip.jpg` | Git blob `1876a63cce63de1ba2626d865950a9e13e2bceb1` at commit `1c3fdca2` | Byte-identical repository copy |
| AF-MIG-CT-0006 main image before the 2026-08-25 format correction | `/images/products/mig-contact-tip.jpg` | Git blob `1876a63cce63de1ba2626d865950a9e13e2bceb1` at commit `1c3fdca2` | Byte-identical repository copy |
| AF-MIG-GN-0008 current main image                                 | `/images/products/mig-gas-nozzle.jpg`  | Git blob `756d8bd608a3fed0cd83d0cf51f71bcecfebe674`                      | Byte-identical repository copy |

The three current contact-tip JPEG files remain visual derivatives of the same repository candidate,
but the historical blob is used for the exact byte-identity statement because the controlled
format correction changed their encoding.

## Evidence Boundary

These findings prove only repository file lineage. They do not prove:

- Who created, owns or supplied either candidate file.
- Whether ArcFort Weld has website or marketing usage rights.
- Whether the contact-tip image distinguishes 0.8 mm, 1.0 mm and 1.2 mm variants.
- Whether the nozzle image is the exact AF-MIG-GN-0008 supplied variant.
- Any model, compatibility, material, dimension or performance claim.

The corresponding assets therefore remain `unknown`, `needs_confirmation`,
`product_family_reference` and `legacy_reference`. The local candidates remain `unverified` and
`needs_review`.

## Required Resolution

1. Identify the original file owner and first source.
2. Record the explicit website-use basis.
3. Compare each image with a labeled physical SKU, controlled drawing or approved sample.
4. Replace shared family images with variant-specific views when the variants are visually distinct.
5. Record reviewer and ISO review date before any status upgrade.
