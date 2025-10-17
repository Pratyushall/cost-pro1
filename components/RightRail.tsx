"use client";

import { useEffect } from "react";
import Image from "next/image";
import { analytics } from "@/lib/analytics";

const DEST = process.env.NEXT_PUBLIC_AD_DEST || "https://simplifyhome.in/";

type SlotId = "right-1" | "right-2";

function AdCard({
  slot,
  img,
  alt,
  width,
  height,
  dest = DEST,
}: {
  slot: SlotId;
  img: string;
  alt: string;
  width: number;
  height: number;
  dest?: string;
}) {
  useEffect(() => {
    try {
      (analytics as any)?.adViewed?.({ slot, dest });
    } catch {}
  }, [slot, dest]);

  const describedById = `${slot}-desc`;

  return (
    <a
      href={dest}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        try {
          (analytics as any)?.adClicked?.({ slot, dest });
        } catch {}
      }}
      aria-label={`${alt} — Sponsored`}
      aria-describedby={describedById}
      className="
        group relative block overflow-hidden rounded-xl
        border border-white/40 bg-white/50
        shadow-md backdrop-blur-md
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-lg
        focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30
      "
    >
      {/* Sponsored pill (top-left) */}
      <span
        className="
          pointer-events-none absolute left-3 top-3 z-20
          inline-flex items-center gap-1 rounded-full
          bg-amber-500/90 px-2.5 py-1 text-xs font-semibold
          text-white shadow
        "
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-3.5 w-3.5"
          fill="currentColor"
        >
          <path d="M10 0l3.09 6.26L20 7.27l-5 4.87L16.18 20 10 16.9 3.82 20 5 12.14 0 7.27l6.91-1.01L10 0z" />
        </svg>
        Sponsored
      </span>

      {/* Tiny “Ad” info chip (top-right) */}
      <span
        className="
          pointer-events-none absolute right-3 top-3 z-20
          inline-flex items-center gap-1 rounded-full
          bg-black/55 px-2 py-0.5 text-[10px] font-medium
          uppercase tracking-wide text-white
        "
        title="Advertisement"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8h.01M11 12h1v4h1" />
        </svg>
      </span>

      {/* Soft gradient sheen overlay on hover */}
      <div
        aria-hidden="true"
        className="
          absolute inset-0 z-10 opacity-0
          bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.35),transparent)]
          transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      {/* Image */}
      <div className="relative z-0 mx-auto" style={{ width }}>
        <Image
          src={img}
          alt={alt}
          width={width}
          height={height}
          className="h-auto w-full rounded-lg object-cover"
          priority={slot === "right-1"}
        />
      </div>

      {/* Bottom meta bar */}
      <div
        className="
          relative z-20 mt-2 flex items-center justify-between
          px-3 pb-3 pt-1 text-xs text-foreground/70
        "
      >
        <span className="truncate">Partner: Simplify Home</span>
        <span
          className="
            inline-flex items-center gap-1 rounded-md
            bg-white/60 px-2 py-0.5 text-[11px]
            text-foreground shadow-sm
          "
        >
          Learn more
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>

      {/* Visually hidden extra context for screen readers */}
      <span id={describedById} className="sr-only">
        This is a sponsored advertisement. Clicking opens our partner’s website
        in a new tab.
      </span>
    </a>
  );
}

export default function RightRail() {
  return (
    <div className="w-full space-y-4">
      {/* Slot 1 — square */}
      <AdCard
        slot="right-1"
        img="/images/ad1.png"
        alt="Interior design partner"
        width={300}
        height={300}
      />

      {/* Slot 2 — banner */}
      <AdCard
        slot="right-2"
        img="/images/ad2.png"
        alt="Interior design partner"
        width={336}
        height={140}
      />
    </div>
  );
}
