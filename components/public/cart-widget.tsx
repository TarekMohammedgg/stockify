"use client";

import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import CheckoutModal from "./checkout-modal";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartWidget({ 
  isAr, 
  userProfile 
}: { 
  isAr: boolean; 
  userProfile: { id: string; name: string; phone: string | null; address: string | null } | null;
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore();
  const router = useRouter();

  const count = getItemCount();

  if (count === 0) return null;

  const handleCheckoutClick = () => {
    if (!userProfile) {
      router.push("/login");
    } else {
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 start-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-600)] text-white shadow-xl shadow-[var(--primary-600)]/30 transition-transform hover:scale-110 animate-in slide-in-from-bottom-10"
      >
        <ShoppingBag className="h-6 w-6" />
        <span className="absolute -top-2 -end-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-600)] text-xs font-bold font-display shadow-sm">
          {count}
        </span>
      </button>

      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title={isAr ? "عربة التسوق" : "Your Cart"}
        className="font-sans"
      >
        <div className="max-h-[60vh] overflow-y-auto pe-2" dir={isAr ? "rtl" : "ltr"}>
          {items.map((item) => (
            <div key={item.id} className="mb-4 flex gap-4 border-b border-[var(--surface-border-soft)] pb-4 last:border-0">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-[var(--surface-canvas)]">
                {item.photo_url ? (
                  <Image src={item.photo_url} alt={isAr ? item.name_ar : item.name_en} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-gray-200" />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between">
                  <h4 className="font-display font-bold text-[var(--ink)]">{isAr ? item.name_ar : item.name_en}</h4>
                  <button onClick={() => removeItem(item.id)} className="text-[var(--text-muted)] hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-bold text-[var(--primary-700)]">{item.price} <span className="text-sm">{isAr ? "ج.م" : "EGP"}</span></span>
                  <div className="flex items-center gap-3 rounded-full border border-[var(--surface-border)] px-2 py-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-[var(--text-secondary)] hover:text-[var(--primary-600)]">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-[var(--text-secondary)] hover:text-[var(--primary-600)]">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-[var(--surface-border)] pt-4" dir={isAr ? "rtl" : "ltr"}>
          <div className="mb-4 flex justify-between font-display text-2xl font-bold">
            <span>{isAr ? "المجموع" : "Total"}</span>
            <span className="text-[var(--primary-700)]">{getTotal()} <span className="text-lg">{isAr ? "ج.م" : "EGP"}</span></span>
          </div>
          <button
            onClick={handleCheckoutClick}
            className="flex w-full items-center justify-center gap-2 rounded bg-[var(--primary-600)] py-4 text-lg font-bold text-white transition-all hover:bg-[var(--primary-700)]"
          >
            {isAr ? "إتمام الطلب" : "Checkout"}
            {isAr ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
          </button>
        </div>
      </Modal>

      {userProfile && (
        <CheckoutModal 
          isOpen={isCheckoutOpen} 
          onClose={() => setIsCheckoutOpen(false)} 
          userProfile={userProfile} 
          isAr={isAr} 
        />
      )}
    </>
  );
}
