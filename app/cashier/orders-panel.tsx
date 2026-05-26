"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  updateOrderStatus,
  type Order,
  type OrderStatus,
  type LowStockItem,
} from "@/lib/actions/cashier";
import {
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChefHat,
  Package,
  Wifi,
  ShoppingBag,
  Utensils,
  Bike,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "قيد الانتظار",
  preparing: "قيد التحضير",
  ready: "جاهز",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const STATUS_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "preparing",
  preparing: "ready",
  ready: "completed",
};

const STATUS_NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: "ابدأ التحضير",
  preparing: "جاهز للاستلام",
  ready: "تم التسليم",
};

type FilterStatus = "all" | OrderStatus;

const FILTERS: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "pending", label: "انتظار" },
  { key: "preparing", label: "تحضير" },
  { key: "ready", label: "جاهز" },
  { key: "completed", label: "مكتمل" },
  { key: "cancelled", label: "ملغي" },
];

function statusChipClass(status: OrderStatus) {
  switch (status) {
    case "pending":   return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    case "preparing": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "ready":     return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "completed": return "bg-[var(--surface-border)] text-[var(--text-muted)]";
    case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  }
}

function statusCardBorder(status: OrderStatus) {
  switch (status) {
    case "pending":   return "border-s-amber-400";
    case "preparing": return "border-s-blue-400";
    case "ready":     return "border-s-green-400";
    case "completed": return "border-s-[var(--surface-border)]";
    case "cancelled": return "border-s-red-400";
  }
}

function typeIcon(type: Order["type"]) {
  switch (type) {
    case "dine-in":  return <Utensils className="h-3.5 w-3.5" />;
    case "takeaway": return <ShoppingBag className="h-3.5 w-3.5" />;
    case "delivery": return <Bike className="h-3.5 w-3.5" />;
  }
}

