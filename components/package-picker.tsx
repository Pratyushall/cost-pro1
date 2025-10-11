"use client";

import type { Package } from "@/lib/types";

interface PackagePickerProps {
  value?: Package | null;
  currentPackage?: Package | null;
  globalPkg: Package;
  onChange?: (next: Package | null) => void;
  onPackageChange?: (pkg: Package | null) => void;
  compact?: boolean;
  itemId?: string;
  itemName?: string;
}

export function PackagePicker({
  value,
  currentPackage,
  globalPkg,
  onChange,
  onPackageChange,
  compact = true,
  itemId,
  itemName,
}: PackagePickerProps) {
  // Effective selection: override -> currentPackage -> global
  const selected = (value ?? currentPackage ?? globalPkg) as Package;
  const actualOnChange = onChange ?? onPackageChange;
  const analyticsId = itemId ?? itemName;

  const base =
    "px-2 py-1 rounded text-xs border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary";

  const selectedCls = "bg-primary text-primary-foreground border-primary";
  const unselectedCls =
    "bg-transparent text-primary border-primary hover:bg-primary/10 dark:hover:bg-primary/20";

  const handleChange = (newPkg: Package) => {
    const override: Package | null = newPkg === globalPkg ? null : newPkg;
    actualOnChange?.(override);

    if (
      override &&
      analyticsId &&
      typeof window !== "undefined" &&
      (window as any).gtag
    ) {
      (window as any).gtag("event", "item_pkg_overridden", {
        itemId: analyticsId,
        from: globalPkg,
        to: override,
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={compact ? "flex gap-1 text-xs" : "flex gap-2"}>
        <button
          type="button"
          aria-pressed={selected === "Premium"}
          onClick={() => handleChange("Premium")}
          className={`${base} ${
            selected === "Premium" ? selectedCls : unselectedCls
          }`}
        >
          Premium
        </button>
        <button
          type="button"
          aria-pressed={selected === "Luxury"}
          onClick={() => handleChange("Luxury")}
          className={`${base} ${
            selected === "Luxury" ? selectedCls : unselectedCls
          }`}
        >
          Luxury
        </button>
      </div>
    </div>
  );
}
