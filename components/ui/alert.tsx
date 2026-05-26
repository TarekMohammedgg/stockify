import * as React from "react"
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error" | "default";
  title?: string;
  icon?: boolean;
}

export function Alert({
  className = "",
  variant = "default",
  title,
  icon = true,
  children,
  ...props
}: AlertProps) {
  const baseClasses = "relative w-full rounded-xl border p-4 text-sm [&>svg~*]:ms-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:start-4 [&>svg]:top-4"

  const variants = {
    default: "bg-[var(--surface-card)] text-[var(--text-primary)] border-[var(--surface-border)]",
    info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
    warning: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
    error: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300",
  }

  const icons = {
    default: null,
    info: <Info className="h-5 w-5 text-blue-500" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
  }

  const mergedClasses = `${baseClasses} ${variants[variant]} ${className}`

  return (
    <div role="alert" className={mergedClasses} {...props}>
      {icon && icons[variant]}
      <div>
        {title && <h5 className="mb-1 font-bold leading-none tracking-tight">{title}</h5>}
        <div className="text-[0.875rem] opacity-90">{children}</div>
      </div>
    </div>
  )
}
