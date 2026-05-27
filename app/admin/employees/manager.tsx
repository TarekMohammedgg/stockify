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
  createDeliveryEmployee,
  updateCashier,
  setCashierActive,
  deleteCashier,
} from "@/lib/actions/admin";

type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "cashier" | "delivery";
  is_active: boolean;
};

type FilterTab = "all" | "cashier" | "delivery";

const ROLE_LABEL: Record<"cashier" | "delivery", string> = {
  cashier: "كاشير",
  delivery: "توصيل",
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export function EmployeesManager({ employees }: { employees: Employee[] }) {
  const [open, setOpen] = useState<{ employee: Employee | null; role: "cashier" | "delivery" } | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");

  const filtered =
    filter === "all" ? employees : employees.filter((e) => e.role === filter);

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "الكل", count: employees.length },
    {
      key: "cashier",
      label: "كاشير",
      count: employees.filter((e) => e.role === "cashier").length,
    },
    {
      key: "delivery",
      label: "توصيل",
      count: employees.filter((e) => e.role === "delivery").length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Top bar: filters + add button ─────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Filter tabs */}
        <div className="inline-flex items-center gap-1 rounded-full border border-[var(--surface-border-soft)] bg-[var(--surface-input)] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ease-out cursor-pointer ${
                filter === tab.key
                  ? "bg-[var(--surface-ink)] text-[var(--surface-bg)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-canvas)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
              <span
                className={`numeric text-xs rounded-full px-1.5 py-0.5 ${
                  filter === tab.key
                    ? "bg-white/20 text-[var(--surface-bg)]"
                    : "bg-[var(--surface-border-soft)] text-[var(--text-muted)]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Add buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen({ employee: null, role: "cashier" })}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-border-soft)] bg-[var(--surface-input)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-all hover:bg-primary-500/10 hover:border-primary-400 hover:text-primary-700 dark:hover:text-primary-300 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            إضافة كاشير
          </button>
          <button
            type="button"
            onClick={() => setOpen({ employee: null, role: "delivery" })}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-ink)] px-4 py-2 text-sm font-medium text-[var(--surface-bg)] transition-all hover:bg-primary-600 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            إضافة مندوب توصيل
          </button>
        </div>
      </div>

      {/* ── Employee grid ──────────────────────────────────── */}
      {filtered.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((emp, idx) => {
            const itemDelay = idx * 40;
            return (
              <li
                key={emp.id}
                style={{ animationDelay: `${itemDelay}ms` }}
                className="lift rise-in group rounded-2xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] p-5 hover:border-primary-500/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/15 font-display text-lg text-primary-700 dark:text-primary-300 transition-transform duration-300 group-hover:scale-105">
                      {initials(emp.name) || "؟"}
                      <span
                        className={`absolute -bottom-0.5 -end-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-[var(--surface-card)] ${
                          emp.is_active ? "bg-emerald-500" : "bg-zinc-400"
                        }`}
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-display text-base text-[var(--text-primary)] truncate">
                          {emp.name}
                        </p>
                        <RoleBadge role={emp.role} />
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate" dir="ltr">
                        {emp.email}
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
                      {emp.phone || "—"}
                    </p>
                  </div>
                  <RowActions employee={emp} onEdit={() => setOpen({ employee: emp, role: emp.role })} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {filtered.length === 0 && employees.length > 0 && (
        <p className="text-center text-sm text-[var(--text-muted)] py-10">
          لا يوجد موظفون في هذه الفئة
        </p>
      )}

      {/* ── Dialog ────────────────────────────────────────── */}
      {open && (
        <EmployeeDialog
          employee={open.employee}
          role={open.role}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: "cashier" | "delivery" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
        role === "cashier"
          ? "bg-primary-500/10 text-primary-700 dark:text-primary-300"
          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      }`}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}

function RowActions({
  employee,
  onEdit,
}: {
  employee: Employee;
  onEdit: () => void;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-1 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out">
      <button
        type="button"
        onClick={onEdit}
        title="تعديل"
        aria-label="تعديل"
        className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-primary-600 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={pending}
        title={employee.is_active ? "إيقاف" : "تفعيل"}
        aria-label={employee.is_active ? "إيقاف" : "تفعيل"}
        onClick={() =>
          start(async () => {
            await setCashierActive(employee.id, !employee.is_active);
          })
        }
        className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
      >
        {employee.is_active ? (
          <PowerOff className="h-4 w-4" />
        ) : (
          <Power className="h-4 w-4" />
        )}
      </button>
      <button
        type="button"
        disabled={pending}
        title="حذف"
        aria-label="حذف"
        onClick={() => {
          if (
            !confirm(
              `حذف ${ROLE_LABEL[employee.role]} ${employee.name}؟ هذا الإجراء نهائي`,
            )
          )
            return;
          start(async () => {
            const res = await deleteCashier(employee.id);
            if (res?.error) alert(res.error);
          });
        }}
        className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function EmployeeDialog({
  employee,
  role,
  onClose,
}: {
  employee: Employee | null;
  role: "cashier" | "delivery";
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      let res;
      if (employee) {
        res = await updateCashier(employee.id, fd);
      } else if (role === "delivery") {
        res = await createDeliveryEmployee(fd);
      } else {
        res = await createCashier(fd);
      }
      if (res?.error) setError(res.error);
      else onClose();
    });
  }

  const isNew = !employee;
  const dialogTitle = isNew
    ? role === "cashier"
      ? "كاشير جديد"
      : "مندوب توصيل جديد"
    : employee.name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-ink)]/50 backdrop-fade p-4"
      onClick={onClose}
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-[var(--surface-card)] overflow-hidden shadow-2xl border border-[var(--surface-border-soft)] slide-up"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--surface-border-soft)] bg-[var(--surface-canvas)]/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="eyebrow">{employee ? "تعديل" : "إضافة"}</p>
              <RoleBadge role={employee?.role ?? role} />
            </div>
            <h2 className="font-display text-lg text-[var(--text-primary)]">
              {dialogTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="إغلاق"
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

          <Field label="الاسم" name="name" defaultValue={employee?.name} required />

          {isNew && (
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
            defaultValue={employee?.phone}
          />

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[var(--surface-border)] px-5 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-input)] transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-ink)] px-5 py-2.5 text-sm font-medium text-[var(--surface-bg)] hover:bg-primary-600 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {employee ? "حفظ" : "إنشاء"}
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
