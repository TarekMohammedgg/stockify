import * as React from "react"

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={`h-5 w-5 rounded border-[var(--surface-border)] bg-[var(--surface-input)] text-primary-500 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Checkbox.displayName = "Checkbox"
