import { ConsoleLink } from "@/components/console/ConsoleLink";

import { requireConsoleAccess } from "@/lib/console/server";
import { readDashboard } from "@/lib/console/catalog";

export const metadata = { title: "Overview" };
export default async function Dashboard() {
  const { client } = await requireConsoleAccess();
  const data = await readDashboard(client);
  const metrics = [
    ["total_products", "SKU Records", "/console/products"],
    ["shadow_products", "Shadow Records", "/console/products"],
    ["published_products", "Console-published Products", "/console/products?lifecycle=PUBLISHED"],
    ["verified_products", "Verified Products", "/console/products?lifecycle=VERIFIED"],
    [
      "data_conflicts",
      "Conflicting Technical Values",
      "/console/technical-data?verification=DATA_CONFLICT",
    ],
    [
      "needs_factory_confirmation",
      "Values Awaiting Factory Confirmation",
      "/console/technical-data?verification=NEEDS_FACTORY_CONFIRMATION",
    ],
    [
      "missing_eligible_main_images",
      "SKUs Without an Eligible Main Image",
      "/console/readiness?blocker=image",
    ],
    [
      "unconfirmed_compatibility",
      "Unconfirmed Compatibility Relationships",
      "/console/readiness?blocker=compatibility",
    ],
    [
      "ready_for_publish",
      "Ready for Publication Review",
      "/console/products?lifecycle=READY_FOR_PUBLISH",
    ],
  ];
  return (
    <>
      <h1>Catalog Overview</h1>
      <div className="console-metrics">
        {metrics.map(([key, label, href]) => (
          <ConsoleLink className="console-metric" key={key} href={href}>
            <strong className="console-number">{data.metrics[key]}</strong>
            <span>{label}</span>
          </ConsoleLink>
        ))}
      </div>
      <h2>Website Baseline</h2>
      <p>
        {data.legacyActive} records retain a legacy active website status. The public website still
        reads the repository catalog, not this shadow database.
      </p>
      <p className="mt-4">
        <ConsoleLink href="/console/readiness">Review SKU readiness blockers</ConsoleLink>
      </p>
    </>
  );
}
