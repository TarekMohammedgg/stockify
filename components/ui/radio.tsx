import * as React from "react"

export const Radio = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        type="radio"
        className={`h-5 w-5 rounded-full border-[var(--surface-border)] bg-[var(--surface-input)] text-primary-500 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Radio.displayName = "Radio"
