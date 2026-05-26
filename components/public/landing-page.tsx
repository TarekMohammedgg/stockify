"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Clock,
  MapPin,
  Sparkles,
  Truck,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import SiteHeader from "./site-header";

type UserProfile = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
} | null;

const COPY = {
  ar: {
    eyebrow: "مطبخ مصري حديث",
    heroLineA: "مذاق",
    heroLineB: "فاخر.",
    heroLineC: "في كل لقمة.",
    heroSub:
      "أطباق محضّرة بعناية يومياً من أجود المكونات الطازجة. اطلب أونلاين أو دع مساعدنا الذكي يرتّب طلبك بالعامية.",
    ctaPrimary: "تصفح القائمة",
    ctaSecondary: "اطلب بمساعد ستوكيفاي",
    metaDishes: "+٥٠ طبق طازج",
    metaHours: "مفتوح ١٠ص — ٢ص",
    metaCash: "كاش فقط",
    sectionNumber1: "٠١",
    sectionEyebrow: "لماذا ستوكيفاي",
    sectionTitle: "تجربة طلب أبسط،",
    sectionTitleAccent: "وأذوق.",
    featuredTitle: "مساعد ذكي بالعامية",
    featuredBody:
      "تحدّث مع مساعد ستوكيفاي زي ما بتكلم صاحبك. يرشّحلك أكلات، يفهم مزاجك، ويسجّل الطلب كامل بدون ما تملّى استمارة واحدة.",
    featuredAction: "جرّب المساعد",
    feature2Title: "قائمة طازجة يومياً",
    feature2Body:
      "بنحدّث المكونات يومياً ونعرض الأطباق المتوفّرة فقط. مفيش وعود، الطلب بيوصل زي ما هو.",
    feature3Title: "ديليفري أو تيك أواي",
    feature3Body:
      "الطلب بيظهر للكاشير على طول، وسائق الديليفري بيحدّث الحالة لحد ما يصلك على الباب.",
    sectionNumber2: "٠٢",
    ctaEyebrow: "ابدأ دلوقتي",
    ctaBanner: "جاهز للتجربة؟",
    ctaBannerSub: "افتح القائمة، اختار أطباقك، وابني طلبك في أقل من دقيقة.",
    ctaBannerButton: "ادخل القائمة",
    infoHours: "ساعات العمل",
    infoHoursValue: "كل يوم ١٠ص — ٢ص",
    infoLocation: "الموقع",
    infoLocationValue: "وسط البلد، القاهرة",
    infoPayment: "الدفع",
    infoPaymentValue: "كاش عند الاستلام فقط",
    footer: "© ستوكيفاي — مطبخك المفضّل، أقرب ممّا تتخيل.",
  },
  en: {
    eyebrow: "Modern Egyptian Kitchen",
    heroLineA: "Taste",
    heroLineB: "Luxury,",
    heroLineC: "in every bite.",
    heroSub:
      "Dishes crafted fresh daily from the finest ingredients. Order online or let our AI concierge place it for you, in plain Egyptian Arabic.",
    ctaPrimary: "Explore the Menu",
    ctaSecondary: "Order via Stockify AI",
    metaDishes: "50+ fresh dishes",
    metaHours: "Open 10am — 2am",
    metaCash: "Cash only",
    sectionNumber1: "01",
    sectionEyebrow: "Why Stockify",
    sectionTitle: "A simpler, tastier",
    sectionTitleAccent: "way to order.",
    featuredTitle: "An AI concierge that speaks your dialect",
    featuredBody:
      "Chat with our concierge like a friend. It recommends dishes, reads the room, and places the full order. No forms, no menus to scroll forever.",
    featuredAction: "Try the concierge",
    feature2Title: "Fresh menu, daily",
    feature2Body:
      "Ingredients are refreshed daily and we only show what's actually available. What you see is what arrives.",
    feature3Title: "Delivery or takeaway",
    feature3Body:
      "Orders land at the cashier instantly, and our delivery team updates the status until it's at your door.",
    sectionNumber2: "02",
    ctaEyebrow: "Start now",
    ctaBanner: "Ready to taste it?",
    ctaBannerSub: "Open the menu, pick your dishes, and build the order in under a minute.",
    ctaBannerButton: "Open the menu",
    infoHours: "Hours",
    infoHoursValue: "Every day, 10am — 2am",
    infoLocation: "Location",
    infoLocationValue: "Downtown, Cairo",
    infoPayment: "Payment",
    infoPaymentValue: "Cash on delivery only",
    footer: "© Stockify — your favorite kitchen, closer than you think.",
  },
};

