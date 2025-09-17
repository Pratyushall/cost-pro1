"use client";

import type { Package } from "@/lib/types";

interface PackagePickerProps {
  value?: Package | null; // per-item override (may be null)
  currentPackage?: Package | null; // legacy prop; if present, used before global
  globalPkg: Package; // global package from Step 1
  onChange?: (next: Package | null) => void;
  onPackageChange?: (pkg: Package | null) => void; // legacy handler
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
    "px-2 py-1 rounded text-xs border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-yellow-400";

  const selectedCls = "bg-yellow-400 text-black border-yellow-400";
  const unselectedCls =
    "bg-transparent text-yellow-700 border-yellow-400 hover:bg-yellow-50";

  const handleChange = (newPkg: Package) => {
    // store null if user chooses the same as global (i.e., no override)
    const override: Package | null = newPkg === globalPkg ? null : newPkg;
    actualOnChange?.(override);

    // optional GA event you already had
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
