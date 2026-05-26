import * as React from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "./button"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center px-4 border border-dashed border-[var(--surface-border)] rounded-2xl bg-[var(--surface-card)]/50 ${className}`}>
      {Icon && <Icon className="mb-4 h-12 w-12 text-[var(--text-muted)] opacity-50" />}
      <h3 className="mb-2 font-display text-lg font-bold text-[var(--text-primary)]">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm text-[var(--text-secondary)]">{description}</p>}
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  )
}

export function ErrorState({
  title = "حدث خطأ ما",
  description = "لم نتمكن من تحميل البيانات. يرجى المحاولة مرة أخرى.",
  onRetry,
  className = "",
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center px-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 ${className}`}>
      <AlertCircle className="mb-4 h-10 w-10 text-red-500" />
      <h3 className="mb-2 font-display text-lg font-bold text-red-800 dark:text-red-400">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-red-600 dark:text-red-500/80">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50">
          إعادة المحاولة
        </Button>
      )}
    </div>
  )
}

export function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--surface-border)]/50 ${className}`}
      {...props}
    />
  )
}
