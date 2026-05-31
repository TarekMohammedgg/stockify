"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChefHat,
  Eye,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  Smartphone,
  Truck,
  Upload,
  X,
} from "lucide-react";
import { submitSiteRequest } from "@/lib/actions/request-site";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadState = "idle" | "uploading" | "done" | "error";

interface FileUploadStatus {
  state: UploadState;
  path: string;
  error: string;
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

const BASE_PRICE = 3000;
const ADDON_PRICES: Record<string, number> = {
  chatbot: 2000,
  whatsapp: 3000,
  mobile_app: 6000,
};

const ADDON_LABELS: Record<string, string> = {
  chatbot: "شات بوت ذكاء اصطناعي",
  whatsapp: "شات بوت واتساب",
  mobile_app: "تطبيق أندرويد و iOS",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAX_SIZE = 10 * 1024 * 1024;

function toArabicNum(n: number) {
  return n.toLocaleString("ar-EG");
}

async function uploadFileToSupabase(
  file: File
): Promise<{ path: string; error?: string }> {
  const res = await fetch("/api/storage/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    }),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    return { path: "", error: json.error ?? "فشل رفع الملف" };
  }

  const { signedUrl, path } = await res.json();

  const uploadRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    return { path: "", error: "فشل رفع الملف للسيرفر" };
  }

  return { path };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[var(--surface-card-warm)] p-6 border border-[var(--surface-border)]">
      <div className="flex size-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <p className="font-bold text-[var(--surface-ink)]">{title}</p>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingBadge({ label, price }: { label: string; price: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] px-4 py-3">
      <span className="text-sm font-medium text-[var(--surface-ink)]">
        {label}
      </span>
      <span className="shrink-0 rounded-full bg-accent-500/10 px-3 py-0.5 text-sm font-bold text-accent-500">
        +{price}
      </span>
    </div>
  );
}

