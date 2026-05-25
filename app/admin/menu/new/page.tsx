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
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-8">
      <Link
        href="/admin/menu"
        className="inline-flex items-center gap-2 text-xs eyebrow text-[var(--text-muted)] hover:text-primary-600 transition-colors"
      >
        <ArrowRight className="h-3.5 w-3.5" />
        رجوع للمنيو
      </Link>
      <header className="rise-in">
        <p className="eyebrow mb-3">إضافة جديدة</p>
        <h1 className="font-display text-4xl md:text-5xl text-[var(--text-primary)] leading-tight">
          صنف جديد
        </h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          اكتب التفاصيل بكلتا اللغتين، اربط المكوّنات، ثم احفظ.
        </p>
      </header>
      <div className="rise-in rounded-3xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] p-8" style={{ animationDelay: "100ms" }}>
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
