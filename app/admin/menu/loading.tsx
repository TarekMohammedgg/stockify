export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10 animate-pulse">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="h-2.5 w-24 rounded-full bg-[var(--surface-card)]" />
          <div className="h-12 w-40 rounded-xl bg-[var(--surface-card)]" />
          <div className="h-2.5 w-52 rounded-full bg-[var(--surface-card)]" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-[var(--surface-card)]" />
      </div>

      {/* Category section 1 */}
      {Array.from({ length: 2 }).map((_, gi) => (
        <div key={gi} className="space-y-4">
          {/* Category label */}
          <div className="flex items-center gap-4">
            <div className="h-2.5 w-28 rounded-full bg-[var(--surface-card)]" />
            <div className="flex-1 h-px bg-[var(--surface-border-soft)]" />
            <div className="h-2 w-12 rounded-full bg-[var(--surface-card)]" />
          </div>

          {/* Menu item rows */}
          <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border-soft)] divide-y divide-[var(--surface-border-soft)]">
            {Array.from({ length: gi === 0 ? 4 : 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                {/* Thumbnail */}
                <div className="h-14 w-14 rounded-xl bg-[var(--surface-border-soft)] shrink-0" />
                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-36 rounded-full bg-[var(--surface-border-soft)]" />
                  <div className="h-2.5 w-24 rounded-full bg-[var(--surface-border-soft)]" />
                </div>
                {/* Price */}
                <div className="h-3 w-16 rounded-full bg-[var(--surface-border-soft)]" />
                {/* Badge */}
                <div className="h-6 w-14 rounded-full bg-[var(--surface-border-soft)]" />
                {/* Actions */}
                <div className="h-7 w-7 rounded-lg bg-[var(--surface-border-soft)]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
