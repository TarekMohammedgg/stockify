"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Heart,
  Home,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  XCircle,
  ShoppingBag,
  Utensils,
  Bike,
  Clock,
  Truck,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { updateProfile } from "@/lib/actions/profile";
import type { Order, OrderStatus } from "@/lib/actions/cashier";

type Props = {
  profile: { name: string; phone: string; address: string; email: string };
  insights: {
    defaultAddress: string;
    favouriteItems: string[];
    lastSeen: string | null;
  };
  orders: Order[];
};

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "؟";
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatArabicDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
    default:
      return "bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-300";
  }
}

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  on_delivery: "في الطريق",
  complete: "مكتمل",
  completed: "مكتمل", // fallback
  cancelled: "ملغي",
};

function statusIcon(status: string) {
  switch (status) {
    case "pending":
      return <Clock className="h-3 w-3" />;
    case "on_delivery":
      return <Truck className="h-3 w-3" />;
    case "complete":
    case "completed":
      return <CheckCircle className="h-3 w-3" />;
    case "cancelled":
      return <XCircle className="h-3.5 w-3.5" />;
    default:
      return null;
  }
}

function typeIcon(type: "dine-in" | "takeaway" | "delivery") {
  switch (type) {
    case "dine-in":
      return <Utensils className="h-3 w-3" />;
    case "takeaway":
      return <ShoppingBag className="h-3 w-3" />;
    case "delivery":
      return <Bike className="h-3 w-3" />;
  }
}

function typeLabel(type: "dine-in" | "takeaway" | "delivery") {
  switch (type) {
    case "dine-in":
      return "داخل المطعم";
    case "takeaway":
      return "تيك أواي";
    case "delivery":
      return "توصيل";
  }
}

