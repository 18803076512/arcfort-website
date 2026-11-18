import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import type { Browser, Page } from "./console/browser-runtime/node_modules/playwright/index.js";
import { assertNoRuntimeEnvFiles, assertPortAvailable } from "./console/browser-server.ts";
import { arcfortProducts } from "../lib/data/products.ts";
import {
  getRfqListItemKey,
  maxRfqItems,
  rfqListStorageKey,
  type RfqListItem,
} from "../lib/rfq-list.ts";

const { chromium } = createRequire(import.meta.url)(
  "./console/browser-runtime/node_modules/playwright",
) as typeof import("./console/browser-runtime/node_modules/playwright/index.js");
const origin = "http://127.0.0.1:3982";
const paths = [
  "/",
  "/products",
  "/products/mig-mag-torch-parts",
  "/products/mig-mag-torch-parts/mig-gas-nozzle-for-mb15",
  "/about",
  "/distributor-supply",
  "/oem-service",
  "/downloads",
  "/contact",
  "/rfq",
];
const output = process.env.PUBLIC_HYDRATION_OUTPUT || ".tmp/public-hydration";
const errors: { path: string; width: number; message: string }[] = [];
const refused: string[] = [];
let activePath = "",
  activeWidth = 0,
  delayMs = 0,
  delayed = 0,
  completed = 0,
  navigationChecks = 0,
  galleryChecks = 0,
  finderChecks = 0,
  rfqListChecks = 0,
  status = "FAIL";
let browser: Browser | undefined;

