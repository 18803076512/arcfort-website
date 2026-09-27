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
  if (mode === "originals")
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
                filename: "synthetic-original.png",
                byte_size: 1200,
                mime_type: "image/png",
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
