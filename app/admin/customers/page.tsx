import { listCustomers } from "@/lib/actions/admin";
import { Users } from "lucide-react";
import { CustomersList } from "./customers-list";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  let customers: Awaited<ReturnType<typeof listCustomers>> = [];
  try {
    customers = await listCustomers();
  } catch (err) {
    console.error("[AdminCustomersPage] listCustomers", err);
  }

  const withOrders = customers.filter((c) => c.order_count > 0).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      <header className="rise-in flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-3">إدارة العملاء</p>
          <h1 className="font-display text-4xl md:text-5xl text-[var(--text-primary)] leading-tight">
            دفتر العملاء
          </h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            <span className="numeric text-[var(--text-primary)]">
              {customers.length}
            </span>{" "}
            عميل مسجّل
            <span className="ms-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <span className="numeric">{withOrders}</span> لديه طلبات
            </span>
          </p>
        </div>
      </header>

      {customers.length === 0 ? (
        <div className="rise-in rounded-3xl border border-dashed border-[var(--surface-border)] bg-[var(--surface-card)] p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10">
            <Users className="h-6 w-6 text-primary-600" />
          </div>
          <p className="font-display text-lg text-[var(--text-primary)]">
            لا يوجد عملاء بعد
          </p>
        </div>
      ) : (
        <div className="rise-in" style={{ animationDelay: "100ms" }}>
          <CustomersList initial={customers} />
        </div>
      )}
    </div>
  );
}
