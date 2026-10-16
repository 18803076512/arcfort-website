import { createServer } from "node:http";
import { consolePrivateHeaders, isConsoleOrigin } from "../../lib/console/security.ts";

// Manual browser regression fixture: loopback only, no Auth client, credentials or external calls.
const origin = "http://127.0.0.1:3002";
const server = createServer((request, response) => {
  Object.entries(consolePrivateHeaders).forEach(([name, value]) => response.setHeader(name, value));
  if (request.method === "GET" && request.url === "/") {
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(`<!doctype html><html lang="en"><meta charset="utf-8">
      <meta name="referrer" content="no-referrer"><title>Console Origin Test</title>
      <h1>Console Origin Test</h1><form action="/check" method="post">
      <input type="hidden" name="action" value="probe">
      <button>Verify same-origin submission</button></form></html>`);
    return;
  }
  if (request.method === "POST" && request.url === "/check") {
    request.resume();
    const headers = new Headers();
    for (const name of ["host", "origin", "sec-fetch-site", "sec-fetch-mode", "sec-fetch-dest"]) {
      const value = request.headers[name];
      if (typeof value === "string") headers.set(name, value);
    }
    const accepted = isConsoleOrigin(headers, origin, true);
    response.statusCode = accepted ? 200 : 403;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    const result = {
      accepted,
      originIsNull: headers.get("origin") === "null",
      fetchSiteIsSameOrigin: headers.get("sec-fetch-site") === "same-origin",
      nativeNavigation:
        headers.get("sec-fetch-mode") === "navigate" &&
        headers.get("sec-fetch-dest") === "document",
      referrerSuppressed: request.headers.referer === undefined,
    };
    console.log(JSON.stringify(result));
    response.end(JSON.stringify(result));
    return;
  }
  response.writeHead(404).end();
});
server.requestTimeout = 10000;
server.headersTimeout = 10000;
server.listen(3002, "127.0.0.1", () => console.log(`Isolated browser fixture: ${origin}`));
const timeout = setTimeout(() => server.close(), 10 * 60 * 1000);
timeout.unref();
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => server.close(() => process.exit(0)));
