import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[var(--surface-bg)] px-4">
      <div className="flex items-center gap-3">
        <UtensilsCrossed className="h-12 w-12 text-primary-500" />
        <h1 className="text-4xl font-bold text-[var(--text-primary)]">Stockify</h1>
      </div>
      <p className="text-center text-lg text-[var(--text-muted)]">
        منيو المطعم والطلبات — سيتم بناؤها في المرحلة الرابعة
      </p>
      <Link
        href="/login"
        className="rounded-xl bg-primary-500 px-8 py-3 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
      >
        تسجيل الدخول
      </Link>
    </div>
  );
}
