# Product Image Asset Report

Generated from `data/assets/product-image-assets.csv`. This is an internal evidence and replacement queue; it is not a claim that migrated images are exact-product or rights-approved assets.

## Executive Summary

- Products covered: 43
- Registered image assets: 46
- Main images: 43
- Gallery images: 3
- Existing registered files: 46
- Search-eligible exact assets: 0
- Legacy public reference assets: 43
- Blocked assets: 3
- Company-owned photos: 0
- Exact-product matches: 0
- Assets with approved usage rights: 0
- Assets with unknown source: 9
- Assets below 1000 px on at least one side: 38
- Assets below 600 px on at least one side: 1
- Assets whose extension does not match file content: 3
- Duplicate-content groups: 2
- Unassigned files in `public/images/products/`: 73

`legacy_reference` preserves an already published buyer-facing image during migration. It does not approve copyright, prove an exact variant, or authorize reuse outside the current site. New images should reach `search_eligible` only after source, rights, exact-product match, reviewer and review date are recorded.

## Registry States

### Publication Status

| State            | Assets |
| ---------------- | -----: |
| blocked          |      3 |
| legacy_reference |     43 |

### Source Kind

| State                  | Assets |
| ---------------------- | -----: |
| company_catalog_crop   |     14 |
| local_supplier_archive |     23 |
| unknown                |      9 |

### Ownership Status

| State                   | Assets |
| ----------------------- | -----: |
| company_document        |     14 |
| supplier_or_third_party |     23 |
| unknown                 |      9 |

### Usage Rights

| State              | Assets |
| ------------------ | -----: |
| needs_confirmation |     46 |

### Content Match

| State                    | Assets |
| ------------------------ | -----: |
| needs_review             |      3 |
| product_family_reference |     43 |

## Blocked Assets

| SKU            | Product slug         | Role | Public path                                 | Required action                                                         |
| -------------- | -------------------- | ---- | ------------------------------------------- | ----------------------------------------------------------------------- |
| AF-PLA-RC-0011 | plasma-retaining-cap | main | `/images/products/plasma-retaining-cap.jpg` | Collect and approve a dedicated exact-product image before publication. |
| AF-ACC-WM-0015 | welding-magnet       | main | `/images/products/welding-magnet.jpg`       | Collect and approve a dedicated exact-product image before publication. |
| AF-TIG-TS-0036 | tig-torch-switch     | main | `/images/products/tig-torch-switch.jpg`     | Collect and approve a dedicated exact-product image before publication. |

## Unknown Source Queue

| SKU            | Product slug             | Role    | Public path                                     | Required action                                                          |
| -------------- | ------------------------ | ------- | ----------------------------------------------- | ------------------------------------------------------------------------ |
| AF-MIG-CT-0004 | mig-contact-tip-m6-0-8mm | main    | `/images/products/mig-contact-tip-m6-0-8mm.jpg` | Identify the original file owner, source file and permitted website use. |
| AF-MIG-CT-0005 | mig-contact-tip-m6-1-0mm | main    | `/images/products/mig-contact-tip-m6-1-0mm.jpg` | Identify the original file owner, source file and permitted website use. |
| AF-MIG-CT-0006 | mig-contact-tip-m6-1-2mm | main    | `/images/products/mig-contact-tip-m6-1-2mm.jpg` | Identify the original file owner, source file and permitted website use. |
| AF-MIG-GN-0008 | mig-gas-nozzle-for-mb15  | main    | `/images/products/mig-gas-nozzle-for-mb15.jpg`  | Identify the original file owner, source file and permitted website use. |
| AF-MIG-GN-0008 | mig-gas-nozzle-for-mb15  | gallery | `/images/products/mig-gas-nozzle-gallery-1.jpg` | Identify the original file owner, source file and permitted website use. |
| AF-MIG-GN-0008 | mig-gas-nozzle-for-mb15  | gallery | `/images/products/mig-gas-nozzle-gallery-2.jpg` | Identify the original file owner, source file and permitted website use. |
| AF-MIG-GN-0008 | mig-gas-nozzle-for-mb15  | gallery | `/images/products/mig-gas-nozzle-gallery-3.jpg` | Identify the original file owner, source file and permitted website use. |
| AF-PLA-RC-0011 | plasma-retaining-cap     | main    | `/images/products/plasma-retaining-cap.jpg`     | Identify the original file owner, source file and permitted website use. |
| AF-ACC-WM-0015 | welding-magnet           | main    | `/images/products/welding-magnet.jpg`           | Identify the original file owner, source file and permitted website use. |

## Resolution Replacement Queue

