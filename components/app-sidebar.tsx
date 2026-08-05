"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutGrid,
  List,
  LayoutDashboard,
  Building2,
  Layers,
  Users,
  Star,
  Upload,
  Settings,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

type NavItem = { href: string; label: string; icon: typeof LayoutGrid };

const CRM_NAV: NavItem[] = [
  { href: "/", label: "Pipeline", icon: LayoutGrid },
  { href: "/leads", label: "Leads", icon: List },
];

const DB_NAV: NavItem[] = [
  { href: "/database", label: "Overview", icon: LayoutDashboard },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/funds", label: "Funds", icon: Layers },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/portfolio", label: "Portfolio", icon: Star },
  { href: "/import", label: "Import", icon: Upload },
];

function isActive(pathname: string, href: string) {
  if (href === "/" || href === "/database") return pathname === href;
  return pathname.startsWith(href);
}

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex items-center gap-2.5 px-2">
      <span className="grid place-items-center h-7 w-7 rounded-md bg-primary text-primary-foreground text-[12px] font-bold tracking-tight">
        LP
      </span>
      <span className="text-[15px] font-semibold tracking-tight">
        LPGP <span className="text-muted-foreground font-normal">Connect</span>
      </span>
    </Link>
  );
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const on = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
        on ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

function NavBody({ user, onNavigate }: { user: SessionUser | null; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      <div className="space-y-0.5">
        <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          CRM
        </p>
        {CRM_NAV.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </div>

      <div className="space-y-0.5">
        <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Database
        </p>
        {DB_NAV.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </div>

      {user?.role === "admin" ? (
        <div className="space-y-0.5">
          <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Admin
          </p>
          <NavLink item={{ href: "/admin", label: "Team & assignments", icon: Shield }} onNavigate={onNavigate} />
        </div>
      ) : null}
    </nav>
  );
}

function Footer({ user, onNavigate }: { user: SessionUser | null; onNavigate?: () => void }) {
  const pathname = usePathname();
  const settingsOn = pathname.startsWith("/settings");
  return (
    <div className="border-t p-3 space-y-2">
      <Link
        href="/settings"
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
          settingsOn ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-accent hover:text-foreground",
        )}
      >
        <Settings className="h-4 w-4" />
        Settings
      </Link>
      <ThemeToggle />
      {user ? (
        <div className="flex items-center gap-2.5 rounded-lg border bg-card/60 px-2.5 py-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-accent-foreground text-[11px] font-semibold shrink-0">
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-[11px] text-muted-foreground truncate">
              {user.role === "admin" ? "Admin" : "Member"}
            </div>
          </div>
          <SignOutButton />
        </div>
      ) : null}
    </div>
  );
}

export function AppSidebar({ user }: { user: SessionUser | null }) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-card h-screen sticky top-0">
      <div className="h-16 flex items-center border-b px-3">
        <Brand />
      </div>
      <NavBody user={user} />
      <Footer user={user} />
    </aside>
  );
}

export function MobileTopBar({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <div className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card/90 backdrop-blur px-3">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 -mr-1 text-foreground"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open ? (
        <div className="md:hidden fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={close} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85%] bg-card border-r flex flex-col shadow-xl">
            <div className="h-14 flex items-center justify-between border-b px-3">
              <Brand onClick={close} />
              <button onClick={close} className="p-2 text-foreground" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavBody user={user} onNavigate={close} />
            <Footer user={user} onNavigate={close} />
          </div>
        </div>
      ) : null}
    </>
  );
}
