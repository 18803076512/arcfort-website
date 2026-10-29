export type DnsLookupLabel = "DKIM" | "DMARC" | "SPF" | "custom MAIL FROM MX";

export function isDefinitiveDnsStatus(status: number | undefined) {
  // NOERROR and NXDOMAIN can establish presence or absence. SERVFAIL and other
  // resolver errors cannot establish either state, so try the next provider.
  return status === 0 || status === 3;
}

export function classifyDnsLookupFailure(label: DnsLookupLabel, lookupError: string) {
  return {
    severity: label === "DMARC" ? ("warning" as const) : ("error" as const),
    message: `${label} was not verified: ${lookupError}`,
  };
}