async function verifyRfqListMutationOutcomes(browser: Browser) {
  const product = arcfortProducts.find((item) => item.slug === "mig-gas-nozzle-for-mb15");
  assert.ok(product);
  const target: RfqListItem = {
    sku: product.sku,
    name: product.name,
    category: product.category,
    categorySlug: product.categorySlug,
    slug: product.slug,
  };
  const saved: RfqListItem = {
    sku: "SYNTHETIC-SAVED",
    name: "Synthetic saved product",
    category: "MIG / MAG Torch Parts",
    categorySlug: "mig-mag-torch-parts",
    slug: "synthetic-saved-product",
    requestedQuantity: "25 pcs",
    buyerReference: "Synthetic reference",
  };
  const path = `/products/${target.categorySlug}/${target.slug}`;
  const observations: unknown[] = [];
  await mkdir(output, { recursive: true });

  async function inspect(page: Page, label: string) {
    const observation = await page.evaluate((storageKey) => {
      const readSavedList = Reflect.get(window, "__arcfortReadSavedRfqList") as () => string | null;
      let storageReadBlocked = false;
      try {
        localStorage.getItem(storageKey);
      } catch {
        storageReadBlocked = true;
      }
      return {
        items: JSON.parse(readSavedList() || "[]") as RfqListItem[],
        storageReadBlocked,
        events: Reflect.get(window, "__arcfortRfqListEvents") as unknown[],
        changes: Reflect.get(window, "__arcfortRfqListChanges") as number,
        writes: Reflect.get(window, "__arcfortRfqListWrites") as number,
        announcements: Array.from(document.querySelectorAll('[aria-live="polite"]')).map(
          (element) => element.textContent?.trim() || "",
        ),
        statuses: Array.from(document.querySelectorAll('[role="status"]')).map(
          (element) => element.textContent?.trim() || "",
        ),
      };
    }, rfqListStorageKey);
    observations.push({ label, ...observation });
    await writeFile(`${output}/rfq-list-observations.json`, JSON.stringify(observations, null, 2));
    return observation;
  }

  for (const width of [390, 1440]) {
    const cases = [
      { mode: "normal", initial: [saved], route: path },
      { mode: "denied", initial: [saved], route: path },
      { mode: "duplicate", initial: [saved, target, target], route: path },
      {
        mode: "full",
        initial: Array.from({ length: maxRfqItems }, (_, index) => ({
          ...saved,
          sku: `SYNTHETIC-${index}`,
          slug: `synthetic-product-${index}`,
        })),
        route: path,
      },
      { mode: "access-remove-SecurityError", initial: [saved, target], route: path },
      { mode: "access-form-SecurityError", initial: [saved, target], route: "/rfq" },
      { mode: "access-add-SecurityError", initial: [saved], route: path },
      { mode: "read-remove-SecurityError", initial: [saved, target], route: path },
      { mode: "read-form-SecurityError", initial: [saved, target], route: "/rfq" },
      { mode: "read-add-SecurityError", initial: [saved], route: path },
      { mode: "postwrite-remove-SecurityError", initial: [saved, target], route: path },
      { mode: "postwrite-form-SecurityError", initial: [saved, target], route: "/rfq" },
      { mode: "postwrite-form-clear-SecurityError", initial: [saved, target], route: "/rfq" },
      ...["SecurityError", "QuotaExceededError"].flatMap((error) => [
        { mode: `add-${error}`, initial: [saved], route: path },
        { mode: `remove-${error}`, initial: [saved, target], route: path },
        { mode: `form-${error}`, initial: [saved, target], route: "/rfq" },
      ]),
      { mode: "form-normal", initial: [saved, target], route: "/rfq" },
    ];
    for (const scenario of cases) {
      const label = `${width}-${scenario.mode}`;
      const context = await browser.newContext({
        serviceWorkers: "block",
        viewport: { width, height: 900 },
      });
      const pageErrors: string[] = [];
      try {
        await context.route("**/*", async (route) => {
          const request = route.request();
          if (
            new URL(request.url()).origin !== origin ||
            !["GET", "HEAD"].includes(request.method())
          ) {
            refused.push(`${request.method()} ${new URL(request.url()).origin}`);
            return route.abort();
          }
          return route.continue();
        });
        await context.addInitScript(
          ({ initial, storageKey, mode }) => {
            localStorage.setItem(storageKey, JSON.stringify(initial));
            localStorage.setItem(
              "arcfort_analytics_consent",
              mode === "denied" ? "denied" : "granted",
            );
            const getItem = Storage.prototype.getItem;
            Reflect.set(window, "__arcfortReadSavedRfqList", () =>
              getItem.call(localStorage, storageKey),
            );
            const events: unknown[] = [];
            Reflect.set(window, "__arcfortRfqListEvents", events);
            Reflect.set(window, "gtag", (command: string, name: string, params: unknown) => {
              if (command === "event" && /^rfq_list_/.test(name)) events.push({ name, params });
            });
            Reflect.set(window, "__arcfortRfqListChanges", 0);
            Reflect.set(window, "__arcfortRfqListWrites", 0);
            window.addEventListener("arcfort:rfq-list-changed", () => {
              Reflect.set(
                window,
                "__arcfortRfqListChanges",
                Reflect.get(window, "__arcfortRfqListChanges") + 1,
              );
            });
            const error = mode.endsWith("SecurityError")
              ? "SecurityError"
              : mode.endsWith("QuotaExceededError")
                ? "QuotaExceededError"
                : "";
            const setItem = Storage.prototype.setItem;
            const afterHydration = /^(access|read|postwrite)-/.test(mode);
            const readOnlyFailure = mode.startsWith("read-");
            const postWriteFailure = mode.startsWith("postwrite-");
            const isBlocked = (key: string) =>
              key === storageKey &&
              (!afterHydration || Reflect.get(window, "__arcfortBlockRfqStorage") === true);
            Storage.prototype.setItem = function (key, value) {
              if (key === storageKey) {
                Reflect.set(
                  window,
                  "__arcfortRfqListWrites",
                  Reflect.get(window, "__arcfortRfqListWrites") + 1,
                );
              }
              if (error && !readOnlyFailure && !postWriteFailure && isBlocked(key))
                throw new DOMException("Synthetic blocked RFQ storage", error);
              const result = setItem.call(this, key, value);
              if (postWriteFailure && isBlocked(key))
                Reflect.set(window, "__arcfortBlockRfqRead", true);
              return result;
            };
            if (error && afterHydration) {
              Storage.prototype.getItem = function (key) {
                if (
                  isBlocked(key) &&
                  (!postWriteFailure || Reflect.get(window, "__arcfortBlockRfqRead") === true)
                )
                  throw new DOMException("Synthetic unreadable RFQ storage", error);
                return getItem.call(this, key);
              };
            }
          },
          { initial: scenario.initial, storageKey: rfqListStorageKey, mode: scenario.mode },
        );
        const page = await context.newPage();
        page.on("pageerror", (error) => pageErrors.push(error.message));
        assert.equal(
          (await page.goto(origin + scenario.route, { waitUntil: "networkidle" }))?.status(),
          200,
        );
        const losesReads = /^(access|read|postwrite)-/.test(scenario.mode);
        const postWriteFailure = scenario.mode.startsWith("postwrite-");
        if (losesReads) {
          const selection = scenario.mode.includes("form-")
            ? page.locator("#selected-products")
            : page.locator("main");
          await selection
            .getByRole("button", {
              name: scenario.mode.includes("add-")
                ? `Add ${target.name} to RFQ list`
                : `Remove ${target.name} from RFQ list`,
              exact: true,
            })
            .first()
            .waitFor();
          await page.evaluate(() => Reflect.set(window, "__arcfortBlockRfqStorage", true));
        }
        const isForm = scenario.mode.includes("form-");
        if (scenario.mode === "postwrite-form-clear-SecurityError") {
          const selection = page.locator("#selected-products");
          await selection.getByRole("button", { name: "Clear List", exact: true }).click();
          const cleared = await inspect(page, label);
          assert.deepEqual(cleared.items, [], `${label} inspects the actual persisted list`);
          assert.equal(cleared.storageReadBlocked, true);
          assert.deepEqual(cleared.events, []);
          assert.equal(cleared.changes, 0);
          assert.equal(cleared.writes, 1);
          assert.match(await selection.innerText(), /Could not clear/);
          assert.equal(await selection.getByRole("button", { name: /^Remove / }).count(), 2);
          assert.equal(
            await selection.locator('input[id^="line-quantity-"]').first().inputValue(),
            saved.requestedQuantity,
          );
          assert.ok(await page.locator('a[href^="mailto:"]').count());
          assert.ok(await page.locator('a[href*="wa.me/"]').count());
          await page.screenshot({ path: `${output}/${label}.png`, fullPage: true });
        } else if (isForm) {
          const selection = page.locator("#selected-products");
          const remove = selection.getByRole("button", {
            name: `Remove ${target.name} from RFQ list`,
            exact: true,
          });
          if (/^(access|read)-/.test(scenario.mode)) {
            await selection.locator('input[id^="line-quantity-"]').first().fill("99 pcs");
            const edited = await inspect(page, `${label}-edit`);
            assert.deepEqual(edited.items, scenario.initial);
            assert.equal(edited.writes, 0, `${label} must not write an unreadable selection`);
            assert.equal(edited.changes, 0);
          }
          await remove.click();
          const removed = await inspect(page, `${label}-remove`);
          const failed = scenario.mode !== "form-normal";
          assert.equal(removed.items.length, failed && !postWriteFailure ? 2 : 1, label);
          assert.equal(removed.events.length, failed ? 0 : 1, label);
          if (failed) {
            assert.match(await selection.innerText(), /Could not remove/);
            assert.deepEqual(
              removed.items,
              postWriteFailure ? [saved] : scenario.initial,
              `${label} actual saved details`,
            );
            assert.equal(removed.storageReadBlocked, losesReads);
            assert.equal(removed.writes, losesReads && !postWriteFailure ? 0 : 1);
            assert.equal(await selection.getByRole("button", { name: /^Remove / }).count(), 2);
            assert.equal(
              await selection.locator('input[id^="line-quantity-"]').first().inputValue(),
              saved.requestedQuantity,
            );
            assert.equal(
              await selection.locator('input[id^="line-reference-"]').first().inputValue(),
              saved.buyerReference,
            );
          }
          await selection.getByRole("button", { name: "Clear List", exact: true }).click();
          const cleared = await inspect(page, `${label}-clear`);
          assert.equal(cleared.items.length, failed ? (postWriteFailure ? 1 : 2) : 0, label);
          assert.equal(cleared.events.length, failed ? 0 : 2, label);
          assert.equal(cleared.changes, failed ? 0 : 2, label);
          if (failed) {
            assert.match(await selection.innerText(), /Could not clear/);
            assert.deepEqual(cleared.items, postWriteFailure ? [saved] : scenario.initial);
            assert.equal(cleared.writes, losesReads ? (postWriteFailure ? 1 : 0) : 2);
            assert.ok(await page.locator('a[href^="mailto:"]').count());
            assert.ok(await page.locator('a[href*="wa.me/"]').count());
            await page.screenshot({ path: `${output}/${label}.png`, fullPage: true });
          } else {
            assert.deepEqual(cleared.events, [
              {
                name: "rfq_list_remove",
                params: { item_name: target.name, item_sku: target.sku, location: "rfq_form" },
              },
              { name: "rfq_list_clear", params: { item_count: 1, location: "rfq_form" } },
            ]);
          }
        } else {
          const button = page
            .getByRole("button", {
              name: new RegExp(`^(Add|Remove) ${target.name} (to|from) RFQ list$`),
            })
            .first();
          if (scenario.mode === "full") {
            const full = page
              .getByRole("button", {
                name: `RFQ list is full. Remove a product before adding ${target.name}`,
                exact: true,
              })
              .first();
            assert.equal(await full.isDisabled(), true);
            const state = await inspect(page, label);
            assert.equal(state.items.length, maxRfqItems);
            assert.deepEqual(state.events, []);
          } else {
            await button.click();
            const state = await inspect(page, label);
            const failed = /Error$/.test(scenario.mode);
            const removing = scenario.mode === "duplicate" || scenario.mode.includes("remove-");
            assert.equal(
              await button.getAttribute("aria-pressed"),
              String(failed ? removing : !removing),
              label,
            );
            if (failed) {
              assert.deepEqual(
                state.items,
                postWriteFailure ? [saved] : scenario.initial,
                `${label} actual saved selection and details`,
              );
              assert.deepEqual(state.events, [], `${label} must not emit a success event`);
              assert.equal(state.changes, 0);
              assert.equal(state.storageReadBlocked, losesReads);
              assert.equal(state.writes, losesReads && !postWriteFailure ? 0 : 1);
              assert.ok(
                state.announcements.some(
                  (text) =>
                    text.includes(`Could not ${removing ? "remove" : "add"}`) &&
                    text.includes("Request a Quote"),
                ),
                label,
              );
              assert.ok(
                state.announcements.every(
                  (text) =>
                    !text.includes("added to your RFQ list.") &&
                    !text.includes("removed from your RFQ list."),
                ),
              );
              await page.screenshot({ path: `${output}/${label}.png`, fullPage: true });
              const quote = page
                .getByRole("link", { name: "Request a Quote", exact: true })
                .first();
              const href = await quote.getAttribute("href");
              assert.ok(href);
              assert.ok(
                new URL(href, origin).searchParams.get("product")?.includes(`SKU: ${target.sku}`),
              );
              await quote.click();
              await page.waitForURL(/\/rfq\?product=/);
              await page.waitForLoadState("networkidle");
              assert.ok(
                (await page.locator("#productRequirements").inputValue()).includes(
                  `SKU: ${target.sku}`,
                ),
              );
            } else if (scenario.mode === "duplicate") {
              assert.deepEqual(state.items.map(getRfqListItemKey), [getRfqListItemKey(saved)]);
              assert.equal(state.events.length, 1);
              assert.ok(state.announcements.includes(`${target.name} removed from your RFQ list.`));
            } else {
              assert.deepEqual(state.items.map(getRfqListItemKey), [
                getRfqListItemKey(saved),
                getRfqListItemKey(target),
              ]);
              assert.ok(state.announcements.includes(`${target.name} added to your RFQ list.`));
              await button.click();
              const removed = await inspect(page, `${label}-remove`);
              assert.deepEqual(removed.items.map(getRfqListItemKey), [getRfqListItemKey(saved)]);
              assert.equal(await button.getAttribute("aria-pressed"), "false");
              assert.ok(
                removed.announcements.includes(`${target.name} removed from your RFQ list.`),
              );
              assert.deepEqual(
                removed.events,
                scenario.mode === "denied"
                  ? []
                  : [
                      {
                        name: "rfq_list_add",
                        params: { item_name: target.name, item_sku: target.sku, item_count: 2 },
                      },
                      {
                        name: "rfq_list_remove",
                        params: { item_name: target.name, item_sku: target.sku },
                      },
                    ],
              );
            }
          }
        }
        assert.deepEqual(pageErrors, [], `${label} page errors`);
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          true,
          `${label} overflow`,
        );
        rfqListChecks++;
        console.log(`RFQ list mutation outcomes: ${label} passed.`);
      } finally {
        await context.close();
      }
    }
  }
}

