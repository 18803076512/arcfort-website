import assert from "node:assert/strict";

import { ProductIntelligenceRestClient } from "../../lib/supabase/product-intelligence-rest.ts";

const originalFetch = globalThis.fetch;
const requests: { url: string; init: RequestInit }[] = [];
globalThis.fetch = async (input, init = {}) => {
  requests.push({ url: String(input), init });
  return new Response("[]", { status: 200 });
};

try {
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
  assert.equal(requests.length, 0, "Empty-filter operations must fail before network access.");

  for (const serviceRoleKey of ["test-service-role-key", "sb_secret_test-fixture-not-valid"]) {
    requests.length = 0;
    const keyedClient = new ProductIntelligenceRestClient({
      environment: "staging",
      serviceRoleKey,
      url: "https://test-staging.supabase.co",
    });

    assert.equal(await keyedClient.selectOne("import_batches", { id: "fixture-batch" }), null);
    await keyedClient.update("import_batches", { status: "FAILED" }, { id: "fixture-batch" });
    await keyedClient.rpc("pi_reconcile_shadow_batch", { batch_id: "fixture-batch" });

    assert.deepEqual(
      requests.map(({ init }) => init.method),
      ["GET", "PATCH", "POST"],
    );
    for (const { url, init } of requests) {
      assert.equal(new URL(url).origin, "https://test-staging.supabase.co");
      const headers = new Headers(init.headers);
      assert.equal(headers.get("apikey"), serviceRoleKey);
      assert.equal(headers.get("content-type"), "application/json");
      assert.equal(
        headers.get("authorization"),
        serviceRoleKey.startsWith("sb_secret_") ? null : `Bearer ${serviceRoleKey}`,
        "Only legacy service-role keys may be sent as Bearer tokens.",
      );
    }
    assert.equal(new Headers(requests[1].init.headers).get("prefer"), "return=minimal");
    assert.equal(new URL(requests[1].url).searchParams.get("id"), "eq.fixture-batch");
    assert.equal(requests[1].init.body, JSON.stringify({ status: "FAILED" }));
  }
} finally {
  globalThis.fetch = originalFetch;
}

console.log("Product Intelligence REST mutation and API-key transport tests passed.");