export default function LandingPage({ userProfile }: { userProfile: UserProfile }) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const isAr = lang === "ar";
  const t = isAr ? COPY.ar : COPY.en;
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const concierge = userProfile ? "/menu" : "/login?next=/menu";

  return (
    <div
      className={`min-h-screen bg-[var(--surface-bg)] text-[var(--text-primary)] ${
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
        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative grid grid-cols-1 gap-x-12 gap-y-14 pt-[clamp(3rem,8vw,7rem)] pb-[clamp(3rem,7vw,6rem)] lg:grid-cols-12 lg:items-center">
          <div className="bg-ornament float absolute -inset-6 -z-10 hidden rounded-3xl opacity-50 lg:block lg:col-span-8 lg:col-start-5 lg:h-[120%] lg:w-[110%]" />

          <div className="lg:col-span-7 lg:pe-12">
            <p
              className="eyebrow rise-in mb-7 inline-flex items-center gap-2 text-[var(--accent-600)]"
              style={{ animationDelay: "0ms" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t.eyebrow}
            </p>

            <h1 className="mb-7 font-display font-bold leading-[0.95] tracking-tight text-[var(--ink)] text-[clamp(3.25rem,9vw,7.5rem)]">
              <span
                className="rise-in block text-[var(--primary-600)]"
                style={{ animationDelay: "80ms" }}
              >
                {t.heroLineA}
              </span>
              <span className="rise-in block" style={{ animationDelay: "180ms" }}>
                {t.heroLineB}
              </span>
              <span
                className="rise-in block text-[var(--text-secondary)]"
                style={{ animationDelay: "280ms" }}
              >
                {t.heroLineC}
              </span>
            </h1>

            <p
              className="rise-in max-w-[58ch] text-pretty text-lg leading-relaxed text-[var(--text-secondary)] lg:text-xl"
              style={{ animationDelay: "380ms" }}
            >
              {t.heroSub}
            </p>

            <div
              className="rise-in mt-10 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "480ms" }}
            >
              <Link
                href="/menu"
                className="group flex min-h-[52px] items-center gap-3 rounded-full bg-[var(--primary-600)] px-7 text-base font-bold text-white shadow-[0_8px_24px_0_oklch(0.58_0.18_48/0.35)] transition-all hover:bg-[var(--primary-700)] hover:shadow-[0_12px_32px_0_oklch(0.58_0.18_48/0.45)] active:scale-[0.98]"
              >
                <UtensilsCrossed className="h-5 w-5" />
                {t.ctaPrimary}
                <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
              <Link
                href={concierge}
                className="flex min-h-[52px] items-center gap-3 rounded-full border-2 border-[var(--surface-border)] bg-[var(--surface-card)] px-7 text-base font-bold text-[var(--text-primary)] transition-all hover:border-[var(--primary-600)] hover:text-[var(--primary-700)] active:scale-[0.98]"
              >
                <Bot className="h-5 w-5" />
                {t.ctaSecondary}
              </Link>
            </div>

            {/* Hero meta strip — tight, editorial */}
            <ul
              className="rise-in mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[var(--surface-border-soft)] pt-6 text-sm text-[var(--text-muted)]"
              style={{ animationDelay: "560ms" }}
            >
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-600)]" />
                <span className="numeric font-semibold text-[var(--text-primary)]">
                  {t.metaDishes}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-[var(--text-faint)]" />
                {t.metaHours}
              </li>
              <li className="flex items-center gap-2">
                <Wallet className="h-3.5 w-3.5 text-[var(--text-faint)]" />
                {t.metaCash}
              </li>
            </ul>
          </div>

          <div
            className="rise-in relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[var(--surface-border-soft)] bg-[var(--surface-canvas)] shadow-[0_24px_80px_-32px_oklch(0.18_0.02_60/0.35)] lg:col-span-5"
            style={{ animationDelay: "600ms" }}
          >
            <Image
              src="/hero-food.png"
              alt={
                isAr
                  ? "أطباقنا الفاخرة المحضرة طازجة"
                  : "Gourmet plating of our finest menu items"
              }
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
            />
            {/* Editorial caption chip */}
            <div className="absolute bottom-4 end-4 flex items-center gap-2 rounded-full bg-[var(--surface-card)]/90 px-4 py-2 text-xs font-semibold text-[var(--text-primary)] shadow-md backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
              {isAr ? "يُحضّر طازجاً اليوم" : "Plated fresh today"}
            </div>
          </div>
        </section>

        {/* Ornamental divider */}
        <div className="rule-ornament my-4 opacity-60">
          <span className="h-1.5 w-1.5 rotate-45 bg-[var(--accent-500)]" />
        </div>

        {/* ── FEATURES — asymmetric, one large + two stacked ───────── */}
        <section className="py-[clamp(4rem,8vw,7rem)]">
          <header className="mb-14 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow mb-3 flex items-center gap-3 text-[var(--accent-600)]">
                <span className="numeric text-base font-bold text-[var(--text-faint)]">
                  {t.sectionNumber1}
                </span>
                <span className="h-px flex-1 max-w-12 bg-[var(--surface-border)]" />
                {t.sectionEyebrow}
              </p>
              <h2 className="font-display font-bold leading-[1.02] tracking-tight text-[var(--ink)] text-[clamp(2.25rem,5vw,4.5rem)]">
                {t.sectionTitle}{" "}
                <span className="text-[var(--primary-600)]">{t.sectionTitleAccent}</span>
              </h2>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Large featured card — spans 7 cols, image-led */}
            <article className="lift group relative overflow-hidden rounded-3xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] lg:col-span-7">
              <div className="relative aspect-[5/4] w-full overflow-hidden bg-[var(--surface-canvas)] lg:aspect-[16/11]">
                <Image
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"
                  alt={
                    isAr
                      ? "محادثة بين عميل ومساعد ستوكيفاي على هاتف"
                      : "A diner chatting with the Stockify concierge on a phone"
                  }
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/55 via-transparent to-transparent" />
                <div className="absolute bottom-6 start-6 end-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 rounded-full bg-[var(--surface-card)]/95 px-4 py-2 text-xs font-bold text-[var(--primary-700)] shadow-sm backdrop-blur">
                    <Bot className="h-4 w-4" />
                    {isAr ? "مساعد ستوكيفاي" : "Stockify AI"}
                  </div>
                </div>
              </div>
              <div className="p-8 md:p-10">
                <h3 className="mb-4 font-display text-3xl font-bold leading-tight text-[var(--ink)] md:text-4xl">
                  {t.featuredTitle}
                </h3>
                <p className="mb-6 max-w-[52ch] text-pretty text-lg leading-relaxed text-[var(--text-secondary)]">
                  {t.featuredBody}
                </p>
                <Link
                  href={concierge}
                  className="group/cta inline-flex items-center gap-2 text-base font-bold text-[var(--primary-600)] hover:text-[var(--primary-700)]"
                >
                  {t.featuredAction}
                  <Arrow className="h-4 w-4 transition-transform group-hover/cta:translate-x-1 rtl:group-hover/cta:-translate-x-1" />
                </Link>
              </div>
            </article>

            {/* Two smaller cards, stacked, cols 8-12 */}
            <div className="grid grid-cols-1 gap-6 lg:col-span-5">
              {[
                {
                  Icon: UtensilsCrossed,
                  title: t.feature2Title,
                  body: t.feature2Body,
                  step: isAr ? "أ" : "A",
                },
                {
                  Icon: Truck,
                  title: t.feature3Title,
                  body: t.feature3Body,
                  step: isAr ? "ب" : "B",
                },
              ].map(({ Icon, title, body, step }) => (
                <article
                  key={title}
                  className="lift group relative overflow-hidden rounded-3xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] p-8"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-card-warm)] text-[var(--accent-600)] transition-colors group-hover:bg-[var(--accent-600)] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="numeric text-xs font-bold tracking-widest text-[var(--text-faint)]">
                      {step}
                    </span>
                  </div>
                  <h3 className="mb-2 font-display text-xl font-bold leading-tight text-[var(--ink)]">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Info strip — restaurant credentials */}
        <section className="py-12">
          <dl className="grid grid-cols-1 gap-y-8 gap-x-12 border-y border-[var(--surface-border-soft)] py-10 md:grid-cols-3">
            {[
              { Icon: Clock, label: t.infoHours, value: t.infoHoursValue },
              { Icon: MapPin, label: t.infoLocation, value: t.infoLocationValue },
              { Icon: Wallet, label: t.infoPayment, value: t.infoPaymentValue },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-card-warm)] text-[var(--accent-600)]">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <dt className="eyebrow mb-1 text-[var(--text-muted)]">{label}</dt>
                  <dd className="font-display text-lg font-bold text-[var(--ink)]">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        {/* ── CTA BANNER ───────────────────────────────────────────── */}
        <section className="py-[clamp(3rem,7vw,6rem)]">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--surface-border-soft)] bg-[var(--surface-card-warm)] px-8 py-14 md:px-16 md:py-20">
            <div className="bg-ornament float absolute -inset-12 -z-10 opacity-40" />
            <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="eyebrow mb-3 flex items-center gap-3 text-[var(--accent-600)]">
                  <span className="numeric text-base font-bold text-[var(--text-faint)]">
                    {t.sectionNumber2}
                  </span>
                  <span className="h-px flex-1 max-w-12 bg-[var(--surface-border)]" />
                  {t.ctaEyebrow}
                </p>
                <h3 className="mb-4 font-display font-bold leading-[1.02] tracking-tight text-[var(--ink)] text-[clamp(2rem,5vw,4rem)]">
                  {t.ctaBanner}
                </h3>
                <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
                  {t.ctaBannerSub}
                </p>
              </div>
              <Link
                href="/menu"
                className="group flex min-h-[56px] shrink-0 items-center gap-3 rounded-full bg-[var(--primary-600)] px-8 text-base font-bold text-white shadow-[0_8px_24px_0_oklch(0.58_0.18_48/0.35)] transition-all hover:bg-[var(--primary-700)] active:scale-[0.98]"
              >
                {t.ctaBannerButton}
                <Arrow className="h-5 w-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--surface-border-soft)] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-[var(--text-muted)] md:flex-row lg:px-12">
          <p>{t.footer}</p>
          <div className="flex items-center gap-6">
            <Link href="/menu" className="hover:text-[var(--primary-600)]">
              {isAr ? "القائمة" : "Menu"}
            </Link>
            <Link href="/login" className="hover:text-[var(--primary-600)]">
              {isAr ? "تسجيل الدخول" : "Login"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
