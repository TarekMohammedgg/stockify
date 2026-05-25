import { signOut } from "@/lib/actions/auth";
import { ClipboardList } from "lucide-react";

export default function CashierHomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[var(--surface-bg)]">
      <div className="flex items-center gap-3 text-primary-500">
        <ClipboardList className="h-10 w-10" />
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">لوحة الكاشير</h1>
      </div>
      <p className="text-[var(--text-muted)]">سيتم بناء لوحة الكاشير في المرحلة القادمة</p>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-xl border border-[var(--surface-border)] px-6 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-input)]"
        >
          تسجيل الخروج
        </button>
      </form>
    </div>
  );
}