| SKU            | Product slug             | Role    | Public path                                      | Required action                                                          |
| -------------- | ------------------------ | ------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| AF-MIG-CT-0004 | mig-contact-tip-m6-0-8mm | main    | `/images/products/mig-contact-tip-m6-0-8mm.jpg`  | 750 x 750 px; replace with a sharper exact-product view when available.  |
| AF-MIG-CT-0005 | mig-contact-tip-m6-1-0mm | main    | `/images/products/mig-contact-tip-m6-1-0mm.jpg`  | 750 x 750 px; replace with a sharper exact-product view when available.  |
| AF-MIG-CT-0006 | mig-contact-tip-m6-1-2mm | main    | `/images/products/mig-contact-tip-m6-1-2mm.jpg`  | 750 x 750 px; replace with a sharper exact-product view when available.  |
| AF-MIG-GN-0008 | mig-gas-nozzle-for-mb15  | main    | `/images/products/mig-gas-nozzle-for-mb15.jpg`   | 800 x 800 px; replace with a sharper exact-product view when available.  |
| AF-MIG-GN-0008 | mig-gas-nozzle-for-mb15  | gallery | `/images/products/mig-gas-nozzle-gallery-1.jpg`  | 800 x 800 px; replace with a sharper exact-product view when available.  |
| AF-MIG-GN-0008 | mig-gas-nozzle-for-mb15  | gallery | `/images/products/mig-gas-nozzle-gallery-2.jpg`  | 790 x 790 px; replace with a sharper exact-product view when available.  |
| AF-MIG-GN-0008 | mig-gas-nozzle-for-mb15  | gallery | `/images/products/mig-gas-nozzle-gallery-3.jpg`  | 790 x 790 px; replace with a sharper exact-product view when available.  |
| AF-MIG-DF-0003 | mig-diffuser             | main    | `/images/products/mig-diffuser.jpg`              | 800 x 800 px; replace with a sharper exact-product view when available.  |
| AF-MIG-SN-0010 | mig-swan-neck            | main    | `/images/products/mig-swan-neck.jpg`             | 800 x 800 px; replace with a sharper exact-product view when available.  |
| AF-TIG-CC-0007 | tig-ceramic-cup-5        | main    | `/images/products/tig-ceramic-cup-5.jpg`         | 800 x 800 px; replace with a sharper exact-product view when available.  |
| AF-TIG-CC-0008 | tig-ceramic-cup-6        | main    | `/images/products/tig-ceramic-cup-6.jpg`         | 800 x 800 px; replace with a sharper exact-product view when available.  |
| AF-TIG-CL-0009 | tig-collet               | main    | `/images/products/tig-collet.jpg`                | 800 x 800 px; replace with a sharper exact-product view when available.  |
| AF-TIG-CB-0005 | tig-collet-body          | main    | `/images/products/tig-collet-body-reference.jpg` | 750 x 750 px; replace with a sharper exact-product view when available.  |
| AF-TIG-BC-0011 | tig-back-cap             | main    | `/images/products/tig-back-cap.jpg`              | 800 x 800 px; replace with a sharper exact-product view when available.  |
| AF-TIG-TE-0012 | tig-tungsten-electrode   | main    | `/images/products/tig-tungsten-electrode.jpg`    | 750 x 750 px; replace with a sharper exact-product view when available.  |
| AF-PLA-NZ-0008 | plasma-nozzle            | main    | `/images/products/plasma-nozzle.jpg`             | 800 x 800 px; replace with a sharper exact-product view when available.  |
| AF-PLA-SH-0010 | plasma-shield            | main    | `/images/products/plasma-shield.jpg`             | 800 x 800 px; replace with a sharper exact-product view when available.  |
| AF-PLA-RC-0011 | plasma-retaining-cap     | main    | `/images/products/plasma-retaining-cap.jpg`      | 1200 x 900 px; replace with a sharper exact-product view when available. |
| AF-PLA-CT-0012 | plasma-cutting-tip       | main    | `/images/products/plasma-cutting-tip.jpg`        | 800 x 800 px; replace with a sharper exact-product view when available.  |
| AF-CON-EH-0010 | electrode-holder         | main    | `/images/products/electrode-holder.jpg`          | 800 x 800 px; replace with a sharper exact-product view when available.  |
| AF-CON-WW-0012 | welding-wire             | main    | `/images/products/welding-wire.jpg`              | 750 x 750 px; replace with a sharper exact-product view when available.  |
| AF-ACC-GC-0011 | ground-clamp             | main    | `/images/products/ground-clamp.jpg`              | 750 x 750 px; replace with a sharper exact-product view when available.  |
| AF-ACC-CC-0012 | welding-cable-connector  | main    | `/images/products/welding-cable-connector.jpg`   | 726 x 532 px; replace with a sharper exact-product view when available.  |
| AF-ACC-DC-0014 | dinse-connector          | main    | `/images/products/dinse-connector.jpg`           | 800 x 800 px; replace with a sharper exact-product view when available.  |
| AF-ACC-WM-0015 | welding-magnet           | main    | `/images/products/welding-magnet.jpg`            | 1200 x 900 px; replace with a sharper exact-product view when available. |
| AF-MIG-MT-0031 | mig-mag-welding-torch    | main    | `/images/products/mig-mag-welding-torch.jpg`     | 1200 x 900 px; replace with a sharper exact-product view when available. |
| AF-MIG-MS-0032 | mig-torch-switch         | main    | `/images/products/mig-torch-switch.jpg`          | 1200 x 900 px; replace with a sharper exact-product view when available. |
| AF-MAC-WF-0033 | wire-feeder              | main    | `/images/products/wire-feeder.jpg`               | 1200 x 900 px; replace with a sharper exact-product view when available. |
| AF-PLA-PT-0034 | plasma-cutting-torch     | main    | `/images/products/plasma-cutting-torch.jpg`      | 1200 x 900 px; replace with a sharper exact-product view when available. |
| AF-TIG-TT-0035 | tig-welding-torch        | main    | `/images/products/tig-welding-torch.jpg`         | 1200 x 900 px; replace with a sharper exact-product view when available. |
| AF-TIG-TS-0036 | tig-torch-switch         | main    | `/images/products/tig-torch-switch.jpg`          | 1200 x 900 px; replace with a sharper exact-product view when available. |
| AF-MAC-SG-0037 | stud-welding-gun         | main    | `/images/products/stud-welding-gun.jpg`          | 1200 x 900 px; replace with a sharper exact-product view when available. |
| AF-ACC-SA-0038 | stud-welding-accessories | main    | `/images/products/stud-welding-accessories.jpg`  | 1200 x 900 px; replace with a sharper exact-product view when available. |
| AF-ACC-RT-0039 | robot-welding-torch      | main    | `/images/products/robot-welding-torch.jpg`       | 1200 x 900 px; replace with a sharper exact-product view when available. |
| AF-CON-SE-0040 | spot-welding-electrode   | main    | `/images/products/spot-welding-electrode.jpg`    | 1200 x 900 px; replace with a sharper exact-product view when available. |
| AF-ACC-FA-0041 | wire-feeder-accessories  | main    | `/images/products/wire-feeder-accessories.jpg`   | 1200 x 900 px; replace with a sharper exact-product view when available. |
| AF-ACC-PC-0042 | welding-protective-cover | main    | `/images/products/welding-protective-cover.jpg`  | 1200 x 900 px; replace with a sharper exact-product view when available. |
| AF-ACC-FM-0043 | co2-flowmeter            | main    | `/images/products/co2-flowmeter.jpg`             | 1200 x 900 px; replace with a sharper exact-product view when available. |

