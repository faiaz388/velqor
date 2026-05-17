"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, id, ...props }, ref) => {
    // We need an id for the htmlFor in the label
    const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <div className="relative pt-5">
        <input
          type={type}
          id={inputId}
          className={cn(
            "peer flex h-12 w-full border-b border-foreground/20 bg-transparent px-0 py-2 text-sm text-foreground placeholder:text-transparent focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            className
          )}
          placeholder={label}
          ref={ref}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="absolute left-0 top-5 text-sm text-foreground-secondary transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs peer-focus:text-accent pointer-events-none"
        >
          {label}
        </label>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
