"use client";

import Image from "next/image";
import { analytics } from "@/lib/analytics";

const DEST = process.env.NEXT_PUBLIC_AD_DEST || "https://simplifyhome.in/";

export default function RightRail() {
  return (
    <div className="w-full space-y-4">
      {/* Slot 1: 300x300 (fits our ~300px rail) */}
      <a
        href={DEST}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          try {
            (analytics as any)?.adClicked?.({ slot: "right-1", dest: DEST });
          } catch {}
        }}
        className="block rounded-lg border border-gray-200 bg-white p-2 shadow-sm"
        aria-label="Visit our partner"
      >
        <div className="mx-auto w-[300px]">
          <Image
            src="/images/ad1.png"
            alt="Interior design partner"
            width={300}
            height={300}
            className="h-auto w-full rounded-md object-cover"
            priority
          />
        </div>
      </a>

      {/* Slot 2: 336x140 (optional, can remove) */}
      <a
        href={DEST}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          try {
            (analytics as any)?.adClicked?.({ slot: "right-2", dest: DEST });
          } catch {}
        }}
        className="block rounded-lg border border-gray-200 bg-white p-2 shadow-sm"
        aria-label="Visit our partner"
      >
        <div className="mx-auto w-[336px]">
          <Image
            src="/images/ad2.png"
            alt="Interior design partner"
            width={336}
            height={140}
            className="h-auto w-full rounded-md object-cover"
          />
        </div>
      </a>
    </div>
  );
}
