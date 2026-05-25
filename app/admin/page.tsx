import { createClient } from "@/lib/supabase/server";
import {
  Receipt,
  Banknote,
  UtensilsCrossed,
  AlertTriangle,
  Users,
} from "lucide-react";
import Link from "next/link";

type StatCard = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "success" | "warning" | "info";
  href?: string;
  hint?: string;
};

const toneStyles: Record<StatCard["tone"], string> = {
  primary: "bg-primary-500/10 text-primary-600",
  success: "bg-emerald-500/10 text-emerald-600",
  warning: "bg-amber-500/10 text-amber-600",
  info: "bg-sky-500/10 text-sky-600",
};

export default async function AdminHomePage() {
  const supabase = await createClient();

  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const [
    { count: ordersToday },
    { data: revenueRows },
    { count: menuCount },
    { data: lowStock },
    { count: customerCount },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since.toISOString()),
    supabase
      .from("orders")
      .select("total_price")
      .eq("status", "completed")
      .gte("created_at", since.toISOString()),
    supabase.from("menu_items").select("id", { count: "exact", head: true }),
    supabase.from("v_low_stock").select("id, name_ar, alert_level"),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer"),
  ]);

  const revenueToday =
    revenueRows?.reduce((sum, r) => sum + Number(r.total_price ?? 0), 0) ?? 0;

  const stats: StatCard[] = [
    {
      label: "طلبات اليوم",
      value: String(ordersToday ?? 0),
      icon: Receipt,
      tone: "primary",
      href: "/cashier",
    },
    {
      label: "إيرادات اليوم",
      value: `${revenueToday.toLocaleString("ar-EG")} ج.م`,
      icon: Banknote,
      tone: "success",
      hint: "الطلبات المكتملة",
    },
    {
      label: "أصناف المنيو",
      value: String(menuCount ?? 0),
      icon: UtensilsCrossed,
      tone: "info",
      href: "/admin/menu",
    },
    {
      label: "تنبيهات مخزون",
      value: String(lowStock?.length ?? 0),
      icon: AlertTriangle,
      tone: "warning",
      href: "/admin/ingredients",
    },
    {
      label: "العملاء",
      value: String(customerCount ?? 0),
      icon: Users,
      tone: "info",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          نظرة عامة
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          ملخص نشاط المطعم اليوم
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          const inner = (
            <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] p-5 hover:border-primary-500/40 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">{s.label}</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                    {s.value}
                  </p>
                  {s.hint && (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {s.hint}
                    </p>
                  )}
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneStyles[s.tone]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href}>
              {inner}
            </Link>
          ) : (
            <div key={s.label}>{inner}</div>
          );
        })}
      </section>

      {lowStock && lowStock.length > 0 && (
        <section className="rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              مكونات تحتاج إعادة تموين
            </h2>
            <Link
              href="/admin/ingredients"
              className="text-sm text-primary-600 hover:underline"
            >
              عرض الكل
            </Link>
          </div>
          <ul className="divide-y divide-[var(--surface-border)]">
            {lowStock.slice(0, 6).map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <span className="text-[var(--text-primary)]">{row.name_ar}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    row.alert_level === "out_of_stock"
                      ? "bg-red-500/10 text-red-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {row.alert_level === "out_of_stock" ? "نفد" : "منخفض"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
