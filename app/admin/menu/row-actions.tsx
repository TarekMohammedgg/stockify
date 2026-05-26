"use client";

import Link from "next/link";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useTransition } from "react";
import {
  deleteMenuItem,
  toggleMenuItemAvailability,
} from "@/lib/actions/admin";

export function MenuRowActions({
  id,
  isAvailable,
}: {
  id: string;
  isAvailable: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
      <button
        type="button"
        title={isAvailable ? "إخفاء" : "إظهار"}
        aria-label={isAvailable ? "إخفاء" : "إظهار"}
        disabled={pending}
        onClick={() =>
          start(async () => {
            await toggleMenuItemAvailability(id, !isAvailable);
          })
        }
        className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
      >
        {isAvailable ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>
      <Link
        href={`/admin/menu/${id}`}
        className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-input)] hover:text-primary-600 transition-colors"
        title="تعديل"
        aria-label="تعديل"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        title="حذف"
        aria-label="حذف"
        disabled={pending}
        onClick={() => {
          if (!confirm("هل أنت متأكد من حذف هذا الصنف؟")) return;
          start(async () => {
            await deleteMenuItem(id);
          });
        }}
        className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
