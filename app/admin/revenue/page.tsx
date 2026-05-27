import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  CheckCircle,
  Wallet,
  Receipt,
} from "lucide-react";
import { cairoStartOfDay, cairoStartOfMonth } from "@/lib/time";

export const dynamic = "force-dynamic";

type RevenueOrder = {
  id: string;
  total_price: number;
  created_at: string;
  type: "dine-in" | "takeaway" | "delivery";
  source: "online" | "onsite";
};

function shortId(id: string) {
  return id.slice(-4).toUpperCase();
}

function typeLabel(t: RevenueOrder["type"]) {
  switch (t) {
    case "dine-in":
      return "داخل المطعم";
    case "takeaway":
      return "تيك أواي";
    case "delivery":
      return "توصيل";
  }
}

function formatCairoTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Cairo",
  });
}

function formatCairoDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Cairo",
  });
}

export default async function AdminRevenuePage() {
  const supabase = await createClient();

  const now = new Date();
  const sinceDay = cairoStartOfDay(now);
  const sinceMonth = cairoStartOfMonth(now);

  const [todayRes, monthRes, allRes] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total_price, created_at, type, source")
      .eq("status", "complete")
      .gte("created_at", sinceDay.toISOString())
      .order("created_at", { ascending: true }),
    supabase
      .from("orders")
      .select("id, total_price, created_at, type, source")
      .eq("status", "complete")
      .gte("created_at", sinceMonth.toISOString())
      .order("created_at", { ascending: true }),
    supabase
      .from("orders")
      .select("id, total_price, created_at, type, source")
      .eq("status", "complete")
      .order("created_at", { ascending: false }),
  ]);

  const today = ((todayRes.data ?? []) as RevenueOrder[]).map((o) => ({
    ...o,
    total_price: Number(o.total_price),
  }));
  const month = ((monthRes.data ?? []) as RevenueOrder[]).map((o) => ({
    ...o,
    total_price: Number(o.total_price),
  }));
  const all = ((allRes.data ?? []) as RevenueOrder[]).map((o) => ({
    ...o,
    total_price: Number(o.total_price),
  }));

  const todayTotal = today.reduce((s, o) => s + o.total_price, 0);
  const monthTotal = month.reduce((s, o) => s + o.total_price, 0);
  const allTotal = all.reduce((s, o) => s + o.total_price, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">
      <header className="rise-in flex flex-wrap items-end justify-between gap-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs eyebrow text-[var(--text-muted)] hover:text-primary-600 transition-colors mb-3"
          >
            <ArrowRight className="h-3 w-3 rotate-180" />
            العودة للوحة
          </Link>
          <p className="eyebrow mb-2">احتساب الإيرادات</p>
          <h1 className="font-display text-4xl md:text-5xl text-[var(--text-primary)] leading-tight">
            من أين جاء الرقم؟
          </h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
            تُحتسب الإيرادات من الطلبات بحالة{" "}
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-xs">
              <CheckCircle className="h-3 w-3" />
              مكتمل
            </span>{" "}
            فقط، وحسب توقيت القاهرة (UTC+3).
          </p>
        </div>
      </header>

      {/* Today breakdown */}
      <RevenueSection
        title="إيرادات اليوم"
        subtitle={formatCairoDate(now.toISOString())}
        orders={today}
        total={todayTotal}
        emptyMsg="لا توجد طلبات مكتملة اليوم"
      />

      {/* Month breakdown */}
      <RevenueSection
        title="إيرادات هذا الشهر"
        subtitle={`منذ ${formatCairoDate(sinceMonth.toISOString())}`}
        orders={month}
        total={monthTotal}
        emptyMsg="لا توجد طلبات مكتملة هذا الشهر"
        collapsedAfter={6}
      />

      {/* All-time */}
      <RevenueSection
        title="إجمالي الإيرادات (كل الوقت)"
        subtitle={`${all.length} طلب مكتمل`}
        orders={all}
        total={allTotal}
        emptyMsg="لا توجد طلبات مكتملة بعد"
        collapsedAfter={6}
        showDate
      />
    </div>
  );
}

function RevenueSection({
  title,
  subtitle,
  orders,
  total,
  emptyMsg,
  collapsedAfter,
  showDate = false,
}: {
  title: string;
  subtitle: string;
  orders: RevenueOrder[];
  total: number;
  emptyMsg: string;
  collapsedAfter?: number;
  showDate?: boolean;
}) {
  const display =
    collapsedAfter && orders.length > collapsedAfter
      ? orders.slice(0, collapsedAfter)
      : orders;
  const hiddenCount = orders.length - display.length;

  return (
    <section className="rise-in rounded-3xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-3 px-6 py-5 border-b border-[var(--surface-border-soft)] bg-[var(--surface-canvas)]/40">
        <div>
          <p className="eyebrow mb-1">{title}</p>
          <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
        </div>
        <p className="font-serif text-3xl numeric text-[var(--text-primary)] leading-none">
          {total.toLocaleString("en-EG")}{" "}
          <span className="text-base text-primary-600 font-display align-middle">
            ج.م
          </span>
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-[var(--text-muted)]">
          {emptyMsg}
        </div>
      ) : (
        <>
          <ul className="divide-y divide-dashed divide-[var(--surface-border-soft)]">
            {display.map((o, idx) => (
              <li
                key={o.id}
                className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-6 py-3"
              >
                <span className="font-serif numeric text-xs text-[var(--text-faint)] w-7">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="font-serif text-sm text-[var(--text-primary)]">
                    #{shortId(o.id)}{" "}
                    <span className="text-xs text-[var(--text-muted)] font-sans ms-1">
                      · {typeLabel(o.type)}
                    </span>
                  </p>
                  <p className="text-[11px] text-[var(--text-faint)] flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatCairoTime(o.created_at)}
                  </p>
                  <p className="text-[10px] text-[var(--text-faint)] ms-4">
                    {formatCairoDate(o.created_at)}
                  </p>
                </div>
                <span className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider">
                  {o.source === "online" ? "online" : "onsite"}
                </span>
                <span className="font-serif numeric text-sm text-[var(--text-primary)]">
                  + {o.total_price.toLocaleString("en-EG")}{" "}
                  <span className="text-[10px] text-[var(--text-muted)]">
                    ج
                  </span>
                </span>
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <p className="px-6 py-3 text-center text-[11px] text-[var(--text-muted)] bg-[var(--surface-canvas)]/40">
              + {hiddenCount} طلب آخر مضمّن في الإجمالي
            </p>
          )}

          {/* Sum line */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-4 border-t border-[var(--surface-border-soft)] bg-[var(--surface-canvas)]/60">
            <Wallet className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              مجموع {orders.length} طلب
            </span>
            <span className="font-serif numeric text-lg font-semibold text-[var(--text-primary)]">
              = {total.toLocaleString("en-EG")}{" "}
              <span className="text-xs text-primary-600">ج.م</span>
            </span>
          </div>
        </>
      )}

      <div className="px-6 py-3 border-t border-[var(--surface-border-soft)] bg-[var(--surface-canvas)]/30">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs eyebrow text-primary-600 hover:text-primary-700 transition-colors"
        >
          <Receipt className="h-3 w-3" />
          عرض كل الطلبات →
        </Link>
      </div>
    </section>
  );
}
