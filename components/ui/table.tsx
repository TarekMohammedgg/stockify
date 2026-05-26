import * as React from "react"

export function Table({ className = "", ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)]">
      <table className={`w-full caption-bottom text-sm text-[var(--text-primary)] ${className}`} {...props} />
    </div>
  )
}

export function TableHeader({ className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`border-b border-[var(--surface-border)] bg-[var(--surface-input)]/50 ${className}`} {...props} />
}

export function TableBody({ className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props} />
}

export function TableFooter({ className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={`border-t border-[var(--surface-border)] bg-[var(--surface-input)]/50 font-medium ${className}`}
      {...props}
    />
  )
}

export function TableRow({ className = "", ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`border-b border-[var(--surface-border)] transition-colors hover:bg-[var(--surface-input)]/50 data-[state=selected]:bg-[var(--surface-input)] ${className}`}
      {...props}
    />
  )
}

export function TableHead({ className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`h-12 px-4 text-start align-middle font-semibold text-[var(--text-secondary)] [&:has([role=checkbox])]:pe-0 ${className}`}
      {...props}
    />
  )
}

export function TableCell({ className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`p-4 align-middle [&:has([role=checkbox])]:pe-0 ${className}`}
      {...props}
    />
  )
}

export function TableCaption({ className = "", ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={`mt-4 text-sm text-[var(--text-muted)] ${className}`}
      {...props}
    />
  )
}
