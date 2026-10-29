globalThis.fetch = async () =>
  new Response(JSON.stringify({ Status: 2 }), {
    status: 200,
    headers: { "content-type": "application/dns-json" },
  });