async function verifyProductFinderNavigation(browser: Browser) {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      serviceWorkers: "block",
      viewport: { width, height: 900 },
    });
    let releaseScripts = () => {};
    const scriptsReleased = new Promise<void>((resolve) => {
      releaseScripts = resolve;
    });
    let holdScripts = true;
    let delayedModules = 0;
    const pageErrors: string[] = [];
    try {
      await context.route("**/*", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
          refused.push(`${request.method()} ${url.origin}`);
          return route.abort();
        }
        if (holdScripts && url.pathname.startsWith("/_next/static/chunks/")) {
          delayedModules++;
          await scriptsReleased;
        }
        return route.continue();
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => pageErrors.push(error.message));
      assert.equal((await page.goto(`${origin}/products`, { waitUntil: "commit" }))?.status(), 200);
      const queryInput = page.getByRole("searchbox", { name: "Product name, component or SKU" });
      const categoryInput = page.getByLabel("Product category", { exact: true });
      const catalog = page.locator("#product-catalog");
      const searchButton = page.getByRole("button", { name: "Search Products", exact: true });
      const clearFilters = page.getByRole("link", { name: "Clear Filters", exact: true });
      const initialDraft = `Native draft before hydration ${width}`;
      await queryInput.fill(initialDraft);
      await categoryInput.selectOption("plasma-cutting-consumables");
      const baselineSummary = (
        await catalog.getByText(/^Showing \d+-\d+ of \d+ products$/).textContent()
      )?.trim();
      assert.ok(baselineSummary, "Unfiltered catalog must provide a result summary.");
      holdScripts = false;
      releaseScripts();
      await page.waitForLoadState("networkidle");
      await page
        .getByRole("button", { name: /^Add .+ to RFQ list$/ })
        .first()
        .waitFor({ state: "attached" });
      assert.ok(
        delayedModules > 0,
        `${width}px finder must exercise native input before hydration`,
      );
      assert.equal(
        await queryInput.inputValue(),
        initialDraft,
        `${width}px hydration preserves native query draft`,
      );
      assert.equal(
        await categoryInput.inputValue(),
        "plasma-cutting-consumables",
        `${width}px hydration preserves native category draft`,
      );

      // A hard navigation would also reset defaultValues and could hide the original regression.
      const documentMarker = `finder-navigation-${width}`;
      await page.evaluate(
        (marker) => Reflect.set(window, "__arcfortFinderNavigationMarker", marker),
        documentMarker,
      );
      async function assertClientNavigation(label: string) {
        assert.equal(
          await page.evaluate(() => Reflect.get(window, "__arcfortFinderNavigationMarker")),
          documentMarker,
          `${width}px ${label} must retain the current document through Next.js navigation`,
        );
      }
      async function waitForCatalogUrl(
        query: string,
        category: string,
        pageNumber = "",
        hash = "#product-catalog",
      ) {
        await page.waitForURL(
          (url) =>
            url.pathname === "/products" &&
            (url.searchParams.get("q") ?? "") === query &&
            (url.searchParams.get("category") ?? "") === category &&
            (url.searchParams.get("page") ?? "") === pageNumber &&
            url.hash === hash,
        );
      }
      async function assertNativeFilters(query: string, category: string, label: string) {
        assert.equal(await queryInput.inputValue(), query, `${width}px ${label} query`);
        assert.equal(await categoryInput.inputValue(), category, `${width}px ${label} category`);
        await assertClientNavigation(label);
      }

      await queryInput.fill("AF-MIG-CT-0005");
      await categoryInput.selectOption("mig-mag-torch-parts");
      await searchButton.click();
      await waitForCatalogUrl("AF-MIG-CT-0005", "mig-mag-torch-parts");
      await catalog.getByText("Showing 1-1 of 1 products", { exact: true }).waitFor();
      assert.equal(await catalog.getByText("AF-MIG-CT-0005", { exact: true }).count(), 1);
      await assertNativeFilters("AF-MIG-CT-0005", "mig-mag-torch-parts", "SKU search");

      await clearFilters.click();
      await waitForCatalogUrl("", "", "", "#product-finder");
      await catalog.getByText(baselineSummary, { exact: true }).waitFor();
      await assertNativeFilters("", "", "clear filters");

      await queryInput.fill("ceramic");
      await categoryInput.selectOption("tig-torch-parts");
      await searchButton.click();
      await waitForCatalogUrl("ceramic", "tig-torch-parts");
      const secondSearchSummary = "Search: “ceramic” | Category: TIG Torch Parts";
      await catalog.getByText(secondSearchSummary, { exact: true }).waitFor();
      assert.equal(await catalog.getByText("AF-TIG-CC-0007", { exact: true }).count(), 1);
      await assertNativeFilters("ceramic", "tig-torch-parts", "keyword search");

      await page.goBack();
      await waitForCatalogUrl("", "", "", "#product-finder");
      await catalog.getByText(baselineSummary, { exact: true }).waitFor();
      await assertNativeFilters("", "", "history back");
      await page.goForward();
      await waitForCatalogUrl("ceramic", "tig-torch-parts");
      await catalog.getByText(secondSearchSummary, { exact: true }).waitFor();
      await assertNativeFilters("ceramic", "tig-torch-parts", "history forward");

      await clearFilters.click();
      await waitForCatalogUrl("", "", "", "#product-finder");
      await catalog.getByText(baselineSummary, { exact: true }).waitFor();
      const unsentDraft = `Unsubmitted finder draft ${width}`;
      await queryInput.fill(unsentDraft);
      await categoryInput.selectOption("welding-accessories");
      await page.getByRole("link", { name: "View product catalog", exact: false }).click();
      await waitForCatalogUrl("", "");
      await assertNativeFilters(unsentDraft, "welding-accessories", "catalog hash navigation");
      await catalog.getByRole("link", { name: "Change Search", exact: true }).click();
      await waitForCatalogUrl("", "", "", "#product-finder");
      await assertNativeFilters(unsentDraft, "welding-accessories", "same-filter hash navigation");
      await catalog
        .getByRole("navigation", { name: "Product catalog pagination" })
        .getByRole("link", { name: "Next", exact: true })
        .click();
      await waitForCatalogUrl("", "", "2");
      await catalog.getByText(/^Showing 13-\d+ of \d+ products$/).waitFor();
      await assertNativeFilters(unsentDraft, "welding-accessories", "same-filter pagination");
      assert.deepEqual(pageErrors, [], `${width}px product finder page errors`);
      finderChecks++;
      console.log(
        `Product finder filters, history and native drafts stay consistent at ${width}px.`,
      );
    } finally {
      releaseScripts();
      await context.close();
    }
  }
}

