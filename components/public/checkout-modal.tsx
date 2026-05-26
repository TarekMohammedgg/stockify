"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useCartStore } from "@/lib/store/cart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, StickyNote, ShoppingBag, CheckCircle2 } from "lucide-react";

export default function CheckoutModal({
  isOpen,
  onClose,
  userProfile,
  isAr,
}: {
  isOpen: boolean;
  onClose: () => void;
  userProfile: { id: string; name: string; phone: string | null; address: string | null };
  isAr: boolean;
}) {
  const { items, getTotal, clearCart } = useCartStore();
  const [type, setType] = useState<"delivery" | "takeaway">("delivery");
  const [phone, setPhone] = useState(userProfile.phone || "");
  const [address, setAddress] = useState(userProfile.address || "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "delivery" && (!phone || !address)) {
      setError(isAr ? "رقم الهاتف والعنوان مطلوبان للتوصيل." : "Phone and address are required for delivery.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          customer_id: userProfile.id,
          customer_phone: phone,
          delivery_address: type === "delivery" ? address : null,
          notes,
          items: items.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setIsSuccess(true);
      clearCart();
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || (isAr ? "حدث خطأ أثناء الطلب" : "Error placing order"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="font-sans text-center">
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="mb-6 h-24 w-24 text-green-500 animate-in zoom-in" />
          <h2 className="mb-2 font-display text-3xl font-bold text-[var(--ink)]">
            {isAr ? "تم استلام طلبك بنجاح!" : "Order placed successfully!"}
          </h2>
          <p className="text-[var(--text-secondary)]">
            {isAr ? "سنقوم بتجهيز طلبك في أسرع وقت." : "We will prepare your order shortly."}
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAr ? "إتمام الطلب" : "Checkout"}
      className="font-sans"
    >
      <form onSubmit={handleSubmit} dir={isAr ? "rtl" : "ltr"} className="flex flex-col gap-6">
        {/* Order Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          <label
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
              type === "delivery"
                ? "border-[var(--primary-600)] bg-[var(--primary-50)] text-[var(--primary-700)] dark:bg-[var(--primary-900)]/20"
                : "border-[var(--surface-border)] text-[var(--text-muted)] hover:border-[var(--primary-300)] hover:bg-[var(--surface-input)]"
            }`}
          >
            <input
              type="radio"
              name="type"
              value="delivery"
              checked={type === "delivery"}
              onChange={() => setType("delivery")}
              className="sr-only"
            />
            <ShoppingBag className="h-8 w-8" />
            <span className="font-display font-bold">{isAr ? "توصيل" : "Delivery"}</span>
          </label>
          <label
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
              type === "takeaway"
                ? "border-[var(--primary-600)] bg-[var(--primary-50)] text-[var(--primary-700)] dark:bg-[var(--primary-900)]/20"
                : "border-[var(--surface-border)] text-[var(--text-muted)] hover:border-[var(--primary-300)] hover:bg-[var(--surface-input)]"
            }`}
          >
            <input
              type="radio"
              name="type"
              value="takeaway"
              checked={type === "takeaway"}
              onChange={() => setType("takeaway")}
              className="sr-only"
            />
            <ShoppingBag className="h-8 w-8" />
            <span className="font-display font-bold">{isAr ? "استلام" : "Takeaway"}</span>
          </label>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">{isAr ? "رقم الهاتف" : "Phone Number"}</Label>
            <div className="relative">
              <Phone className="absolute top-3 start-3 h-5 w-5 text-[var(--text-muted)]" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="ps-10"
                placeholder={isAr ? "أدخل رقم الهاتف..." : "Enter phone number..."}
                required={type === "delivery"}
              />
            </div>
          </div>

          {type === "delivery" && (
            <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
              <Label htmlFor="address">{isAr ? "عنوان التوصيل" : "Delivery Address"}</Label>
              <div className="relative">
                <MapPin className="absolute top-3 start-3 h-5 w-5 text-[var(--text-muted)]" />
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="ps-10"
                  placeholder={isAr ? "أدخل عنوان التوصيل..." : "Enter delivery address..."}
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">{isAr ? "ملاحظات إضافية (اختياري)" : "Additional Notes (Optional)"}</Label>
            <div className="relative">
              <StickyNote className="absolute top-3 start-3 h-5 w-5 text-[var(--text-muted)]" />
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px] ps-10"
                placeholder={isAr ? "بدون بصل، تفاصيل أكثر..." : "No onions, extra details..."}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-4 border-t border-[var(--surface-border)] pt-6">
          <div className="mb-6 flex items-center justify-between font-display text-2xl font-bold">
            <span>{isAr ? "الإجمالي النهائي" : "Final Total"}</span>
            <span className="text-[var(--primary-700)]">{getTotal()} <span className="text-lg">{isAr ? "ج.م" : "EGP"}</span></span>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-lg h-14 bg-[var(--primary-600)] hover:bg-[var(--primary-700)]"
          >
            {isSubmitting ? (
              <span className="animate-pulse">{isAr ? "جاري التأكيد..." : "Confirming..."}</span>
            ) : (
              isAr ? "تأكيد الطلب" : "Confirm Order"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
