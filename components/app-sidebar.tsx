"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Upload,
  Star,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/portfolio", label: "Portfolio", icon: Star },
  { href: "/import", label: "Import", icon: Upload },
];

function isMenuActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
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

function NavBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      <div className="space-y-0.5">
        <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        {MENU.map((item) => {
          const Icon = item.icon;
          const on = isMenuActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                on
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="space-y-0.5">
        <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Books
        </p>
        {CATEGORY_ORDER.map((k) => {
          const meta = CATEGORIES[k];
          return (
            <Link
              key={k}
              href={`/companies?category=${k}`}
              onClick={onNavigate}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
            >
              <span className={cn("h-2 w-2 rounded-full shrink-0", meta.dot)} />
              <span className="flex-1">
                {meta.singular}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">{meta.name}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Footer({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const on = pathname.startsWith("/settings");
  return (
    <div className="border-t p-3 space-y-2">
      <Link
        href="/settings"
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
          on
            ? "bg-primary text-primary-foreground"
            : "text-foreground/70 hover:bg-accent hover:text-foreground",
        )}
      >
        <Settings className="h-4 w-4" />
        Settings
      </Link>
      <ThemeToggle />
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-card h-screen sticky top-0">
      <div className="h-16 flex items-center border-b px-3">
        <Brand />
      </div>
      <NavBody />
      <Footer />
    </aside>
  );
}

export function MobileTopBar() {
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
            <NavBody onNavigate={close} />
            <Footer onNavigate={close} />
          </div>
        </div>
      ) : null}
    </>
  );
}
