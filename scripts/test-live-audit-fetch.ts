#!/usr/bin/env node

import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { fetchReadOnlyWithRetry } from "./live-audit-fetch.ts";

const requestCounts = new Map<string, number>();

function countRequest(pathname: string) {
  const count = (requestCounts.get(pathname) ?? 0) + 1;
  requestCounts.set(pathname, count);
  return count;
}

const server = createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  const count = countRequest(pathname);

  if (pathname === "/transient-status") {
    response.statusCode = count < 3 ? 503 : 200;
    response.end(count < 3 ? "retry" : "recovered");
    return;
  }

  if (pathname === "/connection-reset" && count === 1) {
    request.socket.destroy();
    return;
  }

  if (pathname === "/connection-reset") {
    response.statusCode = 200;
    response.end("recovered");
    return;
  }

  if (pathname === "/slow-body" && count === 1) {
    response.writeHead(200, { "content-type": "text/plain" });
    response.write("partial");
    setTimeout(() => response.end(" late"), 100);
    return;
  }

  if (pathname === "/slow-body") {
    response.statusCode = 200;
    response.end("recovered body");
    return;
  }

  if (pathname === "/persistent-status") {
    response.statusCode = 503;
    response.end("still unavailable");
    return;
  }

  response.statusCode = 404;
  response.end("not found");
});

server.listen(0, "127.0.0.1");
await once(server, "listening");

const address = server.address();
assert(address && typeof address !== "string");
const baseUrl = `http://127.0.0.1:${address.port}`;

try {
  let statusRetries = 0;
  const transient = await fetchReadOnlyWithRetry(
    `${baseUrl}/transient-status`,
    {},
    {
      attempts: 3,
      timeoutMs: 1_000,
      baseDelayMs: 1,
      maxDelayMs: 2,
      read: (response) => response.text(),
      onRetry: () => {
        statusRetries += 1;
      },
    },
  );
  assert.equal(transient.response.status, 200);
  assert.equal(transient.data, "recovered");
  assert.equal(statusRetries, 2);
  assert.equal(requestCounts.get("/transient-status"), 3);

  const reset = await fetchReadOnlyWithRetry(
    `${baseUrl}/connection-reset`,
    {},
    {
      attempts: 2,
      timeoutMs: 1_000,
      baseDelayMs: 1,
      maxDelayMs: 1,
      read: (response) => response.text(),
    },
  );
  assert.equal(reset.response.status, 200);
  assert.equal(reset.data, "recovered");
  assert.equal(requestCounts.get("/connection-reset"), 2);

  const slowBody = await fetchReadOnlyWithRetry(
    `${baseUrl}/slow-body`,
    {},
    {
      attempts: 2,
      timeoutMs: 40,
      baseDelayMs: 1,
      maxDelayMs: 1,
      read: (response) => response.text(),
    },
  );
  assert.equal(slowBody.response.status, 200);
  assert.equal(slowBody.data, "recovered body");
  assert.equal(requestCounts.get("/slow-body"), 2);

  let missingRetries = 0;
  const missing = await fetchReadOnlyWithRetry(
    `${baseUrl}/missing`,
    {},
    {
      attempts: 3,
      timeoutMs: 1_000,
      baseDelayMs: 1,
      onRetry: () => {
        missingRetries += 1;
      },
    },
  );
  assert.equal(missing.response.status, 404);
  assert.equal(missingRetries, 0);
  assert.equal(requestCounts.get("/missing"), 1);

  let persistentRetries = 0;
  const persistent = await fetchReadOnlyWithRetry(
    `${baseUrl}/persistent-status`,
    {},
    {
      attempts: 3,
      timeoutMs: 1_000,
      baseDelayMs: 1,
      maxDelayMs: 1,
      onRetry: () => {
        persistentRetries += 1;
      },
    },
  );
  assert.equal(persistent.response.status, 503);
  assert.equal(persistentRetries, 2);
  assert.equal(requestCounts.get("/persistent-status"), 3);

  await assert.rejects(
    fetchReadOnlyWithRetry(`${baseUrl}/post`, { method: "POST" }, { attempts: 2 }),
    /Retrying non-read-only method POST is not allowed/,
  );

  console.log("Live audit bounded-retry tests passed.");
} finally {
  server.closeAllConnections();
  server.close();
  await once(server, "close");
}
