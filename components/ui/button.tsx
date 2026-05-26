import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "default",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses =
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    // Variant classes
    const variants = {
      primary:
        "bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500",
      secondary:
        "bg-[var(--surface-input)] text-[var(--text-primary)] hover:bg-[var(--surface-border)]",
      ghost:
        "hover:bg-[var(--surface-input)] hover:text-[var(--text-primary)] text-[var(--text-secondary)]",
      destructive:
        "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500",
      outline:
        "border border-[var(--surface-border)] bg-transparent hover:bg-[var(--surface-input)] text-[var(--text-primary)]",
    }

    // Size classes
    const sizes = {
      default: "h-11 px-5 py-2",
      sm: "h-9 px-4 py-1 text-sm rounded-lg",
      lg: "h-12 px-8 text-lg rounded-2xl",
      icon: "h-11 w-11",
    }

    const mergedClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

    return (
      <button
        className={mergedClasses}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="me-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
