"use client";

import { useState } from "react";
import Image from "next/image";
import { Info, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import CartWidget from "./cart-widget";
import SiteHeader from "./site-header";

type MenuItem = {
  id: string;
  name_ar: string;
  name_en: string;
  category_ar: string;
  category_en: string;
  price: number;
  photo_url: string | null;
  is_available: boolean;
  allergens: { name_ar: string; name_en: string }[];
  ingredients: { name_ar: string; name_en: string }[];
};

type Category = {
  id: string;
  name_ar: string;
  name_en: string;
};

export default function PublicMenu({
  items,
  categories,
  isLoggedIn,
  userProfile,
}: {
  items: MenuItem[];
  categories: Category[];
  isLoggedIn: boolean;
  userProfile: { id: string; name: string; phone: string | null; address: string | null } | null;
}) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const router = useRouter();

  const isAr = lang === "ar";

  const filteredItems = items.filter((item) => {
    if (activeCategory === "all") return true;
    return item.category_en === activeCategory;
  });

  const { addItem } = useCartStore();

  const handleAddToCart = (item: MenuItem) => {
    if (!isLoggedIn) {
      router.push("/login?next=/menu");
      return;
    }
    addItem({
      id: item.id,
      name_ar: item.name_ar,
      name_en: item.name_en,
      price: item.price,
      photo_url: item.photo_url,
      quantity: 1,
    });
  };

  return (
    <div
      className={`min-h-screen bg-[var(--surface-bg)] text-[var(--text-primary)] pb-32 ${
        isAr ? "font-arabic" : "font-sans"
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      <SiteHeader
        isAr={isAr}
        onToggleLang={() => setLang(isAr ? "en" : "ar")}
        userProfile={userProfile}
        loginNext="/menu"
      />

      <main className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Bold Asymmetrical Hero */}
        <section className="relative my-16 grid grid-cols-1 gap-12 lg:my-24 lg:grid-cols-12 lg:items-center">
          {/* Ornamental Backdrop Block */}
          <div className="bg-ornament float absolute -inset-6 -z-10 hidden rounded-3xl opacity-50 lg:block lg:col-span-8 lg:col-start-5 lg:h-[120%] lg:w-[110%]"></div>
          
          <div className="lg:col-span-7 lg:pe-12">
            <h2 className="mb-6 font-display text-6xl font-bold leading-tight tracking-tight text-[var(--ink)] md:text-7xl lg:text-8xl">
              {isAr ? (
                <>
                  <span className="rise-in block text-[var(--primary-600)]" style={{ animationDelay: '200ms' }}>تذوق</span> 
                  <span className="rise-in block" style={{ animationDelay: '300ms' }}>الفخامة.</span>
                </>
              ) : (
                <>
                  <span className="rise-in block text-[var(--primary-600)]" style={{ animationDelay: '200ms' }}>Taste</span> 
                  <span className="rise-in block" style={{ animationDelay: '300ms' }}>Luxury.</span>
                </>
              )}
            </h2>
            <p className="rise-in max-w-xl text-xl leading-relaxed text-[var(--text-secondary)] lg:text-2xl" style={{ animationDelay: '400ms' }}>
              {isAr
                ? "استكشف أشهى الأطباق المحضرة بعناية من أفضل المكونات الطازجة يومياً لتقديم تجربة لا تُنسى."
                : "Explore our exquisite dishes, crafted daily from the finest fresh ingredients for an unforgettable experience."}
            </p>
          </div>

          {/* Asymmetric Gourmet Image Block */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[var(--surface-border-soft)] bg-[var(--surface-canvas)] shadow-md lg:col-span-5 rise-in" style={{ animationDelay: '500ms' }}>
            <Image
              src="/hero-food.png"
              alt={isAr ? "أطباقنا الفاخرة المحضرة طازجة" : "Gourmet plating of our finest menu items"}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
            />
          </div>
        </section>

        {/* Hairline Divider */}
        <div className="rise-in rule-ornament my-16 opacity-60" style={{ animationDelay: '600ms' }}>
          <span className="h-1.5 w-1.5 rotate-45 bg-[var(--accent-500)]"></span>
        </div>

        {/* Typography-Led Category Selector */}
        <div className="rise-in mb-12 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ animationDelay: '700ms' }}>
          <div className="flex min-w-max items-center gap-3 border-b border-[var(--surface-border-soft)] pb-4">
            <button
              onClick={() => setActiveCategory("all")}
              className={`relative flex min-h-[44px] items-center justify-center rounded-full px-6 py-2 font-display text-lg font-bold transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-600)] focus-visible:ring-offset-2 ${
                activeCategory === "all"
                  ? "bg-[var(--primary-600)] text-white shadow-[0_6px_16px_0_oklch(0.58_0.18_48/0.25)]"
                  : "bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--surface-border-soft)] hover:bg-[var(--surface-border-soft)] hover:text-[var(--text-primary)]"
              }`}
            >
              {isAr ? "الكل" : "All"}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name_en)}
                className={`relative flex min-h-[44px] items-center justify-center rounded-full px-6 py-2 font-display text-lg font-bold transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-600)] focus-visible:ring-offset-2 ${
                  activeCategory === cat.name_en
                    ? "bg-[var(--primary-600)] text-white shadow-[0_6px_16px_0_oklch(0.58_0.18_48/0.25)]"
                    : "bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--surface-border-soft)] hover:bg-[var(--surface-border-soft)] hover:text-[var(--text-primary)]"
                }`}
              >
                {isAr ? cat.name_ar : cat.name_en}
              </button>
            ))}
          </div>
        </div>

        {/* Premium Editorial Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, index) => (
            <article
              key={item.id}
              className="rise-in group relative flex flex-col overflow-hidden rounded-3xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] p-5 shadow-sm transition-all duration-300 hover:shadow-[0_24px_48px_-20px_oklch(0.18_0.02_60/0.15)] hover:border-[var(--primary-300)] dark:hover:border-[var(--primary-800)] lift h-full"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Photo - Premium Rounded Crop */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--surface-canvas)] mb-6 rounded-2xl border border-[var(--surface-border-soft)]">
                {item.photo_url ? (
                  <Image
                    src={item.photo_url}
                    alt={isAr ? item.name_ar : item.name_en}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--surface-border)]">
                    <Info className="h-12 w-12 opacity-20" />
                  </div>
                )}
                
                {!item.is_available && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--surface-bg)]/80 backdrop-blur-[2px]">
                    <span className="border border-red-800/30 bg-red-50/90 dark:bg-red-950/80 dark:text-red-300 px-6 py-2 font-display text-base font-bold text-red-800 shadow-md rotate-[-3deg] rounded-lg tracking-wide">
                      {isAr ? "نفدت الكمية" : "Sold Out"}
                    </span>
                  </div>
                )}
              </div>

              {/* Content Wrapper */}
              <div className="relative z-10 flex flex-1 flex-col justify-between">
                <div className="mb-5">
                  <h3 className="mb-2 font-display text-2xl font-bold leading-tight text-[var(--ink)] transition-colors duration-200 group-hover:text-[var(--primary-600)]">
                    {isAr ? item.name_ar : item.name_en}
                  </h3>
                  
                  {item.ingredients.length > 0 && (
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-2 min-h-[2.5rem] mb-4">
                      {item.ingredients
                        .map((ing) => (isAr ? ing.name_ar : ing.name_en))
                        .join(" • ")}
                    </p>
                  )}

                  {/* Badges */}
                  {item.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.allergens.map((allergen, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] uppercase font-bold tracking-wider bg-[var(--surface-card-warm)] border border-[var(--surface-border)] px-2.5 py-1 text-[var(--accent-600)] rounded-md"
                        >
                          {isAr ? allergen.name_ar : allergen.name_en}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer with Price & Action */}
                <div className="mt-auto flex items-center justify-between border-t border-[var(--surface-border-soft)] pt-4">
                  <div className="flex flex-col">
                    <span className="eyebrow mb-1 opacity-70 text-[10px]">
                      {isAr ? "السعر" : "Price"}
                    </span>
                    <span className="numeric text-3xl font-bold text-[var(--primary-700)]">
                      {item.price} <span className="text-lg font-sans font-medium text-[var(--text-muted)]">{isAr ? "ج.م" : "EGP"}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.is_available}
                    className="flex h-12 w-12 min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-full bg-[var(--primary-600)] text-white shadow-[0_4px_14px_0_oklch(0.58_0.18_48/0.39)] transition-all duration-300 hover:bg-[var(--primary-700)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-card)]"
                    aria-label={isAr ? "أضف إلى السلة" : "Add to Cart"}
                  >
                    <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="py-32 text-center text-[var(--text-muted)]">
            <Info className="mx-auto mb-6 h-16 w-16 opacity-20" />
            <p className="font-display text-2xl">
              {isAr
                ? "لا توجد أطباق في هذا التصنيف حالياً."
                : "No items found in this category."}
            </p>
          </div>
        )}
      </main>

      <CartWidget isAr={isAr} userProfile={userProfile} />
    </div>
  );
}
