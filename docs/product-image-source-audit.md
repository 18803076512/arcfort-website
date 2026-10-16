# Product Image Source Audit

Initial audit date: 2026-06-29

Asset-registry migration review: 2026-08-21

Contact-tip file-format review: 2026-08-25

P0 repository-lineage review: 2026-08-25

The three existing 750 x 750 contact-tip references for AF-MIG-CT-0004, AF-MIG-CT-0005 and
AF-MIG-CT-0006 were loss-minimized re-exports from PNG content to real JPEG encoding while retaining
their public `.jpg` paths. The visible composition, dimensions and evidence state did not change.
They remain duplicate family-level references with unknown original provenance and require
variant-specific, rights-approved replacements. A file-format correction is not evidence of
ownership, exact-SKU identity or compatibility.

The repository-lineage review found that all three contact-tip files before re-export were
byte-identical to `mig-contact-tip.jpg`, and the current AF-MIG-GN-0008 main image is byte-identical
to `mig-gas-nozzle.jpg`. These facts narrow the repository file chain only; they do not identify the
original owner, usage rights or exact product variant. The reproducible hashes and boundaries are
recorded in `knowledge-base/assets/p0-repository-image-lineage.md`.

This checklist records the temporary main images assigned to catalog-derived product-family pages.
These images were selected from local product files or from the Renqiu Ailesen welding catalog PDF.
They remain migration-period product-family references. File existence or visual similarity does not
prove exact-product identity, ownership or public usage rights. The canonical state and replacement
queue now live in `data/assets/product-image-assets.csv` and
`docs/product-image-asset-report.md`.

## Updated Product Images

| SKU            | Product                                 | Target Image                                    | Source Used                                        | Notes                                                                                                                                                                                                              |
| -------------- | --------------------------------------- | ----------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AF-MIG-MT-0031 | MIG/MAG Welding Torch                   | `/images/products/mig-mag-welding-torch.jpg`    | Local product photo `焊枪1.jpg`                    | Clean MIG/MAG torch image.                                                                                                                                                                                         |
| AF-MIG-MS-0032 | MIG Torch Switch                        | `/images/products/mig-torch-switch.jpg`         | Catalog PDF crop, page 19                          | Temporary accessory image; replace with a confirmed switch photo.                                                                                                                                                  |
| AF-MAC-WF-0033 | Wire Feeder                             | `/images/products/wire-feeder.jpg`              | Catalog PDF crop, page 39                          | Product body crop only; exact model data remains unconfirmed.                                                                                                                                                      |
| AF-PLA-PT-0034 | Plasma Cutting Torch                    | `/images/products/plasma-cutting-torch.jpg`     | Local product photo `P809.jpg`                     | Clean plasma torch image.                                                                                                                                                                                          |
| AF-TIG-TT-0035 | TIG Welding Torch                       | `/images/products/tig-welding-torch.jpg`        | Catalog PDF crop, page 25                          | Temporary TIG torch family image.                                                                                                                                                                                  |
| AF-TIG-TS-0036 | TIG Torch Switch                        | `/images/products/tig-torch-switch.jpg`         | Catalog PDF crop, page 36                          | Retired from public products on 2026-08-12: the crop shows a normal torch termination, not a dedicated switch. SKU remains draft until a confirmed switch photo and source record are available.                   |
| AF-MAC-SG-0037 | Stud Welding Gun                        | `/images/products/stud-welding-gun.jpg`         | Catalog PDF crop, page 37                          | Product body crop only; exact model data remains unconfirmed.                                                                                                                                                      |
| AF-ACC-SA-0038 | Stud Welding Accessories                | `/images/products/stud-welding-accessories.jpg` | Catalog PDF crop, page 37                          | Temporary accessory group image.                                                                                                                                                                                   |
| AF-ACC-RT-0039 | Robotic MIG/MAG Welding Torch Front End | `/images/products/robot-welding-torch.jpg`      | Catalog PDF crop, page 48                          | Shows a torch-neck/front-end assembly and removable consumables only. It does not confirm a robot flange, cable package, collision mount, cooling circuit, interface, TCP geometry, rating or model compatibility. |
| AF-CON-SE-0040 | Spot Welding Electrode                  | `/images/products/spot-welding-electrode.jpg`   | Local product photo `微信图片_202404111901308.jpg` | Clean spot welding electrode/cap image.                                                                                                                                                                            |
| AF-ACC-FA-0041 | Wire Feeder Accessories                 | `/images/products/wire-feeder-accessories.jpg`  | Local product photo `送丝机.jpg`                   | Accessory group image.                                                                                                                                                                                             |
| AF-ACC-PC-0042 | Welding Protective Cover                | `/images/products/welding-protective-cover.jpg` | Catalog PDF crop, page 58                          | Temporary protective cover image.                                                                                                                                                                                  |
| AF-ACC-FM-0043 | CO2 Flowmeter                           | `/images/products/co2-flowmeter.jpg`            | Catalog PDF crop, page 58                          | Temporary CO2 flowmeter image; source resolution is limited.                                                                                                                                                       |

