export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-10 animate-pulse">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="h-2.5 w-24 rounded-full bg-[var(--surface-card)]" />
          <div className="h-12 w-44 rounded-xl bg-[var(--surface-card)]" />
          <div className="h-2.5 w-48 rounded-full bg-[var(--surface-card)]" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-[var(--surface-card)]" />
      </div>

      {/* Search / filter bar */}
      <div className="flex gap-3">
        <div className="flex-1 h-10 rounded-xl bg-[var(--surface-card)]" />
        <div className="h-10 w-28 rounded-xl bg-[var(--surface-card)]" />
      </div>

      {/* Ingredient table */}
      <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border-soft)] overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-[var(--surface-border-soft)]">
          <div className="h-2 w-32 rounded-full bg-[var(--surface-border-soft)]" />
          <div className="flex-1" />
          <div className="h-2 w-20 rounded-full bg-[var(--surface-border-soft)]" />
          <div className="h-2 w-20 rounded-full bg-[var(--surface-border-soft)]" />
          <div className="h-2 w-16 rounded-full bg-[var(--surface-border-soft)]" />
        </div>

        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-4 border-b border-[var(--surface-border-soft)] last:border-0"
          >
            <div className="h-8 w-8 rounded-lg bg-[var(--surface-border-soft)] shrink-0" />
            <div className="flex-1 space-y-2">
              <div
                className="h-2.5 rounded-full bg-[var(--surface-border-soft)]"
                style={{ width: `${90 + (i % 3) * 30}px` }}
              />
            </div>
            <div className="h-2.5 w-16 rounded-full bg-[var(--surface-border-soft)]" />
            <div className="h-6 w-20 rounded-full bg-[var(--surface-border-soft)]" />
            <div className="h-7 w-7 rounded-lg bg-[var(--surface-border-soft)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
