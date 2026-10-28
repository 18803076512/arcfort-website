import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { siteConfig } from "../lib/content/site.ts";
import {
  canonicalSubmissionUrl,
  checkSubmissionTarget,
  indexNowEndpoint,
  parseIndexNowOptions,
  readSubmissionSitemap,
  runIndexNowPreflight,
  selectSubmissionUrls,
  sendIndexNowNotification,
} from "./indexnow-workflow.ts";

const site = siteConfig.url;
const target = `${site}/products`;
const second = `${site}/guides`;
const xml = `<urlset><url><loc>${target}</loc><image:image><image:loc>${site}/image.jpg</image:loc></image:image></url><url><loc>${second}</loc></url></urlset>`;
const preview = parseIndexNowOptions([]);
const submit = parseIndexNowOptions(["--submit", "--urls-file", "reviewed.txt"]);
assert.equal(preview.submit, false);
assert.deepEqual(readSubmissionSitemap(xml), [target, second]);
assert.deepEqual(
  selectSubmissionUrls([target, second], submit, `# reviewed changes\n${second}\n`),
  [second],
);
assert.deepEqual(selectSubmissionUrls([target, second], parseIndexNowOptions(["--limit", "1"])), [
  target,
]);
assert.equal(
  parseIndexNowOptions(["--key", "replacement-key"]).keyLocation,
  `${site}/replacement-key.txt`,
);

for (const args of [
  ["--submit"],
  ["--submit", "--dry-run"],
  ["--limit", "0"],
  ["--limit", "-2"],
  ["--limit", "1.5"],
  ["--limit"],
  ["--key", "short"],
  ["--dry-run", "--dry-run"],
  ["--unknown"],
  ["--submit", "--urls-file", "reviewed.txt", "--limit", "1"],
  ["--submit", "--urls-file", "reviewed.txt", "--sitemap", "local.xml"],
  ["--key-location", "https://other.test/key.txt"],
])
  assert.throws(() => parseIndexNowOptions(args));
assert.throws(() => parseIndexNowOptions([], { INDEXNOW_ENDPOINT: "https://other.test" }));
for (const url of [
  "http://www.arcfortweld.com/products",
  "https://arcfortweld.com/products",
  target + "?q=tip",
  target + "#tip",
  "https://user@www.arcfortweld.com/products",
  `${site}/x/../products`,
])
  assert.throws(() => canonicalSubmissionUrl(url));
for (const source of [
  "<html>error</html>",
  "<sitemapindex></sitemapindex>",
  "<urlset></urlset>",
  `<urlset><url><loc>${target}</loc><loc>${second}</loc></url></urlset>`,
  `<urlset><url><loc>https://other.test/</loc></url></urlset>`,
  xml.replace(second, target),
])
  assert.throws(() => readSubmissionSitemap(source));
for (const file of [
  "",
  "# only a comment",
  `${target}\n${target}`,
  `${site}/missing`,
  target + "?q=tip",
])
  assert.throws(() => selectSubmissionUrls([target, second], submit, file));
assert.throws(() =>
  selectSubmissionUrls([target], { ...submit, keyLocation: `${site}/folder/key.txt` }, target),
);
const tooMany = Array.from({ length: 101 }, (_, i) => `${site}/page-${i}`);
assert.throws(() => selectSubmissionUrls(tooMany, submit, tooMany.join("\n")));

const html = (url: string, extra = "") =>
  `<head><link rel="canonical" href="${url}">${extra}</head><body>Content</body>`;
const htmlResponse = (headers: Record<string, string> = {}) =>
  new Response("", { headers: { "content-type": "text/html", ...headers } });
assert.doesNotThrow(() => checkSubmissionTarget(target, htmlResponse(), html(target)));
for (const extra of [
  '<meta name="robots" content="noindex">',
  "<meta content='none' name='googlebot'>",
  "<meta name=bingbot content=noindex>",
  `<link href="${target}" rel="canonical">`,
])
  assert.throws(() => checkSubmissionTarget(target, htmlResponse(), html(target, extra)));
