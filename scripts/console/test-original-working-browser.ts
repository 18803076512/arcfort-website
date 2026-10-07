import assert from "node:assert/strict";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import type { BrowserContext, Page } from "./browser-runtime/node_modules/playwright/index.js";
import type { ConsoleClient } from "../../lib/console/client.ts";
import { readOriginalIntakes } from "../../lib/console/originals.ts";
import { consoleOriginalsEnabled } from "../../lib/console/working-config.ts";
import {
  originalUploadPath,
  originalUuid,
  parseOriginalUpload,
  type OriginalUploadInput,
} from "../../lib/domain/catalog/originals.ts";
import { browserOrigin, privateResponse } from "./browser-server.ts";
import { originalInspectionPath } from "../../lib/domain/catalog/original-inspection.ts";

type Participant = { ctx: BrowserContext; page: Page; client: ConsoleClient };
type Input = {
  variantId: string;
  owner: Participant;
  reviewer: Participant;
  viewer: Participant;
  context: () => Promise<BrowserContext>;
  output: string;
  goto: (page: Page, pathname: string) => Promise<void>;
  checkpoint: (value: string) => void;
};
type Receipt = { ok: true; intent_id: string; asset_id: string };

// Only called by the guarded pristine-stack runner. Real HTTP/Storage responses are not mocked.
export async function runOriginalWorkingBrowser(input: Input) {
  assert.equal(process.env.CI, "true");
  assert.equal(consoleOriginalsEnabled(), true);
  const { variantId, owner, reviewer, viewer, goto } = input;
  const identity = await owner.client
    .from("product_variants")
    .select("sku,public_slug,is_shadow,lifecycle_state")
    .eq("id", variantId)
    .single();
  assert.equal(identity.error, null);
  assert.equal(identity.data?.sku, "AF-MIG-TS-9998");
  assert.equal(identity.data?.public_slug, "synthetic-browser-m3-item");
  assert.equal(identity.data?.is_shadow, false);
  assert.equal(identity.data?.lifecycle_state, "DRAFT");
  const pathname = `/console/products/${variantId}/originals`;
  const endpoint = browserOrigin + originalUploadPath;
  const inspectionEndpoint = browserOrigin + originalInspectionPath;
  const results: string[] = [];
  const checkpoint = (name: string) => input.checkpoint(name);
  const small = await sharp({
    create: { width: 32, height: 24, channels: 3, background: "#168565" },
  })
    .png()
    .toBuffer();
  const large = await sharp(randomBytes(2048 * 2048 * 3), {
    raw: { width: 2048, height: 2048, channels: 3 },
  })
    .png()
    .toBuffer();
  assert.ok(large.length > 10 * 1024 * 1024 && large.length < 25 * 1024 * 1024);
  const headers = (metadata: OriginalUploadInput) => ({
    origin: browserOrigin,
    "x-console-command": "1",
    "content-type": "image/png",
    "x-console-original": encodeURIComponent(JSON.stringify(metadata)),
  });
  function receipt(value: unknown): Receipt {
    assert.ok(value && typeof value === "object" && !Array.isArray(value));
    assert.deepEqual(Object.keys(value).sort(), ["asset_id", "intent_id", "ok"]);
    const result = value as Receipt;
    assert.equal(result.ok, true);
    assert.match(result.asset_id, originalUuid);
    assert.match(result.intent_id, originalUuid);
    return result;
  }
  async function rejected(
    ctx: BrowserContext,
    metadata: OriginalUploadInput,
    data: Buffer,
    status: number,
    overrides: Record<string, string> = {},
  ) {
    const response = await ctx.request.post(endpoint, {
      headers: { ...headers(metadata), ...overrides },
      data,
      maxRedirects: 0,
      timeout: 90_000,
    });
    assert.equal(response.status(), status);
    privateResponse(response.headers());
    const result = await response.json();
    assert.equal(result.ok, false);
    assert.deepEqual(Object.keys(result).sort(), ["code", "message", "ok"]);
    assert.doesNotMatch(
      JSON.stringify(result),
      /storage_path|access_token|raw_snapshot|working-originals/,
    );
  }
  async function upload(participant: Participant, name: string, data: Buffer) {
    const role = participant === owner ? "owner" : "reviewer";
    checkpoint(`originals: ${role} navigate to real intake form`);
    await goto(participant.page, pathname);
    checkpoint(`originals: ${role} fill real intake form`);
    await participant.page
      .getByLabel("Original image", { exact: true })
      .setInputFiles({ name, mimeType: "image/png", buffer: data });
    await participant.page
      .getByLabel("Source type", { exact: true })
      .selectOption("other_reference");
    await participant.page
      .getByLabel("Source custodian", { exact: true })
      .fill("Synthetic disposable test custodian");
    await participant.page
      .getByLabel("Source reference", { exact: true })
      .fill("TEST-ONLY generated raster; not product evidence");
    checkpoint(`originals: ${role} submit and await real upload HTTP response`);
    const responsePromise = participant.page.waitForResponse(
      (response) => response.url() === endpoint && response.request().method() === "POST",
      { timeout: 120_000 },
    );
    await participant.page.getByRole("button", { name: "Upload original", exact: true }).click();
    const response = await responsePromise;
    checkpoint(`originals: ${role} verify HTTP status, privacy, cookie and request metadata`);
    assert.equal(response.status(), 200, "Real original upload did not complete.");
    privateResponse(response.headers());
    assert.match((await response.request().allHeaders()).cookie ?? "", /sb-/);
    const metadata = parseOriginalUpload(response.request().headers()["x-console-original"]);
    assert.equal(metadata.variant_id, variantId);
    assert.equal(metadata.byte_size, data.length);
    const result = receipt(await response.json());
    checkpoint(`originals: ${role} wait for received feedback and cleared input`);
    await participant.page.getByRole("status").filter({ hasText: "Original received" }).waitFor();
    assert.equal(
      await participant.page.getByLabel("Original image", { exact: true }).inputValue(),
      "",
    );
    return { metadata, result };
  }
  async function stored(result: Receipt, data: Buffer) {
    checkpoint("originals: select persisted asset through owner session");
    const asset = await owner.client
      .from("media_assets")
      .select(
        "storage_bucket,storage_path,file_hash,ownership_status,usage_rights_status,content_match_status,publication_status,approved_by,approved_at,raw_snapshot",
      )
      .eq("id", result.asset_id)
      .single();
    assert.equal(asset.error, null);
    assert.ok(asset.data);
    checkpoint("originals: validate persisted hash, unapproved flags and immutable metadata");
    assert.equal(asset.data.storage_bucket, "pi-product-originals");
    assert.equal(asset.data.file_hash, createHash("sha256").update(data).digest("hex"));
    assert.equal(asset.data.ownership_status, "unconfirmed");
    assert.equal(asset.data.usage_rights_status, "needs_confirmation");
    assert.equal(asset.data.content_match_status, "needs_review");
    assert.equal(asset.data.publication_status, "blocked");
    assert.equal(asset.data.approved_by, null);
    assert.equal(asset.data.approved_at, null);
    assert.deepEqual(asset.data.raw_snapshot, {
      intake_id: result.intent_id,
      byte_verification: "not_attested",
    });
    const location = asset.data.storage_path;
    assert.ok(location);
    checkpoint("originals: download and compare actual stored bytes through owner session");
    const object = await owner.client.storage.from("pi-product-originals").download(location);
    assert.equal(object.error, null);
    assert.ok(object.data);
    assert.deepEqual(
      Buffer.from(await object.data.arrayBuffer()),
      data,
      "Actual stored original bytes changed.",
    );
    return location;
  }
  async function inspect(participant: Participant, result: Receipt, data: Buffer, status = 200) {
    const actor =
      participant === owner ? "owner" : participant === reviewer ? "reviewer" : "viewer";
    checkpoint(`originals: ${actor} stored inspection HTTP status`);
    const response = await participant.ctx.request.post(inspectionEndpoint, {
      headers: { origin: browserOrigin, "x-console-command": "1" },
      data: { variant_id: variantId, asset_id: result.asset_id },
      maxRedirects: 0,
    });
    assert.equal(response.status(), status);
    checkpoint(`originals: ${actor} stored inspection privacy headers`);
    privateResponse(response.headers());
    if (status === 200) {
      checkpoint(`originals: ${actor} stored inspection MIME and byte-length headers`);
      assert.equal(response.headers()["content-type"], "image/png");
      assert.equal(response.headers()["content-length"], String(data.length));
      checkpoint(`originals: ${actor} stored inspection security headers`);
      assert.equal(response.headers()["x-content-type-options"], "nosniff");
      assert.equal(response.headers()["cross-origin-resource-policy"], "same-origin");
      checkpoint(`originals: ${actor} stored inspection exact bytes`);
      assert.deepEqual(await response.body(), data);
    } else {
      const body = await response.json();
      assert.deepEqual(Object.keys(body).sort(), ["code", "message", "ok"]);
      assert.equal(body.ok, false);
    }
  }

  checkpoint("originals: real cookie-scoped owner form, storage readback and unchanged HTTP retry");
  assert.equal((await readOriginalIntakes(owner.client, variantId, 1))?.total, 0);
  const first = await upload(owner, "synthetic-owner-original.png", small);
  const location = await stored(first.result, small);
  checkpoint("originals: unchanged owner HTTP replay");
  const retried = await owner.ctx.request.post(endpoint, {
    headers: headers(first.metadata),
    data: small,
    timeout: 90_000,
    maxRedirects: 0,
  });
  assert.equal(retried.status(), 200);
  privateResponse(retried.headers());
  assert.deepEqual(receipt(await retried.json()), first.result);
  assert.equal((await readOriginalIntakes(owner.client, variantId, 1))?.total, 1);
  results.push("original owner form, persisted exact bytes and unchanged receipt retry");

  checkpoint("originals: real greater-than-10-MiB reviewer upload");
  const second = await upload(reviewer, "synthetic-large-original.png", large);
  const secondLocation = await stored(second.result, large);
  assert.notEqual(first.result.asset_id, second.result.asset_id);
  results.push("original reviewer form with >10 MiB HTTP and actual stored-byte fidelity");

  checkpoint("originals: real stored-original inspection, private download and role access");
  await inspect(owner, first.result, small);
  await inspect(viewer, second.result, large);
  checkpoint("originals: browser inspection navigation and response");
  await goto(owner.page, pathname);
  const inspected = owner.page.waitForResponse((response) => response.url() === inspectionEndpoint);
  await owner.page
    .getByRole("button", { name: "Inspect synthetic-owner-original.png", exact: true })
    .click();
  const inspectionResponse = await inspected;
  assert.equal(inspectionResponse.status(), 200);
  checkpoint("originals: browser inspection privacy, cookie and exact bytes");
  privateResponse(inspectionResponse.headers());
  assert.match((await inspectionResponse.request().allHeaders()).cookie ?? "", /sb-/);
  assert.deepEqual(await inspectionResponse.body(), small);
  checkpoint("originals: browser decoded original image and zoom");
  await owner.page.waitForFunction(
    () =>
      document.querySelector<HTMLImageElement>(
        'img[alt="Stored original: synthetic-owner-original.png"]',
      )?.naturalWidth === 32,
  );
  await owner.page.getByRole("button", { name: "Zoom in", exact: true }).click();
  checkpoint("originals: browser download preserves exact original bytes");
  const downloadPromise = owner.page.waitForEvent("download");
  await owner.page.getByRole("link", { name: "Download original", exact: true }).click();
  const download = await downloadPromise;
  const chunks: Buffer[] = [];
  for await (const chunk of await download.createReadStream()) chunks.push(Buffer.from(chunk));
  assert.deepEqual(Buffer.concat(chunks), small);
  await owner.page.getByRole("button", { name: "Close original inspection", exact: true }).click();
  results.push("original private inspection, unchanged browser download and read-only-role access");

  checkpoint("originals: denied viewer/anonymous/origin, malformed bytes and changed receipt");
  await goto(viewer.page, pathname);
  assert.equal(
    await viewer.page.getByRole("button", { name: "Upload original", exact: true }).count(),
    0,
  );
  await rejected(viewer.ctx, first.metadata, small, 403);
  const anonymous = await input.context();
  try {
    await rejected(anonymous, first.metadata, small, 403);
  } finally {
    await anonymous.close();
  }
  await rejected(owner.ctx, first.metadata, small, 403, { origin: "https://invalid.example" });
  await rejected(
    owner.ctx,
    { ...first.metadata, source_reference: "TEST-ONLY changed receipt" },
    small,
    409,
  );
  await rejected(
    owner.ctx,
    { ...first.metadata, request_id: randomUUID(), completion_id: randomUUID(), byte_size: 8 },
    Buffer.alloc(8),
    422,
  );
  assert.equal((await readOriginalIntakes(owner.client, variantId, 1))?.total, 2);
  results.push("original HTTP role/origin/input refusals preserve two completed intents");

  checkpoint("originals: actual managed-object overwrite/move/delete refusal");
  const storage = owner.client.storage.from("pi-product-originals");
  assert.ok(
    (await storage.upload(location, small, { contentType: "image/png", upsert: true })).error,
  );
  assert.ok((await storage.move(location, location + "-moved")).error);
  await storage.remove([location]);
  await stored(first.result, small);
  // Positive control: the actual API can delete an ordinary synthetic object, not managed originals.
  const legacyPath = `synthetic-original-acceptance/${randomUUID()}.png`;
  assert.equal(
    (await storage.upload(legacyPath, small, { contentType: "image/png", upsert: false })).error,
    null,
  );
  assert.equal((await storage.download(legacyPath)).error, null);
  const removed = await storage.remove([legacyPath]);
  assert.equal(removed.error, null);
  assert.ok(removed.data?.some((object) => object.name === legacyPath));
  assert.ok((await storage.download(legacyPath)).error);
  await stored(first.result, small);
  const history = await readOriginalIntakes(viewer.client, variantId, 1);
  assert.equal(history?.total, 2);
  assert.equal(history?.canUpload, false);
  assert.ok(history?.items.every((item) => item.completed && item.subject_current));
  assert.doesNotMatch(
    JSON.stringify(history),
    /storage_path|working-originals|raw_snapshot|access_token/,
  );
  const assignments = await owner.client
    .from("product_media")
    .select("id", { count: "exact" })
    .eq("product_variant_id", variantId);
  assert.equal(assignments.error, null);
  assert.equal(assignments.count, 0);
  const readiness = await owner.client
    .from("pi_variant_readiness")
    .select("lifecycle_state,eligible_main_image_count,blocker_count")
    .eq("id", variantId)
    .single();
  assert.equal(readiness.error, null);
  assert.equal(readiness.data?.lifecycle_state, "DRAFT");
  assert.equal(readiness.data?.eligible_main_image_count, 0);
  assert.ok((readiness.data?.blocker_count ?? 0) > 0);
  results.push(
    "original Storage immutability, API delete positive control, private history and no promotion",
  );

  let screenshots = 0;
  checkpoint("originals: persisted history at six responsive widths");
  for (const width of [360, 390, 768, 1024, 1280, 1440]) {
    await owner.page.setViewportSize({ width, height: 1000 });
    await goto(owner.page, pathname);
    await owner.page.getByText("synthetic-owner-original.png", { exact: true }).waitFor();
    await owner.page.getByText("synthetic-large-original.png", { exact: true }).waitFor();
    assert.equal(
      await owner.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      true,
    );
    await owner.page.screenshot({
      path: path.join(input.output, `originals-${width}.png`),
      fullPage: true,
    });
    screenshots++;
  }
  results.push("original persisted history and form at six viewport widths");
  return {
    results,
    screenshots,
    originals: [
      { ...first.result, bytes: small },
      { ...second.result, bytes: large },
    ],
    assertRetained: async () => {
      checkpoint(
        "originals: re-read both unchanged Storage objects after media review and revocation",
      );
      await stored(first.result, small);
      await stored(second.result, large);
      assert.equal((await readOriginalIntakes(owner.client, variantId, 1))?.total, 2);
      results.push(
        "both original objects remain byte-identical, unapproved and not_attested after media review",
      );
    },
    assertRevoked: async () => {
      checkpoint("originals: revoked reviewer cannot replay completed upload or read stored bytes");
      await rejected(reviewer.ctx, second.metadata, large, 403);
      await inspect(reviewer, second.result, large, 403);
      assert.equal(
        (
          await reviewer.client.rpc("pi_complete_media_upload", {
            request_uuid: second.metadata.completion_id,
            intent_uuid: second.result.intent_id,
          })
        ).error?.code,
        "42501",
      );
      assert.ok(
        (await reviewer.client.storage.from("pi-product-originals").download(secondLocation)).error,
      );
      await assert.rejects(() => readOriginalIntakes(reviewer.client, variantId, 1));
      await stored(second.result, large);
      results.push("original revoked-session retry, direct RPC and Storage read denied");
    },
    assertLoggedOut: async () => {
      checkpoint("originals: logged-out browser cannot replay completed upload");
      await rejected(owner.ctx, first.metadata, small, 403);
      await inspect(owner, first.result, small, 403);
      assert.equal((await readOriginalIntakes(owner.client, variantId, 1))?.total, 2);
      results.push("original logged-out HTTP replay denied with retained history");
    },
  };
}
