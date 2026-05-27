"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Carrot,
  Users,
  Receipt,
  UserCog,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";

const nav = [
  { href: "/admin", label: "الرئيسية", en: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "الطلبات", en: "Orders", icon: Receipt },
  { href: "/admin/menu", label: "المنيو", en: "Menu", icon: UtensilsCrossed },
  { href: "/admin/ingredients", label: "المخزون", en: "Stock", icon: Carrot },
  { href: "/admin/employees", label: "الموظفون", en: "Staff", icon: UserCog },
  { href: "/admin/customers", label: "العملاء", en: "Customers", icon: Users },
];

function Mark({ className = "" }: { className?: string }) {
  // 8-point star monogram — a single ornamental glyph for Stockify
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="5" y="5" width="22" height="22" transform="rotate(0 16 16)" rx="2" />
        <rect x="5" y="5" width="22" height="22" transform="rotate(45 16 16)" rx="2" />
        <circle cx="16" cy="16" r="2.4" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-72 md:flex-col bg-[var(--surface-canvas)] border-s border-[var(--surface-border-soft)] relative">
      {/* Vertical hairline accent */}
      <div className="absolute inset-y-0 start-0 w-px bg-gradient-to-b from-transparent via-primary-500/30 to-transparent" />

      <div className="px-7 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <Mark className="h-9 w-9 text-primary-600" />
          <div className="leading-tight">
            <p className="font-display text-xl text-[var(--text-primary)] tracking-tight">
              Stockify
            </p>
            <p className="eyebrow">لوحة المدير</p>
          </div>
        </div>
      </div>

      <div className="px-7 pb-5">
        <div className="rule-ornament text-[var(--surface-border)]">
          <span aria-hidden className="font-display text-primary-500/70">٭</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-0.5">
        {nav.map((item, i) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-4 rounded-xl px-4 py-3 text-sm transition-all duration-300 ease-out hover:ps-5 relative ${
                active
                  ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-[0_1px_0_oklch(0.85_0.025_70)] ps-5"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-card)]/50 hover:text-[var(--text-primary)]"
              }`}
            >
              {active && (
                <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-primary-500 transition-all duration-300 origin-center animate-fade-in" />
              )}
              <Icon className={`h-4 w-4 shrink-0 transition-all duration-300 ${active ? "text-primary-600 scale-110" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] group-hover:scale-110 group-hover:rotate-3"}`} />
              <span className="flex-1 font-medium">{item.label}</span>
              <span className="font-display text-[10px] tracking-[0.18em] text-[var(--text-faint)]">
                {String(i + 1).padStart(2, "0")}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 mb-5 mt-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border-soft)] p-4 transition-all duration-300 hover:border-primary-500/20">
        <p className="eyebrow mb-1.5">مرحباً</p>
        <p className="font-display text-base text-[var(--text-primary)] truncate mb-3">
          {name}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center justify-between gap-2 rounded-lg bg-[var(--surface-input)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-canvas)] hover:text-accent-600 transition-colors duration-200"
          >
            <span>تسجيل الخروج</span>
            <LogOut className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </form>
      </div>
    </aside>
  );
}

export function AdminTopbar({ name }: { name: string }) {
  const pathname = usePathname();
  const current = nav.find((n) =>
    n.exact ? pathname === n.href : pathname.startsWith(n.href),
  );

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--surface-canvas)] border-b border-[var(--surface-border-soft)]">
      <div className="flex items-center gap-2.5">
        <Mark className="h-6 w-6 text-primary-600" />
        <span className="font-display text-base text-[var(--text-primary)]">
          {current?.label ?? "Stockify"}
        </span>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-input)] transition-colors duration-200"
          aria-label="تسجيل الخروج"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </form>
      <span className="sr-only">{name}</span>
    </header>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-20 bg-[var(--surface-canvas)] border-t border-[var(--surface-border-soft)] flex backdrop-blur-md">
      {nav.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] relative transition-colors duration-300 ${
              active
                ? "text-primary-600"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {active && (
              <span className="absolute top-0 inset-x-6 h-0.5 rounded-full bg-primary-500 animate-fade-in" />
            )}
            <Icon className={`h-5 w-5 transition-transform duration-300 ${active ? "scale-110 text-primary-600" : "text-[var(--text-muted)]"}`} />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
