"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Pencil, Trash2, Plus, X, Loader2, AlertTriangle, Carrot } from "lucide-react";
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

type StockFilter = "all" | "low";

export function IngredientsManager({
  initial,
  initialFilter = "all",
}: {
  initial: Ingredient[];
  initialFilter?: StockFilter;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [editing, setEditing] = useState<Ingredient | "new" | null>(null);
  const [filter, setFilter] = useState<StockFilter>(initialFilter);

  function changeFilter(next: StockFilter) {
    setFilter(next);
    router.replace(next === "low" ? `${pathname}?filter=low` : pathname);
  }

  const lowCount = initial.filter(
    (i) => i.stock_quantity <= i.low_stock_threshold,
  ).length;

  const visible =
    filter === "low"
      ? initial.filter((i) => i.stock_quantity <= i.low_stock_threshold)
      : initial;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="rounded-3xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] overflow-hidden">
        {/* Filter toggle */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-[var(--surface-border-soft)] bg-[var(--surface-canvas)]/40">
          <button
            type="button"
            onClick={() => changeFilter("all")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-primary-500 text-white"
                : "bg-[var(--surface-input)] text-[var(--text-secondary)] hover:bg-[var(--surface-border)] hover:text-[var(--text-primary)]"
            }`}
          >
            الكل
            <span
              className={`text-xs rounded-full px-1.5 py-0.5 leading-none ${filter === "all" ? "bg-white/20" : "bg-[var(--surface-border)]"}`}
            >
              {initial.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => changeFilter("low")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === "low"
                ? "bg-amber-500 text-white"
                : "bg-[var(--surface-input)] text-[var(--text-secondary)] hover:bg-[var(--surface-border)] hover:text-[var(--text-primary)]"
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            منخفض فقط
            <span
              className={`text-xs rounded-full px-1.5 py-0.5 leading-none ${filter === "low" ? "bg-white/20" : "bg-[var(--surface-border)]"}`}
            >
              {lowCount}
            </span>
          </button>
        </div>

        {/* Ledger header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-[var(--surface-border-soft)] bg-[var(--surface-canvas)]/60">
          <span className="eyebrow">المكوّن</span>
          <span className="eyebrow">المخزون</span>
          <span className="eyebrow">حد التنبيه</span>
          <span className="eyebrow">يُستخدم في</span>
          <span className="eyebrow w-16 text-end">إجراءات</span>
        </div>

        {visible.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
            لا توجد مكوّنات في هذا التصنيف
          </div>
        ) : (
        <ul className="divide-y divide-dashed divide-[var(--surface-border-soft)]">
          {visible.map((ing, idx) => {
            const isLow = ing.stock_quantity <= ing.low_stock_threshold;
            const isOut = ing.stock_quantity === 0;
            const itemDelay = idx * 40;
            return (
              <li
                key={ing.id}
                style={{ animationDelay: `${itemDelay}ms` }}
                className="rise-in group grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-[var(--surface-canvas)]/40"
              >
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="font-serif numeric text-xs text-[var(--text-faint)] w-7 shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-sm text-[var(--text-primary)] truncate">
                      {ing.name_ar}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate" dir="ltr">
                      {ing.name_en}
                    </p>
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-300 ${
                      isOut
                        ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
                        : isLow
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {(isOut || isLow) && <AlertTriangle className="h-3 w-3 animate-pulse" />}
                    <span className="numeric">{ing.stock_quantity}</span>{" "}
                    {UNIT_LABELS[ing.unit]}
                  </span>
                </div>

                <div className="text-sm text-[var(--text-secondary)]">
                  <span className="numeric">{ing.low_stock_threshold}</span>{" "}
                  <span className="text-[var(--text-muted)]">
                    {UNIT_LABELS[ing.unit]}
                  </span>
                </div>

                <div className="text-sm text-[var(--text-secondary)]">
                  {ing.used_in.length === 0 ? (
                    <span className="text-[var(--text-faint)]">—</span>
                  ) : (
                    <span
                      title={ing.used_in.join("، ")}
                      className="numeric"
                    >
                      {ing.used_in.length}{" "}
                      <span className="font-sans text-[var(--text-muted)]">صنف</span>
                    </span>
                  )}
                </div>

                <RowActions ing={ing} onEdit={() => setEditing(ing)} />
              </li>
            );
          })}
        </ul>
        )}
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
            className="group w-full rounded-3xl border border-dashed border-[var(--surface-border)] bg-[var(--surface-card)] p-10 transition-all hover:border-primary-500/40 hover:bg-primary-500/5 flex flex-col items-center gap-4 sticky top-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-600 transition-transform group-hover:scale-110">
              <Plus className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="font-display text-base text-[var(--text-primary)]">
                مكوّن جديد
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                أضف عنصراً إلى المخزون
              </p>
            </div>
            <Carrot className="h-4 w-4 text-primary-500/40" />
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
    <div className="flex items-center gap-1 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-primary-600 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
        title="تعديل"
        aria-label="تعديل"
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
        className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
        title="حذف"
        aria-label="حذف"
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
      className="rounded-3xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] overflow-hidden sticky top-6 slide-in-start shadow-xl"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--surface-border-soft)] bg-[var(--surface-canvas)]/50">
        <div>
          <p className="eyebrow mb-1">
            {ingredient ? "تعديل" : "إضافة"}
          </p>
          <h2 className="font-display text-lg text-[var(--text-primary)]">
            {ingredient ? ingredient.name_ar : "مكوّن جديد"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-6 py-5 space-y-4">
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
            <label className="eyebrow block mb-2">الوحدة</label>
            <select
              name="unit"
              defaultValue={ingredient?.unit ?? "piece"}
              className="w-full rounded-xl border border-[var(--surface-border-soft)] bg-[var(--surface-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
            >
              {Object.entries(UNIT_LABELS).map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <Field
          label="حد التنبيه"
          hint="ينبّهك النظام عند الوصول لهذا الرقم"
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--surface-ink)] px-5 py-3 text-sm font-medium text-[var(--surface-bg)] hover:bg-primary-600 disabled:opacity-50 transition-colors mt-2"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {ingredient ? "حفظ التعديلات" : "إضافة المكوّن"}
        </button>
      </div>
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
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  dir?: "ltr" | "rtl";
  step?: string;
  min?: string;
  hint?: string;
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
        step={step}
        min={min}
        className="w-full rounded-xl border border-[var(--surface-border-soft)] bg-[var(--surface-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
      />
      {hint && (
        <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">{hint}</p>
      )}
    </div>
  );
}
