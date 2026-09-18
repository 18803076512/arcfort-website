#!/usr/bin/env node

import { fetchReadOnlyWithRetry } from "./live-audit-fetch.ts";

type DnsAnswer = {
  type?: number;
  data?: string;
};

type DnsResponse = {
  Status?: number;
  Answer?: DnsAnswer[];
};

type DnsLookupResponse = DnsResponse & {
  lookupError?: string;
};

const args = process.argv.slice(2);
const dnsType = {
  MX: 15,
  TXT: 16,
} as const;
const retriedDnsHosts = new Set<string>();
let dnsRetryAttemptCount = 0;

function getOption(name: string) {
  const inlinePrefix = `--${name}=`;
  const inlineValue = args.find((argument) => argument.startsWith(inlinePrefix));

  if (inlineValue) {
    return inlineValue.slice(inlinePrefix.length).trim();
  }

  const optionIndex = args.indexOf(`--${name}`);
  return optionIndex >= 0 ? (args[optionIndex + 1] ?? "").trim() : "";
}

function normalizeDnsName(value: string, label: string) {
  const normalized = value.trim().toLowerCase().replace(/\.$/, "");

  if (!/^(?=.{1,253}$)[a-z0-9](?:[a-z0-9.-]*[a-z0-9])$/.test(normalized)) {
    throw new Error(`${label} must be a valid DNS name.`);
  }

  return normalized;
}

function decodeTxt(value: string) {
  return value.trim().replace(/^"|"$/g, "").replace(/"\s*"/g, "");
}

