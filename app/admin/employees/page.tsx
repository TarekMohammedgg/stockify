import { createClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";
import { EmployeesManager } from "./manager";

export const dynamic = "force-dynamic";

export default async function AdminEmployeesPage() {
  const supabase = await createClient();
  const { data: cashiers } = await supabase
    .from("users")
    .select("id, name, email, phone, is_active, created_at")
    .eq("role", "cashier")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">الموظفون</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {cashiers?.length ?? 0} كاشير
          </p>
        </div>
      </header>

      {!cashiers || cashiers.length === 0 ? (
        <EmptyState />
      ) : null}

      <EmployeesManager
        cashiers={
          (cashiers ?? []).map((c) => ({
            id: c.id,
            name: c.name,
            email: c.email ?? "",
            phone: c.phone ?? "",
            is_active: c.is_active,
          }))
        }
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--surface-border)] p-12 text-center">
      <Users className="mx-auto h-10 w-10 text-[var(--text-muted)]" />
      <p className="mt-3 text-sm text-[var(--text-muted)]">لا يوجد كاشير بعد</p>
    </div>
  );
}
