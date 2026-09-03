import { ConsoleLink } from "@/components/console/ConsoleLink";

import { AuthPanel } from "@/components/console/AuthPanel";
import { getConsoleContext } from "@/lib/console/server";

export const metadata = { title: "Account Recovery" };

export default async function RecoverPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const context = await getConsoleContext();
  const available = ["authorized", "unauthenticated", "no_role"].includes(context.status);
  return (
    <AuthPanel title="Reset Password">
      {(await searchParams).sent === "1" ? (
        <p role="status">
          If the account is eligible for recovery, a reset link will be sent. Check your inbox and
          spam folder.
        </p>
      ) : available ? (
        <form action="/console/auth/session" method="post" className="console-form">
          <input type="hidden" name="action" value="recover" />
          <label>
            Email
            <input type="email" name="email" required maxLength={254} autoComplete="email" />
          </label>
          <button className="console-button">Send Reset Link</button>
        </form>
      ) : (
        <p>Account recovery is unavailable in this environment.</p>
      )}
      <ConsoleLink href="/console/login">Back to Sign In</ConsoleLink>
    </AuthPanel>
  );
}
