import { AuthPanel } from "@/components/console/AuthPanel";
import { getConsoleContext } from "@/lib/console/server";

export const metadata = { title: "Verify Invitation" };

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await getConsoleContext();
  const params = await searchParams;
  const valid =
    ["unauthenticated", "no_role", "authorized"].includes(context.status) &&
    typeof params.token_hash === "string" &&
    /^[a-f0-9]{40,128}$/.test(params.token_hash) &&
    (params.type === "invite" || params.type === "recovery");
  return (
    <AuthPanel title="Confirm Account Access">
      {valid ? (
        <form action="/console/auth/session" method="post" className="console-form">
          <input type="hidden" name="action" value="confirm" />
          <input type="hidden" name="token_hash" value={params.token_hash} />
          <input type="hidden" name="type" value={params.type} />
          <p>Continue to verify this invitation or recovery request.</p>
          <button className="console-button">Continue</button>
        </form>
      ) : (
        <p>This link cannot be used. Request a new invitation or recovery link.</p>
      )}
    </AuthPanel>
  );
}
