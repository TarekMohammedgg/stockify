export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-10 animate-pulse">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="h-2.5 w-24 rounded-full bg-[var(--surface-card)]" />
          <div className="h-12 w-40 rounded-xl bg-[var(--surface-card)]" />
          <div className="h-2.5 w-44 rounded-full bg-[var(--surface-card)]" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-[var(--surface-card)]" />
      </div>

      {/* Employee cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border-soft)] p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="h-11 w-11 rounded-full bg-[var(--surface-border-soft)] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 rounded-full bg-[var(--surface-border-soft)]" />
                <div className="h-2.5 w-20 rounded-full bg-[var(--surface-border-soft)]" />
              </div>
            </div>
            <div className="h-px bg-[var(--surface-border-soft)]" />
            <div className="flex items-center justify-between">
              <div className="h-6 w-16 rounded-full bg-[var(--surface-border-soft)]" />
              <div className="h-7 w-7 rounded-lg bg-[var(--surface-border-soft)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