export default function ProfileForm({ profile, insights, orders }: Props) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [status, setStatus] = useState<null | "success" | "error">(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setStatus(null);
    startTransition(async () => {
      const result = await updateProfile({ name, phone, address, defaultAddress: address });
      if (result?.error) {
        setStatus("error");
        setErrorMsg(result.error);
      } else {
        setStatus("success");
      }
    });
  }

  const inputBase =
    "w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-input)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:border-[var(--primary-600)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)]/20";
  const readOnlyInput =
    "w-full rounded-xl border border-[var(--surface-border-soft)] bg-[var(--surface-canvas,var(--surface-bg))] px-4 py-3 text-sm text-[var(--text-muted)] cursor-default select-none";
  const label =
    "block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5";

  return (
    <div
      className="min-h-screen bg-[var(--surface-bg)]"
      dir="rtl"
    >
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">

        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--primary-600)] mb-8 group"
        >
          <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          العودة للقائمة
        </Link>

        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg"
            style={{ background: "var(--primary-600)" }}
          >
            {getInitials(name || profile.name)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {name || "ملفك الشخصي"}
            </h1>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]" dir="ltr">
              {profile.email}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 sm:p-8 shadow-sm">
          <div className="mb-5 flex items-center gap-2 border-b border-[var(--surface-border-soft)] pb-4">
            <User className="h-4 w-4 text-[var(--primary-600)]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              المعلومات الشخصية
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className={label}>
                <span className="flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  الاسم الكامل
                </span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك الكامل"
                className={inputBase}
              />
            </div>

            <div>
              <label className={label}>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  رقم الهاتف
                </span>
              </label>
              <input
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className={inputBase}
              />
            </div>

            <div>
              <label className={label}>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  البريد الإلكتروني
                </span>
              </label>
              <input
                type="email"
                dir="ltr"
                value={profile.email}
                readOnly
                className={readOnlyInput}
              />
              <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--text-faint,var(--text-muted))]">
                <Lock className="h-3 w-3" />
                لا يمكن تعديل البريد الإلكتروني
              </p>
            </div>

            <div>
              <label className={label}>
                <span className="flex items-center gap-1.5">
                  <Home className="h-3 w-3" />
                  عنوان المنزل / التوصيل
                </span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="الشارع، الحي، المدينة"
                className={inputBase}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {status === "success" && (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              تم حفظ التغييرات بنجاح
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              <XCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary-600)] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[var(--primary-700)] active:scale-[0.99] disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>

        {/* Orders History Section */}
        <div className="mt-12">
          <div className="mb-6 flex items-center gap-2 border-b border-[var(--surface-border-soft)] pb-4">
            <ShoppingBag className="h-4 w-4 text-[var(--primary-600)]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              سجل الطلبات
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-12 text-center text-[var(--text-muted)] shadow-sm">
              <ShoppingBag className="h-10 w-10 text-[var(--text-faint)] mb-4 opacity-50" />
              <p className="text-sm font-semibold">لم تقم بإجراء أي طلبات بعد</p>
              <p className="text-xs text-[var(--text-faint)] mt-1">تصفح قائمتنا اللذيذة واطلب الآن!</p>
              <Link
                href="/menu"
                className="mt-4 rounded-xl bg-[var(--primary-600)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[var(--primary-700)] transition-colors"
              >
                عرض المنيو
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const shortId = order.id.slice(-4).toUpperCase();
                const dateStr = formatArabicDate(order.created_at);
                const isExpanded = expandedOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    className="lift rounded-2xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] overflow-hidden shadow-sm transition-all duration-300"
                  >
                    {/* Collapsed Header Bar (Clickable) */}
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="w-full text-start flex items-center justify-between gap-4 p-4 hover:bg-[var(--surface-canvas)]/40 transition-colors focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-input)] text-[var(--text-secondary)]">
                          {typeIcon(order.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-sm font-bold text-[var(--text-primary)]">
                              #{shortId}
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusChipClass(order.status)}`}>
                              {statusIcon(order.status)}
                              {STATUS_LABELS[order.status]}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-faint,var(--text-muted))] mt-0.5">
                            {dateStr}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="text-end">
                          <p className="font-serif text-sm font-semibold text-[var(--text-primary)]">
                            {order.total_price.toLocaleString("ar-EG")} ج
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                            {order.items.length} {order.items.length === 1 ? "صنف" : "أصناف"}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                        )}
                      </div>
                    </button>

                    {/* Expandable Details Area */}
                    {isExpanded && (
                      <div className="border-t border-[var(--surface-border-soft)] bg-[var(--surface-canvas)]/30 p-4 space-y-4">
                        {/* Order Items Table */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                            تفاصيل الطلب
                          </p>
                          <ul className="divide-y divide-dashed divide-[var(--surface-border-soft)]">
                            {order.items.map((item, idx) => (
                              <li
                                key={idx}
                                className="flex justify-between items-start py-2 text-xs text-[var(--text-secondary)]"
                              >
                                <div>
                                  <span className="font-semibold">{item.quantity}×</span> {item.name_ar}
                                  {item.notes && (
                                    <p className="text-[10px] text-[var(--text-faint,var(--text-muted))] mt-0.5">
                                      ملاحظة: {item.notes}
                                    </p>
                                  )}
                                </div>
                                <span className="font-serif text-[var(--text-primary)]">
                                  {(item.unit_price * item.quantity).toLocaleString("ar-EG")} ج
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Extra Meta details */}
                        <div className="grid gap-3 sm:grid-cols-2 text-xs border-t border-[var(--surface-border-soft)] pt-3">
                          <div>
                            <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
                              نوع الطلب
                            </span>
                            <span className="text-[var(--text-secondary)] font-medium">
                              {typeLabel(order.type)}
                            </span>
                          </div>
                          {order.delivery_address && (
                            <div>
                              <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
                                عنوان التوصيل
                              </span>
                              <span className="text-[var(--text-secondary)] font-medium break-all">
                                {order.delivery_address}
                              </span>
                            </div>
                          )}
                          {order.notes && (
                            <div className="sm:col-span-2">
                              <span className="block text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
                                ملاحظات عامة
                              </span>
                              <span className="text-[var(--text-secondary)] italic">
                                &quot;{order.notes}&quot;
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
