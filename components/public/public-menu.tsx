"use client";

import { useState } from "react";
import Image from "next/image";
import { Info, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

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
}: {
  items: MenuItem[];
  categories: Category[];
  isLoggedIn: boolean;
}) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const router = useRouter();

  const isAr = lang === "ar";

  const filteredItems = items.filter((item) => {
    if (activeCategory === "all") return true;
    return item.category_en === activeCategory;
  });

  const handleOrderClick = () => {
    if (isLoggedIn) {
      window.dispatchEvent(new CustomEvent("open-chatbot"));
    } else {
      router.push("/login");
    }
  };

  return (
    <div
      className={`min-h-screen bg-[var(--surface-bg)] text-[var(--text-primary)] pb-32 ${
        isAr ? "font-arabic" : "font-sans"
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Editorial Header */}
      <header className="relative z-20 border-b border-[var(--surface-border)] bg-[var(--surface-bg)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--primary-600)]">
            Stockify
          </h1>
          <button
            onClick={() => setLang(isAr ? "en" : "ar")}
            className="flex items-center gap-2 rounded-full border border-[var(--surface-border)] px-5 py-2 text-sm font-medium transition-all hover:bg-[var(--surface-border)] hover:text-[var(--primary-700)]"
          >
            {isAr ? "English" : "عربي"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Bold Asymmetrical Hero */}
        <section className="relative my-16 grid grid-cols-1 gap-12 lg:my-24 lg:grid-cols-12 lg:items-center">
          {/* Ornamental Backdrop Block */}
          <div className="bg-ornament absolute -inset-6 -z-10 hidden rounded-3xl opacity-50 lg:block lg:col-span-8 lg:col-start-5 lg:h-[120%] lg:w-[110%]"></div>
          
          <div className="lg:col-span-7 lg:pr-12">
            <h2 className="mb-6 font-display text-6xl font-bold leading-tight tracking-tight text-[var(--ink)] md:text-7xl lg:text-8xl">
              {isAr ? (
                <>
                  <span className="block text-[var(--primary-600)]">تذوق</span> 
                  <span className="block">الفخامة.</span>
                </>
              ) : (
                <>
                  <span className="block text-[var(--primary-600)]">Taste</span> 
                  <span className="block">Luxury.</span>
                </>
              )}
            </h2>
            <p className="max-w-xl text-xl leading-relaxed text-[var(--text-secondary)] lg:text-2xl">
              {isAr
                ? "استكشف أشهى الأطباق المحضرة بعناية من أفضل المكونات الطازجة يومياً لتقديم تجربة لا تُنسى."
                : "Explore our exquisite dishes, crafted daily from the finest fresh ingredients for an unforgettable experience."}
            </p>
          </div>
        </section>

        {/* Hairline Divider */}
        <div className="rule-ornament my-16 opacity-60">
          <span className="h-1.5 w-1.5 rotate-45 bg-[var(--accent-500)]"></span>
        </div>

        {/* Typography-Led Category Selector */}
        <div className="mb-16 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex min-w-max items-end gap-8 border-b border-[var(--surface-border-soft)] pb-4">
            <button
              onClick={() => setActiveCategory("all")}
              className={`relative pb-2 font-display text-2xl md:text-4xl transition-all duration-300 ${
                activeCategory === "all"
                  ? "text-[var(--accent-600)] font-bold scale-105 origin-bottom"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {isAr ? "الكل" : "All"}
              {activeCategory === "all" && (
                <span className="absolute -bottom-[17px] left-0 right-0 h-1 bg-[var(--accent-600)]" />
              )}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name_en)}
                className={`relative pb-2 font-display text-2xl md:text-4xl transition-all duration-300 ${
                  activeCategory === cat.name_en
                    ? "text-[var(--accent-600)] font-bold scale-105 origin-bottom"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {isAr ? cat.name_ar : cat.name_en}
                {activeCategory === cat.name_en && (
                  <span className="absolute -bottom-[17px] left-0 right-0 h-1 bg-[var(--accent-600)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Staggered Masonry-ish Grid */}
        <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
          {filteredItems.map((item, index) => (
            <article
              key={item.id}
              className="rise-in group relative mb-8 break-inside-avoid overflow-hidden rounded-sm border border-[var(--surface-border-soft)] bg-[var(--surface-card)] p-4 shadow-sm lift"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Photo - Editorial tight crop */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--surface-canvas)] mb-6">
                {item.photo_url ? (
                  <Image
                    src={item.photo_url}
                    alt={isAr ? item.name_ar : item.name_en}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--surface-border)]">
                    <Info className="h-12 w-12 opacity-20" />
                  </div>
                )}
                
                {!item.is_available && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--surface-bg)]/60 backdrop-blur-sm">
                    <span className="border border-red-800/30 bg-red-50 px-6 py-2 font-display text-lg font-bold text-red-800 shadow-sm rotate-[-5deg]">
                      {isAr ? "نفدت الكمية" : "Sold Out"}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col">
                <div className="mb-4">
                  <h3 className="mb-2 font-display text-2xl font-bold leading-tight text-[var(--ink)]">
                    {isAr ? item.name_ar : item.name_en}
                  </h3>
                  
                  {item.ingredients.length > 0 && (
                    <p className="text-sm italic text-[var(--text-secondary)] line-clamp-3">
                      {item.ingredients
                        .map((ing) => (isAr ? ing.name_ar : ing.name_en))
                        .join(" • ")}
                    </p>
                  )}
                </div>

                {/* Badges */}
                {item.allergens.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {item.allergens.map((allergen, idx) => (
                      <span
                        key={idx}
                        className="eyebrow inline-block bg-[var(--surface-card-warm)] px-2 py-1 text-[var(--accent-600)]"
                      >
                        {isAr ? allergen.name_ar : allergen.name_en}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer with Price & Action */}
                <div className="mt-auto flex items-end justify-between border-t border-[var(--surface-border-soft)] pt-4">
                  <div className="flex flex-col">
                    <span className="eyebrow mb-1 opacity-70">
                      {isAr ? "السعر" : "Price"}
                    </span>
                    <span className="numeric text-3xl font-light text-[var(--primary-700)]">
                      {item.price} <span className="text-lg">{isAr ? "ج.م" : "EGP"}</span>
                    </span>
                  </div>

                  <button
                    onClick={handleOrderClick}
                    disabled={!item.is_available}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary-600)] text-white shadow-sm transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    aria-label={isAr ? "اطلب الآن" : "Order Now"}
                  >
                    {isAr ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
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
    </div>
  );
}
