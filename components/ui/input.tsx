"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        // Mobile niceties:
        // - 16px font prevents iOS zoom
        // - generous horizontal padding so placeholders don't hug the edge
        // - large touch target by default (h-12)
        className={cn(
          "flex h-12 w-full rounded-lg border border-input",
          "bg-background px-4 py-3 text-base",
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // glass variant alignment (matches your globals.css helpers)
          "calculator-input",
          className
        )}
        // help password managers & mobile keyboards
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
