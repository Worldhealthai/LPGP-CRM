export function SiteFooter() {
  return (
    <footer className="border-t mt-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">LPGP Connect</span> — internal CRM ·
          finance, capital markets & private markets.
        </p>
        <p className="text-xs">Leads via Lusha · data in Supabase</p>
      </div>
    </footer>
  );
}
