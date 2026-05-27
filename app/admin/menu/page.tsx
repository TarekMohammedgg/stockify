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

  // Group by category for editorial sectioning
  const groups = new Map<string, typeof items>();
  (items ?? []).forEach((it) => {
    const key = it.category_ar ?? "—";
    const arr = groups.get(key) ?? [];
    arr.push(it);
    groups.set(key, arr as typeof items);
  });

  const availableCount = items?.filter((i) => i.is_available).length ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      <header className="rise-in flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-3">قائمة الطعام</p>
          <h1 className="font-display text-4xl md:text-5xl text-[var(--text-primary)] leading-tight">
            المنيو
          </h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            <span className="numeric text-[var(--text-primary)]">{items?.length ?? 0}</span>{" "}
            صنف ·{" "}
            <span className="numeric text-emerald-700 dark:text-emerald-400">{availableCount}</span>{" "}
            متاحة الآن
          </p>
        </div>
        <Link
          href="/admin/menu/new"
          className="group inline-flex items-center gap-3 rounded-full bg-[var(--surface-ink)] px-6 py-3 text-sm font-medium text-[var(--surface-bg)] transition-all hover:gap-4 hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" />
          إضافة صنف جديد
        </Link>
      </header>

      {!items || items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-12">
          {Array.from(groups.entries()).map(([category, rows], catIdx) => {
            const sectionDelay = (catIdx + 1) * 100;
            return (
              <section
                key={category}
                className="rise-in"
                style={{ animationDelay: `${sectionDelay}ms` }}
              >
                {/* Category divider */}
                <div className="mb-5 flex items-baseline gap-4">
                  <h2 className="font-display text-lg text-[var(--text-primary)] whitespace-nowrap">
                    {category}
                  </h2>
                  <div className="flex-1 h-px bg-[var(--surface-border-soft)]" />
                  <span className="eyebrow numeric">
                    {(rows?.length ?? 0).toString().padStart(2, "0")}
                  </span>
                </div>

                <ul className="space-y-2">
                  {(rows ?? []).map((it, itemIdx) => {
                    const itemDelay = sectionDelay + (itemIdx * 40);
                    return (
                      <li
                        key={it.id}
                        style={{ animationDelay: `${itemDelay}ms` }}
                        className="lift rise-in group grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-5 rounded-2xl border border-[var(--surface-border-soft)] bg-[var(--surface-card)] p-4 hover:border-primary-500/40"
                      >
                    {it.photo_url ? (
                      <Image
                        src={it.photo_url}
                        alt={it.name_ar ?? ""}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-xl object-cover ring-1 ring-[var(--surface-border-soft)]"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--surface-input)]">
                        <UtensilsCrossed className="h-5 w-5 text-[var(--text-faint)]" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="font-display text-base text-[var(--text-primary)] truncate">
                        {it.name_ar}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate" dir="ltr">
                        {it.name_en}
                      </p>
                    </div>

                    <div className="text-end">
                      <p className="eyebrow mb-1">السعر</p>
                      <p className="numeric text-xl text-[var(--text-primary)]">
                        {Number(it.price).toLocaleString("en-EG")}
                        <span className="ms-1 text-[10px] tracking-widest text-[var(--text-muted)] font-display">
                          EGP
                        </span>
                      </p>
                    </div>

                    <span
                      className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${
                        it.is_available
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border-zinc-500/30 bg-zinc-500/10 text-[var(--text-muted)]"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {it.is_available ? "متاح" : "موقوف"}
                    </span>

                    <MenuRowActions
                      id={it.id!}
                      isAvailable={!!it.is_available}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rise-in rounded-3xl border border-dashed border-[var(--surface-border)] bg-[var(--surface-card)] p-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10">
        <UtensilsCrossed className="h-6 w-6 text-primary-600" />
      </div>
      <p className="font-display text-lg text-[var(--text-primary)]">
        لا توجد أصناف بعد
      </p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        ابدأ ببناء قائمتك بإضافة أول صنف
      </p>
      <Link
        href="/admin/menu/new"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
      >
        <Plus className="h-4 w-4" />
        أول صنف
      </Link>
    </div>
  );
}
