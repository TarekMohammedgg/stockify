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
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <Link
        href="/admin/menu"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <ArrowRight className="h-4 w-4" />
        رجوع للمنيو
      </Link>
      <header>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          تعديل: {item.name_ar}
        </h1>
      </header>
      <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6">
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
