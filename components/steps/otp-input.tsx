"use client";

import * as React from "react";
import { useEffect, useMemo, useRef } from "react";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length: number; // e.g., 6
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Mobile-first OTP input with:
 * - autoFocus first cell
 * - paste full code support
 * - arrow key navigation
 * - Backspace to previous cell when empty
 * - autocomplete / autoOneTimeCode for iOS/Android SMS autofill
 */
export function OTPInput({
  value,
  onChange,
  length,
  disabled = false,
  autoFocus = false,
}: OTPInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // clamp to numeric and max length
  const safeValue = useMemo(
    () => (value || "").replace(/\D/g, "").slice(0, length),
    [value, length]
  );

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
      inputRefs.current[0].select?.();
    }
  }, [autoFocus]);

  const setDigit = (index: number, digit: string) => {
    if (disabled) return;
    if (digit && !/^\d$/.test(digit)) return; // only 0-9

    const chars = safeValue.split("");
    chars[index] = digit || "";
    const joined = chars.join("").slice(0, length);
    onChange(joined);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select?.();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const key = e.key;
    if (key === "Backspace") {
      if (!safeValue[index] && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
        const chars = safeValue.split("");
        chars[index - 1] = "";
        onChange(chars.join(""));
      }
    } else if (key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
    if (!pasted) return;
    onChange(pasted.slice(0, length));
    const targetIndex = Math.min(pasted.length, length) - 1;
    inputRefs.current[targetIndex]?.focus();
    inputRefs.current[targetIndex]?.select?.();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            // ✅ return void, not the assigned value
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          // one-time-code enables SMS OTP autofill on iOS/Android
          autoComplete="one-time-code"
          autoCorrect="off"
          pattern="\d*"
          maxLength={1}
          value={safeValue[i] || ""}
          onChange={(e) =>
            setDigit(i, e.target.value.replace(/\D/g, "").slice(0, 1))
          }
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={[
            "w-12 h-14 text-center text-2xl font-semibold rounded-lg",
            "border-2 border-border bg-input text-foreground",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            "transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          ].join(" ")}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