/** Pulsing "LIVE" demo CTA button */
function LiveDemoButton({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "px-4 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5",
  };
  return (
    <Link
      href="/login?back=1"
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full font-bold text-white transition-all
        bg-gradient-to-l from-amber-500 to-orange-500
        shadow-lg shadow-amber-500/40
        hover:shadow-amber-500/60 hover:scale-105 hover:from-amber-400 hover:to-orange-400
        ${sizes[size]} ${className}`}
    >
      {/* Pulsing ring */}
      <span className="absolute inset-0 rounded-full animate-ping bg-amber-400/25 duration-1000" />
      {/* Live dot */}
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-white" />
      </span>
      <Eye size={size === "lg" ? 18 : size === "sm" ? 13 : 15} strokeWidth={2} />
      <span>شوف مثال حي</span>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ServiceLandingPage() {
  // Form state
  const [email, setEmail] = useState("");
  const [websiteName, setWebsiteName] = useState("");
  const [specs, setSpecs] = useState("");
  const [notes, setNotes] = useState("");
  const [addons, setAddons] = useState<string[]>([]);

  // File upload state
  const menuInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [menuUpload, setMenuUpload] = useState<FileUploadStatus>({
    state: "idle",
    path: "",
    error: "",
  });
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [logoUpload, setLogoUpload] = useState<FileUploadStatus>({
    state: "idle",
    path: "",
    error: "",
  });
  const [logoPaths, setLogoPaths] = useState<string[]>([]);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // ── Live pricing ─────────────────────────────────────────────────────────
  const total = BASE_PRICE + addons.reduce((sum, a) => sum + (ADDON_PRICES[a] ?? 0), 0);

  // ── File handlers ────────────────────────────────────────────────────────

  function handleMenuChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMenuUpload({ state: "idle", path: "", error: "" });
    if (file.type !== "application/pdf") {
      setMenuUpload({ state: "error", path: "", error: "يجب أن يكون الملف بصيغة PDF" });
      return;
    }
    if (file.size > MAX_SIZE) {
      setMenuUpload({ state: "error", path: "", error: "حجم الملف يتجاوز 10 ميجابايت" });
      return;
    }
    setMenuFile(file);
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setLogoUpload({ state: "idle", path: "", error: "" });
    if (files.length > 5) {
      setLogoUpload({ state: "error", path: "", error: "يمكن رفع 5 ملفات كحد أقصى" });
      return;
    }
    const oversized = files.find((f) => f.size > MAX_SIZE);
    if (oversized) {
      setLogoUpload({ state: "error", path: "", error: `${oversized.name} يتجاوز 10 ميجابايت` });
      return;
    }
    setLogoFiles(files);
    setLogoPaths([]);
  }

  function toggleAddon(value: string) {
    setAddons((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
    );
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!email || !email.includes("@")) {
      setFormError("أدخل بريد إلكتروني صالح");
      return;
    }
    if (!websiteName.trim()) {
      setFormError("اسم الموقع مطلوب");
      return;
    }
    if (!specs.trim()) {
      setFormError("مواصفات الموقع مطلوبة");
      return;
    }
    if (!menuFile) {
      setFormError("يجب رفع ملف المنيو");
      return;
    }

    setSubmitting(true);

    try {
      let menuPath = menuUpload.path;
      if (!menuPath) {
        setMenuUpload({ state: "uploading", path: "", error: "" });
        const result = await uploadFileToSupabase(menuFile);
        if (result.error) {
          setMenuUpload({ state: "error", path: "", error: result.error });
          setFormError(result.error);
          setSubmitting(false);
          return;
        }
        menuPath = result.path;
        setMenuUpload({ state: "done", path: menuPath, error: "" });
      }

      let resolvedLogoPaths = logoPaths;
      if (logoFiles.length > 0 && logoPaths.length === 0) {
        setLogoUpload({ state: "uploading", path: "", error: "" });
        const results = await Promise.all(logoFiles.map(uploadFileToSupabase));
        const failed = results.find((r) => r.error);
        if (failed) {
          setLogoUpload({ state: "error", path: "", error: failed.error! });
          setFormError(failed.error!);
          setSubmitting(false);
          return;
        }
        resolvedLogoPaths = results.map((r) => r.path);
        setLogoPaths(resolvedLogoPaths);
        setLogoUpload({ state: "done", path: "", error: "" });
      }

      const result = await submitSiteRequest({
        email,
        websiteName,
        specs,
        menuPdfPath: menuPath,
        logoPaths: resolvedLogoPaths,
        addons,
        notes,
      });

      if (result.error) {
        setFormError(result.error);
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setFormError("حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى");
      setSubmitting(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--surface-bg)] text-[var(--surface-ink)]">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--surface-border)] bg-[var(--surface-bg)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <ChefHat size={24} className="text-primary-500" />
            <span className="text-lg font-extrabold tracking-tight text-primary-600">
              ستوكيفاي
            </span>
          </div>
          <LiveDemoButton size="sm" />
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 pb-16 pt-16 text-center">
        {/* Decorative blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-72 w-72 rounded-full bg-primary-200/40 blur-3xl"
          style={{ left: "50%", transform: "translateX(-50%)" }}
        />
        <div className="relative mx-auto max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary-600">
            🚀 أنشئ موقع مطعمك دلوقتي
          </span>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-[var(--surface-ink)] sm:text-5xl">
            ابني موقعك{" "}
            <span className="text-primary-500">بالمواصفات</span>
            <br />
            الي في بالك
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-[var(--text-muted)]">
            وداعاً للغبطة وضغط الطلبات! دلوقتي تقدر تدير مطعمك بالكامل من
            سيستم واحد يربط الكاشير، والزبائن، والطيارين، والإدارة في مكان
            واحد وبمنتهى السهولة.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#request-form"
              className="rounded-full bg-primary-500 px-7 py-3 text-sm font-bold text-white shadow-md transition hover:bg-primary-600"
            >
              ابدأ دلوقتي
            </a>
            <LiveDemoButton size="md" />
          </div>
        </div>
      </section>

      {/* ── Live Demo Banner ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 pb-10">
        <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/60 bg-gradient-to-l from-amber-50 to-orange-50 p-6 dark:from-amber-900/20 dark:to-orange-900/20">
          {/* Background glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background:
                "radial-gradient(ellipse at 70% 50%, #f59e0b 0%, transparent 70%)",
            }}
          />
          <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-start">
            {/* Icon */}
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/40">
              <Eye size={28} strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <p className="text-lg font-extrabold text-[var(--surface-ink)]">
                شوف النظام بنفسك قبل ما تطلب 👁
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                النظام ده شغال دلوقتي — جرّبه كعميل أو اعمل أوردر حقيقي وشوف الفرق
              </p>
            </div>
            <Link
              href="/login?back=1"
              className="shrink-0 flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/40 transition hover:bg-amber-600 hover:shadow-amber-500/60 hover:scale-105"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-white" />
              </span>
              افتح المثال الحي
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="mb-10 text-center">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary-500">
            ليه ستوكيفاي؟
          </span>
          <h2 className="text-2xl font-extrabold text-[var(--surface-ink)] sm:text-3xl">
            كل اللي محتاجه في مكان واحد
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={LayoutDashboard}
            title="لوحة تحكم للكاشير والإدارة"
            desc="تابع الطلبات، المبيعات، والموظفين من داشبورد واحد سهل الاستخدام."
          />
          <FeatureCard
            icon={Truck}
            title="تتبع الطلبات والديليفري"
            desc="الزبون يطلب، الكاشير يؤكد، والطيار يوصل — كل ده في سيستم واحد."
          />
          <FeatureCard
            icon={ChefHat}
            title="عرض المنيو بالكامل"
            desc="موقعك بيعرض المنيو بتاعك بشكل احترافي مع صور وأسعار محدثة."
          />
          <FeatureCard
            icon={Bot}
            title="شات بوت ذكاء اصطناعي"
            desc="الزبون يطلب عن طريق محادثة ذكية بتفهم العربي وتسجل الطلب أوتوماتيك."
          />
          <FeatureCard
            icon={MessageCircle}
            title="واتساب شات بوت"
            desc="استقبل الطلبات وابعت المنيو والعروض عبر واتساب بدون أي تدخل يدوي."
          />
          <FeatureCard
            icon={Smartphone}
            title="تطبيق موبايل"
            desc="تطبيق احترافي للأندرويد و iOS يدي عملاؤك تجربة أفضل."
          />
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="bg-[var(--surface-canvas)] px-5 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary-500">
              الأسعار
            </span>
            <h2 className="text-2xl font-extrabold text-[var(--surface-ink)] sm:text-3xl">
              باقات مناسبة لكل مطعم
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Main pricing card */}
            <div className="rounded-2xl border-2 border-primary-400 bg-[var(--surface-card-warm)] p-8 shadow-lg">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-primary-500 px-3 py-0.5 text-xs font-bold text-white">
                  ⭐ الباقة الأساسية
                </span>
              </div>
              <div className="mb-6 mt-3 flex items-end gap-1">
                <span className="text-5xl font-extrabold text-primary-600 tabular-nums">
                  ٣٬٠٠٠
                </span>
                <span className="mb-1 text-lg font-semibold text-[var(--text-muted)]">
                  ج.م
                </span>
              </div>
              <ul className="space-y-3">
                {[
                  "بناء موقع ويب احترافي وعمل طلبات ديليفري",
                  "عرض المنيو كامل",
                  "لوحة خاصة بالطلبات",
                  "تتبع حالة الطلبات",
                  "دعم لمدة ٣٠ يوم",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 size={17} className="shrink-0 text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#request-form"
                className="mt-7 block w-full rounded-xl bg-primary-500 py-3 text-center text-sm font-bold text-white transition hover:bg-primary-600"
              >
                ابدأ دلوقتي
              </a>
            </div>

            {/* Add-ons */}
            <div className="flex flex-col gap-3">
              <p className="mb-1 text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                إضافات اختيارية
              </p>
              <PricingBadge label="شات بوت للموقع (ذكاء اصطناعي)" price="٢٬٠٠٠ ج.م" />
              <PricingBadge label="شات بوت واتساب" price="٣٬٠٠٠ ج.م" />
              <PricingBadge label="تطبيق أندرويد و iOS" price="٦٬٠٠٠ ج.م" />
              <div className="mt-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-4 text-sm text-[var(--text-muted)] leading-relaxed">
                💡 تقدر تختار الإضافات الي تناسبك وانت بتبعت الطلب من خلال الفورم تحت.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Request Form ────────────────────────────────────────────────────── */}
      <section id="request-form" className="mx-auto max-w-2xl px-5 py-16">
        <div className="mb-10 text-center">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary-500">
            ابدأ مشروعك
          </span>
          <h2 className="text-2xl font-extrabold text-[var(--surface-ink)] sm:text-3xl">
            ابعت طلبك
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            بعد ما تبعت الطلب، هنبقى معاك في أقرب وقت على إيميلك.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 sm:p-8 shadow-sm">
          {submitted ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle2 size={56} className="text-green-500" />
              <h3 className="text-xl font-extrabold text-[var(--surface-ink)]">
                وصلنا طلبك! 🎉
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                هنبقى معاك في أقرب وقت على إيميلك{" "}
                <strong className="text-[var(--surface-ink)]">{email}</strong>.
              </p>
              <LiveDemoButton size="md" className="mt-4" />
            </div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  إيميلك <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                  dir="ltr"
                  className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-bg)] px-4 py-2.5 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>

              {/* Website name */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  اسم موقعك <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  required
                  maxLength={200}
                  placeholder="مطعم البيت — شاورما وكفتة"
                  className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-bg)] px-4 py-2.5 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>

              {/* Specs */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  مواصفات الموقع بتاعك؟ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  required
                  rows={5}
                  maxLength={5000}
                  placeholder="اكتب هنا أي تفاصيل عن مطعمك، نوع الأكل، عدد الفروع، ألوان أو ستايل معين…"
                  className="w-full resize-y rounded-xl border border-[var(--surface-border)] bg-[var(--surface-bg)] px-4 py-2.5 text-sm leading-relaxed placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>

              {/* Menu PDF upload */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  ارفع المنيو (PDF) <span className="text-red-500">*</span>
                </label>
                <input
                  ref={menuInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleMenuChange}
                  className="hidden"
                />
                {menuFile && menuUpload.state !== "error" ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-green-300 bg-green-50 px-4 py-3 dark:border-green-700 dark:bg-green-900/20">
                    <div className="flex min-w-0 items-center gap-2">
                      {menuUpload.state === "uploading" ? (
                        <Loader2 size={16} className="shrink-0 animate-spin text-primary-500" />
                      ) : menuUpload.state === "done" ? (
                        <CheckCircle2 size={16} className="shrink-0 text-green-600" />
                      ) : (
                        <FileText size={16} className="shrink-0 text-primary-500" />
                      )}
                      <span className="truncate text-sm text-[var(--surface-ink)]">
                        {menuFile.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuFile(null);
                        setMenuUpload({ state: "idle", path: "", error: "" });
                        if (menuInputRef.current) menuInputRef.current.value = "";
                      }}
                      className="shrink-0 text-[var(--text-muted)] hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => menuInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--surface-border)] bg-[var(--surface-bg)] py-4 text-sm font-medium text-[var(--text-muted)] transition hover:border-primary-400 hover:text-primary-600"
                  >
                    <Upload size={18} />
                    اضغط لاختيار ملف PDF (أقصى ١٠ ميجابايت)
                  </button>
                )}
                {menuUpload.error && (
                  <p className="mt-1.5 text-xs text-red-500">{menuUpload.error}</p>
                )}
              </div>

              {/* Logo / other files */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  لوجو أو ملفات أخرى خاصة بالمطعم
                  <span className="ms-1 text-xs font-normal text-[var(--text-muted)]">
                    (اختياري — حتى ٥ ملفات، ١٠ ميجابايت لكل ملف)
                  </span>
                </label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleLogoChange}
                  className="hidden"
                />
                {logoFiles.length > 0 && logoUpload.state !== "error" ? (
                  <div className="space-y-2">
                    {logoFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-bg)] px-4 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          {logoUpload.state === "uploading" ? (
                            <Loader2 size={15} className="shrink-0 animate-spin text-primary-500" />
                          ) : logoUpload.state === "done" ? (
                            <CheckCircle2 size={15} className="shrink-0 text-green-600" />
                          ) : (
                            <FileText size={15} className="shrink-0 text-[var(--text-muted)]" />
                          )}
                          <span className="truncate text-sm">{f.name}</span>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFiles([]);
                        setLogoPaths([]);
                        setLogoUpload({ state: "idle", path: "", error: "" });
                        if (logoInputRef.current) logoInputRef.current.value = "";
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      إزالة الكل
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--surface-border)] bg-[var(--surface-bg)] py-4 text-sm font-medium text-[var(--text-muted)] transition hover:border-primary-400 hover:text-primary-600"
                  >
                    <Upload size={18} />
                    اختر الصور (PNG, JPG, SVG…)
                  </button>
                )}
                {logoUpload.error && (
                  <p className="mt-1.5 text-xs text-red-500">{logoUpload.error}</p>
                )}
              </div>

              {/* Add-ons checkboxes */}
              <div>
                <label className="mb-3 block text-sm font-semibold">
                  عايز الموقع يكون فيه ايه تاني؟{" "}
                  <span className="text-xs font-normal text-[var(--text-muted)]">
                    (اختياري)
                  </span>
                </label>
                <div className="space-y-2.5">
                  {[
                    { value: "chatbot", label: "شات ذكاء اصطناعي — Chatbot", price: "+٢٬٠٠٠ ج.م" },
                    { value: "whatsapp", label: "موديل محادثة واتساب — WhatsApp Chatbot", price: "+٣٬٠٠٠ ج.م" },
                    { value: "mobile_app", label: "تطبيق على الأندرويد و iOS", price: "+٦٬٠٠٠ ج.م" },
                  ].map(({ value, label, price }) => (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${
                        addons.includes(value)
                          ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20"
                          : "border-[var(--surface-border)] bg-[var(--surface-bg)] hover:border-primary-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={addons.includes(value)}
                          onChange={() => toggleAddon(value)}
                          className="size-4 accent-primary-500"
                        />
                        <span className="text-sm">{label}</span>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-primary-600">
                        {price}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Live Total ── */}
              <div className="rounded-2xl border-2 border-primary-300 bg-gradient-to-l from-primary-50 to-amber-50 p-5 dark:from-primary-900/20 dark:to-amber-900/10">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-500">
                  إجمالي المدفوعات
                </p>
                <div className="space-y-2 text-sm">
                  {/* Base price row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">الباقة الأساسية</span>
                    <span className="font-semibold tabular-nums text-[var(--surface-ink)]">
                      {toArabicNum(BASE_PRICE)} ج.م
                    </span>
                  </div>
                  {/* Selected add-ons */}
                  {addons.map((a) => (
                    <div key={a} className="flex items-center justify-between text-primary-700 dark:text-primary-400">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        {ADDON_LABELS[a]}
                      </span>
                      <span className="font-semibold tabular-nums">
                        +{toArabicNum(ADDON_PRICES[a])} ج.م
                      </span>
                    </div>
                  ))}
                </div>
                {/* Divider */}
                <div className="my-3 h-px bg-primary-200 dark:bg-primary-700/40" />
                {/* Grand total */}
                <div className="flex items-end justify-between">
                  <span className="font-bold text-[var(--surface-ink)]">الإجمالي</span>
                  <div className="text-end">
                    <span
                      key={total}
                      className="text-3xl font-extrabold tabular-nums text-primary-600"
                    >
                      {toArabicNum(total)}
                    </span>
                    <span className="ms-1 text-base font-semibold text-[var(--text-muted)]">
                      ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  أي ملاحظات أخرى؟{" "}
                  <span className="text-xs font-normal text-[var(--text-muted)]">
                    (اختياري)
                  </span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="أي تفاصيل إضافية تحب تضيفها…"
                  className="w-full resize-y rounded-xl border border-[var(--surface-border)] bg-[var(--surface-bg)] px-4 py-2.5 text-sm leading-relaxed placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>

              {/* Form error */}
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {formError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-primary-600 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ArrowLeft size={18} />
                )}
                {submitting ? "جاري الإرسال…" : "ابعت الطلب"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--surface-border)] bg-[var(--surface-canvas)] px-5 py-8 text-center text-sm text-[var(--text-muted)]">
        <p>
          © ستوكيفاي ٢٠٢٦ — نبنيلك موقعك بمواصفاتك.{" "}
          <Link href="/login?back=1" className="text-primary-500 hover:underline">
            شوف مثال حي
          </Link>
        </p>
      </footer>
    </div>
  );
}
