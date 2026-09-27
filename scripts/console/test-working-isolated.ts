import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { buildShadowCatalog } from "./build-shadow-catalog.ts";
import { assertPristineBaseline, openLocalAcceptance, sqlLiteral } from "./local-acceptance.ts";
import {
  checkInviteOnlyProvider,
  createConsoleClient,
  type ConsoleClient,
} from "../../lib/console/client.ts";
import { executeConsoleCommand } from "../../lib/console/commands.ts";
import {
  readProductDraft,
  readProductHistory,
  readTechnicalWorkbench,
} from "../../lib/console/working.ts";
import type {
  CommandInput,
  CommandResult,
  ConsoleCommand,
} from "../../lib/domain/catalog/commands.ts";
import type { Database } from "../../lib/supabase/database.types.ts";
import { runWorkingBrowser } from "./test-working-browser.ts";
import { runCompatibilityAcceptance } from "./test-compatibility-isolated.ts";

let checkpoint = "local target preflight";
async function main() {
  const local = openLocalAcceptance();
  const config = {
    origin: "http://127.0.0.1:3000",
    supabaseUrl: local.url,
    publicKey: local.key,
    environment: "local" as const,
  };
  assert.equal(await checkInviteOnlyProvider(config), true);
  // Refuse existing users/work before creating anything. The runner never resets a database.
  const pristine = local.json<{
    users: number;
    roles: number;
    adoptions: number;
    drafts: number;
    events: number;
    products: number;
    compatibilityHeads: number;
    compatibilityRevisions: number;
    compatibilitySources: number;
    mediaSources: number;
    uploadIntents: number;
    uploadCompletions: number;
    storageObjects: number;
  }>(`select json_build_object(
    'users',(select count(*) from auth.users), 'roles',(select count(*) from console_user_roles),
    'adoptions',(select count(*) from private.pi_working_adoptions),
    'drafts',(select count(*) from private.pi_product_draft_heads),
    'events',(select count(*) from verification_events), 'products',(select count(*) from product_variants),
    'compatibilityHeads',(select count(*) from compatibility_revision_heads),
    'compatibilityRevisions',(select count(*) from compatibility_revisions),
    'compatibilitySources',(select count(*) from compatibility_source_bindings),
    'mediaSources',(select count(*) from media_source_bindings),
    'uploadIntents',(select count(*) from media_upload_intents),
    'uploadCompletions',(select count(*) from media_upload_completions),
    'storageObjects',(select count(*) from storage.objects));`);
  assertPristineBaseline(pristine);
  const catalog = await buildShadowCatalog();
  const tables = {
    ...catalog.tables,
    import_rows: catalog.tables.import_rows.map((row) => ({
      ...row,
      import_batch_id: catalog.batchId,
      raw_payload: row.normalized_payload,
    })),
  };
  const originalFacts = local.json(
    "select jsonb_agg(to_jsonb(t) order by id) from technical_values t;",
  );
  const originalVariants = local.json(
    "select jsonb_agg(to_jsonb(t) order by id) from product_variants t;",
  );
  const relationshipIds = catalog.tables.compatibility_relationships
    .map((row) => sqlLiteral(row.id))
    .join(",");
  const compatibilityRetentionQueries = [
    ...(["compatibility_entities", "compatibility_relationships", "evidence_sources"] as const).map(
      (table) => {
        const ids = catalog.tables[table].map((row) => sqlLiteral(row.id)).join(",");
        return `select jsonb_agg(to_jsonb(t) order by id) from ${table} t where id in (${ids});`;
      },
    ),
    `select jsonb_agg(to_jsonb(t) order by compatibility_relationship_id,evidence_source_id) from compatibility_evidence t where compatibility_relationship_id in (${relationshipIds});`,
  ];
  const originalCompatibility = compatibilityRetentionQueries.map((query) => local.json(query));
  const mediaRetentionQueries = (["media_assets", "product_media"] as const).map((table) => {
    const ids = catalog.tables[table].map((row) => sqlLiteral(row.id)).join(",");
    assert.ok(ids.length > 0, "Original media baseline must be present.");
    return `select jsonb_agg(to_jsonb(t) order by id) from ${table} t where id in (${ids});`;
  });
  const originalMedia = mediaRetentionQueries.map((query) => local.json(query));
  const admin = createClient<Database>(local.url, local.adminKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(12_000) }) },
  });
  Object.assign(process.env, {
    CONSOLE_ENABLED: "true",
    CONSOLE_WORKING_ENABLED: "true",
    CONSOLE_COMPATIBILITY_ENABLED: "true",
    CONSOLE_ORIGINALS_ENABLED: "true",
    CONSOLE_ENVIRONMENT: "local",
    CONSOLE_ORIGIN: config.origin,
    CONSOLE_SUPABASE_URL: local.url,
    CONSOLE_SUPABASE_PUBLISHABLE_KEY: local.key,
  });
  const sessions: ConsoleClient[] = [];
  function session() {
    const cookies = new Map<string, string>();
    const client = createConsoleClient(config, {
      getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
      setAll: (items) => {
        for (const item of items) {
          if (item.value) cookies.set(item.name, item.value);
          else cookies.delete(item.name);
        }
      },
    });
    sessions.push(client);
    return client;
  }
  async function fixture(role?: "owner" | "editor" | "reviewer" | "viewer") {
    checkpoint = `synthetic ${role ?? "unassigned"} account creation`;
    const email = `m3-isolated-${randomUUID()}@example.invalid`;
    const password = randomUUID() + randomUUID();
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    assert.ok(!created.error && created.data.user);
    const id = created.data.user.id;
    if (role) {
      checkpoint = `synthetic ${role} role assignment`;
      assert.equal(
        (await admin.from("console_user_roles").insert({ user_id: id, role })).error,
        null,
      );
    }
    const client = session();
    checkpoint = `synthetic ${role ?? "unassigned"} password login`;
    assert.equal((await client.auth.signInWithPassword({ email, password })).error, null);
    return { id, client, email, password };
  }
  const request = (input: CommandInput): ConsoleCommand => ({ ...input, request_id: randomUUID() });
  function success(result: CommandResult) {
    assert.equal(result.ok, true, "Expected successful command.");
    if (!result.ok) throw new Error("Command failed.");
    return result.result;
  }
  function failure(result: CommandResult, code: string) {
    assert.equal(result.ok, false);
    if (result.ok) throw new Error("Expected denial.");
    assert.equal(result.code, code);
  }
  function reviewTarget(result: ReturnType<typeof success>) {
    assert.ok(result.value_id && result.digest && typeof result.revision === "number");
    return { value_id: result.value_id, digest: result.digest, revision: result.revision };
  }
  const copy = {
    name_en: "Synthetic isolated test item",
    name_zh: "",
    model: "",
    summary: "Synthetic test only",
    description: "Disposable acceptance fixture, never public.",
    applications: "",
  };
  const create = request({
    action: "create",
    identity: {
      sku: "AF-MIG-TS-9996",
      slug: "synthetic-isolated-m3-item",
      source_reference: "Synthetic isolated fixture",
    },
    copy,
  });
  try {
    checkpoint = "real Auth sessions and pre-adoption denial";
    const owner = await fixture("owner");
    const editor = await fixture("editor");
    const reviewer = await fixture("reviewer");
    const viewer = await fixture("viewer");
    const noRole = await fixture();
    checkpoint = "owner command requires adoption";
    failure(await executeConsoleCommand(owner.client, create), "55000");
    checkpoint = "unauthorized application commands denied before adoption";
    for (const client of [session(), noRole.client, viewer.client])
      failure(await executeConsoleCommand(client, create), "42501");
    checkpoint = "viewer direct RPC denied before adoption";
    assert.equal(
      (
        await viewer.client.rpc("pi_create_product_draft", {
          request_uuid: randomUUID(),
          identity: create.action === "create" ? create.identity : {},
          draft_copy: copy,
        })
      ).error?.code,
      "42501",
    );

    checkpoint = "exact adoption waits for a legacy import transaction";
    const commit = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    assert.match(commit, /^[a-f0-9]{40}$/);
    const adoption = `begin; select set_config('request.jwt.claim.sub',${sqlLiteral(owner.id)},true); select set_config('request.jwt.claim.role','authenticated',true);
      select private.pi_adopt_15ak_working_scope(${sqlLiteral(catalog.sourceRevision)},${sqlLiteral(JSON.stringify(tables))}::jsonb,${sqlLiteral(commit)},'Synthetic disposable CI adoption only'); commit;`;
    await local.withAuthorityLock(() => local.asyncSql(adoption), 1, true);
    assert.equal(local.sql("select count(*) from private.pi_working_adoptions;"), "1");
    const status = await owner.client.rpc("pi_working_status");
    assert.equal(status.error, null);
    assert.deepEqual(status.data, [{ adopted: true, can_edit: true, can_review: true }]);

    checkpoint = "post-adoption legacy service replay denied without partial change";
    const replayRow: Database["public"]["Tables"]["products"]["Insert"] = JSON.parse(
      JSON.stringify(tables.products[0]),
    );
    const replay = await admin.from("products").upsert(replayRow, { onConflict: "external_key" });
    assert.equal(replay.error?.code, "55000");
    assert.equal(
      (await admin.rpc("pi_reconcile_shadow_batch", { batch_id: catalog.batchId })).error?.code,
      "55000",
    );
    assert.deepEqual(
      local.json("select jsonb_agg(to_jsonb(t) order by id) from product_variants t;"),
      originalVariants,
    );

    checkpoint = "create persistence, idempotency and concurrent stable identity";
    const created = success(await executeConsoleCommand(owner.client, create));
    assert.deepEqual(success(await executeConsoleCommand(owner.client, create)), created);
    assert.ok(created.variant_id);
    const id = created.variant_id;
    const duplicate = {
      action: "create" as const,
      identity: {
        sku: "AF-MIG-TS-9997",
        slug: "synthetic-isolated-m3-duplicate",
        source_reference: "Synthetic concurrency fixture",
      },
      copy,
    };
    const duplicates = await local.withAuthorityLock(
      () =>
        Promise.all([
          executeConsoleCommand(owner.client, request(duplicate)),
          executeConsoleCommand(editor.client, request(duplicate)),
        ]),
      2,
    );
    assert.equal(duplicates.filter((item) => item.ok).length, 1);
    failure(duplicates.find((item) => !item.ok)!, "23505");
    const createdRow = await readProductDraft(viewer.client, id);
    assert.equal(createdRow?.revision, 1);
    assert.equal(createdRow?.editable, false);

    checkpoint = "two persisted saves contend, stale revision loses";
    const saves = await local.withAuthorityLock(
      () =>
        Promise.all([
          executeConsoleCommand(
            owner.client,
            request({
              action: "save",
              variant_id: id,
              revision: 1,
              copy: { ...copy, summary: "Synthetic owner change" },
            }),
          ),
          executeConsoleCommand(
            editor.client,
            request({
              action: "save",
              variant_id: id,
              revision: 1,
              copy: { ...copy, summary: "Synthetic editor change" },
            }),
          ),
        ]),
      2,
    );
    assert.equal(saves.filter((item) => item.ok).length, 1);
    failure(saves.find((item) => !item.ok)!, "40001");
    const draft = await readProductDraft(owner.client, id);
    assert.equal(draft?.revision, 2);
    assert.ok(["Synthetic owner change", "Synthetic editor change"].includes(draft?.summary ?? ""));
    const history = await readProductHistory(owner.client, id, 1);
    assert.equal(history.total, 2);
    assert.equal(history.items.length, 2);
    for (const forbidden of [
      "raw_snapshot",
      "private_storage_path",
      "access_token",
      "payload_digest",
    ])
      assert.equal(JSON.stringify({ draft, history }).includes(forbidden), false);
    failure(
      await executeConsoleCommand(owner.client, {
        ...create,
        copy: { ...copy, summary: "Changed receipt payload" },
      }),
      "40001",
    );
    assert.ok(
      (
        await owner.client
          .from("product_variants")
          .update({ model: "Forbidden direct write" })
          .eq("id", id)
      ).error,
    );

    checkpoint = "technical source, rollback and explicit EDIT";
    const field = await owner.client
      .from("technical_field_definitions")
      .select("id")
      .eq("field_key", "thread")
      .single();
    assert.ok(!field.error && field.data);
    const target = { variant_id: id, field_id: field.data.id, scope: "Synthetic acceptance scope" };
    const source = {
      source_kind: "company_record",
      source_level: "A",
      title: "Synthetic acceptance drawing",
      source_reference: "TEST-ONLY-001",
      evidence_basis: "drawing",
      evidence_date: "2026-01-01",
      owner_name: "Synthetic test custodian",
      revision_label: "TEST-1",
      source_location: "Test page 1 callout 1",
      asserted_value: "QA-M6",
      asserted_unit: "",
    };
    const sourceResult = success(
      await executeConsoleCommand(editor.client, request({ action: "source", ...target, source })),
    );
    assert.ok(sourceResult.source_id);
    const links = [{ source_id: sourceResult.source_id, role: "supporting" as const }];
    const proposal = {
      action: "propose" as const,
      ...target,
      revision: 0,
      value: { value_text: "QA-M6", unit: "" },
      evidence: [],
      reason: "Synthetic missing-evidence proposal",
    };
    const before = local.sql("select count(*) from technical_values;");
    failure(
      await executeConsoleCommand(
        editor.client,
        request({ ...proposal, evidence: [{ source_id: randomUUID(), role: "supporting" }] }),
      ),
      "22023",
    );
    assert.equal(local.sql("select count(*) from technical_values;"), before);
    const proposed = success(await executeConsoleCommand(editor.client, request(proposal)));
    const pending = success(
      await executeConsoleCommand(
        editor.client,
        request({ action: "submit", ...reviewTarget(proposed) }),
      ),
    );
    const approve = request({
      action: "review",
      ...reviewTarget(pending),
      decision: "APPROVE",
      reason: "Synthetic explicit review",
      resolution: "",
      replacement: null,
      evidence: null,
    });
    failure(await executeConsoleCommand(editor.client, approve), "42501");
    assert.equal(
      (
        await editor.client.rpc("pi_review_technical_revision", {
          request_uuid: randomUUID(),
          value_uuid: pending.value_id!,
          expected_revision: pending.revision!,
          expected_digest: pending.digest!,
          decision: "APPROVE",
          review_reason: "Synthetic forbidden editor approval",
          conflict_resolution: "",
          replacement_value: null,
          replacement_evidence: null,
        })
      ).error?.code,
      "42501",
    );
    failure(await executeConsoleCommand(reviewer.client, approve), "23514");
    assert.equal(local.sql("select count(*) from verification_events;"), "0");
    const edited = success(
      await executeConsoleCommand(reviewer.client, {
        ...approve,
        request_id: randomUUID(),
        decision: "EDIT",
        replacement: { value_text: "QA-M6", unit: "" },
        evidence: links,
      }),
    );
    const workbench = await readTechnicalWorkbench(owner.client, id);
    assert.equal(
      workbench?.scopes.find((item) => item.scope === target.scope)?.candidate?.status,
      "NEEDS_FACTORY_CONFIRMATION",
    );
    assert.equal(local.sql("select count(*) from verification_events where decision='EDIT';"), "1");

    checkpoint = "concurrent approval retry produces one immutable decision";
    const pendingEdit = success(
      await executeConsoleCommand(
        editor.client,
        request({ action: "submit", ...reviewTarget(edited) }),
      ),
    );
    const review = { ...approve, ...reviewTarget(pendingEdit), request_id: randomUUID() };
    const approvals = await local.withAuthorityLock(
      () =>
        Promise.all([
          executeConsoleCommand(reviewer.client, review),
          executeConsoleCommand(reviewer.client, review),
        ]),
      2,
    );
    const approved = success(approvals[0]);
    assert.deepEqual(success(approvals[1]), approved);
    assert.equal(
      local.sql("select count(*) from verification_events where decision='APPROVE';"),
      "1",
    );
    const confirmed = await owner.client
      .from("technical_values")
      .select("verification_status,confirmed_by,confirmed_at")
      .eq("id", approved.value_id!)
      .single();
    assert.equal(confirmed.data?.verification_status, "CONFIRMED");
    assert.equal(confirmed.data?.confirmed_by, reviewer.id);
    assert.ok(confirmed.data?.confirmed_at);
    failure(
      await executeConsoleCommand(reviewer.client, { ...review, decision: "REJECT" }),
      "40001",
    );
    failure(
      await executeConsoleCommand(reviewer.client, { ...approve, request_id: randomUUID() }),
      "40001",
    );

    checkpoint = "secondary evidence cannot approve, rejection remains historical";
    const secondary = success(
      await executeConsoleCommand(
        editor.client,
        request({
          action: "source",
          ...target,
          source: {
            ...source,
            source_kind: "secondary_reference",
            source_level: "D",
            revision_label: "TEST-D",
          },
        }),
      ),
    );
    const replacement = success(
      await executeConsoleCommand(
        editor.client,
        request({
          ...proposal,
          revision: approved.revision!,
          evidence: [{ source_id: secondary.source_id!, role: "supporting" }],
        }),
      ),
    );
    const pendingReplacement = success(
      await executeConsoleCommand(
        editor.client,
        request({ action: "submit", ...reviewTarget(replacement) }),
      ),
    );
    const secondaryReview = {
      ...approve,
      ...reviewTarget(pendingReplacement),
      request_id: randomUUID(),
    };
    failure(await executeConsoleCommand(reviewer.client, secondaryReview), "23514");
    success(
      await executeConsoleCommand(reviewer.client, { ...secondaryReview, decision: "REJECT" }),
    );
    const afterReject = await readTechnicalWorkbench(viewer.client, id);
    const effective = afterReject?.scopes.find((item) => item.scope === target.scope);
    assert.equal(effective?.current?.id, approved.value_id);
    assert.equal(effective?.candidate, null);
    assert.equal(
      local.sql("select count(*) from technical_revisions where review_state='rejected';"),
      "1",
    );

    const compatibility = await runCompatibilityAcceptance({
      local,
      variantId: id,
      owner,
      editor,
      reviewer,
      viewer,
      checkpoint: (value) => {
        checkpoint = value;
      },
    });

    checkpoint = "revocation denies still-valid sessions at handler and database";
    assert.equal(
      (
        await admin
          .from("console_user_roles")
          .update({ revoked_at: new Date().toISOString() })
          .eq("user_id", editor.id)
      ).error,
      null,
    );
    failure(
      await executeConsoleCommand(
        editor.client,
        request({ action: "save", variant_id: id, revision: 2, copy }),
      ),
      "42501",
    );
    assert.equal(
      (
        await editor.client.rpc("pi_save_product_draft", {
          request_uuid: randomUUID(),
          variant_uuid: id,
          expected_revision: 2,
          draft_copy: copy,
        })
      ).error?.code,
      "42501",
    );
    await assert.rejects(() => readProductDraft(editor.client, id));

    checkpoint = "database-backed browser forms, HTTP, cookies and review history";
    await runWorkingBrowser({
      publicKey: local.key,
      owner,
      reviewer,
      viewer,
      fieldId: field.data.id,
      compatibilityTargetId: compatibility.targetId,
      originals: true,
      revokeReviewer: async () => {
        assert.equal(
          (
            await admin
              .from("console_user_roles")
              .update({ revoked_at: new Date().toISOString() })
              .eq("user_id", reviewer.id)
          ).error,
          null,
        );
      },
    });
    checkpoint = "revoked reviewer cannot replay compatibility receipts or access records";
    await compatibility.assertRevoked();

    checkpoint = "real references preserved and no lifecycle/publication advancement";
    const ids = catalog.tables.technical_values.map((row) => sqlLiteral(row.id)).join(",");
    assert.deepEqual(
      local.json(
        `select jsonb_agg(to_jsonb(t) order by id) from technical_values t where id in (${ids});`,
      ),
      originalFacts,
    );
    const variants = catalog.tables.product_variants.map((row) => sqlLiteral(row.id)).join(",");
    assert.deepEqual(
      local.json(
        `select jsonb_agg(to_jsonb(t) order by id) from product_variants t where id in (${variants});`,
      ),
      originalVariants,
    );
    assert.deepEqual(
      compatibilityRetentionQueries.map((query) => local.json(query)),
      originalCompatibility,
    );
    assert.deepEqual(
      mediaRetentionQueries.map((query) => local.json(query)),
      originalMedia,
    );
    assert.equal(local.sql("select count(*) from media_upload_intents;"), "2");
    assert.equal(local.sql("select count(*) from media_upload_completions;"), "2");
    assert.equal(local.sql("select count(*) from storage.objects;"), "2");
    assert.equal(
      local.sql(`select count(*) from media_upload_intents i
      join media_upload_completions c on c.intent_id=i.id
      join storage.objects o on o.id=c.storage_object_id
      where o.bucket_id='pi-product-originals' and o.name=i.storage_path
        and o.owner_id=i.actor_id::text and c.created_by=i.actor_id
        and o.metadata->>'size'=i.manifest->>'byte_size'
        and o.metadata->>'mimetype'=i.manifest->>'mime_type';`),
      "2",
    );
    assert.equal(local.sql("select count(*) from media_source_bindings;"), "0");
    assert.equal(
      local.sql(
        "select count(*) from product_variants where not is_shadow and lifecycle_state='DRAFT' and legacy_image_status='needs_photo';",
      ),
      "3",
    );
    assert.equal(local.sql("select count(*) from publish_records;"), "0");
    console.log(
      "M3, compatibility and original intake local acceptance passed: Auth/PostgREST/Storage, observed lock contention, database-backed browser forms, review/history, upload/readback, revocation and source retention. Synthetic-only; no real product approval or publication.",
    );
  } finally {
    // No data deletion: preserve failed fixtures for inspection until the disposable stack is stopped.
    for (const client of sessions)
      await client.auth.signOut({ scope: "local" }).catch(() => undefined);
  }
}

main().catch(() => {
  console.error(
    `Working Console isolated acceptance failed at: ${checkpoint}. Raw SQL, provider responses and credentials are suppressed.`,
  );
  process.exitCode = 1;
});
