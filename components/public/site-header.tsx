"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogIn, LogOut, UserCircle, User } from "lucide-react";
import { signOut } from "@/lib/actions/auth";

type UserProfile = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
} | null;

type SiteHeaderProps = {
  isAr: boolean;
  onToggleLang: () => void;
  userProfile: UserProfile;
  loginNext?: string;
};

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export default function SiteHeader({
  isAr,
  onToggleLang,
  userProfile,
  loginNext = "/menu",
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const loginHref = `/login?next=${encodeURIComponent(loginNext)}`;

  return (
    <header className="relative z-30 border-b border-[var(--surface-border)] bg-[var(--surface-bg)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        <Link
          href="/"
          className="font-display text-3xl font-bold tracking-tight text-[var(--primary-600)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-600)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--surface-bg)] rounded-sm"
        >
          Stockify
        </Link>



        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLang}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-[var(--surface-border)] px-5 text-sm font-bold transition-all hover:bg-[var(--surface-border)] hover:text-[var(--primary-700)] active:scale-95"
            aria-label={isAr ? "Switch to English" : "تغيير إلى العربية"}
          >
            {isAr ? "English" : "عربي"}
          </button>

          {userProfile ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface-card)] py-1 ps-1 pe-3 transition-all hover:border-[var(--primary-600)] hover:shadow-sm active:scale-95"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-600)] text-sm font-bold text-white">
                  {getInitials(userProfile.name || "?")}
                </span>
                <span className="hidden text-sm font-semibold text-[var(--text-primary)] sm:inline">
                  {userProfile.name?.split(" ")[0] || (isAr ? "حسابي" : "Account")}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${menuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute end-0 mt-2 w-64 overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] shadow-xl"
                  dir={isAr ? "rtl" : "ltr"}
                >
                  <div className="border-b border-[var(--surface-border-soft)] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-600)] text-sm font-bold text-white">
                        {getInitials(userProfile.name || "?")}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                          {userProfile.name || (isAr ? "صديقنا" : "Friend")}
                        </p>
                        {userProfile.phone && (
                          <p className="truncate text-xs text-[var(--text-muted)]" dir="ltr">
                            {userProfile.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-start text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-card-warm)]"
                  >
                    <UserCircle className="h-4 w-4 text-[var(--text-muted)]" />
                    {isAr ? "ملفي الشخصي" : "My Profile"}
                  </Link>
                  <form action={signOut} className="block">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 px-4 py-3 text-start text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-card-warm)]"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4 text-[var(--text-muted)]" />
                      {isAr ? "تسجيل الخروج" : "Logout"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={loginHref}
              className="flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--primary-600)] px-5 text-sm font-bold text-white shadow-[0_4px_14px_0_oklch(0.58_0.18_48/0.39)] transition-all hover:bg-[var(--primary-700)] hover:shadow-[0_6px_20px_0_oklch(0.58_0.18_48/0.23)] active:scale-95"
            >
              <LogIn className="h-4 w-4" />
              {isAr ? "تسجيل الدخول" : "Login"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
