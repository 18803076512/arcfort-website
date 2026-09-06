import { ConsoleLink } from "@/components/console/ConsoleLink";

import Image from "next/image";
import { notFound } from "next/navigation";
import { requireConsoleAccess } from "@/lib/console/server";
import {
  filters,
  readProductDetail,
  readTechnicalData,
  type SearchParams,
} from "@/lib/console/catalog";
import {
  DataTable,
  EmptyState,
  Pagination,
  Status,
  TechnicalTable,
} from "@/components/console/CatalogViews";

export const metadata = { title: "Product Evidence" };
export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { client } = await requireConsoleAccess();
  const { id } = await params;
  const query = await searchParams;
  const data = await readProductDetail(client, id);
  if (!data) notFound();
  const technical = await readTechnicalData(client, filters(query), { variantId: id });
  return (
    <>
      <ConsoleLink className="console-back" href="/console/products">
        Products
      </ConsoleLink>
      <h1>{data.identity.products?.name_en}</h1>
      <dl className="console-facts">
        <div>
          <dt>SKU / Model</dt>
          <dd>
            {data.identity.sku}
            <p>{data.identity.model ?? "Model not recorded"}</p>
          </dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{data.identity.product_categories?.name_en}</dd>
        </div>
        <div>
          <dt>Lifecycle</dt>
          <dd>
            <Status value={data.identity.lifecycle_state} />
            <p>{data.identity.is_shadow ? "Shadow record" : "Governed record"}</p>
          </dd>
        </div>
      </dl>
      <h2>Readiness</h2>
      <p>
        {data.readiness.blocker_count} blockers; {data.readiness.confirmed_technical_count}{" "}
        confirmed technical values; {data.readiness.eligible_main_image_count} eligible main images.
      </p>
      <h2>Technical Values</h2>
      <TechnicalTable data={technical} />
      <Pagination data={technical} params={query} path={`/console/products/${id}`} />
      <h2>Product Media</h2>
      {data.media.length ? (
        <DataTable
          label="Product media evidence"
          columns={["Image / Role", "Publication", "Usage Rights", "Product Match"]}
        >
          {data.media.map((item) => (
            <tr key={item.id}>
              <td>
                {item.media_assets?.public_path &&
                  /^\/images\/products\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|avif)$/.test(
                    item.media_assets.public_path,
                  ) && (
                    <Image
                      src={item.media_assets.public_path}
                      alt={item.alt_text || "Catalog reference image"}
                      width={160}
                      height={120}
                      unoptimized
                      className="mb-2 h-28 w-40 object-contain"
                    />
                  )}
                {item.role}
              </td>
              <td>
                <Status value={item.media_assets?.publication_status} />
              </td>
              <td>
                <Status value={item.media_assets?.usage_rights_status} />
              </td>
              <td>
                <Status value={item.media_assets?.content_match_status} />
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState />
      )}
      <h2>Compatibility</h2>
      {data.compatibility.length ? (
        <DataTable
          label="Compatibility evidence"
          columns={["Reference", "Relationship", "Verification", "Evidence"]}
        >
          {data.compatibility.map((item) => (
            <tr key={item.id}>
              <td>{item.target?.label}</td>
              <td>
                {item.relationship_type}
                <small>{item.relationship_status}</small>
              </td>
              <td>
                <Status value={item.verification_status} />
                <small>{item.confirmation_requirements.join("; ")}</small>
              </td>
              <td>
                {item.compatibility_evidence.map((link, index) => (
                  <p key={index}>
                    {link.evidence_sources?.title}
                    <small>{link.evidence_sources?.source_reference}</small>
                  </p>
                ))}
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <p>No compatibility relationship recorded.</p>
      )}
      <h2>Packaging &amp; Order Notes</h2>
      {data.packaging.length ? (
        <DataTable
          label="Packaging evidence"
          columns={["Packaging", "MOQ", "Lead Time", "Verification"]}
        >
          {data.packaging.map((item) => (
            <tr key={item.id}>
              <td>{item.package_description}</td>
              <td>{item.moq_note}</td>
              <td>{item.lead_time_note}</td>
              <td>
                <Status value={item.verification_status} />
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState />
      )}
    </>
  );
}
