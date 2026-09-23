import { redirect } from "next/navigation";
import { AuthPanel, PasswordField } from "@/components/console/AuthPanel";
import { getConsoleContext } from "@/lib/console/server";

export const metadata = { title: "Set Password" };

export default async function PasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const context = await getConsoleContext();
  if (context.status !== "authorized" && context.status !== "no_role") redirect("/console/login");
  return (
    <AuthPanel title="Set Your Password">
      {(await searchParams).error && (
        <p role="alert">
          Use 12-128 characters and enter the same password twice. Request a new recovery link if
          the session has expired.
        </p>
      )}
      <form action="/console/auth/session" method="post" className="console-form">
        <input type="hidden" name="action" value="password" />
        <PasswordField />
        <PasswordField confirm />
        <button className="console-button">Save Password</button>
      </form>
    </AuthPanel>
  );
}
