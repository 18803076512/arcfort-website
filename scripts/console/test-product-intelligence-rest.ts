import assert from "node:assert/strict";

import { ProductIntelligenceRestClient } from "../../lib/supabase/product-intelligence-rest.ts";

const client = new ProductIntelligenceRestClient({
  environment: "local",
  serviceRoleKey: "test-service-role-key",
  url: "http://127.0.0.1:54321",
});

await assert.rejects(
  client.selectOne("import_batches", {}),
  /selectOne requires at least one filter/,
);
await assert.rejects(
  client.update("import_batches", { status: "FAILED" }, {}),
  /update requires at least one filter/,
);

console.log("Product Intelligence REST mutation guard tests passed.");
