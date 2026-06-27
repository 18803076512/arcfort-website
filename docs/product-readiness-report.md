# Product Readiness Report

Generated from `data/import/products.csv` at 2026-06-27T04:17:25.159Z.

This report is an internal working checklist. Do not use it to invent product specifications, certifications, prices, stock status, factory capacity or confirmed compatibility.

## Summary

- Products checked: 30
- Products with confirmed data status: 0
- Products with own-photo image status: 0
- Products with confirmed compatibility status: 0
- Products with confirmed OEM status: 0
- Missing main images: 0
- Missing gallery images: 0
- Products with high-priority placeholder fields: 30

## Data Status

- needs_review: 30

## Image Status

- placeholder: 30

## Compatibility Status

- unverified: 30

## OEM Status

- unknown: 30

## Missing Main Images

No items found.

## Missing Gallery Images

No items found.

## High-Priority Placeholder Fields

| SKU | Product | Fields To Confirm |
| --- | --- | --- |
| AF-MIG-CT-0004 | MIG Contact Tip M6 0.8mm | compatible_brand, oem_number, package |
| AF-MIG-CT-0005 | MIG Contact Tip M6 1.0mm | compatible_brand, oem_number, package |
| AF-MIG-CT-0006 | MIG Contact Tip M6 1.2mm | compatible_brand, oem_number, package |
| AF-MIG-TH-0007 | MIG Tip Holder for MB15 | size, thread, compatible_brand, oem_number, package |
| AF-MIG-GN-0008 | MIG Gas Nozzle for MB15 | size, thread, compatible_brand, oem_number, package |
| AF-MIG-DF-0003 | MIG Diffuser | size, thread, compatible_brand, oem_number, package |
| AF-MIG-TL-0009 | MIG Torch Liner | material, size, thread, compatible_brand, oem_number, package |
| AF-MIG-SN-0010 | MIG Swan Neck | material, size, thread, compatible_brand, oem_number, package |
| AF-TIG-CC-0007 | TIG Ceramic Cup #5 | thread, compatible_brand, oem_number, package |
| AF-TIG-CC-0008 | TIG Ceramic Cup #6 | thread, compatible_brand, oem_number, package |
| AF-TIG-CL-0009 | TIG Collet | size, thread, compatible_brand, oem_number, package |
| AF-TIG-CB-0005 | TIG Collet Body | size, thread, compatible_brand, oem_number, package |
| AF-TIG-GL-0010 | TIG Gas Lens 1.6mm | thread, compatible_brand, oem_number, package |
| AF-TIG-BC-0011 | TIG Back Cap | material, size, thread, compatible_brand, oem_number, package |
| AF-TIG-TE-0012 | TIG Tungsten Electrode | material, size, thread, compatible_brand, compatible_model, oem_number, package |
| AF-PLA-EL-0007 | Plasma Electrode | material, size, thread, compatible_brand, oem_number, package |
| AF-PLA-NZ-0008 | Plasma Nozzle | material, size, thread, compatible_brand, oem_number, package |
| AF-PLA-SR-0009 | Plasma Swirl Ring | material, size, thread, compatible_brand, oem_number, package |
| AF-PLA-SH-0010 | Plasma Shield | material, size, thread, compatible_brand, oem_number, package |
| AF-PLA-RC-0011 | Plasma Retaining Cap | material, size, thread, compatible_brand, oem_number, package |
| AF-PLA-CT-0012 | Plasma Cutting Tip | material, size, thread, compatible_brand, oem_number, package |
| AF-PLA-TS-0013 | Plasma Torch Spacer | material, size, thread, compatible_brand, oem_number, package |
| AF-CON-EH-0010 | Electrode Holder | material, size, thread, compatible_brand, compatible_model, oem_number, package |
| AF-CON-EL-0011 | Welding Electrode | material, size, thread, compatible_brand, compatible_model, oem_number, package |
| AF-CON-WW-0012 | Welding Wire | material, size, thread, compatible_brand, compatible_model, oem_number, package |
| AF-ACC-GC-0011 | Ground Clamp | material, size, thread, compatible_brand, compatible_model, oem_number, package |
| AF-ACC-CC-0012 | Welding Cable Connector | material, size, thread, compatible_brand, compatible_model, oem_number, package |
| AF-ACC-WC-0013 | Welding Cable | material, size, thread, compatible_brand, compatible_model, oem_number, package |
| AF-ACC-DC-0014 | Dinse Connector | material, size, thread, compatible_brand, compatible_model, oem_number, package |
| AF-ACC-WM-0015 | Welding Magnet | material, size, thread, compatible_brand, compatible_model, oem_number, package |

## Next Actions

1. Replace missing main images with white-background product photos named exactly as the CSV image paths.
2. Confirm high-priority product fields from samples, drawings, factory data or supplier catalogs.
3. Change `data_status`, `image_status`, `compatibility_status` and `oem_status` only when the supporting data is actually confirmed.
4. Run `npm run products:report`, `npm run products:validate`, `npm run products:check-images` and `npm run build` before publishing SKU updates.
