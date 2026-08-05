import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { listLeads, listProfiles } from "@/lib/crm";
import { STAGE_META } from "@/lib/pipeline";
import { formatUsd } from "@/lib/utils";
import { initials } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { AssignSelect } from "@/components/admin-assign";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — LPGP Connect" };

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-16 text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
        <h1 className="mt-3 text-xl font-semibold">Admins only</h1>
        <p className="mt-1 text-muted-foreground">
          You need an admin role to allocate leads. An existing admin can grant it (set your email in{" "}
          <code className="font-mono text-xs">ADMIN_EMAILS</code> or{" "}
          <code className="font-mono text-xs">profiles.role = &apos;admin&apos;</code>).
        </p>
        <Link href="/" className="mt-4 inline-block text-sm text-primary hover:underline">
          Back to pipeline
        </Link>
      </div>
    );
  }

  const [leads, profiles] = await Promise.all([listLeads(), listProfiles()]);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Team & assignments"
        description="Allocate leads to teammates. Reassigning here changes who owns and can edit a lead."
      />

      {/* Team */}
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Team ({profiles.length})</h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <li key={p.id} className="flex items-center gap-2.5 rounded-lg border px-3 py-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground text-[11px] font-semibold">
                {initials(p.full_name ?? p.email ?? "?")}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{p.full_name ?? "Unnamed"}</div>
                <div className="text-xs text-muted-foreground truncate">{p.email}</div>
              </div>
              {p.role === "admin" ? (
                <span className="ml-auto rounded border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  ADMIN
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Add teammates in Supabase → Authentication → Users. They appear here on first sign-in.
        </p>
      </section>

      {/* Assign leads */}
      <section className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b">
          <h2 className="font-semibold">Leads ({leads.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-5 py-2.5">Company</th>
                <th className="text-left font-medium px-3 py-2.5">Stage</th>
                <th className="text-left font-medium px-3 py-2.5">Market</th>
                <th className="text-right font-medium px-3 py-2.5">Value</th>
                <th className="text-left font-medium px-5 py-2.5">Owner</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    No leads yet.
                  </td>
                </tr>
              ) : (
                leads.map((l) => {
                  const kind = STAGE_META[l.stage]?.kind ?? "open";
                  return (
                    <tr key={l.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/leads/${l.id}`} className="font-medium hover:text-primary">
                          {l.company_name ?? l.company?.name ?? "Untitled"}
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              kind === "won" ? "bg-foreground" : kind === "lost" ? "bg-foreground/30" : "bg-foreground/60",
                            )}
                          />
                          {l.stage}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{l.market ?? "—"}</td>
                      <td className="px-3 py-3 text-right tabular whitespace-nowrap">
                        {l.value_usd != null ? formatUsd(l.value_usd) : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <AssignSelect leadId={l.id} ownerId={l.owner_id} profiles={profiles} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
