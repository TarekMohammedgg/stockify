import { createClient } from "@/lib/supabase/server";
import { Carrot, AlertTriangle } from "lucide-react";
import { IngredientsManager } from "./manager";

export const dynamic = "force-dynamic";

export default async function AdminIngredientsPage() {
  const supabase = await createClient();

  const [{ data: ingredients }, { data: usage }] = await Promise.all([
    supabase
      .from("ingredients")
      .select("id, name_ar, name_en, stock_quantity, unit, low_stock_threshold")
      .order("name_ar"),
    supabase
      .from("menu_item_ingredients")
      .select("ingredient_id, menu_items(id, name_ar)"),
  ]);

  const usageMap: Record<string, string[]> = {};
  for (const row of usage ?? []) {
    const item = row.menu_items as unknown as { name_ar: string } | null;
    if (!item) continue;
    (usageMap[row.ingredient_id] ??= []).push(item.name_ar);
  }

  const lowCount = (ingredients ?? []).filter(
    (i) => Number(i.stock_quantity) <= Number(i.low_stock_threshold),
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      <header className="rise-in flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-3">إدارة المخزون</p>
          <h1 className="font-display text-4xl md:text-5xl text-[var(--text-primary)] leading-tight">
            دفتر المخزون
          </h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            <span className="numeric text-[var(--text-primary)]">{ingredients?.length ?? 0}</span>{" "}
            مكوّن في القاعدة
            {lowCount > 0 && (
              <span className="ms-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                <span className="numeric">{lowCount}</span> يحتاج إعادة تموين
              </span>
            )}
          </p>
        </div>
      </header>

      {!ingredients || ingredients.length === 0 ? (
        <div className="rise-in rounded-3xl border border-dashed border-[var(--surface-border)] bg-[var(--surface-card)] p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10">
            <Carrot className="h-6 w-6 text-primary-600" />
          </div>
          <p className="font-display text-lg text-[var(--text-primary)]">
            لا توجد مكونات بعد
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            أضف أول مكوّن لتبدأ بإدارة المخزون
          </p>
        </div>
      ) : (
        <div className="rise-in" style={{ animationDelay: "100ms" }}>
          <IngredientsManager
            initial={ingredients.map((i) => ({
              ...i,
              stock_quantity: Number(i.stock_quantity),
              low_stock_threshold: Number(i.low_stock_threshold),
              used_in: usageMap[i.id] ?? [],
            }))}
          />
        </div>
      )}
    </div>
  );
}
