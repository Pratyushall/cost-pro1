"use client";

import { track as vercelTrack } from "@vercel/analytics";
import type { PriceRange, Package } from "./types";

const ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
type Props = Record<string, any>;

export type BasicsForAnalytics = {
  carpetAreaSqft: number;
  bhk: string;
  pkg: Package;
};

function safeTrack(name: string, props?: Props) {
  if (!ENABLED) return;
  try {
    vercelTrack(name, props);
  } catch {
    /* no-op */
  }
}

export const analytics = {
  /** low-level passthrough so calls like analytics.track(...) compile */
  track(event: string, props?: Props) {
    safeTrack(event, props);
  },

  estimatorStarted() {
    safeTrack("estimator_started");
  },

  /** allow an optional label for your step names */
  stepCompleted(step: number, label?: string) {
    safeTrack("step_completed", { step, label });
  },

  estimateGenerated(basics: BasicsForAnalytics, grand: PriceRange) {
    safeTrack("estimate_generated", {
      ...basics,
      grandLow: grand.low,
      grandHigh: grand.high,
    });
  },

  pdfDownloaded(
    basics: BasicsForAnalytics,
    extra?: { grandTotal?: number; lines?: number }
  ) {
    safeTrack("download_pdf", { ...basics, ...extra });
  },

  shareLinkCopied(basics: BasicsForAnalytics) {
    safeTrack("share_link_copied", { ...basics });
  },

  itemPkgOverridden(itemId: string, from: string, to: string) {
    safeTrack("item_pkg_overridden", { itemId, from, to });
  },

  itemToggled(itemId: string, enabled: boolean) {
    safeTrack("item_toggled", { itemId, enabled });
  },
};
