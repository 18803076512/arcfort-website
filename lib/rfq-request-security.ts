type RfqRequestTrustInput = {
  requestUrl: string;
  requestHost?: string | null;
  origin: string | null;
  fetchSite: string | null;
  productionUrl: string;
};

const trustedFetchSites = new Set(["none", "same-origin", "same-site"]);

function getHttpOrigin(value: string) {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function isTrustedRfqRequest({
  requestUrl,
  requestHost,
  origin,
  fetchSite,
  productionUrl,
}: RfqRequestTrustInput) {
  const normalizedFetchSite = fetchSite?.trim().toLowerCase();

  if (normalizedFetchSite && !trustedFetchSites.has(normalizedFetchSite)) {
    return false;
  }

  if (!origin) {
    return true;
  }

  const requestOrigin = getHttpOrigin(requestUrl);
  const submittedOrigin = getHttpOrigin(origin);
  const productionOrigin = getHttpOrigin(productionUrl);

  if (!requestOrigin || !submittedOrigin || !productionOrigin) {
    return false;
  }

  const submittedHost = new URL(submittedOrigin).host.toLowerCase();
  const normalizedRequestHost = requestHost?.trim().toLowerCase();

  return (
    submittedOrigin === requestOrigin ||
    submittedOrigin === productionOrigin ||
    Boolean(normalizedRequestHost && submittedHost === normalizedRequestHost)
  );
}
