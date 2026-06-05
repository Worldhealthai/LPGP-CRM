import { Check, X, Database, Plug, KeyRound } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { isAdminConfigured } from "@/lib/supabase/admin";
import { lushaConfigured } from "@/lib/lusha";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = { title: "Settings — LPGP Connect" };

function StatusRow({
  label,
  hint,
  ok,
  icon,
}: {
  label: string;
  hint: string;
  ok: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-foreground/70 shrink-0">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-medium">{label}</div>
        <div className="text-sm text-muted-foreground">{hint}</div>
      </div>
      <span
        className={
          "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium " +
          (ok
            ? "border-foreground/20 bg-foreground/5 text-foreground"
            : "border-border bg-muted text-muted-foreground")
        }
      >
        {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
        {ok ? "Connected" : "Not set"}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const supabase = isSupabaseConfigured();
  const admin = isAdminConfigured();
  const lusha = lushaConfigured();

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Appearance, connections and data setup.</p>
      </div>

      {/* Appearance */}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Appearance</h2>
        <p className="text-sm text-muted-foreground mt-0.5 mb-3">
          Switch between light and dark. Your choice is remembered on this device.
        </p>
        <ThemeToggle variant="switch" />
      </section>

      {/* Connections */}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Connections</h2>
        <div className="mt-2 divide-y">
          <StatusRow
            label="Supabase (reads)"
            hint="NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY"
            ok={supabase}
            icon={<Database className="h-4 w-4" />}
          />
          <StatusRow
            label="Supabase service role (writes)"
            hint="SUPABASE_SERVICE_ROLE_KEY — needed for import & editing"
            ok={admin}
            icon={<KeyRound className="h-4 w-4" />}
          />
          <StatusRow
            label="Lusha (optional)"
            hint="LUSHA_API_KEY — pull fresh leads by job title & firm"
            ok={lusha}
            icon={<Plug className="h-4 w-4" />}
          />
        </div>
      </section>

      {/* Database setup */}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Database</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Run the schema once in the Supabase SQL editor to create the tables this CRM uses.
        </p>
        <ol className="mt-3 space-y-2 text-sm list-decimal pl-5 text-foreground/80">
          <li>Open your Supabase project → <strong>SQL Editor</strong>.</li>
          <li>
            Paste the contents of{" "}
            <code className="font-mono text-xs rounded bg-muted px-1.5 py-0.5">
              supabase/migrations/0001_init.sql
            </code>{" "}
            and run it.
          </li>
          <li>
            Add the environment variables above in{" "}
            <strong>Vercel → Settings → Environment Variables</strong> (and your local{" "}
            <code className="font-mono text-xs rounded bg-muted px-1.5 py-0.5">.env.local</code>).
          </li>
        </ol>
      </section>
    </div>
  );
}
