import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <input
        className={`flex h-11 w-full rounded-xl border bg-[var(--surface-input)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${
          error
            ? "border-red-500 focus-visible:ring-red-500"
            : "border-[var(--surface-border)] focus-visible:border-primary-500 focus-visible:ring-primary-500/20"
        } ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"
