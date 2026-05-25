export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10 animate-pulse">
      {/* Page header */}
      <div className="space-y-3">
        <div className="h-2.5 w-20 rounded-full bg-[var(--surface-card)]" />
        <div className="h-11 w-52 rounded-xl bg-[var(--surface-card)]" />
        <div className="h-2.5 w-64 rounded-full bg-[var(--surface-card)]" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border-soft)] p-5 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-20 rounded-full bg-[var(--surface-border-soft)]" />
              <div className="h-8 w-8 rounded-xl bg-[var(--surface-border-soft)]" />
            </div>
            <div className="h-9 w-28 rounded-lg bg-[var(--surface-border-soft)]" />
            <div className="h-2 w-16 rounded-full bg-[var(--surface-border-soft)]" />
          </div>
        ))}
      </div>

      {/* Secondary section divider */}
      <div className="h-px w-full bg-[var(--surface-border-soft)] rounded-full" />

      {/* Recent activity rows */}
      <div className="space-y-3">
        <div className="h-2.5 w-32 rounded-full bg-[var(--surface-card)]" />
        <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border-soft)] divide-y divide-[var(--surface-border-soft)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="h-9 w-9 rounded-full bg-[var(--surface-border-soft)] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-40 rounded-full bg-[var(--surface-border-soft)]" />
                <div className="h-2 w-24 rounded-full bg-[var(--surface-border-soft)]" />
              </div>
              <div className="h-2.5 w-16 rounded-full bg-[var(--surface-border-soft)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
