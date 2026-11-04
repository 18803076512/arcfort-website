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

export function hasDmarcAggregateReportUri(record: string) {
  const rua = /(?:^|;)\s*rua\s*=\s*([^;]+)/i.exec(record)?.[1];
  return Boolean(
    rua
      ?.split(",")
      .some((uri) => /^mailto:[^\s@,;!]+@[^\s@,;!]+(?:![0-9]+[kKmMgGtT]?)?$/i.test(uri.trim())),
  );
}
