"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  createOnsiteOrder,
  findCustomerByPhone,
  type CustomerInfo,
} from "@/lib/actions/cashier";
import {
  Plus,
  Minus,
  ShoppingCart,
  Utensils,
  ShoppingBag,
  Truck,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Search,
  UserCheck,
  UserPlus,
  MapPin,
  Phone,
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

type OrderType = "dine-in" | "takeaway" | "delivery";
type CustomerType = "new" | "existing";

export function OrderForm({
  categories,
  menuItems,
}: {
  categories: Category[];
  menuItems: MenuItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSearching, startSearch] = useTransition();

  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.id ?? "",
  );
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [customerType, setCustomerType] = useState<CustomerType>("new");

  // Existing-customer search
  const [searchPhone, setSearchPhone] = useState("");
  const [foundCustomer, setFoundCustomer] = useState<CustomerInfo | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // New-customer manual fields
  const [ownerName, setOwnerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

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

  function handleOrderTypeChange(type: OrderType) {
    setOrderType(type);
    setCustomerType("new");
    setSearchPhone("");
    setFoundCustomer(null);
    setSearchError(null);
    setOwnerName("");
    setCustomerPhone("");
    setDeliveryAddress("");
  }

  function handleCustomerTypeChange(type: CustomerType) {
    setCustomerType(type);
    setSearchPhone("");
    setFoundCustomer(null);
    setSearchError(null);
    setOwnerName("");
    setCustomerPhone("");
    setDeliveryAddress("");
  }

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

  function handleSearch() {
    if (!searchPhone.trim()) return;
    setSearchError(null);
    setFoundCustomer(null);
    startSearch(async () => {
      const result = await findCustomerByPhone(searchPhone);
      if (result.error) {
        setSearchError(result.error);
      } else if (result.customer) {
        setFoundCustomer(result.customer);
      }
    });
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const payload =
        orderType !== "delivery"
          ? {
              type: orderType,
              notes: orderNotes,
              items: cartList.map((i) => ({
                menu_item_id: i.menu_item_id,
                quantity: i.quantity,
                unit_price: i.unit_price,
                notes: i.notes,
              })),
            }
          : customerType === "existing" && foundCustomer
            ? {
                type: orderType,
                customer_id: foundCustomer.id,
                owner_name: foundCustomer.name,
                customer_phone: foundCustomer.phone,
                delivery_address:
                  orderType === "delivery"
                    ? (foundCustomer.address ?? deliveryAddress)
                    : undefined,
                notes: orderNotes,
                items: cartList.map((i) => ({
                  menu_item_id: i.menu_item_id,
                  quantity: i.quantity,
                  unit_price: i.unit_price,
                  notes: i.notes,
                })),
              }
            : {
                type: orderType,
                owner_name: ownerName,
                customer_phone: customerPhone || undefined,
                delivery_address:
                  orderType === "delivery" ? deliveryAddress : undefined,
                notes: orderNotes,
                items: cartList.map((i) => ({
                  menu_item_id: i.menu_item_id,
                  quantity: i.quantity,
                  unit_price: i.unit_price,
                  notes: i.notes,
                })),
              };

      const result = await createOnsiteOrder(payload);
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

  const needsCustomer = orderType === "delivery";
  const existingCustomerMissingAddress =
    orderType === "delivery" &&
    customerType === "existing" &&
    foundCustomer !== null &&
    !foundCustomer.address;

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
                      aria-label="إضافة للسلة"
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        aria-label="تقليل الكمية"
                        className="flex items-center justify-center h-7 w-7 rounded-full border border-[var(--surface-border)] hover:bg-[var(--surface-input)] transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-serif text-sm font-semibold w-5 text-center">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        aria-label="زيادة الكمية"
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
                    aria-label="إزالة من السلة"
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

          <div className="h-px bg-[var(--surface-border-soft)]" />

          {/* Order type — 3 buttons */}
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-2">نوع الطلب</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { value: "dine-in", label: "داخل المطعم", icon: Utensils },
                  { value: "takeaway", label: "تيك أواي", icon: ShoppingBag },
                  { value: "delivery", label: "توصيل", icon: Truck },
                ] as const
              ).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleOrderTypeChange(value)}
                  className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs transition-colors ${
                    orderType === value
                      ? "border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-900/20"
                      : "border-[var(--surface-border)] text-[var(--text-secondary)] hover:bg-[var(--surface-input)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Customer section (takeaway / delivery only) */}
          {needsCustomer && (
            <div className="flex flex-col gap-3">
              {/* New / Existing toggle */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleCustomerTypeChange("existing")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs transition-colors ${
                    customerType === "existing"
                      ? "border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-900/20"
                      : "border-[var(--surface-border)] text-[var(--text-secondary)] hover:bg-[var(--surface-input)]"
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  عميل موجود
                </button>
                <button
                  onClick={() => handleCustomerTypeChange("new")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs transition-colors ${
                    customerType === "new"
                      ? "border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-900/20"
                      : "border-[var(--surface-border)] text-[var(--text-secondary)] hover:bg-[var(--surface-input)]"
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  عميل جديد
                </button>
              </div>

              {/* Existing customer search */}
              {customerType === "existing" && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1.5">
                    <input
                      type="tel"
                      placeholder="رقم الهاتف"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1 min-w-0 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none focus:border-primary-400"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={isSearching || !searchPhone.trim()}
                      aria-label="بحث"
                      className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 shrink-0"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>

                  {searchError && (
                    <p className="text-xs text-red-500">{searchError}</p>
                  )}

                  {foundCustomer && (
                    <div className="rounded-xl border border-green-300 bg-green-50 dark:bg-green-900/20 p-3 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        {foundCustomer.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <Phone className="h-3 w-3" />
                        {foundCustomer.phone}
                      </div>
                      {foundCustomer.address && (
                        <div className="flex items-start gap-1.5 text-xs text-[var(--text-muted)]">
                          <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                          <span>{foundCustomer.address}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delivery: existing customer with no saved address → manual entry */}
                  {existingCustomerMissingAddress && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        لا يوجد عنوان محفوظ لهذا العميل، أدخله يدوياً
                      </p>
                      <input
                        type="text"
                        placeholder="عنوان التوصيل"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none focus:border-primary-400"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* New customer manual fields */}
              {customerType === "new" && (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="اسم العميل"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none focus:border-primary-400"
                  />
                  <input
                    type="tel"
                    placeholder="رقم الهاتف (اختياري)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none focus:border-primary-400"
                  />
                  {orderType === "delivery" && (
                    <input
                      type="text"
                      placeholder="عنوان التوصيل"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none focus:border-primary-400"
                    />
                  )}
                </div>
              )}
            </div>
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
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              {isPending ? "جاري الإرسال…" : "إرسال الطلب"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