async function verifyProductGalleryHydration(browser: Browser) {
  const path = "/products/mig-mag-torch-parts/mig-gas-nozzle-for-mb15";
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      serviceWorkers: "block",
      viewport: { width, height: 900 },
    });
    try {
      let delayedModules = 0;
      const pageErrors: string[] = [];
      await context.route("**/*", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
          refused.push(`${request.method()} ${url.origin}`);
          return route.abort();
        }
        if (url.pathname.startsWith("/_next/static/chunks/")) {
          delayedModules++;
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }
        return route.continue();
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => pageErrors.push(error.message));
      assert.equal((await page.goto(origin + path, { waitUntil: "commit" }))?.status(), 200);
      const gallery = page.locator('[data-snippet-region="product-visual"]').first();
      const thumbnails = gallery.getByRole("button");
      const second = thumbnails.nth(1);
      await second.waitFor({ state: "visible" });
      assert.ok((await thumbnails.count()) > 1, "Product must have multiple gallery images.");
      assert.equal(await second.isDisabled(), true, `${width}px thumbnail waits for hydration`);
      const fullImage = gallery.getByRole("link", { name: /View full image/ });
      const firstHref = await fullImage.getAttribute("href");
      assert.ok(firstHref, "Initial full image remains accessible before hydration.");
      await page.waitForLoadState("networkidle");
      assert.ok(delayedModules > 0, "Gallery test must delay client scripts.");
      assert.equal(await second.isEnabled(), true, `${width}px thumbnail becomes ready`);
      await second.click();
      assert.equal(await second.getAttribute("aria-pressed"), "true");
      assert.notEqual(await fullImage.getAttribute("href"), firstHref);
      assert.deepEqual(pageErrors, [], `${width}px gallery page errors`);
      galleryChecks++;
      console.log(`Product gallery selection retained at ${width}px after delayed hydration.`);
    } finally {
      await context.close();
    }
  }

  const context = await browser.newContext({
    javaScriptEnabled: false,
    serviceWorkers: "block",
    viewport: { width: 390, height: 900 },
  });
  try {
    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
        refused.push(`${request.method()} ${url.origin}`);
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    assert.equal((await page.goto(origin + path, { waitUntil: "networkidle" }))?.status(), 200);
    const gallery = page.locator('[data-snippet-region="product-visual"]').first();
    assert.equal(await gallery.getByRole("button").nth(1).isDisabled(), true);
    assert.ok(await gallery.getByRole("link", { name: /View full image/ }).getAttribute("href"));
    galleryChecks++;
    console.log("Product gallery retains a direct image link without JavaScript.");
  } finally {
    await context.close();
  }
}

