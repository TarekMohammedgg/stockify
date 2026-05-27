export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-6 animate-pulse">
      <div className="h-8 w-40 rounded-xl bg-[var(--surface-card)]" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-[var(--surface-card)]" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 rounded-2xl bg-[var(--surface-card)]" />
        ))}
      </div>
    </div>
  );
}
