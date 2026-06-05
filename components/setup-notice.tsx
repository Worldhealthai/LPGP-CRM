import { Database } from "lucide-react";

export function SetupNotice() {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 px-5 py-4 flex gap-3">
      <Database className="h-5 w-5 mt-0.5 shrink-0" />
      <div className="text-sm">
        <p className="font-semibold">Supabase isn&apos;t connected yet.</p>
        <p className="mt-1 text-amber-800">
          Set <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (plus{" "}
          <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> for imports &amp;
          edits) in your environment, and run{" "}
          <code className="font-mono text-xs">supabase/migrations/0001_init.sql</code> in the
          Supabase SQL editor. The app will light up automatically once those exist.
        </p>
      </div>
    </div>
  );
}
