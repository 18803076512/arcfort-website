import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE_PATH || "./browser-runtime/node_modules/playwright",
);
const origin = "http://127.0.0.1:3901";
const output = path.resolve(".tmp/console-media-ui");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});
const context = await browser.newContext();
const errors = [];
const external = [];
const mutations = [];
const screenshots = [];
await context.route("**/*", async (route) => {
  const request = route.request();
  if (new URL(request.url()).origin !== origin) {
    external.push(request.url());
    return route.abort();
  }
  if (request.method() !== "GET") {
    mutations.push(request.method());
    return route.abort();
  }
  return route.continue();
});
const page = await context.newPage();
page.on("pageerror", (error) => errors.push(error.message));
async function visit(search = "") {
  const response = await page.goto(`${origin}/console/media${search}`);
  assert.equal(response.status(), 200);
  assert.match(response.headers()["x-robots-tag"], /noindex/);
  await page.getByRole("heading", { name: "Product Media", exact: true }).waitFor();
}
try {
  await visit();
  assert.equal(await page.getByText("Missing", { exact: true }).count(), 2);
  assert.equal(await page.getByText("0 asset approvals recorded", { exact: true }).count(), 1);
  const next = await page.getByRole("link", { name: "Next Page" }).getAttribute("href");
  assert.equal(new URL(next, origin).searchParams.get("page"), "2");
  await page.getByLabel("Missing mapping", { exact: true }).selectOption("packaging");
  await page.getByRole("button", { name: "Apply media filters" }).click();
  await page.waitForURL((url) => url.searchParams.get("missingView") === "packaging");
  assert.equal(
    new URL(
      await page.getByRole("link", { name: "Next Page" }).getAttribute("href"),
      origin,
    ).searchParams.get("missingView"),
    "packaging",
  );
  await page.getByLabel("Missing mapping", { exact: true }).selectOption("main");
  await page.getByRole("button", { name: "Apply media filters" }).click();
  await page.getByText("No records match this view.").waitFor();
  await page.getByRole("link", { name: "Asset Inventory", exact: true }).click();
  await page.waitForURL(`${origin}/console/media?view=assets`);
  await page.getByRole("region", { name: "Media asset inventory" }).waitFor();
  assert.equal(await page.getByText("Same recorded hash: 2 assets", { exact: true }).count(), 2);
  await page.getByLabel("Assignment", { exact: true }).selectOption("unassigned");
  await page.getByRole("button", { name: "Apply media filters" }).click();
  await page.waitForURL((url) => url.searchParams.get("assignment") === "unassigned");
  assert.equal(await page.getByText("Synthetic main reference", { exact: true }).count(), 0);
  assert.equal(
    await page
      .getByRole("region", { name: "Media asset inventory" })
      .getByText("Unassigned", { exact: true })
      .count(),
    2,
  );
  await page.getByLabel("Usage rights", { exact: true }).selectOption("approved");
  await page.getByRole("button", { name: "Apply media filters" }).click();
  await page.getByText("No records match this view.").waitFor();
  console.log(
    "PASS media navigation, missing views, GET filters, duplicate state and empty results",
  );
  for (const width of [1440, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 960 });
    for (const view of ["coverage", "assets"]) {
      await visit(`?view=${view}`);
      if (view === "assets") {
        await page.waitForFunction(() =>
          [...document.querySelectorAll("img")].every(
            (image) => image.complete && image.naturalWidth > 0,
          ),
        );
        assert.equal(await page.locator("img").count(), 2);
        assert.equal(
          await page
            .getByRole("link", { name: "Open image: Synthetic main reference" })
            .getAttribute("target"),
          "_blank",
        );
      }
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        badControls: [
          ...document.querySelectorAll("input:not([type=hidden]), select, button"),
        ].filter((element) => {
          const box = element.getBoundingClientRect();
          return box.width < 40 || box.height < 40 || box.left < -1 || box.right > innerWidth + 1;
        }).length,
      }));
      assert.deepEqual(layout, { overflow: false, badControls: 0 }, `${view} at ${width}px`);
      const file = `${view}-${width}.png`;
      await page.screenshot({ path: path.join(output, file), fullPage: true });
      screenshots.push(file);
    }
  }
  await page.getByLabel("Asset reference").focus();
  await page.keyboard.press("Tab");
  assert.equal(
    await page
      .getByLabel("Publication", { exact: true })
      .evaluate((element) => element === document.activeElement),
    true,
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  assert.deepEqual(mutations, []);
  await writeFile(
    path.join(output, "result.json"),
    JSON.stringify(
      {
        status: "PASS",
        scope: "synthetic UI only; not database or Auth acceptance",
        screenshots,
        pageErrors: errors.length,
        externalRequests: external.length,
        mutations: mutations.length,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `PASS ${screenshots.length} responsive screenshots, actual image loads, keyboard order and read-only requests`,
  );
} finally {
  await context.close();
  await browser.close();
}