async function verifyNativeNavigationHydration(browser: Browser) {
  for (const { width, label } of [
    { width: 390, label: "Menu" },
    { width: 1440, label: "Products" },
  ]) {
    const context = await browser.newContext({
      serviceWorkers: "block",
      viewport: { width, height: 900 },
    });
    try {
      let delayedModules = 0;
      const pageErrors: string[] = [];
      await context.route("**/*", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
          refused.push(`${request.method()} ${url.origin}`);
          return route.abort();
        }
        if (url.pathname.startsWith("/_next/static/chunks/")) {
          delayedModules++;
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }
        return route.continue();
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => pageErrors.push(error.message));
      assert.equal((await page.goto(origin, { waitUntil: "commit" }))?.status(), 200);
      const summary = page.locator("summary").filter({ hasText: label }).first();
      await summary.waitFor({ state: "visible" });
      const details = summary.locator("xpath=parent::details");
      await summary.click();
      assert.equal(
        await details.evaluate((element) => (element as HTMLDetailsElement).open),
        true,
        `${label} opens natively`,
      );
      await page.waitForLoadState("networkidle");
      assert.ok(delayedModules > 0, `${label} must exercise delayed scripts`);
      assert.equal(
        await details.evaluate((element) => (element as HTMLDetailsElement).open),
        true,
        `${label} must remain open when hydration finishes`,
      );
      await summary.press("Escape");
      assert.equal(
        await details.evaluate((element) => (element as HTMLDetailsElement).open),
        false,
        `${label} Escape closes`,
      );
      assert.equal(await summary.evaluate((element) => document.activeElement === element), true);
      assert.deepEqual(pageErrors, [], `${label} must not cause browser errors`);
      navigationChecks++;
      console.log(`Native ${label} navigation retained through hydration at ${width}px.`);
    } finally {
      await context.close();
    }
  }

  const context = await browser.newContext({
    javaScriptEnabled: false,
    serviceWorkers: "block",
    viewport: { width: 390, height: 900 },
  });
  try {
    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
        refused.push(`${request.method()} ${url.origin}`);
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    assert.equal((await page.goto(origin, { waitUntil: "networkidle" }))?.status(), 200);
    const summary = page.locator("summary").filter({ hasText: "Menu" }).first();
    await summary.click();
    assert.equal(
      await summary
        .locator("xpath=parent::details")
        .evaluate((element) => (element as HTMLDetailsElement).open),
      true,
    );
    const quoteLink = page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Request a Quote" });
    assert.equal(await quoteLink.getAttribute("href"), "/rfq");
    await quoteLink.click();
    await page.waitForURL(`${origin}/rfq`);
    navigationChecks++;
    console.log("Native mobile navigation reaches RFQ without JavaScript.");
  } finally {
    await context.close();
  }
}

