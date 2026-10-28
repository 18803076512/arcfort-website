import { existsSync, readFileSync } from "node:fs";
import {
  parseIndexNowOptions,
  readIndexNowResource,
  readSubmissionSitemap,
  runIndexNowPreflight,
  selectSubmissionUrls,
  sendIndexNowNotification,
} from "./indexnow-workflow.ts";

async function main() {
  const options = parseIndexNowOptions(process.argv.slice(2), process.env);
  const localSitemap = existsSync(options.sitemap);
  if (localSitemap && options.submit) throw new Error("Submission cannot use a local sitemap.");
  const xml = localSitemap
    ? readFileSync(options.sitemap, "utf8")
    : (await readIndexNowResource(options.sitemap)).data;
  const urls = selectSubmissionUrls(
    readSubmissionSitemap(xml),
    options,
    options.urlsFile ? readFileSync(options.urlsFile, "utf8") : undefined,
  );
  console.log(`Mode: ${options.submit ? "explicit submission" : "preview only"}`);
  console.log(`Sitemap: ${options.sitemap}`);
  console.log(`Exact selected URLs (${urls.length}):`);
  for (const url of urls) console.log(url);
  console.log(
    "IndexNow is a notification to participating engines, not a Google indexing request.",
  );
  if (options.submit) console.log(await sendIndexNowNotification(options, urls));
  else {
    if (localSitemap)
      console.log("Offline preview: live key, robots and target checks were not run.");
    else {
      await runIndexNowPreflight(options, urls);
      console.log(
        "Live key and Bingbot robots preflight passed. Individual targets are checked before explicit submission.",
      );
    }
    console.log(
      "Preview only. No IndexNow POST was sent. Submit changed URLs only with --submit --urls-file <reviewed-file>.",
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
