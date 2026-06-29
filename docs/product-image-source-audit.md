# Product Image Source Audit

Audit date: 2026-06-29

This checklist records the temporary main images assigned to catalog-derived product-family pages.
These images were selected from local product photos or from the Renqiu Ailesen welding catalog PDF.
They are suitable to replace blank placeholders, but they should still be replaced with confirmed
white-background product photos when available.

## Updated Product Images

| SKU | Product | Target Image | Source Used | Notes |
| --- | --- | --- | --- | --- |
| AF-MIG-MT-0031 | MIG/MAG Welding Torch | `/images/products/mig-mag-welding-torch.jpg` | Local product photo `焊枪1.jpg` | Clean MIG/MAG torch image. |
| AF-MIG-MS-0032 | MIG Torch Switch | `/images/products/mig-torch-switch.jpg` | Catalog PDF crop, page 19 | Temporary accessory image; replace with a confirmed switch photo. |
| AF-MAC-WF-0033 | Wire Feeder | `/images/products/wire-feeder.jpg` | Catalog PDF crop, page 39 | Product body crop only; exact model data remains unconfirmed. |
| AF-PLA-PT-0034 | Plasma Cutting Torch | `/images/products/plasma-cutting-torch.jpg` | Local product photo `P809.jpg` | Clean plasma torch image. |
| AF-TIG-TT-0035 | TIG Welding Torch | `/images/products/tig-welding-torch.jpg` | Catalog PDF crop, page 25 | Temporary TIG torch family image. |
| AF-TIG-TS-0036 | TIG Torch Switch | `/images/products/tig-torch-switch.jpg` | Catalog PDF crop, page 36 | Temporary control-wire/termination reference; replace with a confirmed switch photo. |
| AF-MAC-SG-0037 | Stud Welding Gun | `/images/products/stud-welding-gun.jpg` | Catalog PDF crop, page 37 | Product body crop only; exact model data remains unconfirmed. |
| AF-ACC-SA-0038 | Stud Welding Accessories | `/images/products/stud-welding-accessories.jpg` | Catalog PDF crop, page 37 | Temporary accessory group image. |
| AF-ACC-RT-0039 | Robot Welding Torch | `/images/products/robot-welding-torch.jpg` | Catalog PDF crop, page 48 | Product body crop only; exact model data remains unconfirmed. |
| AF-CON-SE-0040 | Spot Welding Electrode | `/images/products/spot-welding-electrode.jpg` | Local product photo `微信图片_202404111901308.jpg` | Clean spot welding electrode/cap image. |
| AF-ACC-FA-0041 | Wire Feeder Accessories | `/images/products/wire-feeder-accessories.jpg` | Local product photo `送丝机.jpg` | Accessory group image. |
| AF-ACC-PC-0042 | Welding Protective Cover | `/images/products/welding-protective-cover.jpg` | Catalog PDF crop, page 58 | Temporary protective cover image. |
| AF-ACC-FM-0043 | CO2 Flowmeter | `/images/products/co2-flowmeter.jpg` | Catalog PDF crop, page 58 | Temporary CO2 flowmeter image; source resolution is limited. |

## Replacement Priority

1. Replace `mig-torch-switch.jpg` and `tig-torch-switch.jpg` with dedicated switch photos.
2. Replace PDF crops with clean white-background product photos where possible.
3. Keep file names aligned with `data/import/products.csv` so image checks and product pages continue to work.
