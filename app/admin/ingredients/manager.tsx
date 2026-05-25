"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Plus, X, Loader2, AlertTriangle } from "lucide-react";
import {
  saveIngredient,
  deleteIngredient,
} from "@/lib/actions/admin";

type Unit = "kg" | "liter" | "piece" | "gram" | "ml";

type Ingredient = {
  id: string;
  name_ar: string;
  name_en: string;
  stock_quantity: number;
  unit: Unit;
  low_stock_threshold: number;
  used_in: string[];
};

const UNIT_LABELS: Record<Unit, string> = {
  kg: "كجم",
  liter: "لتر",
  piece: "قطعة",
  gram: "جرام",
  ml: "مل",
};

export function IngredientsManager({ initial }: { initial: Ingredient[] }) {
  const [editing, setEditing] = useState<Ingredient | "new" | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-input)] text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3 text-start font-medium">المكون</th>
              <th className="px-4 py-3 text-start font-medium">المخزون</th>
              <th className="px-4 py-3 text-start font-medium">حد التنبيه</th>
              <th className="px-4 py-3 text-start font-medium">يُستخدم في</th>
              <th className="px-4 py-3 text-start font-medium w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--surface-border)]">
            {initial.map((ing) => {
              const isLow = ing.stock_quantity <= ing.low_stock_threshold;
              const isOut = ing.stock_quantity === 0;
              return (
                <tr key={ing.id} className="hover:bg-[var(--surface-input)]/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--text-primary)]">
                      {ing.name_ar}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {ing.name_en}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${
                        isOut
                          ? "bg-red-500/10 text-red-600"
                          : isLow
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-emerald-500/10 text-emerald-700"
                      }`}
                    >
                      {(isOut || isLow) && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {ing.stock_quantity} {UNIT_LABELS[ing.unit]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {ing.low_stock_threshold} {UNIT_LABELS[ing.unit]}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {ing.used_in.length === 0 ? (
                      <span className="text-[var(--text-muted)]">—</span>
                    ) : (
                      <span title={ing.used_in.join("، ")}>
                        {ing.used_in.length} صنف
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <RowActions
                      ing={ing}
                      onEdit={() => setEditing(ing)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <aside>
        {editing ? (
          <IngredientForm
            key={editing === "new" ? "new" : editing.id}
            ingredient={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="w-full rounded-2xl border-2 border-dashed border-[var(--surface-border)] p-8 text-sm text-[var(--text-muted)] hover:border-primary-500/40 hover:text-primary-600 transition-colors flex flex-col items-center gap-2"
          >
            <Plus className="h-6 w-6" />
            إضافة مكون جديد
          </button>
        )}
      </aside>
    </div>
  );
}

function RowActions({
  ing,
  onEdit,
}: {
  ing: Ingredient;
  onEdit: () => void;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-input)]"
        title="تعديل"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (ing.used_in.length > 0) {
            alert(`لا يمكن حذف ${ing.name_ar}: مستخدم في ${ing.used_in.length} صنف`);
            return;
          }
          if (!confirm(`حذف ${ing.name_ar}؟`)) return;
          start(async () => {
            await deleteIngredient(ing.id);
          });
        }}
        className="rounded-lg p-2 text-red-600 hover:bg-red-500/10 disabled:opacity-50"
        title="حذف"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function IngredientForm({
  ingredient,
  onClose,
}: {
  ingredient: Ingredient | null;
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await saveIngredient(ingredient?.id ?? null, fd);
      if (res?.error) setError(res.error);
      else onClose();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-5 space-y-4 sticky top-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          {ingredient ? "تعديل مكون" : "مكون جديد"}
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
        <p className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      <Field label="الاسم بالعربية" name="name_ar" defaultValue={ingredient?.name_ar} required />
      <Field label="الاسم بالإنجليزية" name="name_en" defaultValue={ingredient?.name_en} required dir="ltr" />

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="الكمية"
          name="stock_quantity"
          type="number"
          step="0.01"
          min="0"
          defaultValue={ingredient?.stock_quantity?.toString() ?? "0"}
          required
        />
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            الوحدة
          </label>
          <select
            name="unit"
            defaultValue={ingredient?.unit ?? "piece"}
            className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-primary)]"
          >
            {Object.entries(UNIT_LABELS).map(([v, label]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <Field
        label="حد التنبيه (تنبيه عند الوصول لهذا الرقم)"
        name="low_stock_threshold"
        type="number"
        step="0.01"
        min="0"
        defaultValue={ingredient?.low_stock_threshold?.toString() ?? "5"}
        required
      />

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {ingredient ? "حفظ" : "إضافة"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  dir,
  step,
  min,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  dir?: "ltr" | "rtl";
  step?: string;
  min?: string;
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
        step={step}
        min={min}
        className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-primary-500"
      />
    </div>
  );
}
