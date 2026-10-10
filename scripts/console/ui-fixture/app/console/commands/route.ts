import { isConsoleCommandOrigin } from "../../../../../../lib/console/commands";

// Browser-header probe only. This fixture never calls a database or authorizes a mutation.
export async function POST(request: Request) {
  const origin = "http://127.0.0.1:3901";
  if (request.headers.get("host") !== new URL(origin).host)
    return new Response(null, { status: 403 });
  return Response.json({
    ok: false,
    code: "unavailable",
    originAccepted: isConsoleCommandOrigin(request.headers, origin),
    headers: {
      origin: request.headers.get("origin"),
      site: request.headers.get("sec-fetch-site"),
      mode: request.headers.get("sec-fetch-mode"),
      dest: request.headers.get("sec-fetch-dest"),
    },
  });
}
