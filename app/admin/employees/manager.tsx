"use client";

import { useState, useTransition } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  X,
  Loader2,
  PowerOff,
  Power,
} from "lucide-react";
import {
  createCashier,
  updateCashier,
  setCashierActive,
  deleteCashier,
} from "@/lib/actions/admin";

type Cashier = {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export function EmployeesManager({ cashiers }: { cashiers: Cashier[] }) {
  const [open, setOpen] = useState<Cashier | "new" | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen("new")}
          className="group inline-flex items-center gap-3 rounded-full bg-[var(--surface-ink)] px-6 py-3 text-sm font-medium text-[var(--surface-bg)] transition-all hover:gap-4 hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          إضافة كاشير
        </button>
      </div>

      {cashiers.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {cashiers.map((c, idx) => (
            <li
              key={c.id}
              className="lift group rounded-2xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/15 font-display text-lg text-primary-700 dark:text-primary-300">
                    {initials(c.name) || "؟"}
                    <span
                      className={`absolute -bottom-0.5 -end-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-[var(--surface-card)] ${
                        c.is_active ? "bg-emerald-500" : "bg-zinc-400"
                      }`}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-base text-[var(--text-primary)] truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate" dir="ltr">
                      {c.email}
                    </p>
                  </div>
                </div>
                <span className="font-display text-[10px] tracking-[0.2em] text-[var(--text-faint)]">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 pt-4 border-t border-dashed border-[var(--surface-border-soft)]">
                <div className="min-w-0">
                  <p className="eyebrow mb-0.5">الهاتف</p>
                  <p
                    className="text-sm text-[var(--text-secondary)] truncate numeric"
                    dir="ltr"
                  >
                    {c.phone || "—"}
                  </p>
                </div>
                <RowActions cashier={c} onEdit={() => setOpen(c)} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <CashierDialog
          cashier={open === "new" ? null : open}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function RowActions({
  cashier,
  onEdit,
}: {
  cashier: Cashier;
  onEdit: () => void;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        title="تعديل"
        className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-primary-600 transition-colors"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={pending}
        title={cashier.is_active ? "إيقاف" : "تفعيل"}
        onClick={() =>
          start(async () => {
            await setCashierActive(cashier.id, !cashier.is_active);
          })
        }
        className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
      >
        {cashier.is_active ? (
          <PowerOff className="h-4 w-4" />
        ) : (
          <Power className="h-4 w-4" />
        )}
      </button>
      <button
        type="button"
        disabled={pending}
        title="حذف"
        onClick={() => {
          if (!confirm(`حذف الكاشير ${cashier.name}؟ هذا الإجراء نهائي`)) return;
          start(async () => {
            const res = await deleteCashier(cashier.id);
            if (res?.error) alert(res.error);
          });
        }}
        className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function CashierDialog({
  cashier,
  onClose,
}: {
  cashier: Cashier | null;
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = cashier
        ? await updateCashier(cashier.id, fd)
        : await createCashier(fd);
      if (res?.error) setError(res.error);
      else onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-ink)]/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-[var(--surface-card)] overflow-hidden shadow-2xl border border-[var(--surface-border-soft)] rise-in"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--surface-border-soft)] bg-[var(--surface-canvas)]/50">
          <div>
            <p className="eyebrow mb-1">
              {cashier ? "تعديل" : "إضافة"}
            </p>
            <h2 className="font-display text-lg text-[var(--text-primary)]">
              {cashier ? cashier.name : "كاشير جديد"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          )}

          <Field label="الاسم" name="name" defaultValue={cashier?.name} required />

          {!cashier && (
            <>
              <Field
                label="البريد الإلكتروني"
                name="email"
                type="email"
                dir="ltr"
                required
              />
              <Field
                label="كلمة المرور"
                name="password"
                type="password"
                required
              />
            </>
          )}

          <Field
            label="رقم الهاتف"
            name="phone"
            dir="ltr"
            defaultValue={cashier?.phone}
          />

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[var(--surface-border)] px-5 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-input)] transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-ink)] px-5 py-2.5 text-sm font-medium text-[var(--surface-bg)] hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {cashier ? "حفظ" : "إنشاء"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  dir,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        dir={dir}
        className="w-full rounded-xl border border-[var(--surface-border-soft)] bg-[var(--surface-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
      />
    </div>
  );
}
