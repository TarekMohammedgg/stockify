"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await signUp(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--surface-bg)] px-4 py-8">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-[var(--surface-card)] p-8 shadow-lg border border-[var(--surface-border)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">إنشاء حساب جديد</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">انضم إلينا وابدأ الطلب الآن</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)]">
              الاسم الكامل
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="محمد أحمد"
              className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-input)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-secondary)]">
              رقم الهاتف
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="01XXXXXXXXX"
              dir="ltr"
              className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-input)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

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
                minLength={8}
                autoComplete="new-password"
                placeholder="٨ أحرف على الأقل"
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
            <UserPlus className="h-4 w-4" />
            {pending ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-muted)]">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-medium text-primary-500 hover:text-primary-600">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