function typeLabel(type: Order["type"]) {
  switch (type) {
    case "dine-in":  return "داخل المطعم";
    case "takeaway": return "تيك أواي";
    case "delivery": return "توصيل";
  }
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "الآن";
  if (diffMin < 60) return `منذ ${diffMin} د`;
  return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

function shortId(id: string) {
  return id.slice(-4).toUpperCase();
}

// ── Low stock banner ────────────────────────────────────────────────────────

function LowStockBanner({ items }: { items: LowStockItem[] }) {
  if (!items.length) return null;
  const outItems = items.filter((i) => i.alert_level === "out_of_stock");
  const lowItems = items.filter((i) => i.alert_level === "low");

  return (
    <div className="mb-5 space-y-2">
      {outItems.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30 px-4 py-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-800 dark:text-red-300 mb-0.5">نفاد مخزون</p>
            <p className="text-red-700 dark:text-red-400">
              {outItems.map((i) => i.name_ar).join(" • ")}
            </p>
          </div>
        </div>
      )}
      {lowItems.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800 dark:text-amber-300 mb-0.5">مخزون منخفض</p>
            <p className="text-amber-700 dark:text-amber-400">
              {lowItems.map((i) => `${i.name_ar} (${i.stock_quantity} ${i.unit})`).join(" • ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Order card ──────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [isPending, startTransition] = useTransition();
  const nextStatus = STATUS_NEXT[order.status];
  const isTerminal = order.status === "completed" || order.status === "cancelled";

  function handleAdvance() {
    if (!nextStatus) return;
    startTransition(() => updateOrderStatus(order.id, nextStatus));
  }

  function handleCancel() {
    startTransition(() => updateOrderStatus(order.id, "cancelled"));
  }

  return (
    <div
      className={`bg-[var(--surface-card)] rounded-2xl border border-[var(--surface-border-soft)] border-s-4 ${statusCardBorder(order.status)} flex flex-col gap-3 p-4 transition-opacity ${isPending ? "opacity-60" : ""}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-serif text-base font-semibold text-[var(--text-primary)]">
            #{shortId(order.id)}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusChipClass(order.status)}`}>
            {STATUS_LABELS[order.status]}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-[var(--surface-input)] text-[var(--text-secondary)]">
            {typeIcon(order.type)}
            {typeLabel(order.type)}
          </span>
          {order.source === "online" && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <Wifi className="h-3 w-3" />
              أونلاين
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] shrink-0">
          <Clock className="h-3.5 w-3.5" />
          {formatTime(order.created_at)}
        </span>
      </div>

      {/* Items */}
      <ul className="space-y-0.5">
        {order.items.map((item, idx) => (
          <li key={idx} className="flex justify-between text-sm text-[var(--text-secondary)]">
            <span>
              {item.quantity}× {item.name_ar}
              {item.notes && (
                <span className="text-[var(--text-muted)] text-xs me-1">({item.notes})</span>
              )}
            </span>
            <span className="text-[var(--text-muted)] font-serif">
              {(item.unit_price * item.quantity).toLocaleString("ar-EG")} ج
            </span>
          </li>
        ))}
      </ul>

      {/* Divider */}
      <div className="h-px bg-[var(--surface-border-soft)]" />

      {/* Customer + total */}
      <div className="flex items-end justify-between gap-2">
        <div className="text-xs text-[var(--text-muted)] space-y-0.5">
          {order.customer_name && <p>{order.customer_name}{order.customer_phone && ` · ${order.customer_phone}`}</p>}
          {order.owner_name && <p>{order.owner_name}</p>}
          {order.delivery_address && <p className="text-[var(--text-faint)]">{order.delivery_address}</p>}
          {order.notes && <p className="italic">"{order.notes}"</p>}
        </div>
        <p className="font-serif text-lg font-semibold text-[var(--text-primary)] shrink-0">
          {order.total_price.toLocaleString("ar-EG")} ج
        </p>
      </div>

      {/* Actions */}
      {!isTerminal && (
        <div className="flex gap-2 pt-1">
          {nextStatus && (
            <button
              onClick={handleAdvance}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium py-2 transition-colors disabled:opacity-50"
            >
              {nextStatus === "preparing" && <ChefHat className="h-4 w-4" />}
              {nextStatus === "ready"     && <CheckCircle2 className="h-4 w-4" />}
              {nextStatus === "completed" && <Package className="h-4 w-4" />}
              {STATUS_NEXT_LABEL[order.status]}
            </button>
          )}
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--surface-border)] hover:border-red-400 hover:text-red-600 text-[var(--text-muted)] text-sm py-2 px-3 transition-colors disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            <span className="hidden sm:inline">إلغاء</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main panel ──────────────────────────────────────────────────────────────

export function OrdersPanel({
  initialOrders,
  lowStock,
}: {
  initialOrders: Order[];
  lowStock: LowStockItem[];
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          // Refetch on any orders change — simple and safe
          fetch("/api/orders-refresh")
            .then((r) => r.json())
            .then((data) => {
              if (Array.isArray(data)) setOrders(data as Order[]);
            })
            .catch(() => {/* ignore network errors */});
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const countByStatus = (s: FilterStatus) =>
    s === "all" ? orders.length : orders.filter((o) => o.status === s).length;

  return (
    <div>
      <LowStockBanner items={lowStock} />

      {/* Page title + filter tabs */}
      <div className="mb-5">
        <h1 className="font-display text-2xl text-[var(--text-primary)] mb-4">الطلبات</h1>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => {
            const count = countByStatus(f.key);
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-500 text-white"
                    : "bg-[var(--surface-input)] text-[var(--text-secondary)] hover:bg-[var(--surface-border)] hover:text-[var(--text-primary)]"
                }`}
              >
                {f.label}
                {count > 0 && (
                  <span className={`text-xs rounded-full px-1.5 py-0.5 leading-none ${active ? "bg-white/20" : "bg-[var(--surface-border)]"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
          <CheckCircle2 className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">لا توجد طلبات في هذا التصنيف</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
