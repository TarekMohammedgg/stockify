import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Plus, UtensilsCrossed } from "lucide-react";
import { MenuRowActions } from "./row-actions";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("v_menu")
    .select("id, name_ar, name_en, category_ar, price, photo_url, is_available")
    .order("category_ar", { ascending: true });

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">المنيو</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {items?.length ?? 0} صنف
          </p>
        </div>
        <Link
          href="/admin/menu/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          إضافة صنف
        </Link>
      </header>

      {!items || items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-input)] text-[var(--text-muted)]">
              <tr className="text-start">
                <th className="px-4 py-3 text-start font-medium">الصنف</th>
                <th className="px-4 py-3 text-start font-medium">التصنيف</th>
                <th className="px-4 py-3 text-start font-medium">السعر</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-start font-medium w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-border)]">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-[var(--surface-input)]/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {it.photo_url ? (
                        <Image
                          src={it.photo_url}
                          alt={it.name_ar ?? ""}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover h-10 w-10"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-[var(--surface-input)] flex items-center justify-center">
                          <UtensilsCrossed className="h-4 w-4 text-[var(--text-muted)]" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {it.name_ar}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {it.name_en}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {it.category_ar}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-primary)] font-medium">
                    {Number(it.price).toLocaleString("ar-EG")} ج.م
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        it.is_available
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-zinc-500/10 text-zinc-500"
                      }`}
                    >
                      {it.is_available ? "متاح" : "غير متاح"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <MenuRowActions
                      id={it.id!}
                      isAvailable={!!it.is_available}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--surface-border)] p-12 text-center">
      <UtensilsCrossed className="mx-auto h-10 w-10 text-[var(--text-muted)]" />
      <p className="mt-3 text-sm text-[var(--text-muted)]">لا توجد أصناف بعد</p>
    </div>
  );
}
