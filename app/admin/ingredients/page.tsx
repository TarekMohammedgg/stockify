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

  // Build ingredient_id → list of menu_item names
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
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">المخزون</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {ingredients?.length ?? 0} مكون
            {lowCount > 0 && (
              <span className="ms-2 inline-flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                {lowCount} يحتاج إعادة تموين
              </span>
            )}
          </p>
        </div>
      </header>

      {!ingredients || ingredients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--surface-border)] p-12 text-center">
          <Carrot className="mx-auto h-10 w-10 text-[var(--text-muted)]" />
          <p className="mt-3 text-sm text-[var(--text-muted)]">لا توجد مكونات بعد</p>
        </div>
      ) : (
        <IngredientsManager
          initial={ingredients.map((i) => ({
            ...i,
            stock_quantity: Number(i.stock_quantity),
            low_stock_threshold: Number(i.low_stock_threshold),
            used_in: usageMap[i.id] ?? [],
          }))}
        />
      )}
    </div>
  );
}
