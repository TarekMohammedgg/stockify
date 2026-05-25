import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { MenuForm } from "../menu-form";

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: item },
    { data: categories },
    { data: allergens },
    { data: ingredients },
    { data: itemAllergens },
    { data: itemIngredients },
  ] = await Promise.all([
    supabase.from("menu_items").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name_ar, name_en").order("sort_order"),
    supabase.from("allergens").select("id, name_ar, name_en").order("name_ar"),
    supabase.from("ingredients").select("id, name_ar, unit").order("name_ar"),
    supabase.from("menu_item_allergens").select("allergen_id").eq("menu_item_id", id),
    supabase
      .from("menu_item_ingredients")
      .select("ingredient_id, quantity")
      .eq("menu_item_id", id),
  ]);

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-8">
      <Link
        href="/admin/menu"
        className="inline-flex items-center gap-2 text-xs eyebrow text-[var(--text-muted)] hover:text-primary-600 transition-colors"
      >
        <ArrowRight className="h-3.5 w-3.5" />
        رجوع للمنيو
      </Link>
      <header className="rise-in">
        <p className="eyebrow mb-3">تعديل صنف</p>
        <h1 className="font-display text-4xl md:text-5xl text-[var(--text-primary)] leading-tight">
          {item.name_ar}
        </h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]" dir="ltr">
          {item.name_en}
        </p>
      </header>
      <div className="rise-in rounded-3xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] p-8" style={{ animationDelay: "100ms" }}>
        <MenuForm
          item={item}
          categories={categories ?? []}
          allergens={allergens ?? []}
          ingredients={ingredients ?? []}
          selectedAllergenIds={(itemAllergens ?? []).map((r) => r.allergen_id)}
          selectedIngredients={(itemIngredients ?? []).map((r) => ({
            id: r.ingredient_id,
            quantity: Number(r.quantity),
          }))}
        />
      </div>
    </div>
  );
}