## File Format Corrections

| SKU            | Product slug             | Role | Public path                                     | Required action                                                                                    |
| -------------- | ------------------------ | ---- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| AF-MIG-CT-0004 | mig-contact-tip-m6-0-8mm | main | `/images/products/mig-contact-tip-m6-0-8mm.jpg` | .jpg extension with detected PNG content; re-export or rename through the reviewed image workflow. |
| AF-MIG-CT-0005 | mig-contact-tip-m6-1-0mm | main | `/images/products/mig-contact-tip-m6-1-0mm.jpg` | .jpg extension with detected PNG content; re-export or rename through the reviewed image workflow. |
| AF-MIG-CT-0006 | mig-contact-tip-m6-1-2mm | main | `/images/products/mig-contact-tip-m6-1-2mm.jpg` | .jpg extension with detected PNG content; re-export or rename through the reviewed image workflow. |

## Duplicate Content

| Group | Products and assets                                                                                                                                                                                      | Review boundary                                                                                                     |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1     | AF-MIG-CT-0004 (`/images/products/mig-contact-tip-m6-0-8mm.jpg`)<br>AF-MIG-CT-0005 (`/images/products/mig-contact-tip-m6-1-0mm.jpg`)<br>AF-MIG-CT-0006 (`/images/products/mig-contact-tip-m6-1-2mm.jpg`) | Same-family reference image only; collect variant-specific views before presenting visual differences as confirmed. |
| 2     | AF-TIG-CC-0007 (`/images/products/tig-ceramic-cup-5.jpg`)<br>AF-TIG-CC-0008 (`/images/products/tig-ceramic-cup-6.jpg`)                                                                                   | Same-family reference image only; collect variant-specific views before presenting visual differences as confirmed. |

