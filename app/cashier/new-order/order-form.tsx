"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createOnsiteOrder } from "@/lib/actions/cashier";
import {
  Plus,
  Minus,
  ShoppingCart,
  Utensils,
  ShoppingBag,
  Trash2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

type MenuItem = {
  id: string;
  name_ar: string;
  name_en: string;
  category_id: string;
  price: number;
  photo_url: string | null;
  is_available: boolean;
};

type Category = {
  id: string;
  name_ar: string;
  name_en: string;
  sort_order: number;
};

type CartItem = {
  menu_item_id: string;
  name_ar: string;
  unit_price: number;
  quantity: number;
  notes: string;
};

export function OrderForm({
  categories,
  menuItems,
}: {
  categories: Category[];
  menuItems: MenuItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.id ?? "",
  );
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway">("dine-in");
  const [ownerName, setOwnerName] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const visibleItems = menuItems.filter(
    (m) => m.category_id === activeCategory,
  );
  const cartList = Array.from(cart.values());
  const total = cartList.reduce(
    (sum, i) => sum + i.unit_price * i.quantity,
    0,
  );

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(item.id);
      if (existing) {
        next.set(item.id, { ...existing, quantity: existing.quantity + 1 });
      } else {
        next.set(item.id, {
          menu_item_id: item.id,
          name_ar: item.name_ar,
          unit_price: item.price,
          quantity: 1,
          notes: "",
        });
      }
      return next;
    });
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) => {
      const next = new Map(prev);
      const item = next.get(id);
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        next.delete(id);
      } else {
        next.set(id, { ...item, quantity: newQty });
      }
      return next;
    });
  }

  function cartQty(id: string) {
    return cart.get(id)?.quantity ?? 0;
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await createOnsiteOrder({
        type: orderType,
        owner_name: ownerName,
        notes: orderNotes,
        items: cartList.map((i) => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          notes: i.notes,
        })),
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/cashier"), 1200);
      }
    });
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-[var(--text-primary)]">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <p className="font-display text-xl">تم إنشاء الطلب بنجاح!</p>
        <p className="text-sm text-[var(--text-muted)]">جاري التوجيه إلى قائمة الطلبات…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── Left: menu picker ─────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-2xl text-[var(--text-primary)] mb-4">طلب جديد</h1>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-primary-500 text-white"
                  : "bg-[var(--surface-input)] text-[var(--text-secondary)] hover:bg-[var(--surface-border)]"
              }`}
            >
              {cat.name_ar}
            </button>
          ))}
        </div>

        {/* Menu item grid */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => {
            const qty = cartQty(item.id);
            return (
              <div
                key={item.id}
                className={`bg-[var(--surface-card)] rounded-2xl border overflow-hidden transition-colors ${
                  qty > 0
                    ? "border-primary-400 shadow-sm"
                    : "border-[var(--surface-border-soft)]"
                }`}
              >
                {item.photo_url && (
                  <div className="relative h-32 w-full bg-[var(--surface-canvas)]">
                    <Image
                      src={item.photo_url}
                      alt={item.name_ar}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 300px"
                    />
                  </div>
                )}
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {item.name_ar}
                    </p>
                    <p className="font-serif text-sm text-primary-600">
                      {item.price.toLocaleString("ar-EG")} ج
                    </p>
                  </div>
                  {qty === 0 ? (
                    <button
                      onClick={() => addToCart(item)}
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="flex items-center justify-center h-7 w-7 rounded-full border border-[var(--surface-border)] hover:bg-[var(--surface-input)] transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-serif text-sm font-semibold w-5 text-center">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="flex items-center justify-center h-7 w-7 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {visibleItems.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-[var(--text-muted)]">
              لا توجد أصناف متاحة في هذه الفئة
            </p>
          )}
        </div>
      </div>

      {/* ── Right: cart + submit ───────────────────────────────── */}
      <div className="lg:w-80 shrink-0">
        <div className="sticky top-20 bg-[var(--surface-card)] rounded-2xl border border-[var(--surface-border-soft)] p-5 flex flex-col gap-4">
          {/* Cart header */}
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">السلة</h2>
            {cartList.length > 0 && (
              <span className="ms-auto text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5">
                {cartList.reduce((s, i) => s + i.quantity, 0)} صنف
              </span>
            )}
          </div>

          {/* Cart items */}
          {cartList.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">
              لم تضف أصنافاً بعد
            </p>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {cartList.map((item) => (
                <li key={item.menu_item_id} className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() =>
                      setCart((prev) => {
                        const n = new Map(prev);
                        n.delete(item.menu_item_id);
                        return n;
                      })
                    }
                    className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <span className="flex-1 truncate text-[var(--text-secondary)]">
                    {item.quantity}× {item.name_ar}
                  </span>
                  <span className="font-serif text-[var(--text-primary)] shrink-0">
                    {(item.unit_price * item.quantity).toLocaleString("ar-EG")} ج
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Divider */}
          <div className="h-px bg-[var(--surface-border-soft)]" />

          {/* Order type */}
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-2">نوع الطلب</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOrderType("dine-in")}
                className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-sm transition-colors ${
                  orderType === "dine-in"
                    ? "border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-900/20"
                    : "border-[var(--surface-border)] text-[var(--text-secondary)] hover:bg-[var(--surface-input)]"
                }`}
              >
                <Utensils className="h-4 w-4" />
                <span>داخل المطعم</span>
              </button>
              <button
                onClick={() => setOrderType("takeaway")}
                className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-sm transition-colors ${
                  orderType === "takeaway"
                    ? "border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-900/20"
                    : "border-[var(--surface-border)] text-[var(--text-secondary)] hover:bg-[var(--surface-input)]"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>تيك أواي</span>
              </button>
            </div>
          </div>

          {/* Owner name (takeaway only) */}
          {orderType === "takeaway" && (
            <input
              type="text"
              placeholder="اسم صاحب الطلب"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none focus:border-primary-400"
            />
          )}

          {/* Notes */}
          <textarea
            placeholder="ملاحظات على الطلب (اختياري)"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none focus:border-primary-400 resize-none"
          />

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
          )}

          {/* Total + submit */}
          <div className="space-y-3">
            {cartList.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-muted)]">الإجمالي</span>
                <span className="font-serif text-xl font-semibold text-[var(--text-primary)]">
                  {total.toLocaleString("ar-EG")} ج
                </span>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={isPending || cartList.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 transition-colors disabled:opacity-50"
            >
              <ArrowRight className="h-4 w-4" />
              {isPending ? "جاري الإرسال…" : "إرسال الطلب"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
