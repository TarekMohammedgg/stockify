import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardList, Plus, LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";

function Mark({ className = "" }: { className?: string }) {
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

export default async function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role, name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "cashier") redirect("/");

  const cashierName = profile?.name ?? "الكاشير";

  return (
    <div className="min-h-svh bg-[var(--surface-bg)] flex flex-col" dir="rtl">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[var(--surface-canvas)] border-b border-[var(--surface-border-soft)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <Mark className="h-7 w-7 text-primary-600" />
            <span className="font-display text-lg text-[var(--text-primary)] tracking-tight hidden sm:block">
              Stockify
            </span>
            <span className="text-[var(--surface-border)] hidden sm:block">|</span>
            <span className="text-xs text-[var(--text-muted)] hidden sm:block">لوحة الكاشير</span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1 flex-1">
            <Link
              href="/cashier"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ClipboardList className="h-4 w-4" />
              <span>الطلبات</span>
            </Link>
            <Link
              href="/cashier/new-order"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>طلب جديد</span>
            </Link>
          </nav>

          {/* User + logout */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-[var(--text-muted)] hidden sm:block">{cashierName}</span>
            <form action={signOut}>
              <button
                type="submit"
                title="تسجيل الخروج"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-input)] transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm hidden sm:block">خروج</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