## Reviewed Local Image Batch

Review date: 2026-07-26

The following images were matched by visible product type against files in the local supplier image
archive. They are marked `supplier_photo`; exact dimensions, ratings, model compatibility and OEM
references remain unverified and must still be confirmed through RFQ details.

| SKU            | Product                 | Target Image                                     | Local Source                   |
| -------------- | ----------------------- | ------------------------------------------------ | ------------------------------ |
| AF-MIG-SN-0010 | MIG Swan Neck           | `/images/products/mig-swan-neck.jpg`             | `欧式弯管1.jpg`                |
| AF-MIG-DF-0003 | MIG Diffuser            | `/images/products/mig-diffuser.jpg`              | `微信图片_202404111901304.jpg` |
| AF-TIG-CC-0007 | TIG Ceramic Cup #5      | `/images/products/tig-ceramic-cup-5.jpg`         | `瓷嘴0.jpg`                    |
| AF-TIG-CC-0008 | TIG Ceramic Cup #6      | `/images/products/tig-ceramic-cup-6.jpg`         | `瓷嘴0.jpg`                    |
| AF-TIG-CL-0009 | TIG Collet              | `/images/products/tig-collet.jpg`                | `钨极夹.jpg`                   |
| AF-TIG-CB-0005 | TIG Collet Body         | `/images/products/tig-collet-body-reference.jpg` | `氩弧焊配件.jpg`               |
| AF-TIG-BC-0011 | TIG Back Cap            | `/images/products/tig-back-cap.jpg`              | `微信图片_20240411190132.jpg`  |
| AF-TIG-TE-0012 | TIG Tungsten Electrode  | `/images/products/tig-tungsten-electrode.jpg`    | `微信图片_20240411190131.jpg`  |
| AF-PLA-EL-0007 | Plasma Electrode        | `/images/products/plasma-electrode.jpg`          | `微信图片_202404111901331.jpg` |
| AF-PLA-NZ-0008 | Plasma Nozzle           | `/images/products/plasma-nozzle.jpg`             | `微信图片_202404111901308.jpg` |
| AF-PLA-CT-0012 | Plasma Cutting Tip      | `/images/products/plasma-cutting-tip.jpg`        | `温州40.jpg`                   |
| AF-CON-EH-0010 | Electrode Holder        | `/images/products/electrode-holder.jpg`          | `微信图片_202404111901314.jpg` |
| AF-CON-WW-0012 | Welding Wire            | `/images/products/welding-wire.jpg`              | `大桥牌气体保护实心焊丝.jpg`   |
| AF-ACC-GC-0011 | Ground Clamp            | `/images/products/ground-clamp.jpg`              | `地线夹3.jpg`                  |
| AF-ACC-CC-0012 | Welding Cable Connector | `/images/products/welding-cable-connector.jpg`   | `QQ截图20211203091759.jpg`     |
| AF-ACC-DC-0014 | Dinse Connector         | `/images/products/dinse-connector.jpg`           | `微信图片_202404111901332.jpg` |

## Replacement Priority

1. Replace `mig-torch-switch.jpg` with a dedicated MIG switch photo. Provide a dedicated TIG switch
   photo and source evidence before reactivating `AF-TIG-TS-0036`.
2. Replace the remaining `needs_photo` SKU images with confirmed white-background product photos.
3. Replace `tig-collet-body-reference.jpg` with a dedicated exact-product collet-body image. The
   previous assignment reused the MIG diffuser image and was removed on 2026-08-21; the current TIG
   accessory-group image is reference-only.
4. Confirm source ownership and website usage rights for every migration-period image.
5. Replace PDF crops and low-resolution references with exact-product views where possible.
6. Keep file names aligned with `data/import/products.csv` and update the asset registry so image
   checks, product pages and search metadata continue to use the intended file.
