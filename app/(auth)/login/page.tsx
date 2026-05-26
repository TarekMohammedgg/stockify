"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, signInWithGoogle } from "@/lib/actions/auth";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setFieldError(null);
    const result = await signIn(new FormData(e.currentTarget));
    if (result?.error) {
      setFieldError(result.error);
      setPending(false);
    }
  }

  async function handleGoogle() {
    setPending(true);
    await signInWithGoogle();
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--surface-bg)] px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-[var(--surface-card)] p-8 shadow-lg border border-[var(--surface-border)]">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">مرحباً بك</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">سجّل دخولك للمتابعة</p>
        </div>

        {/* Error banner */}
        {(fieldError || urlError) && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {fieldError ??
              (urlError === "oauth_not_allowed_for_staff"
                ? "حسابات الموظفين (مدير، كاشير، مندوب توصيل) لا تدعم تسجيل الدخول بجوجل، استخدم البريد وكلمة المرور"
                : "حدث خطأ، حاول مجدداً")}
          </div>
        )}

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={pending}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-input)] disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          المتابعة بـ Google
        </button>

        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <div className="h-px flex-1 bg-[var(--surface-border)]" />
          أو بالبريد الإلكتروني
          <div className="h-px flex-1 bg-[var(--surface-border)]" />
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)]">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="example@email.com"
              dir="ltr"
              className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-input)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)]">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                dir="ltr"
                className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-input)] px-4 py-3 pe-12 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 end-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {pending ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-muted)]">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-medium text-primary-500 hover:text-primary-600">
            إنشاء حساب
          </Link>
        </p>
      </div>
    </div>
  );
}