async function queryDns(name: string, type: keyof typeof dnsType): Promise<DnsLookupResponse> {
  const endpoints = [
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
  ];
  const failures: string[] = [];

  for (const endpoint of endpoints) {
    try {
      const { response, data: result } = await fetchReadOnlyWithRetry<DnsResponse>(
        endpoint,
        {
          headers: {
            Accept: "application/dns-json",
            "User-Agent": "ArcFort-Email-Domain-Audit/1.0",
          },
          cache: "no-store",
        },
        {
          attempts: 3,
          timeoutMs: 12_000,
          baseDelayMs: 500,
          read: async (result) => (await result.json()) as DnsResponse,
          onRetry: (event) => {
            dnsRetryAttemptCount += 1;
            retriedDnsHosts.add(new URL(event.url).hostname);
          },
        },
      );

      if (!response.ok) {
        failures.push(`${new URL(endpoint).hostname}: HTTP ${response.status}`);
        continue;
      }

      if (typeof result.Status !== "number") {
        failures.push(`${new URL(endpoint).hostname}: invalid DNS response`);
        continue;
      }

      return result;
    } catch (error) {
      failures.push(
        `${new URL(endpoint).hostname}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return {
    Status: undefined,
    lookupError: `DNS lookup failed for ${name} ${type}: ${failures.join("; ")}`,
  };
}

function answers(result: DnsResponse, type: keyof typeof dnsType) {
  return (result.Answer ?? [])
    .filter((answer) => answer.type === dnsType[type] && answer.data)
    .map((answer) => answer.data as string);
}

async function main() {
  const domain = normalizeDnsName(getOption("domain") || "arcfortweld.com", "Domain");
  const selector = normalizeDnsName(getOption("selector") || "resend", "DKIM selector");
  const mailFromLabel = normalizeDnsName(getOption("mail-from") || "send", "MAIL FROM label");
  const strict = args.includes("--strict");
  const dkimName = `${selector}._domainkey.${domain}`;
  const dmarcName = `_dmarc.${domain}`;
  const mailFromName = `${mailFromLabel}.${domain}`;
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log("ArcFort Weld email-domain authentication audit");
  console.log(`Sender domain: ${domain}`);
  console.log(`DKIM selector: ${selector}`);
  console.log(`MAIL FROM domain: ${mailFromName}`);

  const [dkimResult, dmarcResult, spfResult, mxResult] = await Promise.all([
    queryDns(dkimName, "TXT"),
    queryDns(dmarcName, "TXT"),
    queryDns(mailFromName, "TXT"),
    queryDns(mailFromName, "MX"),
  ]);

  const lookups = [
    { label: "DKIM", result: dkimResult },
    { label: "DMARC", result: dmarcResult },
    { label: "SPF", result: spfResult },
    { label: "custom MAIL FROM MX", result: mxResult },
  ] as Array<{
    label: string;
    result: DnsResponse & { lookupError?: string };
  }>;

  for (const lookup of lookups) {
    if (lookup.result.lookupError) {
      warnings.push(`${lookup.label} was not verified: ${lookup.result.lookupError}`);
    }
  }

  const dkimRecords = answers(dkimResult, "TXT").map(decodeTxt);
  const dkimRecord = dkimRecords.find((record) => /(?:^|;)\s*p=[A-Za-z0-9+/=]+/.test(record));

  if (dkimResult.lookupError) {
    // The lookup warning above is sufficient; do not infer record state.
  } else if (dkimRecord) {
    console.log(`DKIM: present at ${dkimName}`);
  } else {
    errors.push(`DKIM public key is missing at ${dkimName}.`);
  }

  const spfRecords = answers(spfResult, "TXT").map(decodeTxt);
  const spfRecord = spfRecords.find((record) => /^v=spf1\b/i.test(record));

  if (spfResult.lookupError) {
    // The lookup warning above is sufficient; do not infer record state.
  } else if (!spfRecord) {
    errors.push(`SPF record is missing at ${mailFromName}.`);
  } else if (!/\binclude:amazonses\.com\b/i.test(spfRecord)) {
    errors.push(`${mailFromName} SPF does not authorize the Resend/Amazon SES delivery path.`);
  } else {
    console.log(`SPF: Resend/Amazon SES authorized at ${mailFromName}`);
  }

  const mxRecords = answers(mxResult, "MX");

  if (mxResult.lookupError) {
    // The lookup warning above is sufficient; do not infer record state.
  } else if (
    !mxRecords.some((record) =>
      /feedback-smtp\.[^\s.]+(?:\.[^\s.]+)*\.amazonses\.com\.?$/i.test(record),
    )
  ) {
    errors.push(`${mailFromName} MX does not point to an Amazon SES feedback endpoint.`);
  } else {
    console.log(`Custom MAIL FROM MX: present at ${mailFromName}`);
  }

  const dmarcRecords = answers(dmarcResult, "TXT").map(decodeTxt);
  const dmarcRecord = dmarcRecords.find((record) => /^v=DMARC1\b/i.test(record));

  if (dmarcResult.lookupError) {
    // The lookup warning above is sufficient; do not infer record state.
  } else if (!dmarcRecord) {
    warnings.push(
      `DMARC is missing at ${dmarcName}. Start with "v=DMARC1; p=none; adkim=r; aspf=r; pct=100" after confirming the sender domain in Resend.`,
    );
  } else {
    const policy = /(?:^|;)\s*p=(none|quarantine|reject)(?:;|$)/i.exec(dmarcRecord)?.[1];

    if (!policy) {
      errors.push(`${dmarcName} does not contain a valid p= policy.`);
    } else {
      console.log(`DMARC: present with p=${policy.toLowerCase()}`);

      if (policy.toLowerCase() === "none") {
        warnings.push(
          "DMARC is in monitoring mode. Move to quarantine/reject only after reviewing legitimate mail alignment.",
        );
      }
    }
  }

  if (warnings.length > 0) {
    console.warn(`\nWarnings (${warnings.length})`);
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }

  console.log(
    `DNS transient retries: ${dnsRetryAttemptCount} attempt${dnsRetryAttemptCount === 1 ? "" : "s"} across ${retriedDnsHosts.size} provider${retriedDnsHosts.size === 1 ? "" : "s"}`,
  );

  if (errors.length > 0) {
    console.error(`\nBlocking authentication errors (${errors.length})`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }

  if (strict && warnings.length > 0) {
    console.error("\nStrict email-domain audit failed because warnings remain.");
    process.exitCode = 1;
    return;
  }

  console.log(
    warnings.some((warning) => warning.includes("was not verified"))
      ? "\nEmail-domain audit completed with unresolved DNS lookups."
      : "\nCore Resend sender authentication records passed.",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
