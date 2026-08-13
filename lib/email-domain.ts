const mailboxPattern = /^[^\s<>@]+@([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+)$/i;

export function getEmailSenderDomain(value: string | undefined) {
  const normalized = value?.trim();

  if (!normalized || /[\r\n]/.test(normalized)) {
    return undefined;
  }

  const angleAddress = normalized.match(/<([^<>]+)>$/)?.[1]?.trim();
  const address = angleAddress ?? normalized;
  const match = mailboxPattern.exec(address);

  return match?.[1]?.toLowerCase();
}
