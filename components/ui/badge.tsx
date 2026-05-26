import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

export function Badge({
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variants = {
    default:
      "border-transparent bg-primary-500 text-white hover:bg-primary-600",
    secondary:
      "border-transparent bg-[var(--surface-input)] text-[var(--text-secondary)] hover:bg-[var(--surface-border)]",
    destructive:
      "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    outline: "text-[var(--text-primary)] border-[var(--surface-border)]",
    success:
      "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    warning:
      "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  }

  const mergedClasses = `${baseClasses} ${variants[variant]} ${className}`

  return <div className={mergedClasses} {...props} />
}
