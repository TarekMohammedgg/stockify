import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MenuForm } from "../menu-form";

export default async function NewMenuItemPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: allergens }, { data: ingredients }] =
    await Promise.all([
      supabase.from("categories").select("id, name_ar, name_en").order("sort_order"),
      supabase.from("allergens").select("id, name_ar, name_en").order("name_ar"),
      supabase.from("ingredients").select("id, name_ar, unit").order("name_ar"),
    ]);

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
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">صنف جديد</h1>
        <p className="text-sm text-[var(--text-muted)]">أضف صنفاً جديداً للمنيو</p>
      </header>
      <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6">
        <MenuForm
          item={null}
          categories={categories ?? []}
          allergens={allergens ?? []}
          ingredients={ingredients ?? []}
          selectedAllergenIds={[]}
          selectedIngredients={[]}
        />
      </div>
    </div>
  );
}
