import { ConsoleLink } from "@/components/console/ConsoleLink";

import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/console/AuthPanel";
import { getConsoleContext } from "@/lib/console/server";

export const metadata = { title: "Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await getConsoleContext();
  if (context.status === "authorized") redirect("/console/dashboard");
  const params = await searchParams;
  const message =
    context.status === "disabled"
      ? "Console access is not enabled in this environment."
      : context.status === "invalid"
        ? "This environment is not configured for Console access."
        : context.status === "unavailable"
          ? "Sign-in is temporarily unavailable. Contact the project administrator."
          : context.status === "no_role"
            ? "Your account has no active Console role. Contact the project administrator."
            : params.state === "credentials"
              ? "Unable to sign in. Check your credentials and try again."
              : params.state === "link"
                ? "This invitation or recovery link could not be verified. Request a new link."
                : params.state === "password_changed"
                  ? "Password updated. Sign in with your new password."
                  : "Invited team members only.";
  const canSignIn = context.status === "unauthenticated" || context.status === "no_role";
  return (
    <AuthPanel title="Product Intelligence">
      <p role="status">{message}</p>
      {canSignIn && (
        <form action="/console/auth/session" method="post" className="console-form">
          <input type="hidden" name="action" value="login" />
          <label>
            Email
            <input type="email" name="email" required maxLength={254} autoComplete="username" />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              required
              maxLength={128}
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="console-button">
            Sign In
          </button>
          <ConsoleLink href="/console/recover">Forgot password?</ConsoleLink>
        </form>
      )}
      {context.status === "no_role" && (
        <form action="/console/auth/session" method="post">
          <input type="hidden" name="action" value="logout" />
          <button className="console-link">Sign Out</button>
        </form>
      )}
    </AuthPanel>
  );
}