## Unassigned Files

Files in the product-image directory that are not referenced by canonical product data remain outside the public product asset registry. Review provenance and product identity before assigning any of them.

- `/images/products/12.jpg`
- `/images/products/P809.jpg`
- `/images/products/QQ截图20211203091759.jpg`
- `/images/products/VCG41N503257917.jpg`
- `/images/products/mig-contact-tip.jpg`
- `/images/products/mig-gas-nozzle.jpg`
- `/images/products/mig-gas-nozzle（1）.jpg`
- `/images/products/mig-tip-holder-for-mb15.jpg`
- `/images/products/mig-torch-liner.jpg`
- `/images/products/plasma-swirl-ring.jpg`
- `/images/products/plasma-torch-spacer.jpg`
- `/images/products/tig-ceramic-cup.jpg`
- `/images/products/tig-collet-body.jpg`
- `/images/products/tig-gas-lens-1-6mm.jpg`
- `/images/products/tig-gas-lens.jpg`
- `/images/products/welding-cable.jpg`
- `/images/products/welding-electrode.jpg`
- `/images/products/丙烷割嘴.png`
- `/images/products/保护嘴.png`
- `/images/products/割圆.jpg`
- `/images/products/喷嘴.jpg`
- `/images/products/喷嘴1.jpg`
- `/images/products/喷嘴2.jpg`
- `/images/products/地线夹3.jpg`
- `/images/products/地线夹子.jpg`
- `/images/products/埋弧焊.jpg`
- `/images/products/大桥牌气体保护实心焊丝.jpg`
- `/images/products/大桥电焊条.jpg`
- `/images/products/微信图片_202404111901253.jpg`
- `/images/products/微信图片_202404111901254.jpg`
- `/images/products/微信图片_202404111901295.jpg`
- `/images/products/微信图片_202404111901296.jpg`
- `/images/products/微信图片_20240411190130.jpg`
- `/images/products/微信图片_202404111901301.jpg`
- `/images/products/微信图片_202404111901302.jpg`
- `/images/products/微信图片_202404111901303.jpg`
- `/images/products/微信图片_202404111901304.jpg`
- `/images/products/微信图片_202404111901305.jpg`
- `/images/products/微信图片_202404111901307.jpg`
- `/images/products/微信图片_202404111901308.jpg`
- `/images/products/微信图片_20240411190131.jpg`
- `/images/products/微信图片_202404111901311.jpg`
- `/images/products/微信图片_202404111901312.jpg`
- `/images/products/微信图片_202404111901313.jpg`
- `/images/products/微信图片_202404111901314.jpg`
- `/images/products/微信图片_202404111901315.jpg`
- `/images/products/微信图片_202404111901316.jpg`
- `/images/products/微信图片_20240411190132.jpg`
- `/images/products/微信图片_202404111901321.jpg`
- `/images/products/微信图片_202404111901322.jpg`
- `/images/products/微信图片_202404111901323.jpg`
- `/images/products/微信图片_202404111901324.jpg`
- `/images/products/微信图片_202404111901325.jpg`
- `/images/products/微信图片_202404111901326.jpg`
- `/images/products/微信图片_202404111901327.jpg`
- `/images/products/微信图片_20240411190133.jpg`
- `/images/products/微信图片_202404111901331.jpg`
- `/images/products/微信图片_202404111901332.jpg`
- `/images/products/微信图片_202404111901336.jpg`
- `/images/products/欧式弯管1.jpg`
- `/images/products/气电接头.jpg`
- `/images/products/氩弧焊配件.jpg`
- `/images/products/温州40.jpg`
- `/images/products/焊机.jpg`
- `/images/products/焊枪1.jpg`
- `/images/products/焊枪2.jpg`
- `/images/products/瓷嘴.jpg`
- `/images/products/瓷嘴0.jpg`
- `/images/products/绝缘套2.jpg`
- `/images/products/绝缘套3.jpg`
- `/images/products/送丝机.jpg`
- `/images/products/钨极夹.jpg`
- `/images/products/阻尼轴.png`

## Approval Workflow

1. Match the physical SKU using its label, drawing, dimensions or reviewed sample.
2. Record the original file, source owner and written or company-owned usage basis.
3. Capture main, 45-degree, connection/detail, dimension and packaging views without changing product geometry.
4. Update the registry row to `exact_product`; use `approved` rights only with recorded evidence.
5. Set `search_eligible` only after reviewer and ISO review date are present.
6. Run `npm run images:assets:generate`, `npm run images:assets:validate`, `npm run images:assets:report`, SEO checks and the production build.
