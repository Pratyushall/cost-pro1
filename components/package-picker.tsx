"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Package } from "@/lib/types";
import { ChevronDown, RotateCcw } from "lucide-react";

interface PackagePickerProps {
  globalPkg?: Package;
  currentPackage?: Package | null;
  onPackageChange: (pkg: Package | undefined) => void;
  itemName: string;
}

export function PackagePicker({
  globalPkg,
  currentPackage,
  onPackageChange,
  itemName,
}: PackagePickerProps) {
  const isOverridden = currentPackage !== undefined && currentPackage !== null;
  const displayPkg = isOverridden ? currentPackage : globalPkg;

  return (
    <div className="flex items-center gap-2">
      {isOverridden && (
        <Badge variant="secondary" className="text-xs">
          Overridden
        </Badge>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-gray-300 text-black hover:bg-gray-50 bg-transparent"
          >
            {displayPkg || "Select Package"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuItem
            onClick={() => onPackageChange("Premium")}
            className="cursor-pointer"
          >
            Premium
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onPackageChange("Luxury")}
            className="cursor-pointer"
          >
            Luxury
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isOverridden && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPackageChange(undefined)}
          className="h-8 px-2 text-gray-600 hover:text-black"
          title="Reset to Global"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
