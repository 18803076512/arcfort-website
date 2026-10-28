import assert from "node:assert/strict";
import { auditRobotsPolicy, parseRobotsPolicy } from "./robots-policy.ts";

const site = "https://example.test";
const urls = [site + "/", site + "/products/tip", site + "/downloads/catalog.pdf"];
const healthy = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /console\nSitemap: ${site}/sitemap.xml`;
assert.deepEqual(auditRobotsPolicy(healthy, urls, site).errors, []);

// Both broken policies passed the old two text-presence checks.
for (const text of [
  healthy + "\nDisallow: /products",
  healthy + "\nUser-agent: Googlebot\nDisallow: /",
]) {
  assert(text.includes(`Sitemap: ${site}/sitemap.xml`));
  assert(/Disallow:\s*\/api\//i.test(text));
  assert(
    auditRobotsPolicy(text, urls, site).errors.some((error) => error.includes("blocks Googlebot")),
  );
}
assert(
  auditRobotsPolicy(healthy + "\nUser-agent: Bingbot\nAllow: /", urls, site).errors.some((error) =>
    error.includes("internal path for Bingbot"),
  ),
);
assert(
  auditRobotsPolicy("# " + healthy.replace(/\n/g, "\n# "), urls, site).errors.some((error) =>
    error.includes("canonical sitemap"),
  ),
);

function allowed(rules: string, path: string, agent = "Googlebot") {
  return parseRobotsPolicy(rules).allows(site + path, agent);
}
assert(allowed("User-agent: *\nDisallow:", "/"));
assert(!allowed("User-agent: *\nDisallow: /", "/"));
const specificity = "User-agent: *\nDisallow: /\nAllow: /products\nDisallow: /products/private";
assert(allowed(specificity, "/products/tip"));
assert(!allowed(specificity, "/products/private/tip"));
assert(!allowed(specificity, "/Products/tip"));
for (const rules of ["Allow: /fish\nDisallow: /fish", "Disallow: /fish\nAllow: /fish"]) {
  assert(allowed("User-agent: *\n" + rules, "/fish"));
}
const wildcards = "User-agent: *\nDisallow: /*.pdf$\nDisallow: /*?private=*";
assert(!allowed(wildcards, "/downloads/a.pdf"));
assert(allowed(wildcards, "/downloads/a.pdf?public=1"));
assert(!allowed(wildcards, "/products?private=1"));
const groups =
  "User-agent: *\nDisallow: /\nUser-agent: googlebot/1.2\nDisallow: /one\nUser-agent: GOOGLEBOT*\nDisallow: /two";
assert(allowed(groups, "/public"));
assert(!allowed(groups, "/one"));
assert(!allowed(groups, "/two"));
assert(!allowed(groups, "/public", "Bingbot"));
assert(
  !allowed(
    "User-agent: a\nSitemap: https://example.test/sitemap.xml\nUser-agent: Googlebot\nDisallow: /",
    "/",
  ),
);
assert(!allowed("\uFEFFuSeR-aGeNt: Googlebot\r\nDISALLOW: /fish # comment\r\n", "/fish"));
assert(!allowed("User-agent: *\nDisallow: /ツ", "/%E3%83%84"));
assert(!allowed("User-agent: *\nDisallow: /%66ish", "/fish"));
assert(allowed("User-agent: *\nDisallow: /foo%2Fbar", "/foo/bar"));
assert(!allowed("User-agent: *\nDisallow: /foo%2fbar", "/foo%2Fbar"));
assert(allowed("User-agent: Googlebot-News\nDisallow: /", "/", "Googlebot"));
console.log("Robots policy regression and negative controls passed.");
