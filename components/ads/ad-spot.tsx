"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { analytics } from "@/lib/analytics";

interface AdSpotProps {
  variant?: "a" | "b";
  placement?: string;
}

export default function AdSpot({
  variant = "a",
  placement = "wizard_bottom",
}: AdSpotProps) {
  useEffect(() => {
    analytics.adViewed(placement, variant);
  }, [placement, variant]);

  const content =
    variant === "a"
      ? {
          label: "Sponsored",
          headline: "Premium Interior Materials",
          body: "Get 15% off on premium materials for your project",
          cta: "Learn More",
          link: "#",
        }
      : {
          label: "Partner Offer",
          headline: "Professional Design Consultation",
          body: "Book a free consultation with our design experts",
          cta: "Book Now",
          link: "#",
        };

  const handleClick = () => {
    analytics.adClicked(placement, variant, content.link);
  };

  return (
    <Card className="card-glass p-4 text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 flex-1">
          <span className="text-xs text-white/50 uppercase tracking-wider">
            {content.label}
          </span>
          <h3 className="font-semibold text-sm">{content.headline}</h3>
          <p className="text-xs text-white/80">{content.body}</p>
        </div>

        {/* Use a supported variant and add custom flair via className */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClick}
          asChild
          className="bg-white/10 border-white/20 backdrop-blur hover:bg-white/15 transition-shadow shadow-[0_8px_24px_rgba(255,255,255,0.08)]"
        >
          <a
            href={content.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1"
          >
            {content.cta}
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>
    </Card>
  );
}
