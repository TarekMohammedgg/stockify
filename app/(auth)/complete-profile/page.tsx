"use client";

import { useState } from "react";
import { completeProfile } from "@/lib/actions/auth";
import { CheckCircle } from "lucide-react";

export default function CompleteProfilePage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await completeProfile(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--surface-bg)] px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-[var(--surface-card)] p-8 shadow-lg border border-[var(--surface-border)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">أكمل ملفك الشخصي</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            نحتاج بعض المعلومات الإضافية لإتمام حسابك
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-secondary)]">
              رقم الهاتف <span className="text-red-500">*</span>
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
            <label htmlFor="address" className="block text-sm font-medium text-[var(--text-secondary)]">
              عنوان التوصيل (اختياري)
            </label>
            <input
              id="address"
              name="address"
              type="text"
              autoComplete="street-address"
              placeholder="الشارع، الحي، المدينة"
              className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface-input)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            {pending ? "جارٍ الحفظ..." : "حفظ والمتابعة"}
          </button>
        </form>
      </div>
    </div>
  );
}
