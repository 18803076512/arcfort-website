export type ProductIntelligenceEnvironment = "local" | "staging";

export type ProductIntelligenceAdminConfig = {
  url: string;
  serviceRoleKey: string;
  environment: ProductIntelligenceEnvironment;
};

const LOCAL_LOOPBACK_HOSTNAMES = new Set(["127.0.0.1", "localhost", "[::1]"]);

function readRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for a controlled shadow database operation.`);
  return value;
}

function parseDestinationUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("PRODUCT_INTELLIGENCE_SUPABASE_URL must be an absolute URL.");
  }

  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error(
      "PRODUCT_INTELLIGENCE_SUPABASE_URL cannot contain credentials, query parameters or a fragment.",
    );
  }
  if (parsed.pathname !== "/") {
    throw new Error("PRODUCT_INTELLIGENCE_SUPABASE_URL must point to the project root URL.");
  }

  return parsed;
}

export function getProductIntelligenceAdminConfig(): ProductIntelligenceAdminConfig {
  const environment = readRequiredEnvironmentVariable("PRODUCT_INTELLIGENCE_ENVIRONMENT");
  if (environment !== "local" && environment !== "staging") {
    throw new Error(
      "PRODUCT_INTELLIGENCE_ENVIRONMENT must be local or staging. Production shadow writes are blocked.",
    );
  }

  if (process.env.PRODUCT_INTELLIGENCE_ALLOW_SHADOW_WRITE !== "true") {
    throw new Error(
      "Set PRODUCT_INTELLIGENCE_ALLOW_SHADOW_WRITE=true for this reviewed local or staging operation.",
    );
  }

  const destination = parseDestinationUrl(
    readRequiredEnvironmentVariable("PRODUCT_INTELLIGENCE_SUPABASE_URL"),
  );
  if (environment === "local") {
    if (destination.protocol !== "http:" || !LOCAL_LOOPBACK_HOSTNAMES.has(destination.hostname)) {
      throw new Error(
        "A local Product Intelligence write must use an HTTP loopback URL. " +
          "Remote Supabase projects require the staging destination guard.",
      );
    }
  } else {
    const projectRef = readRequiredEnvironmentVariable("PRODUCT_INTELLIGENCE_STAGING_PROJECT_REF");
    const expectedHostname = `${projectRef}.supabase.co`;
    if (destination.protocol !== "https:" || destination.hostname !== expectedHostname) {
      throw new Error(
        "The staging Supabase URL does not match PRODUCT_INTELLIGENCE_STAGING_PROJECT_REF. " +
          "Use the direct HTTPS project URL for the exact authorized non-production project.",
      );
    }
  }

  const url = destination.origin;
  const serviceRoleKey = readRequiredEnvironmentVariable(
    "PRODUCT_INTELLIGENCE_SUPABASE_SERVICE_ROLE_KEY",
  );

  return {
    url,
    serviceRoleKey,
    environment,
  };
}
