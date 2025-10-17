// components/ads/ad-spot.tsx
"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info } from "lucide-react";
import { analytics } from "@/lib/analytics";
import clsx from "clsx";

interface AdSpotProps {
  variant?: "a" | "b";
  placement?: string;
  className?: string;
}

export default function AdSpot({
  variant = "a",
  placement = "wizard_bottom",
  className,
}: AdSpotProps) {
  useEffect(() => {
    analytics.adViewed(placement, variant);
  }, [placement, variant]);

  const content =
    variant === "a"
      ? {
          label: "Sponsored",
          headline: "Premium Interior Materials",
          body: "Get 15% off on premium materials for your project.",
          cta: "Learn More",
          link: "#",
        }
      : {
          label: "Partner Offer",
          headline: "Professional Design Consultation",
          body: "Book a free consultation with our design experts.",
          cta: "Book Now",
          link: "#",
        };

  const handleClick = () => {
    analytics.adClicked(placement, variant, content.link);
  };

  return (
    <Card
      role="complementary"
      aria-label="Sponsored advertisement"
      className={clsx(
        "card-glass p-0 overflow-hidden text-foreground",
        className
      )}
    >
      {/* Sponsored label bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-foreground/5 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-foreground/10 text-[10px] font-bold">
              Ad
            </span>
            <span>Sponsored</span>
          </span>
          <Info className="size-3.5 opacity-70" aria-hidden="true" />
        </div>

        {/* Tiny “i” menu could link to your policy later */}
        <a
          href="/disclaimer"
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Why this ad?
        </a>
      </div>

      {/* Main ad body */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
        <div className="space-y-1 flex-1">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
            {content.label}
          </span>
          <h3 className="font-semibold text-sm leading-snug">
            {content.headline}
          </h3>
          <p className="text-xs body-muted">{content.body}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          asChild
          className="calculator-button-secondary h-8 px-3"
        >
          <a href={content.link} target="_blank" rel="noopener noreferrer">
            {content.cta}
            <ExternalLink className="ml-1.5 size-3.5" />
          </a>
        </Button>
      </div>
    </Card>
  );
}
