import { ProductDraftForm } from "../../../../../components/console/ProductDraftForm";
import { TechnicalWorkbench } from "../../../../../components/console/TechnicalWorkbench";
import { ProductWorkingNav } from "../../../../../components/console/ProductWorkingNav";
import type { TechnicalWorkbenchData } from "../../../../../lib/console/working";
import { MediaWorkspace } from "../../../../../components/console/MediaWorkspace";
import { mediaFilters } from "../../../../../lib/console/media";
import { mediaFixture } from "../../../media-fixture";
import { compatibilityFixture } from "../../../compatibility-fixture";
import { CompatibilityWorkbench } from "../../../../../components/console/CompatibilityWorkbench";
import { OriginalIntake } from "../../../../../components/console/OriginalIntake";
import sharp from "sharp";
import { MediaMappingWorkbench } from "../../../../../components/console/MediaMappingWorkbench";
import { mediaMappingFixture } from "../../../media-mapping-fixture";
import { OemWorkbench } from "../../../../../components/console/OemWorkbench";
import { oemFixture } from "../../../oem-fixture";
import { packagingFixture } from "../../../packaging-fixture";
import { PackagingWorkbench } from "../../../../../components/console/PackagingWorkbench";

const id = "10000000-0000-4000-8000-000000000001";
const sourceId = "10000000-0000-4000-8000-000000000002";
const rootId = "10000000-0000-4000-8000-000000000003";
const evidence = [
  {
    id: sourceId,
    title: "Synthetic controlled drawing",
    reference: "QA-DRAWING-ONLY",
    level: "A",
    role: "supporting",
    version: "QA-1",
    location: "Callout 1",
    value: "12",
    unit: "mm",
  },
];
const fact = {
  id: rootId,
  fieldId: id,
  scope: "connection side A",
  value: "12",
  unit: "mm",
  status: "NEEDS_FACTORY_CONFIRMATION",
  evidence,
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const segments = (await params).segments;
  const query = await searchParams;
  const mode = segments.at(-1);
  const viewer = query.role === "viewer";
  if (mode === "packaging") {
    const fixture = packagingFixture(query);
    return (
      <>
        <h1>Packaging</h1>
        <ProductWorkingNav id={fixture.data.variantId} active="packaging" packaging />
        <PackagingWorkbench
          key={`${fixture.selectedId}:${query.state ?? "pending"}`}
          {...fixture}
        />
      </>
    );
  }
  if (mode === "oem") {
    const fixture = oemFixture(query);
    return (
      <>
        <h1>OEM references</h1>
        <ProductWorkingNav id={fixture.data.variantId} active="oem" oem />
        <OemWorkbench key={`${fixture.selectedId}:${query.state ?? "pending"}`} {...fixture} />
      </>
    );
  }
  if (mode === "media" && segments.includes("products")) {
    const original = await sharp({
      create: { width: 320, height: 240, channels: 3, background: "#18705f" },
    })
      .png()
      .toBuffer();
    return (
      <>
        <h1>Image mappings</h1>
        <ProductWorkingNav id={id} active="media" originals media compatibility />
        <MediaMappingWorkbench {...mediaMappingFixture(query, original.length)} />
      </>
    );
  }
  if (mode === "originals") {
    const raster = sharp({ create: { width: 32, height: 24, channels: 3, background: "#18705f" } });
    const tiff = query.format === "tiff";
    const original = await (tiff ? raster.tiff() : raster.png()).toBuffer();
    return (
      <>
        <h1>Original images</h1>
        <ProductWorkingNav id={id} active="originals" originals compatibility />
        <OriginalIntake
          data={{
            variantId: id,
            sku: "AF-MIG-QA-9999",
            canUpload: !viewer && query.role !== "publisher",
            page: 1,
            pageSize: 25,
            total: 1,
            items: [
              {
                intent_id: sourceId,
                asset_id: rootId,
                filename: tiff ? "synthetic-original.tiff" : "synthetic-original.png",
                byte_size: original.length,
                mime_type: tiff ? "image/tiff" : "image/png",
                width: 32,
                height: 24,
                source_kind: "other_reference",
                source_owner: "Synthetic custodian",
                source_reference: "TEST-ONLY source",
                created_at: "2026-09-27T00:00:00Z",
                completed: query.state !== "pending",
                subject_current: query.state !== "stale",
                total_count: 1,
              },
            ],
          }}
        />
      </>
    );
  }
  if (mode === "compatibility")
    return (
      <>
        <h1>Compatibility</h1>
        <ProductWorkingNav id={id} active="compatibility" compatibility />
        <CompatibilityWorkbench {...compatibilityFixture(query)} />
      </>
    );
  if (mode === "media") {
    const filter = mediaFilters(query);
    return <MediaWorkspace data={mediaFixture(filter)} filter={filter} params={query} />;
  }
  if (mode === "new")
    return (
      <>
        <h1>New product</h1>
        <ProductDraftForm draft={null} />
      </>
    );
  if (mode === "review") {
    const data: TechnicalWorkbenchData = {
      variantId: id,
      sku: "AF-MIG-QA-9999",
      canEdit: !viewer && query.role !== "reviewer",
      canReview: !viewer && query.role !== "editor",
      fields: [{ id, label: "Length", critical: true }],
      sources: [
        {
          id: sourceId,
          fieldId: id,
          scope: fact.scope,
          title: evidence[0].title,
          reference: evidence[0].reference,
          level: "A",
          value: "12",
          unit: "mm",
          location: "Callout 1",
          version: "QA-1",
        },
      ],
      scopes: [
        {
          id: rootId,
          fieldId: id,
          label: "Length",
          scope: fact.scope,
          revision: 2,
          original: fact,
          current: fact,
          candidate: {
            ...fact,
            id,
            state: query.state ?? "proposed",
            digest: "a".repeat(64),
            status: query.conflict === "1" ? "DATA_CONFLICT" : fact.status,
          },
        },
      ],
    };
    return (
      <>
        <h1>Technical review</h1>
        <ProductWorkingNav id={id} active="review" />
        <TechnicalWorkbench data={data} />
      </>
    );
  }
  return (
    <>
      <h1>Product copy</h1>
      <ProductWorkingNav id={id} active="edit" />
      <ProductDraftForm
        draft={{
          product_variant_id: id,
          sku: "AF-MIG-QA-9999",
          public_slug: "synthetic-ui-product",
          revision: 1,
          editable: !viewer,
          name_en: "Synthetic UI product",
          name_zh: "",
          model: "",
          summary: "Synthetic copy for interface testing only.",
          description: "",
          applications: "",
        }}
      />
    </>
  );
}
