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

export function EmployeesManager({ cashiers }: { cashiers: Cashier[] }) {
  const [open, setOpen] = useState<Cashier | "new" | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen("new")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          إضافة كاشير
        </button>
      </div>

      {cashiers.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-input)] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 text-start font-medium">الاسم</th>
                <th className="px-4 py-3 text-start font-medium">البريد</th>
                <th className="px-4 py-3 text-start font-medium">الهاتف</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-start font-medium w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-border)]">
              {cashiers.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--surface-input)]/40">
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]" dir="ltr">
                    {c.email}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]" dir="ltr">
                    {c.phone || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.is_active
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-zinc-500/10 text-zinc-500"
                      }`}
                    >
                      {c.is_active ? "نشط" : "موقوف"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RowActions cashier={c} onEdit={() => setOpen(c)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-input)]"
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
        className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-input)] disabled:opacity-50"
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
          if (!confirm(`حذف الكاشير ${cashier.name}؟ هذا الإجراء نهائي`))
            return;
          start(async () => {
            const res = await deleteCashier(cashier.id);
            if (res?.error) alert(res.error);
          });
        }}
        className="rounded-lg p-2 text-red-600 hover:bg-red-500/10 disabled:opacity-50"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-[var(--surface-card)] p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {cashier ? "تعديل كاشير" : "كاشير جديد"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-input)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}

        <Field
          label="الاسم"
          name="name"
          defaultValue={cashier?.name}
          required
        />

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

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--surface-border)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-input)]"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {cashier ? "حفظ" : "إنشاء"}
          </button>
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
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        dir={dir}
        className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-primary-500"
      />
    </div>
  );
}
