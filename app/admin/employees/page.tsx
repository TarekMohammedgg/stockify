import { createClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";
import { EmployeesManager } from "./manager";

export const dynamic = "force-dynamic";

export default async function AdminEmployeesPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("users")
    .select("id, name, email, phone, role, is_active, created_at")
    .in("role", ["cashier", "delivery"])
    .order("created_at", { ascending: false });

  const active = (employees ?? []).filter((e) => e.is_active).length;
  const cashierCount = (employees ?? []).filter((e) => e.role === "cashier").length;
  const deliveryCount = (employees ?? []).filter((e) => e.role === "delivery").length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">
      <header className="rise-in">
        <p className="eyebrow mb-3">إدارة الفريق</p>
        <h1 className="font-display text-4xl md:text-5xl text-[var(--text-primary)] leading-tight">
          الموظفون
        </h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          <span className="numeric text-[var(--text-primary)]">
            {cashierCount}
          </span>{" "}
          كاشير ·{" "}
          <span className="numeric text-[var(--text-primary)]">
            {deliveryCount}
          </span>{" "}
          مندوب توصيل ·{" "}
          <span className="numeric text-emerald-700 dark:text-emerald-400">
            {active}
          </span>{" "}
          نشطون الآن
        </p>
      </header>

      <div className="rise-in" style={{ animationDelay: "100ms" }}>
        {!employees || employees.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--surface-border)] bg-[var(--surface-card)] p-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <p className="font-display text-lg text-[var(--text-primary)]">
              لا يوجد موظفون بعد
            </p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              أضف أول موظف لإدارة الطلبات
            </p>
            <div className="mt-6">
              <EmployeesManager employees={[]} />
            </div>
          </div>
        ) : (
          <EmployeesManager
            employees={(employees ?? []).map((e) => ({
              id: e.id,
              name: e.name,
              email: e.email ?? "",
              phone: e.phone ?? "",
              role: e.role as "cashier" | "delivery",
              is_active: e.is_active,
            }))}
          />
        )}
      </div>
    </div>
  );
}
