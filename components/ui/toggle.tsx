"use client";

import * as React from "react"

export interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (checked: boolean) => void;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className = "", onValueChange, onChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          ref={ref}
          onChange={(e) => {
            if (onChange) onChange(e);
            if (onValueChange) onValueChange(e.target.checked);
          }}
          {...props}
        />
        <div className={`peer h-6 w-11 rounded-full bg-[var(--surface-border)] after:absolute after:start-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-500 peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full peer-focus:ring-2 peer-focus:ring-primary-500/30 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${className}`}></div>
      </label>
    )
  }
)
Toggle.displayName = "Toggle"
