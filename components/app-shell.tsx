"use client";

import { usePathname } from "next/navigation";
import { AppSidebar, MobileTopBar } from "@/components/app-sidebar";
import { SiteFooter } from "@/components/site-footer";
import { CommandPalette } from "@/components/command-palette";
import type { SessionUser } from "@/lib/auth";

export function AppShell({
  user,
  children,
}: {
  user: SessionUser | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // The login page renders bare (no sidebar/footer).
  if (pathname === "/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <AppSidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar user={user} />
        <main className="w-full flex-1">{children}</main>
        <SiteFooter />
      </div>
      <CommandPalette />
    </div>
  );
}