assertNoRuntimeEnvFiles(process.cwd());
await assertPortAvailable(3982);
const env: NodeJS.ProcessEnv = {
  NODE_ENV: "production",
  CI: "true",
  NEXT_TELEMETRY_DISABLED: "1",
  CONSOLE_ENABLED: "false",
};
for (const [key, value] of Object.entries(process.env)) {
  if (/^(PATH|SYSTEMROOT|WINDIR|TEMP|TMP|TMPDIR|HOME|USERPROFILE|COMSPEC|PATHEXT)$/i.test(key))
    env[key] = value;
}
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", "3982"],
  { env, windowsHide: true, stdio: "ignore" },
);
let exited = false;
const closed = new Promise<void>((resolve) => {
  const finish = () => {
    exited = true;
    resolve();
  };
  server.once("error", finish);
  server.once("close", finish);
});
try {
  let ready = false;
  const deadline = Date.now() + 30_000;
  while (!exited && Date.now() < deadline) {
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(1000) });
      await response.body?.cancel();
      if (response.status === 200) {
        ready = true;
        break;
      }
    } catch {
      // The owned process can take a moment to bind its port.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready && !exited, "Owned public test server unavailable.");
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : {}),
  });
  await verifyRfqListMutationOutcomes(browser);
  const context = await browser.newContext({ serviceWorkers: "block" });
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== origin || !["GET", "HEAD"].includes(request.method())) {
      refused.push(`${request.method()} ${url.origin}`);
      return route.abort();
    }
    if (decodeURIComponent(url.pathname).startsWith("/_next/static/chunks/app/(public)/")) {
      delayed++;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    // Delays exercise lazy RSC replay; renderer, HTML and module bytes stay unchanged.
    return route.continue();
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => {
    errors.push({ path: activePath, width: activeWidth, message: error.message });
  });
  for (const delay of [8, 32, 96, 160, 320, 8]) {
    delayMs = delay;
    for (const width of [360, 1440]) {
      activeWidth = width;
      await page.setViewportSize({ width, height: 1000 });
      for (const path of paths) {
        activePath = path;
        const before = delayed;
        const response = await page.goto(origin + path, { waitUntil: "networkidle" });
        assert.equal(response?.status(), 200, path);
        assert.ok(delayed > before, "Every page must exercise delayed public modules.");
        assert.equal(await page.locator("main#main-content h1").count(), 1, path);
        const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
        assert.ok(canonical, path);
        assert.equal(
          new URL(canonical).href,
          new URL(path, "https://www.arcfortweld.com").href,
          path,
        );
        completed++;
      }
      console.log(`Public hydration: ${completed}/120 loads; ${errors.length} page errors.`);
    }
  }
  assert.equal(completed, 120);
  await verifyNativeNavigationHydration(browser);
  await verifyProductGalleryHydration(browser);
  await verifyProductFinderNavigation(browser);
  assert.deepEqual(refused, [], "Unexpected external or mutating request.");
  assert.deepEqual(errors, [], "Public hydration regression; see bounded local report.");
  status = "PASS";
} finally {
  await browser?.close();
  if (!exited) server.kill();
  const timeout = setTimeout(() => {
    if (!exited) server.kill("SIGKILL");
  }, 5000);
  await closed;
  clearTimeout(timeout);
  await mkdir(output, { recursive: true });
  await writeFile(
    `${output}/report.json`,
    JSON.stringify(
      {
        status,
        completed,
        delayed,
        navigationChecks,
        galleryChecks,
        finderChecks,
        rfqListChecks,
        errors,
        refused,
      },
      null,
      2,
    ),
  );
}
