"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  listAllOrders,
  updateOrderStatusAdmin,
} from "@/lib/actions/admin";
import type { Order, OrderStatus } from "@/lib/actions/cashier";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Wifi,
  ShoppingBag,
  Utensils,
  Bike,
  Truck,
  Loader2,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "قيد الانتظار",
  on_delivery: "في الطريق",
  complete: "مكتمل",
  cancelled: "ملغي",
};

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "on_delivery",
  "complete",
  "cancelled",
];

type FilterStatus = "all" | OrderStatus;
type FilterType = "all" | Order["type"];

const STATUS_FILTERS: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "pending", label: "انتظار" },
  { key: "on_delivery", label: "في الطريق" },
  { key: "complete", label: "مكتمل" },
  { key: "cancelled", label: "ملغي" },
];

const TYPE_FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "كل الأنواع" },
  { key: "dine-in", label: "داخل المطعم" },
  { key: "takeaway", label: "تيك أواي" },
  { key: "delivery", label: "توصيل" },
];

function statusChipClass(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    case "on_delivery":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "complete":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  }
}

function statusCardBorder(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "border-s-amber-400";
    case "on_delivery":
      return "border-s-blue-400";
    case "complete":
      return "border-s-green-400";
    case "cancelled":
      return "border-s-red-400";
  }
}

function statusIcon(status: OrderStatus) {
  switch (status) {
    case "pending":
      return <Clock className="h-3 w-3" />;
    case "on_delivery":
      return <Truck className="h-3 w-3" />;
    case "complete":
      return <CheckCircle className="h-3 w-3" />;
    case "cancelled":
      return <XCircle className="h-3 w-3" />;
  }
}

function typeIcon(type: Order["type"]) {
  switch (type) {
    case "dine-in":
      return <Utensils className="h-3.5 w-3.5" />;
    case "takeaway":
      return <ShoppingBag className="h-3.5 w-3.5" />;
    case "delivery":
      return <Bike className="h-3.5 w-3.5" />;
  }
}

