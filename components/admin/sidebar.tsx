"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Carrot,
  Users,
  LogOut,
  ChefHat,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";

const nav = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard, exact: true },
  { href: "/admin/menu", label: "المنيو", icon: UtensilsCrossed },
  { href: "/admin/ingredients", label: "المخزون", icon: Carrot },
  { href: "/admin/employees", label: "الموظفون", icon: Users },
];

export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col bg-[var(--surface-card)] border-s border-[var(--surface-border)]">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--surface-border)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600">
          <ChefHat className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Stockify</p>
          <p className="text-xs text-[var(--text-muted)]">لوحة المدير</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-500/10 text-primary-700 dark:text-primary-300"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--surface-border)] px-3 py-4 space-y-3">
        <div className="px-3">
          <p className="text-xs text-[var(--text-muted)]">مرحباً</p>
          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
            {name}
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
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
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--surface-card)] border-b border-[var(--surface-border)]">
      <div className="flex items-center gap-2">
        <ChefHat className="h-5 w-5 text-primary-600" />
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {current?.label ?? "Stockify"}
        </span>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-input)]"
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
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-20 bg-[var(--surface-card)] border-t border-[var(--surface-border)] flex">
      {nav.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs ${
              active
                ? "text-primary-600"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
