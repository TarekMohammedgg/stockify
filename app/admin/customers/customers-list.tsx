"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  Search,
  Phone,
  Mail,
  MapPin,
  Heart,
  Clock,
  ShoppingBag,
  Wallet,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { CustomerRow } from "@/lib/actions/admin";

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 1) {
    const hours = Math.floor(diffMs / 3_600_000);
    if (hours < 1) return "الآن";
    return `منذ ${hours} س`;
  }
  if (days === 1) return "أمس";
  if (days < 30) return `منذ ${days} يوم`;
  const months = Math.floor(days / 30);
  if (months < 12) return `منذ ${months} شهر`;
  return d.toLocaleDateString("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: "قيد الانتظار",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  on_delivery: {
    label: "قيد التوصيل",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  complete: {
    label: "مكتمل",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  cancelled: {
    label: "ملغي",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-[var(--text-faint)]">—</span>;
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <span className="text-[var(--text-faint)]">{status}</span>;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CustomersList({ initial }: { initial: CustomerRow[] }) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initial;
    return initial.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q),
    );
  }, [initial, query]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بالاسم أو الهاتف أو البريد"
          className="w-full rounded-xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] ps-10 pe-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
        />
      </div>

      <div className="rounded-3xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-[var(--surface-border-soft)] bg-[var(--surface-canvas)]/60">
          <span className="eyebrow w-7">#</span>
          <span className="eyebrow">العميل</span>
          <span className="eyebrow">العنوان</span>
          <span className="eyebrow">الطلبات</span>
          <span className="eyebrow">آخر طلب</span>
          <span className="eyebrow">إجمالي الإنفاق</span>
          <span className="eyebrow w-6" />
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
            لا يوجد عملاء يطابقون البحث
          </div>
        ) : (
          <ul className="divide-y divide-dashed divide-[var(--surface-border-soft)]">
            {filtered.map((c, idx) => {
              const expanded = expandedId === c.id;
              const addressDisplay =
                c.address ?? c.insights?.default_address ?? null;
              return (
                <li key={c.id} className="group">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : c.id)}
                    className="w-full text-start grid md:grid-cols-[auto_2fr_1.5fr_1fr_1fr_1fr_auto] grid-cols-2 items-center gap-4 px-6 py-4 transition-colors hover:bg-[var(--surface-canvas)]/40"
                  >
                    <span className="hidden md:block font-serif numeric text-xs text-[var(--text-faint)] w-7">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 col-span-2 md:col-span-1">
                      <p className="font-display text-sm text-[var(--text-primary)] truncate">
                        {c.name}
                      </p>
                      <p
                        className="text-xs text-[var(--text-muted)] truncate"
                        dir="ltr"
                      >
                        {c.phone ?? c.email ?? "—"}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] truncate">
                      {addressDisplay ?? (
                        <span className="text-[var(--text-faint)]">—</span>
                      )}
                    </span>
                    <span className="text-sm">
                      <span className="numeric text-[var(--text-primary)]">
                        {c.order_count}
                      </span>
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-xs text-[var(--text-secondary)]">
                        {formatRelative(c.last_order_at)}
                      </span>
                      <StatusBadge status={c.last_order_status} />
                    </span>
                    <span className="font-serif numeric text-sm text-[var(--text-primary)]">
                      {c.total_spend.toLocaleString("ar-EG")}{" "}
                      <span className="text-[var(--text-muted)] text-[10px]">
                        ج
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {expanded && (
                    <div className="px-6 pb-6 pt-1 grid gap-4 md:grid-cols-3 bg-[var(--surface-canvas)]/30">
                      {/* Profile */}
                      <div className="rounded-2xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] p-4">
                        <p className="eyebrow mb-3">الملف الشخصي</p>
                        <dl className="space-y-2 text-xs">
                          <Row
                            icon={Phone}
                            label="الهاتف"
                            value={c.phone}
                            dir="ltr"
                          />
                          <Row
                            icon={Mail}
                            label="البريد"
                            value={c.email}
                            dir="ltr"
                          />
                          <Row
                            icon={MapPin}
                            label="العنوان"
                            value={c.address}
                          />
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider">
                              {c.auth_provider}
                            </span>
                            {c.is_active ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[10px]">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                فعّال
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 px-2 py-0.5 text-[10px]">
                                <XCircle className="h-2.5 w-2.5" />
                                موقوف
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)] pt-1">
                            مسجّل منذ {formatDate(c.created_at)}
                          </p>
                        </dl>
                      </div>

                      {/* Insights */}
                      <div className="rounded-2xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] p-4">
                        <p className="eyebrow mb-3">رؤى الشات بوت</p>
                        {c.insights ? (
                          <div className="space-y-2 text-xs">
                            <Row
                              icon={MapPin}
                              label="عنوان افتراضي"
                              value={c.insights.default_address}
                            />
                            <Row
                              icon={Clock}
                              label="آخر زيارة"
                              value={formatRelative(c.insights.last_seen)}
                            />
                            <div>
                              <p className="flex items-center gap-1.5 text-[var(--text-muted)] mb-1.5">
                                <Heart className="h-3 w-3" />
                                الأصناف المفضّلة
                              </p>
                              {c.insights.favourite_item_names.length === 0 ? (
                                <p className="text-[var(--text-faint)] text-[11px] ps-4">
                                  لا توجد
                                </p>
                              ) : (
                                <ul className="flex flex-wrap gap-1 ps-4">
                                  {c.insights.favourite_item_names.map(
                                    (n, i) => (
                                      <li
                                        key={i}
                                        className="inline-flex items-center rounded-full bg-primary-500/10 text-primary-700 dark:text-primary-300 px-2 py-0.5 text-[11px]"
                                      >
                                        {n}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-[var(--text-faint)]">
                            لم يستخدم العميل الشات بوت بعد
                          </p>
                        )}
                      </div>

                      {/* Order summary */}
                      <div className="rounded-2xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] p-4">
                        <p className="eyebrow mb-3">ملخص الطلبات</p>
                        <div className="space-y-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                              <ShoppingBag className="h-3 w-3" />
                              إجمالي الطلبات
                            </span>
                            <span className="font-serif numeric text-[var(--text-primary)]">
                              {c.order_count}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                              <Clock className="h-3 w-3" />
                              آخر طلب
                            </span>
                            <span className="flex flex-col items-end gap-1">
                              <span className="text-[var(--text-secondary)]">
                                {formatRelative(c.last_order_at)}
                              </span>
                              <StatusBadge status={c.last_order_status} />
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-t border-dashed border-[var(--surface-border-soft)] pt-3">
                            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                              <Wallet className="h-3 w-3" />
                              إجمالي الإنفاق
                            </span>
                            <span className="font-serif numeric text-base text-[var(--text-primary)]">
                              {c.total_spend.toLocaleString("ar-EG")}{" "}
                              <span className="text-[10px] text-[var(--text-muted)]">
                                ج
                              </span>
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--text-faint)] pt-1">
                            الإنفاق من الطلبات المكتملة فقط
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  dir,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-3 w-3 text-[var(--text-muted)] mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider">
          {label}
        </p>
        <p
          className="text-[var(--text-secondary)] truncate"
          dir={dir}
        >
          {value ?? <span className="text-[var(--text-faint)]">—</span>}
        </p>
      </div>
    </div>
  );
}
