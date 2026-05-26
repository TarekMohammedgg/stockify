export default function DeliveryLoading() {
  return (
    <div className="space-y-4">
      {/* Page title skeleton */}
      <div className="mb-5">
        <div className="h-8 w-36 rounded-xl bg-[var(--surface-card)] animate-pulse mb-4" />
        {/* Filter tabs skeleton */}
        <div className="flex gap-1.5 flex-wrap">
          {[80, 96, 100, 80, 72].map((w, i) => (
            <div
              key={i}
              className="h-8 rounded-full bg-[var(--surface-card)] animate-pulse"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>

      {/* Order card skeletons */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-[var(--surface-card)] rounded-2xl border border-[var(--surface-border-soft)] border-s-4 border-s-[var(--surface-border)] p-4 space-y-3 animate-pulse"
        >
          {/* Card header row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-14 rounded-full bg-[var(--surface-input)]" />
              <div className="h-5 w-20 rounded-full bg-[var(--surface-input)]" />
            </div>
            <div className="h-4 w-16 rounded-full bg-[var(--surface-input)]" />
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--surface-border-soft)]" />

          {/* Items lines */}
          <div className="space-y-1.5">
            <div className="h-4 w-3/4 rounded-lg bg-[var(--surface-input)]" />
            <div className="h-4 w-1/2 rounded-lg bg-[var(--surface-input)]" />
          </div>

          {/* Customer / address lines */}
          <div className="space-y-1.5">
            <div className="h-3.5 w-2/5 rounded-lg bg-[var(--surface-input)]" />
            <div className="h-3.5 w-3/5 rounded-lg bg-[var(--surface-input)]" />
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--surface-border-soft)]" />

          {/* Action buttons skeleton */}
          <div className="flex gap-2 pt-1">
            <div className="h-9 flex-1 rounded-xl bg-[var(--surface-input)]" />
            <div className="h-9 w-20 rounded-xl bg-[var(--surface-input)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
