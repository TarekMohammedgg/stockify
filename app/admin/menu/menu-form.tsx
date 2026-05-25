"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import { saveMenuItem } from "@/lib/actions/admin";

type Category = { id: string; name_ar: string; name_en: string };
type Allergen = { id: string; name_ar: string; name_en: string };
type Ingredient = { id: string; name_ar: string; unit: string };

type MenuFormItem = {
  id: string;
  name_ar: string;
  name_en: string;
  category_id: string | null;
  price: number;
  photo_url: string | null;
  is_available: boolean;
};

export type IngredientRow = { id: string; quantity: number };

export function MenuForm({
  item,
  categories,
  allergens,
  ingredients,
  selectedAllergenIds,
  selectedIngredients,
}: {
  item: MenuFormItem | null;
  categories: Category[];
  allergens: Allergen[];
  ingredients: Ingredient[];
  selectedAllergenIds: string[];
  selectedIngredients: IngredientRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [allergenIds, setAllergenIds] = useState<string[]>(selectedAllergenIds);
  const [rows, setRows] = useState<IngredientRow[]>(
    selectedIngredients.length > 0
      ? selectedIngredients
      : [{ id: "", quantity: 1 }],
  );

  function toggleAllergen(id: string) {
    setAllergenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function updateRow(idx: number, patch: Partial<IngredientRow>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { id: "", quantity: 1 }]);
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("allergen_ids", allergenIds.join(","));
    fd.set(
      "ingredients",
      JSON.stringify(rows.filter((r) => r.id && r.quantity > 0)),
    );
    start(async () => {
      const res = await saveMenuItem(item?.id ?? null, fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <Section title="التسمية" subtitle="بالعربية والإنجليزية">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="بالعربية"
            name="name_ar"
            defaultValue={item?.name_ar}
            required
          />
          <Field
            label="بالإنجليزية"
            name="name_en"
            defaultValue={item?.name_en}
            required
            dir="ltr"
          />
        </div>
      </Section>

      <Section title="التصنيف والسعر">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="eyebrow block mb-2">التصنيف</label>
            <select
              name="category_id"
              defaultValue={item?.category_id ?? ""}
              required
              className="w-full rounded-xl border border-[var(--surface-border-soft)] bg-[var(--surface-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
            >
              <option value="" disabled>
                اختر التصنيف
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_ar}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="السعر (ج.م)"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={item?.price?.toString()}
            required
          />
        </div>
      </Section>

      <Section title="الصورة" subtitle="رابط Unsplash يُفضّل">
        <Field
          label="رابط الصورة"
          name="photo_url"
          defaultValue={item?.photo_url ?? ""}
          dir="ltr"
        />
      </Section>

      <Section title="المكوّنات" subtitle="ربط بالمخزون لتتبّع الاستهلاك">
        <div className="space-y-2">
          {rows.map((row, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="font-serif numeric text-xs text-[var(--text-faint)] w-6">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <select
                value={row.id}
                onChange={(e) => updateRow(idx, { id: e.target.value })}
                className="flex-1 rounded-xl border border-[var(--surface-border-soft)] bg-[var(--surface-input)] px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="">اختر مكوّناً</option>
                {ingredients.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name_ar} ({i.unit})
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                min="0"
                value={row.quantity}
                onChange={(e) =>
                  updateRow(idx, { quantity: Number(e.target.value) })
                }
                className="w-28 rounded-xl border border-[var(--surface-border-soft)] bg-[var(--surface-input)] px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                placeholder="الكمية"
              />
              <button
                type="button"
                onClick={() => removeRow(idx)}
                className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[var(--surface-border)] px-4 py-2 text-xs eyebrow text-[var(--text-secondary)] hover:border-primary-500/40 hover:text-primary-600 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> إضافة مكوّن
          </button>
        </div>
      </Section>

      <Section title="مسببات الحساسية" subtitle="ستظهر للعميل كعلامات">
        <div className="flex flex-wrap gap-2">
          {allergens.map((a) => {
            const active = allergenIds.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAllergen(a.id)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-primary-500 bg-primary-500 text-white"
                    : "border-[var(--surface-border)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:border-primary-500/50 hover:text-primary-600"
                }`}
              >
                {a.name_ar}
              </button>
            );
          })}
        </div>
      </Section>

      <div className="rounded-2xl border border-[var(--surface-border-soft)] bg-[var(--surface-canvas)]/50 p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_available"
            defaultChecked={item?.is_available ?? true}
            className="h-4 w-4 rounded border-[var(--surface-border)] text-primary-500 focus:ring-primary-500/30"
          />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            متاح للطلب الآن
          </span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--surface-border-soft)]">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-[var(--surface-border)] px-5 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-input)] transition-colors"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-ink)] px-6 py-2.5 text-sm font-medium text-[var(--surface-bg)] hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {item ? "حفظ التعديلات" : "إضافة الصنف"}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:gap-8">
      <div>
        <h3 className="font-display text-base text-[var(--text-primary)]">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>
        )}
      </div>
      <div>{children}</div>
    </section>
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
    </div>
  );
}
