import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { Truck, LogOut } from "lucide-react";

export default async function DeliveryLayout({
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

  if (profile?.role !== "delivery") redirect("/");

  return (
    <div className="min-h-svh bg-[var(--surface-bg)]">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--surface-border)] bg-[var(--surface-card)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary-500" />
          <span className="font-semibold text-[var(--text-primary)]">لوحة التوصيل</span>
        </div>
        <div className="flex items-center gap-3">
          {profile?.name && (
            <span className="hidden text-sm text-[var(--text-muted)] sm:block">
              {profile.name}
            </span>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
