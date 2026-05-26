"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  listDeliveryOrders,
  updateDeliveryOrderStatus,
  type DeliveryOrder,
  type DeliveryStatus,
} from "@/lib/actions/delivery";
import {
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Package,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending:     "قيد الانتظار",
  on_delivery: "في الطريق",
  complete:    "مكتمل",
  cancelled:   "ملغي",
};

type FilterStatus = "all" | DeliveryStatus;

const FILTERS: { key: FilterStatus; label: string }[] = [
  { key: "all",         label: "الكل" },
  { key: "pending",     label: "قيد الانتظار" },
  { key: "on_delivery", label: "في الطريق" },
  { key: "complete",    label: "مكتمل" },
  { key: "cancelled",   label: "ملغي" },
];

const STATUS_ORDER: DeliveryStatus[] = [
  "pending",
  "on_delivery",
  "complete",
  "cancelled",
];

function sortOrders(orders: DeliveryOrder[]): DeliveryOrder[] {
  return [...orders].sort((a, b) => {
    const aIdx = STATUS_ORDER.indexOf(a.status);
    const bIdx = STATUS_ORDER.indexOf(b.status);
    if (aIdx !== bIdx) return aIdx - bIdx;
    // Within same group: newest first
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function statusChipClass(status: DeliveryStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    case "on_delivery":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "complete":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "cancelled":
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400";
  }
}

function statusChipIcon(status: DeliveryStatus) {
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

function statusCardBorder(status: DeliveryStatus) {
  switch (status) {
    case "pending":
      return "border-s-amber-400";
    case "on_delivery":
      return "border-s-blue-400";
    case "complete":
      return "border-s-green-400";
    case "cancelled":
      return "border-s-zinc-300 dark:border-s-zinc-600";
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

// ── Order card ──────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: DeliveryOrder }) {
  const [isPending, startTransition] = useTransition();
  const isTerminal =
    order.status === "complete" || order.status === "cancelled";

  function handleAdvance() {
    const next: DeliveryStatus | null =
      order.status === "pending"
        ? "on_delivery"
        : order.status === "on_delivery"
          ? "complete"
          : null;
    if (!next) return;
    startTransition(async () => {
      await updateDeliveryOrderStatus(order.id, next);
    });
  }

  function handleCancel() {
    if (
      !window.confirm(
        "هل أنت متأكد من إلغاء هذا الطلب؟\nلا يمكن التراجع عن هذه العملية.",
      )
    )
      return;
    startTransition(async () => {
      await updateDeliveryOrderStatus(order.id, "cancelled");
    });
  }

  const nextLabel =
    order.status === "pending"
      ? "ابدأ التوصيل"
      : order.status === "on_delivery"
        ? "تم التسليم"
        : null;

  const NextIcon =
    order.status === "pending"
      ? Truck
      : order.status === "on_delivery"
        ? CheckCircle
        : null;

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
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusChipClass(order.status)}`}
          >
            {statusChipIcon(order.status)}
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] shrink-0">
          <Clock className="h-3.5 w-3.5" />
          {formatTime(order.created_at)}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--surface-border-soft)]" />

      {/* Items */}
      <div>
        <p className="text-xs text-[var(--text-muted)] mb-1 flex items-center gap-1">
          <Package className="h-3.5 w-3.5" />
          الأصناف
        </p>
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
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--surface-border-soft)]" />

      {/* Customer info */}
      <div className="space-y-0.5 text-xs text-[var(--text-muted)]">
        {(order.customer_name || order.owner_name) && (
          <p className="font-medium text-[var(--text-secondary)]">
            {order.customer_name ?? order.owner_name}
            {order.customer_phone && (
              <span className="font-normal ms-2 text-[var(--text-muted)]">
                📞 {order.customer_phone}
              </span>
            )}
          </p>
        )}
        {order.delivery_address && (
          <p className="text-[var(--text-faint)]">{order.delivery_address}</p>
        )}
        {order.notes && (
          <p className="italic text-[var(--text-faint)]">
            &ldquo;{order.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-end">
        <p className="font-serif text-lg font-semibold text-[var(--text-primary)]">
          {order.total_price.toLocaleString("ar-EG")} ج
        </p>
      </div>

      {/* Actions — only for non-terminal orders */}
      {!isTerminal && (
        <div className="flex gap-2 pt-1">
          {nextLabel && NextIcon && (
            <button
              onClick={handleAdvance}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium py-2 transition-colors disabled:opacity-50"
            >
              <NextIcon className="h-4 w-4" />
              {nextLabel}
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

export default function DeliveryPanel({
  initialOrders,
}: {
  initialOrders: DeliveryOrder[];
}) {
  const [orders, setOrders] = useState<DeliveryOrder[]>(initialOrders);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, startRefreshTransition] = useTransition();

  function refresh() {
    setError(null);
    startRefreshTransition(async () => {
      try {
        const fresh = await listDeliveryOrders();
        setOrders(fresh);
      } catch (err) {
        console.error("[DeliveryPanel] refresh", err);
        setError("تعذّر تحميل الطلبات. تحقق من الاتصال بالإنترنت.");
      }
    });
  }

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("delivery-orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: "type=eq.delivery",
        },
        () => {
          // Refetch on any delivery order change
          listDeliveryOrders()
            .then((fresh) => setOrders(fresh))
            .catch((err) => {
              console.error("[DeliveryPanel] realtime refresh", err);
            });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Apply filter
  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  // Sort: pending/on_delivery first, then complete/cancelled — by created_at desc within groups
  const sorted = sortOrders(filtered);

  const countByStatus = (s: FilterStatus) =>
    s === "all" ? orders.length : orders.filter((o) => o.status === s).length;

  return (
    <div>
      {/* Page title + filter tabs */}
      <div className="mb-5">
        <h1 className="font-display text-2xl text-[var(--text-primary)] mb-4">
          طلبات التوصيل
        </h1>
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
      </div>

      {/* Error / offline state */}
      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30 px-4 py-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-red-300 dark:border-red-700 px-3 py-1.5 text-xs text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Orders list */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)]">
          <Truck className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">
            {filter === "all"
              ? "لا توجد طلبات توصيل حالياً"
              : `لا توجد طلبات في هذا التصنيف`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
