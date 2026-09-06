import assert from "node:assert/strict";
import { request as httpRequest } from "node:http";
import { stagingConsoleOrigin } from "../../lib/console/config.ts";

// This smoke test never submits credentials, sends mail or follows an external redirect.
const origin = "http://127.0.0.1:3000";
async function request(path: string, init?: RequestInit) {
  // Node's fetch may rewrite Host; use the wire HTTP API for exact virtual-host probes.
  const headers = new Headers(init?.headers);
  if (headers.has("host")) {
    return new Promise<Response>((resolve, reject) => {
      const outgoing = httpRequest(
        new URL(path, origin),
        {
          method: init?.method ?? "GET",
          headers: Object.fromEntries(headers),
        },
        (incoming) => {
          const chunks: Buffer[] = [];
          incoming.on("data", (chunk: Buffer) => chunks.push(chunk));
          incoming.on("error", reject);
          incoming.on("end", () => {
            const responseHeaders = new Headers();
            for (const [name, value] of Object.entries(incoming.headers)) {
              if (value !== undefined)
                responseHeaders.set(name, Array.isArray(value) ? value.join(", ") : value);
            }
            resolve(
              new Response(Buffer.concat(chunks), {
                status: incoming.statusCode ?? 500,
                headers: responseHeaders,
              }),
            );
          });
        },
      );
      outgoing.setTimeout(30000, () => outgoing.destroy(new Error("Loopback HTTP timeout")));
      outgoing.on("error", reject);
      outgoing.end(typeof init?.body === "string" ? init.body : undefined);
    });
  }
  return fetch(`${origin}${path}`, {
    ...init,
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  });
}
function privacy(response: Response) {
  assert.match(response.headers.get("cache-control") ?? "", /no-store/i);
  assert.match(response.headers.get("x-robots-tag") ?? "", /noindex/i);
  assert.match(response.headers.get("x-robots-tag") ?? "", /nofollow/i);
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
}
for (const path of [
  "/console/login",
  "/console/recover",
  "/console/password",
  "/console/dashboard",
  "/console/products",
  "/console/series",
  "/console/technical-data",
  "/console/readiness",
  "/console/auth/confirm",
  "/console/unknown-qa-route",
]) {
  const response = await request(path);
  privacy(response);
  const html = await response.text();
  for (const marker of [
    "site-header-navigation",
    "site-footer-links",
    "application/ld+json",
    "raw_snapshot",
    "notes_internal",
  ])
    assert.equal(html.includes(marker), false, `${path}: unexpected ${marker} payload`);
  assert.equal(/AF-(?:MIG|TIG|PLA|CON|MAC|ACC)-[A-Z0-9]+-\d{4}/.test(html), false);
  if (response.headers.has("location")) {
    assert.equal(new URL(response.headers.get("location")!, origin).origin, origin);
  }
  assert.ok(response.status < 500, `${path}: server failure`);
  console.log(`${path}: private, no catalog payload, HTTP ${response.status}`);
}
const rejected = await request("/console/auth/session", {
  method: "POST",
  headers: {
    Origin: "https://invalid.example",
    "Sec-Fetch-Site": "cross-site",
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: "action=login",
});
assert.equal(rejected.status, 403);
privacy(rejected);
assert.equal(rejected.headers.has("set-cookie"), false);
// Exercise the built host matcher over loopback without exposing a real tunnel or sending mail.
const stagingHeaders = { host: new URL(stagingConsoleOrigin).host, "x-forwarded-proto": "https" };
for (const path of [
  "/",
  "/console/login",
  "/console/auth/callback",
  "/_next/static/qa-missing.js",
]) {
  const response = await request(path, { headers: stagingHeaders });
  assert.equal(response.status, 403, `Staging ${path} must require verified Access`);
  privacy(response);
  assert.equal(response.headers.has("set-cookie"), false);
}
for (const path of [
  "/rfq",
  "/contact",
  "/api/rfq",
  "/api/rfq/status",
  "/sitemap.xml",
  "/downloads/renqiu-ailesen-welding-catalog.pdf",
]) {
  const response = await request(path, { headers: stagingHeaders });
  assert.equal(response.status, 404, `Staging ${path} must be isolated`);
  privacy(response);
  assert.equal((await response.text()).includes("site-header-navigation"), false);
}
const stagingRfq = await request("/api/rfq", { method: "POST", headers: stagingHeaders, body: "" });
assert.equal(stagingRfq.status, 404);
privacy(stagingRfq);
const stagingRobots = await request("/robots.txt", { headers: stagingHeaders });
assert.equal(stagingRobots.status, 200);
assert.equal(await stagingRobots.text(), "User-agent: *\nDisallow: /\n");
privacy(stagingRobots);
for (const host of [
  "console-staging.arcfortweld.com:443",
  "CONSOLE-STAGING.ARCFORTWELD.COM",
  "console-staging.arcfortweld.com.",
  "console-staging.arcfortweld.com.:443",
]) {
  for (const path of ["/", "/console/login"]) {
    const response = await request(path, { headers: { host } });
    assert.equal(response.status, 403, `${host}${path}: noncanonical Host denied`);
    privacy(response);
  }
  for (const path of ["/contact", "/api/rfq"]) {
    const response = await request(path, { headers: { host } });
    assert.equal(response.status, 404, `${host}${path}: public routes remain isolated`);
    privacy(response);
  }
}
for (const path of ["/", "/contact", "/rfq", "/distributor-supply"]) {
  const response = await request(path);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes("site-header-navigation"));
  assert.ok(html.includes("site-footer-links"));
  assert.ok(html.includes(`https://www.arcfortweld.com${path === "/" ? "" : path}`));
  assert.ok(html.includes("application/ld+json"));
}
for (const path of ["/distributor-supply/opengraph-image", "/distributor-supply/twitter-image"]) {
  const response = await request(path);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^image\/png/);
  assert.ok((await response.arrayBuffer()).byteLength > 1000);
}
const sitemap = await request("/sitemap.xml");
assert.equal(sitemap.status, 200);
assert.equal((await sitemap.text()).includes("/console"), false);
const robots = await request("/robots.txt");
assert.equal(robots.status, 200);
assert.match(await robots.text(), /Disallow: \/console/);
const publicNotFound = await request("/unknown-public-qa-route");
assert.equal(publicNotFound.status, 404);
assert.ok((await publicNotFound.text()).includes("site-header-navigation"));
console.log(
  "Loopback HTTP privacy, staging host isolation, unauthenticated payload, CSRF, public shell and social-image checks passed. No live tunnel, authenticated browser or inbox result is implied.",
);