assert.throws(() => checkSubmissionTarget(target, htmlResponse(), html(second)));
assert.throws(() =>
  checkSubmissionTarget(target, htmlResponse(), `<head><script>${html(target)}</script></head>`),
);
assert.throws(() =>
  checkSubmissionTarget(
    target,
    htmlResponse({ "x-robots-tag": "googlebot:noindex" }),
    html(target),
  ),
);
assert.throws(() =>
  checkSubmissionTarget(
    target,
    new Response("", { headers: { "content-type": "application/pdf", "x-robots-tag": "noindex" } }),
    "",
  ),
);
assert.throws(() =>
  checkSubmissionTarget(
    target,
    new Response("", { headers: { "content-type": "application/json" } }),
    "{}",
  ),
);

type Mode =
  | "ok"
  | "wrong-key"
  | "key-redirect"
  | "blocked"
  | "redirect"
  | "noindex"
  | "canonical"
  | "post-error"
  | "pending"
  | "network";
function transport(mode: Mode) {
  const calls: { url: string; method: string }[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    calls.push({ url, method });
    if (method === "POST") {
      assert.equal(url, indexNowEndpoint);
      assert.equal(init?.redirect, "error");
      assert.deepEqual(JSON.parse(String(init?.body)).urlList, [target, second]);
      if (mode === "network") throw new Error("Synthetic transport timeout");
      return new Response("", {
        status: mode === "post-error" ? 429 : mode === "pending" ? 202 : 200,
      });
    }
    assert.equal(init?.redirect, "manual");
    if (url === submit.keyLocation)
      return new Response(mode === "wrong-key" ? "wrong" : submit.key, {
        status: mode === "key-redirect" ? 301 : 200,
      });
    if (url.endsWith("/robots.txt"))
      return new Response(
        mode === "blocked" ? "User-agent: Bingbot\nDisallow: /" : "User-agent: *\nAllow: /",
      );
    assert([target, second].includes(url));
    return new Response(
      html(
        mode === "canonical" ? site + "/wrong" : url,
        mode === "noindex" ? '<meta name="robots" content="noindex">' : "",
      ),
      { status: mode === "redirect" ? 308 : 200, headers: { "content-type": "text/html" } },
    );
  };
  return { fetchImpl, calls };
}

const dry = transport("ok");
await runIndexNowPreflight(preview, [target, second], dry.fetchImpl);
assert.equal(dry.calls.length, 2);
assert(dry.calls.every((call) => call.method === "GET"));
await assert.rejects(sendIndexNowNotification(preview, [target], dry.fetchImpl), /explicit/);
for (const mode of [
  "wrong-key",
  "key-redirect",
  "blocked",
  "redirect",
  "noindex",
  "canonical",
] as const) {
  const fake = transport(mode);
  await assert.rejects(sendIndexNowNotification(submit, [target, second], fake.fetchImpl));
  assert.equal(fake.calls.filter((call) => call.method === "POST").length, 0, mode);
}
for (const mode of ["ok", "pending", "post-error", "network"] as const) {
  const fake = transport(mode);
  const operation = sendIndexNowNotification(submit, [target, second], fake.fetchImpl);
  if (mode === "post-error" || mode === "network") await assert.rejects(operation);
  else
    assert.match(
      await operation,
      mode === "pending" ? /validation pending.*not proof/ : /200.*not proof/,
    );
  assert.equal(fake.calls.filter((call) => call.method === "POST").length, 1);
  assert.deepEqual(
    fake.calls.slice(-3).map((call) => call.url),
    [target, second, indexNowEndpoint],
  );
}

// Exercise the real CLI with all network access replaced by a throwing stub.
const directory = mkdtempSync(join(tmpdir(), "arcfort-indexnow-test-"));
try {
  const sitemap = join(directory, "sitemap.xml");
  writeFileSync(sitemap, xml);
  const child = spawnSync(
    process.execPath,
    [
      "--import",
      "data:text/javascript,globalThis.fetch=async()=>{throw new Error('Unexpected network request')}",
      "--experimental-strip-types",
      "scripts/submit-indexnow.ts",
      "--sitemap",
      sitemap,
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        INDEXNOW_ENDPOINT: indexNowEndpoint,
        INDEXNOW_KEY: submit.key,
        INDEXNOW_KEY_LOCATION: submit.keyLocation,
      },
    },
  );
  assert.equal(child.status, 0, child.stderr);
  assert.match(child.stdout, /preview only/);
  assert(child.stdout.includes(target) && child.stdout.includes(second));
  assert.match(child.stdout, /No IndexNow POST was sent/);
} finally {
  rmSync(directory, { recursive: true, force: true });
}
console.log(
  "IndexNow preview, preflight, exact-list and no-retry controls passed; no external notification sent.",
);