function typeLabel(type: Order["type"]) {
  switch (type) {
    case "dine-in":
      return "داخل المطعم";
    case "takeaway":
      return "تيك أواي";
    case "delivery":
      return "توصيل";
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

function formatOrderDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatClock(d: Date) {
  return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

function shortId(id: string) {
  return id.slice(-4).toUpperCase();
}

function OrderCard({
  order,
  onTransition,
}: {
  order: Order;
  onTransition: (next: OrderStatus) => Promise<{ error?: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const [cardError, setCardError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const prevStatus = useRef(order.status);

  useEffect(() => {
    if (prevStatus.current !== order.status) {
      prevStatus.current = order.status;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [order.status]);

  function handleSelect(next: OrderStatus) {
    if (next === order.status) return;
    if (
      next === "cancelled" &&
      !window.confirm("هل تريد إلغاء هذا الطلب؟")
    )
      return;
    setCardError(null);
    startTransition(async () => {
      const res = await onTransition(next);
      if (res.error) setCardError(res.error);
    });
  }

  return (
    <div
      className={`bg-[var(--surface-card)] rounded-2xl border border-[var(--surface-border-soft)] border-s-4 ${statusCardBorder(order.status)} flex flex-col gap-3 p-4 transition-all duration-500 ${
        flash
          ? "ring-2 ring-primary-400 ring-offset-1 ring-offset-[var(--surface-bg)]"
          : ""
      } ${isPending ? "opacity-70" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-serif text-base font-semibold text-[var(--text-primary)]">
            #{shortId(order.id)}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusChipClass(order.status)}`}
          >
            {statusIcon(order.status)}
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
        <div className="flex flex-col items-end gap-0.5 text-xs text-[var(--text-muted)] shrink-0">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(order.created_at)}
          </span>
          <span className="text-[10px] text-[var(--text-faint)]">
            {formatOrderDate(order.created_at)}
          </span>
        </div>
      </div>

      {/* Items */}
      <ul className="space-y-0.5">
        {order.items.map((item, idx) => (
          <li
            key={idx}
            className="flex justify-between text-sm text-[var(--text-secondary)]"
          >
            <span>
              {item.quantity}× {item.name_ar}
              {item.notes && (
                <span className="text-[var(--text-muted)] text-xs ms-1">
                  ({item.notes})
                </span>
              )}
            </span>
            <span className="text-[var(--text-muted)] font-serif">
              {(item.unit_price * item.quantity).toLocaleString("ar-EG")} ج
            </span>
          </li>
        ))}
      </ul>

      <div className="h-px bg-[var(--surface-border-soft)]" />

      {/* Customer + total */}
      <div className="flex items-end justify-between gap-2">
        <div className="text-xs text-[var(--text-muted)] space-y-0.5">
          {order.customer_name && (
            <p>
              {order.customer_name}
              {order.customer_phone && ` · ${order.customer_phone}`}
            </p>
          )}
          {order.owner_name && <p>{order.owner_name}</p>}
          {order.delivery_address && (
            <p className="text-[var(--text-faint)]">{order.delivery_address}</p>
          )}
          {order.notes && <p className="italic">&quot;{order.notes}&quot;</p>}
        </div>
        <p className="font-serif text-lg font-semibold text-[var(--text-primary)] shrink-0">
          {order.total_price.toLocaleString("ar-EG")} ج
        </p>
      </div>

      {/* Per-card error */}
      {cardError && (
        <div className="flex items-start justify-between gap-2 rounded-xl border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30 px-3 py-2">
          <p className="flex items-center gap-1.5 text-xs text-red-700 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {cardError}
          </p>
          <button
            onClick={() => setCardError(null)}
            className="text-red-500 hover:text-red-700"
            aria-label="إغلاق"
          >
            <XCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Status selector — admin can pick any status */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-1.5">
          <p className="eyebrow">تغيير الحالة</p>
          {isPending && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
              <Loader2 className="h-3 w-3 animate-spin" />
              جاري التحديث…
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {ALL_STATUSES.map((s) => {
            const active = s === order.status;
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleSelect(s)}
                disabled={isPending || active}
                className={`inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? `${statusChipClass(s)} cursor-default`
                    : "border border-[var(--surface-border)] text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)] disabled:opacity-50"
                }`}
              >
                {statusIcon(s)}
                {STATUS_LABELS[s]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPanel({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, startRefreshTransition] = useTransition();

  useEffect(() => {
    setOrders(initialOrders);
    setLastUpdated(new Date());
  }, [initialOrders]);

  async function refetch(): Promise<Order[] | null> {
    try {
      const fresh = await listAllOrders();
      setOrders(fresh);
      setLastUpdated(new Date());
      setError(null);
      return fresh;
    } catch (err) {
      console.error("[AdminOrdersPanel] refetch", err);
      setError("تعذّر تحميل الطلبات. تحقق من الاتصال بالإنترنت.");
      return null;
    }
  }

  function refresh() {
    startRefreshTransition(async () => {
      await refetch();
    });
  }

  async function handleTransition(
    orderId: string,
    next: OrderStatus,
  ): Promise<{ error?: string }> {
    const snapshot = orders;
    setOrders((curr) =>
      curr.map((o) => (o.id === orderId ? { ...o, status: next } : o)),
    );
    const res = await updateOrderStatusAdmin(orderId, next);
    if (res.error) {
      setOrders(snapshot);
      return { error: res.error };
    }
    await refetch();
    return {};
  }

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          refetch();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") refetch();
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("[AdminOrdersPanel] realtime status:", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (typeFilter !== "all" && o.type !== typeFilter) return false;
    return true;
  });

  const countByStatus = (s: FilterStatus) =>
    s === "all" ? orders.length : orders.filter((o) => o.status === s).length;

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <p className="eyebrow mb-1">إدارة الطلبات</p>
            <h1 className="font-display text-3xl text-[var(--text-primary)]">
              كل الطلبات
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>آخر تحديث: {formatClock(lastUpdated)}</span>
            <button
              onClick={refresh}
              disabled={isRefreshing}
              className="ms-1 inline-flex items-center gap-1 rounded-lg border border-[var(--surface-border)] px-2 py-1 hover:bg-[var(--surface-input)] disabled:opacity-50"
              aria-label="تحديث"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5 flex-wrap mb-2">
          {STATUS_FILTERS.map((f) => {
            const count = countByStatus(f.key);
            const active = statusFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-500 text-white"
                    : "bg-[var(--surface-input)] text-[var(--text-secondary)] hover:bg-[var(--surface-border)] hover:text-[var(--text-primary)]"
                }`}
              >
                {f.label}
                {count > 0 && (
                  <span
                    className={`text-xs rounded-full px-1.5 py-0.5 leading-none ${active ? "bg-white/20" : "bg-[var(--surface-border)]"}`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Type filter */}
        <div className="flex gap-1.5 flex-wrap">
          {TYPE_FILTERS.map((f) => {
            const active = typeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[var(--surface-ink)] text-[var(--surface-bg)]"
                    : "border border-[var(--surface-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-input)]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30 px-4 py-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-red-300 dark:border-red-700 px-3 py-1.5 text-xs text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            إعادة المحاولة
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
          <CheckCircle2 className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">لا توجد طلبات في هذا التصنيف</p>
        </div>
      ) : (
        <div
          aria-live="polite"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onTransition={(next) => handleTransition(order.id, next)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
