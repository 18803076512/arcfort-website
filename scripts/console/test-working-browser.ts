import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import type {
  Browser,
  BrowserContext,
  Locator,
  Page,
  Request as BrowserRequest,
} from "./browser-runtime/node_modules/playwright/index.js";
import type { ConsoleClient } from "../../lib/console/client.ts";
import {
  readProductDraft,
  readProductHistory,
  readTechnicalHistory,
  readTechnicalWorkbench,
} from "../../lib/console/working.ts";
import { consoleWorkingEnabled } from "../../lib/console/working-config.ts";
import { browserOrigin, privateResponse, startBrowserServer } from "./browser-server.ts";

type Account = { id: string; email: string; password: string; client: ConsoleClient };
type BrowserInput = {
  publicKey: string;
  owner: Account;
  reviewer: Account;
  viewer: Account;
  fieldId: string;
  revokeReviewer: () => Promise<void>;
};

// Called only after the real-service runner has verified its disposable target and adopted
// the exact source baseline. Accounts stay in memory, never in storageState, traces or logs.
export async function runWorkingBrowser(input: BrowserInput) {
  assert.equal(process.env.CI, "true");
  assert.equal(consoleWorkingEnabled(), true);
  for (const account of [input.owner, input.reviewer, input.viewer])
    assert.match(account.email, /^m3-isolated-[a-f0-9-]+@example\.invalid$/);
  const { chromium } = createRequire(import.meta.url)(
    "./browser-runtime/node_modules/playwright",
  ) as typeof import("./browser-runtime/node_modules/playwright/index.js");
  const server = await startBrowserServer(input.publicKey);
  let browser: Browser | undefined;
  const results: string[] = [];
  let phase = "browser launch";
  let checkpoint: string | undefined;
  let pageErrors = 0;
  let externalRequests = 0;
  const commandBodies = new WeakMap<BrowserRequest, Buffer>();
  const output = path.resolve(".tmp/console-working-browser", randomUUID());
  try {
    await mkdir(output, { recursive: true });
    browser = await chromium.launch({
      headless: true,
      ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
    });
    async function context() {
      const value = await browser!.newContext({
        viewport: { width: 1440, height: 1000 },
        serviceWorkers: "block",
      });
      value.setDefaultTimeout(15_000);
      value.setDefaultNavigationTimeout(30_000);
      await value.route("**/*", async (route) => {
        const request = route.request();
        if (new URL(request.url()).origin !== browserOrigin) {
          externalRequests++;
          return route.abort();
        }
        if (request.url() === `${browserOrigin}/console/commands` && request.method() === "POST") {
          // Forward the real server response unchanged; document navigation can evict its browser body.
          const response = await route.fetch({ maxRedirects: 0 });
          commandBodies.set(request, await response.body());
          return route.fulfill({ response });
        }
        return route.continue();
      });
      value.on("page", (page) =>
        page.on("pageerror", () => {
          pageErrors++;
        }),
      );
      return value;
    }
    async function goto(page: Page, pathname: string) {
      const response = await page.goto(`${browserOrigin}${pathname}`);
      assert.equal(response?.status(), 200);
      privateResponse(response!.headers());
      await page.getByRole("heading", { level: 1 }).waitFor();
    }
    async function login(account: Account) {
      const ctx = await context();
      const page = await ctx.newPage();
      await goto(page, "/console/login");
      await page.getByLabel("Email", { exact: true }).fill(account.email);
      await page.getByLabel("Password", { exact: true }).fill(account.password);
      await Promise.all([
        page.waitForURL(`${browserOrigin}/console/dashboard`),
        page.getByRole("button", { name: "Sign In", exact: true }).click(),
      ]);
      const cookies = (await ctx.cookies()).filter((cookie) => cookie.name.startsWith("sb-"));
      assert.ok(cookies.length > 0);
      for (const cookie of cookies) {
        assert.equal(cookie.httpOnly, true);
        assert.equal(cookie.path, "/console");
        assert.equal(cookie.sameSite, "Lax");
      }
      assert.equal(await page.evaluate(() => localStorage.length), 0);
      return { ctx, page };
    }
    async function command(page: Page, button: Locator, status = 200, navigation = false) {
      // The pass-through route retains real response bytes before document replacement.
      const response = page
        .waitForResponse(
          (item) =>
            item.url() === `${browserOrigin}/console/commands` &&
            item.request().method() === "POST",
        )
        .then(async (received) => {
          assert.equal(received.status(), status);
          privateResponse(received.headers());
          const body = commandBodies.get(received.request());
          assert.ok(body, "The real command response body was not captured.");
          commandBodies.delete(received.request());
          const result = JSON.parse(body.toString("utf8"));
          assert.equal(result.ok, status === 200);
          assert.ok(
            !JSON.stringify(result).match(
              /raw_snapshot|private_storage_path|access_token|payload_digest/,
            ),
          );
          return { result, request: received.request().postDataJSON() };
        });
      const [received] = await Promise.all([
        response,
        button.click(),
        ...(navigation ? [page.waitForEvent("domcontentloaded")] : []),
      ]);
      return received;
    }
    async function wire(
      ctx: BrowserContext,
      headers: Record<string, string>,
      data: string,
      status: number,
    ) {
      const response = await ctx.request.post(`${browserOrigin}/console/commands`, {
        headers,
        // Playwright JSON-encodes malformed strings unless raw bytes are supplied.
        data: Buffer.from(data, "utf8"),
        maxRedirects: 0,
      });
      assert.equal(response.status(), status);
      privateResponse(response.headers());
      assert.equal((await response.json()).ok, false);
    }
    phase = "real form login and private cookies";
    const owner = await login(input.owner);
    const reviewer = await login(input.reviewer);
    const viewer = await login(input.viewer);
    results.push(phase);

    phase = "HTTP anonymous, origin, malformed and oversized requests";
    const headers = {
      origin: browserOrigin,
      "content-type": "application/json",
      "x-console-command": "1",
    };
    const anonymous = await context();
    const create = {
      action: "create",
      request_id: randomUUID(),
      identity: {
        sku: "AF-MIG-TS-9998",
        slug: "synthetic-browser-m3-item",
        source_reference: "Synthetic browser fixture",
      },
      copy: {
        name_en: "Synthetic browser item",
        name_zh: "",
        model: "",
        summary: "",
        description: "",
        applications: "",
      },
    };
    await wire(anonymous, headers, JSON.stringify(create), 403);
    await wire(
      owner.ctx,
      { ...headers, origin: "https://invalid.example" },
      JSON.stringify(create),
      403,
    );
    await wire(owner.ctx, { ...headers, "x-console-command": "0" }, JSON.stringify(create), 403);
    await wire(owner.ctx, headers, "{", 400);
    await wire(owner.ctx, headers, JSON.stringify({ padding: "x".repeat(131073) }), 400);
    await wire(viewer.ctx, headers, JSON.stringify(create), 403);
    await anonymous.close();
    results.push(phase);

    phase = "browser create, HTTP retry and database reload";
    const page = owner.page;
    await goto(page, "/console/products/new");
    await page.getByLabel("SKU", { exact: true }).fill(create.identity.sku);
    await page.getByLabel("Product slug", { exact: true }).fill(create.identity.slug);
    await page
      .getByLabel("Identity source reference", { exact: true })
      .fill(create.identity.source_reference);
    await page.getByLabel("English name", { exact: true }).fill(create.copy.name_en);
    const created = await command(
      page,
      page.getByRole("button", { name: "Create draft", exact: true }),
      200,
      true,
    );
    const id = created.result.result.variant_id as string;
    assert.match(id, /^[a-f0-9-]{36}$/);
    const product = `/console/products/${id}`;
    assert.equal(new URL(page.url()).pathname, `${product}/edit`);
    const retry = await owner.ctx.request.post(`${browserOrigin}/console/commands`, {
      headers,
      data: JSON.stringify(created.request),
      maxRedirects: 0,
    });
    assert.equal(retry.status(), 200);
    privateResponse(retry.headers());
    assert.deepEqual(await retry.json(), created.result);
    assert.equal((await readProductDraft(input.owner.client, id))?.revision, 1);
    results.push(phase);

    phase = "two browser tabs preserve stale input and current history";
    const stale = await owner.ctx.newPage();
    await goto(stale, `${product}/edit`);
    await page.getByLabel("Summary", { exact: true }).fill("Synthetic persisted browser summary");
    await command(page, page.getByRole("button", { name: "Save product", exact: true }));
    await page.getByText("Saved revision 2.", { exact: true }).waitFor();
    await stale.getByLabel("Summary", { exact: true }).fill("Synthetic stale browser summary");
    const denied = await command(
      stale,
      stale.getByRole("button", { name: "Save product", exact: true }),
      409,
    );
    assert.equal(denied.result.code, "40001");
    assert.equal(
      await stale.getByLabel("Summary", { exact: true }).inputValue(),
      "Synthetic stale browser summary",
    );
    assert.equal(
      await stale.getByRole("link", { name: /latest/ }).getAttribute("target"),
      "_blank",
    );
    assert.equal(
      (await readProductDraft(input.owner.client, id))?.summary,
      "Synthetic persisted browser summary",
    );
    await stale.close();
    await page.reload();
    assert.equal(
      await page.getByLabel("Summary", { exact: true }).inputValue(),
      "Synthetic persisted browser summary",
    );
    const history = await readProductHistory(input.owner.client, id, 1);
    assert.equal(history.total, 2);
    await goto(page, `${product}/history`);
    assert.equal(await page.locator(".console-history article").count(), 2);
    await page.getByText("Synthetic persisted browser summary", { exact: true }).waitFor();
    results.push(phase);

    phase = "source-free browser proposal cannot be approved";
    await goto(page, `${product}/review`);
    await page.getByLabel("Technical field", { exact: true }).selectOption(input.fieldId);
    await page
      .getByLabel("Profile / connection side", { exact: true })
      .fill("Synthetic browser scope");
    await page.getByLabel("Candidate value", { exact: true }).fill("QA-M6");
    await page
      .getByLabel("Proposal reason", { exact: true })
      .fill("Synthetic browser proposal, no evidence yet");
    await command(
      page,
      page.getByRole("button", { name: "Save proposal", exact: true }),
      200,
      true,
    );
    await command(
      page,
      page.getByRole("button", { name: "Submit for review", exact: true }),
      200,
      true,
    );
    let workbench = await readTechnicalWorkbench(input.owner.client, id);
    const scope = workbench?.scopes.find((item) => item.scope === "Synthetic browser scope");
    assert.ok(scope?.candidate && scope.candidate.state === "pending");
    const reviewPath = `${product}/review?scope=${scope.id}`;
    await goto(reviewer.page, reviewPath);
    await reviewer.page
      .getByLabel("Decision reason", { exact: true })
      .fill("Synthetic explicit browser decision");
    const noEvidence = await command(
      reviewer.page,
      reviewer.page.getByRole("button", { name: "Approve", exact: true }),
      422,
    );
    assert.equal(noEvidence.result.code, "23514");
    results.push(phase);

    phase = "browser EDIT binds an exact source and remains unconfirmed";
    await reviewer.page.getByRole("button", { name: "Edit", exact: true }).click();
    await reviewer.page.getByText("Add source reference", { exact: true }).click();
    for (const [label, value] of Object.entries({
      "Source title": "Synthetic browser drawing",
      "Document / record reference": "BROWSER-TEST-001",
      "Source custodian": "Synthetic test custodian",
      "Document revision": "TEST-1",
      "Page / clause / callout": "Test page 1 callout 1",
      "Source value": "QA-M6",
      "Evidence date": "2026-01-01",
    }))
      await reviewer.page.getByLabel(label, { exact: true }).fill(value);
    await reviewer.page.getByLabel("Evidence basis", { exact: true }).selectOption("drawing");
    await command(
      reviewer.page,
      reviewer.page.getByRole("button", { name: "Record source", exact: true }),
    );
    await reviewer.page.getByText("Source reference recorded.", { exact: true }).waitFor();
    await command(
      reviewer.page,
      reviewer.page.getByRole("button", { name: "Save edit for review", exact: true }),
      200,
      true,
    );
    workbench = await readTechnicalWorkbench(input.owner.client, id);
    assert.equal(workbench?.scopes[0].candidate?.state, "proposed");
    assert.equal(workbench?.scopes[0].candidate?.status, "NEEDS_FACTORY_CONFIRMATION");
    assert.equal(workbench?.scopes[0].candidate?.evidence[0]?.reference, "BROWSER-TEST-001");
    results.push(phase);

    phase = "explicit browser approval persists reviewer attribution";
    await command(
      reviewer.page,
      reviewer.page.getByRole("button", { name: "Submit for review", exact: true }),
      200,
      true,
    );
    await reviewer.page
      .getByLabel("Decision reason", { exact: true })
      .fill("Synthetic exact drawing reviewed in browser");
    await command(
      reviewer.page,
      reviewer.page.getByRole("button", { name: "Approve", exact: true }),
      200,
      true,
    );
    workbench = await readTechnicalWorkbench(input.owner.client, id);
    const approvedId = workbench?.scopes[0].current?.id;
    assert.ok(approvedId);
    assert.equal(workbench?.scopes[0].current?.status, "CONFIRMED");
    assert.equal(workbench?.scopes[0].candidate, null);
    const confirmed = await input.owner.client
      .from("technical_values")
      .select("confirmed_by,confirmed_at")
      .eq("id", approvedId)
      .single();
    assert.equal(confirmed.data?.confirmed_by, input.reviewer.id);
    assert.ok(confirmed.data?.confirmed_at);
    results.push(phase);

    phase = "browser rejection preserves current value and prior decisions";
    await goto(page, reviewPath);
    await page
      .getByLabel("Proposal reason", { exact: true })
      .fill("Synthetic follow-up proposal for rejection");
    await command(
      page,
      page.getByRole("button", { name: "Save proposal", exact: true }),
      200,
      true,
    );
    await command(
      page,
      page.getByRole("button", { name: "Submit for review", exact: true }),
      200,
      true,
    );
    await goto(reviewer.page, reviewPath);
    await reviewer.page
      .getByLabel("Decision reason", { exact: true })
      .fill("Synthetic reviewer rejects duplicate proposal");
    await command(
      reviewer.page,
      reviewer.page.getByRole("button", { name: "Reject", exact: true }),
      200,
      true,
    );
    workbench = await readTechnicalWorkbench(input.owner.client, id);
    assert.equal(workbench?.scopes[0].current?.id, approvedId);
    assert.equal(workbench?.scopes[0].candidate, null);
    const technicalHistory = await readTechnicalHistory(input.owner.client, id, 1);
    const decisions = technicalHistory.items
      .map((item) => item.verification_events?.decision)
      .filter(Boolean)
      .sort();
    assert.deepEqual(decisions, ["APPROVE", "EDIT", "REJECT"]);
    await goto(page, `${product}/history?kind=technical`);
    assert.equal(await page.locator(".console-history article").count(), 3);
    for (const decision of ["APPROVE:", "EDIT:", "REJECT:"])
      await page.getByText(decision, { exact: false }).waitFor();
    results.push(phase);

    phase = "read-only browser, responsive pages and missing-evidence blockers";
    await goto(viewer.page, `${product}/edit`);
    assert.equal(await viewer.page.getByLabel("English name", { exact: true }).isDisabled(), true);
    await goto(viewer.page, reviewPath);
    assert.equal(
      await viewer.page.getByRole("button", { name: "Approve", exact: true }).count(),
      0,
    );
    const readiness = await input.owner.client
      .from("pi_variant_readiness")
      .select("lifecycle_state,eligible_main_image_count,blocker_count")
      .eq("id", id)
      .single();
    assert.equal(readiness.data?.lifecycle_state, "DRAFT");
    assert.equal(readiness.data?.eligible_main_image_count, 0);
    assert.ok((readiness.data?.blocker_count ?? 0) > 0);
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const section of ["edit", "review", "history"]) {
        await goto(page, `${product}/${section}`);
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          true,
        );
        await page.screenshot({
          path: path.join(output, `${section}-${width}.png`),
          fullPage: true,
        });
      }
    }
    results.push(phase);

    phase = "revoked reviewer and logout cannot reuse browser credentials";
    checkpoint = "prepare pending proposal";
    await goto(page, reviewPath);
    await page
      .getByLabel("Proposal reason", { exact: true })
      .fill("Synthetic pending proposal for revocation test");
    await command(
      page,
      page.getByRole("button", { name: "Save proposal", exact: true }),
      200,
      true,
    );
    await command(
      page,
      page.getByRole("button", { name: "Submit for review", exact: true }),
      200,
      true,
    );
    await goto(reviewer.page, reviewPath);
    await reviewer.page
      .getByLabel("Decision reason", { exact: true })
      .fill("Synthetic stale reviewer attempt");
    checkpoint = "revoke reviewer role";
    await input.revokeReviewer();
    checkpoint = "stale browser approval returns forbidden";
    const revoked = await command(
      reviewer.page,
      reviewer.page.getByRole("button", { name: "Approve", exact: true }),
      403,
    );
    assert.equal(revoked.result.code, "42501");
    checkpoint = "revocation preserves pending candidate and approved value";
    workbench = await readTechnicalWorkbench(input.owner.client, id);
    assert.equal(workbench?.scopes[0].candidate?.state, "pending");
    assert.equal(workbench?.scopes[0].current?.id, approvedId);
    checkpoint = "owner form logout reaches login";
    await Promise.all([
      page.waitForURL(`${browserOrigin}/console/login`),
      page.getByRole("button", { name: "Sign Out", exact: true }).click(),
    ]);
    checkpoint = "logged-out product navigation is denied";
    await page.goto(`${browserOrigin}${product}/edit`);
    // App Router can deliver the unauthenticated redirect after the streamed document loads.
    await page.waitForURL((url) => url.pathname === "/console/login");
    assert.equal(new URL(page.url()).pathname, "/console/login");
    assert.equal(await page.getByLabel("English name", { exact: true }).count(), 0);
    checkpoint = "logged-out HTTP command is denied";
    await wire(owner.ctx, headers, JSON.stringify(created.request), 403);
    results.push(phase);
    checkpoint = "no page errors or external requests";
    assert.equal(pageErrors, 0);
    assert.equal(externalRequests, 0);
    await writeFile(
      path.join(output, "result.json"),
      JSON.stringify(
        { status: "PASS", scenarios: results, screenshots: 12, pageErrors, externalRequests },
        null,
        2,
      ),
    );
    console.log(
      `M3 database-backed browser acceptance passed: ${results.length} scenarios; synthetic-only screenshots and bounded report retained.`,
    );
    return id;
  } catch {
    await writeFile(
      path.join(output, "result.json"),
      JSON.stringify(
        { status: "FAIL", checkpoint: phase, detail: checkpoint, completed: results },
        null,
        2,
      ),
    );
    throw new Error(`M3 browser acceptance failed at ${phase}; private output suppressed.`);
  } finally {
    try {
      if (browser) await browser.close();
    } finally {
      await server.stop();
    }
  }
}
