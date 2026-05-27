import { createClient } from "@/lib/supabase/server";
import {
  Receipt,
  UtensilsCrossed,
  AlertTriangle,
  Users,
  UserCog,
  ArrowUpLeft,
} from "lucide-react";
import Link from "next/link";
import { cairoStartOfDay, cairoStartOfMonth } from "@/lib/time";

export const dynamic = "force-dynamic";

type StatCard = {
  label: string;
  value: string;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  hint?: string;
};

export default async function AdminHomePage() {
  const supabase = await createClient();

  const since = cairoStartOfDay();
  const sinceMonth = cairoStartOfMonth();

  const [
    { count: ordersToday },
    { data: revenueRows },
    { data: revenueMonthRows },
    { count: menuCount },
    { data: lowStock },
    { count: customerCount },
    { count: employeeCount },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since.toISOString()),
    supabase
      .from("orders")
      .select("total_price")
      .eq("status", "complete")
      .gte("created_at", since.toISOString()),
    supabase
      .from("orders")
      .select("total_price")
      .eq("status", "complete")
      .gte("created_at", sinceMonth.toISOString()),
    supabase.from("menu_items").select("id", { count: "exact", head: true }),
    supabase.from("v_low_stock").select("id, name_ar, alert_level"),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .in("role", ["cashier", "delivery"]),
  ]);

  const revenueToday =
    revenueRows?.reduce((sum, r) => sum + Number(r.total_price ?? 0), 0) ?? 0;
  const revenueMonth =
    revenueMonthRows?.reduce(
      (sum, r) => sum + Number(r.total_price ?? 0),
      0,
    ) ?? 0;

  const today = new Date().toLocaleDateString("ar-EG-u-nu-latn", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const stats: StatCard[] = [
    {
      label: "طلبات اليوم",
      value: String(ordersToday ?? 0),
      icon: Receipt,
      href: "/admin/orders",
      hint: "كل أنواع الطلبات",
    },
    {
      label: "أصناف المنيو",
      value: String(menuCount ?? 0),
      icon: UtensilsCrossed,
      href: "/admin/menu",
      hint: "متاحة ومتوقفة",
    },
    {
      label: "تنبيهات المخزون",
      value: String(lowStock?.length ?? 0),
      icon: AlertTriangle,
      href: "/admin/ingredients?filter=low",
      hint: "تحتاج إعادة تموين",
    },
    {
      label: "العملاء المسجّلون",
      value: String(customerCount ?? 0),
      icon: Users,
      href: "/admin/customers",
      hint: "كل الوقت",
    },
    {
      label: "الموظفون",
      value: String(employeeCount ?? 0),
      icon: UserCog,
      href: "/admin/employees",
      hint: "كاشير ومندوبو توصيل",
    },
  ];

  return (
    <div className="relative mx-auto max-w-6xl px-6 py-10 space-y-12">
      {/* ── Editorial header ─────────────────────────────────── */}
      <header className="rise-in relative overflow-hidden rounded-3xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)]">
        <div className="absolute inset-0 bg-ornament opacity-60 pointer-events-none" />
        <div className="absolute -top-16 -end-16 h-56 w-56 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
        <div className="relative px-8 py-10 md:px-12 md:py-14">
          <p className="eyebrow mb-4">لوحة الإدارة — اليوم</p>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.15] text-[var(--text-primary)]">
            مرحباً بعودتك،
            <br />
            <span className="text-primary-600">هذا ملخص مطعمك.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm text-[var(--text-secondary)] leading-relaxed">
            {today}
          </p>

          {/* Hero KPI — revenue today (click for breakdown) */}
          <div className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-6">
            <Link
              href="/admin/revenue"
              className="group block transition-opacity hover:opacity-90"
              aria-label="عرض تفاصيل احتساب إيرادات اليوم"
            >
              <p className="eyebrow mb-3 inline-flex items-center gap-2">
                إيرادات اليوم
                <ArrowUpLeft className="h-3 w-3 text-[var(--text-faint)] group-hover:text-primary-600 transition-colors" />
              </p>
              <p className="font-serif text-6xl md:text-7xl text-[var(--text-primary)] leading-none numeric group-hover:text-primary-700 transition-colors">
                {revenueToday.toLocaleString("en-EG")}
                <span className="ms-3 text-2xl md:text-3xl text-primary-600 font-display align-middle">
                  ج.م
                </span>
              </p>
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                من الطلبات المكتملة فقط
              </p>
              <div className="mt-4 border-t border-dashed border-[var(--surface-border-soft)] pt-3">
                <p className="eyebrow mb-1">هذا الشهر</p>
                <p className="font-serif text-2xl numeric text-[var(--text-secondary)] leading-none">
                  {revenueMonth.toLocaleString("en-EG")}
                  <span className="ms-2 text-sm text-primary-600 font-display align-middle">
                    ج.م
                  </span>
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-2 text-[var(--text-faint)] font-display text-2xl">
              <span aria-hidden>٭</span>
              <span aria-hidden>٭</span>
              <span aria-hidden>٭</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 ms-auto">
              <KpiMini label="طلبات" value={String(ordersToday ?? 0)} />
              <KpiMini label="منيو" value={String(menuCount ?? 0)} />
              <KpiMini label="موظفون" value={String(employeeCount ?? 0)} />
              <KpiMini label="عملاء" value={String(customerCount ?? 0)} />
              <KpiMini
                label="تنبيهات"
                value={String(lowStock?.length ?? 0)}
                accent={(lowStock?.length ?? 0) > 0}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── Stat grid ────────────────────────────────────────── */}
      <section className="rise-in delay-100">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-xl text-[var(--text-primary)]">
            مؤشرات سريعة
          </h2>
          <span className="eyebrow">05 / counters</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((s, i) => {
            const Icon = s.icon;
            const delayClass = i === 0 ? "delay-75" : i === 1 ? "delay-100" : i === 2 ? "delay-150" : i === 3 ? "delay-200" : "delay-300";
            const inner = (
              <div className={`lift group relative h-full rounded-2xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] p-6 hover:border-primary-500/40 rise-in ${delayClass}`}>
                <div className="flex items-start justify-between mb-8">
                  <p className="eyebrow">{s.label}</p>
                  <Icon className="h-4 w-4 text-[var(--text-faint)] group-hover:text-primary-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
                </div>
                <p className="numeric text-5xl text-[var(--text-primary)]">
                  {s.value}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)] font-display">
                    {s.hint}
                  </span>
                  {s.href && (
                    <ArrowUpLeft className="h-3.5 w-3.5 text-[var(--text-faint)] group-hover:text-primary-600 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  )}
                </div>
                <span className="absolute top-3 end-3 font-display text-[10px] tracking-[0.2em] text-[var(--text-faint)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            );
            return s.href ? (
              <Link key={s.label} href={s.href} className="block h-full">
                {inner}
              </Link>
            ) : (
              <div key={s.label} className="h-full">{inner}</div>
            );
          })}
        </div>
      </section>

      {/* ── Low stock ledger ─────────────────────────────────── */}
      {lowStock && lowStock.length > 0 && (
        <section
          className="rise-in rounded-3xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] p-8 delay-200"
        >
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-display text-xl text-[var(--text-primary)]">
              مكونات تحتاج إعادة تموين
            </h2>
            <Link
              href="/admin/ingredients"
              className="text-xs eyebrow text-primary-600 hover:text-primary-700 transition-colors"
            >
              عرض الكل ←
            </Link>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-6">
            مرتّبة حسب الأولوية. النفاد أحمر، الانخفاض كهرماني.
          </p>

          <ul className="space-y-px">
            {lowStock.slice(0, 8).map((row, idx) => {
              const itemDelay = idx * 40;
              return (
                <li
                  key={row.id}
                  style={{ animationDelay: `${itemDelay}ms` }}
                  className="rise-in grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3 border-t border-dashed border-[var(--surface-border-soft)] first:border-t-0 hover:bg-[var(--surface-canvas)]/30 px-2 rounded-lg transition-colors duration-200"
                >
                  <span className="font-serif numeric text-sm text-[var(--text-faint)] w-8">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[var(--text-primary)] font-display text-sm">
                    {row.name_ar}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-300 ${
                      row.alert_level === "out_of_stock"
                        ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                    {row.alert_level === "out_of_stock" ? "نفد" : "منخفض"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function KpiMini({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border-t border-dashed border-[var(--surface-border-soft)] pt-2.5 min-w-[70px]">
      <p className="eyebrow mb-1.5">{label}</p>
      <p
        className={`numeric text-2xl font-serif leading-none ${accent ? "text-accent-600 font-bold animate-pulse" : "text-[var(--text-primary)]"}`}
      >
        {value}
      </p>
    </div>
  );
}
