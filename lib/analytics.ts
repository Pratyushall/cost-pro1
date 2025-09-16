// Analytics utility for tracking user interactions
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

class Analytics {
  private isEnabled: boolean;

  constructor() {
    // Enable analytics in production or when explicitly enabled
    this.isEnabled =
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
  }

  track(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) {
      console.log("[v0] Analytics (dev):", event, properties);
      return;
    }

    // In production, this would integrate with PostHog, Plausible, or similar
    try {
      // Example PostHog integration:
      // if (typeof window !== 'undefined' && window.posthog) {
      //   window.posthog.capture(event, properties)
      // }

      // Example Plausible integration:
      // if (typeof window !== 'undefined' && window.plausible) {
      //   window.plausible(event, { props: properties })
      // }

      console.log("[v0] Analytics:", event, properties);
    } catch (error) {
      console.error("Analytics error:", error);
    }
  }

  // Specific tracking methods for the estimator
  estimatorStarted() {
    this.track("estimator_started", {
      timestamp: new Date().toISOString(),
    });
  }

  stepCompleted(stepIndex: number, stepName: string) {
    this.track("step_completed", {
      step_index: stepIndex,
      step_name: stepName,
      timestamp: new Date().toISOString(),
    });
  }

  estimateGenerated(
    basics: { bhk: string; pkg: string; carpetAreaSqft: number },
    totalRange: { low: number; high: number }
  ) {
    // Bucket carpet area for privacy
    const areaBucket = this.getCarpetAreaBucket(basics.carpetAreaSqft);

    this.track("estimate_generated", {
      bhk: basics.bhk,
      package: basics.pkg,
      carpet_area_bucket: areaBucket,
      estimate_range_low: totalRange.low,
      estimate_range_high: totalRange.high,
      timestamp: new Date().toISOString(),
    });
  }

  pdfDownloaded(basics: { bhk: string; pkg: string }) {
    this.track("download_pdf", {
      bhk: basics.bhk,
      package: basics.pkg,
      timestamp: new Date().toISOString(),
    });
  }

  shareLinkCopied(basics: { bhk: string; pkg: string }) {
    this.track("share_link_copied", {
      bhk: basics.bhk,
      package: basics.pkg,
      timestamp: new Date().toISOString(),
    });
  }

  private getCarpetAreaBucket(area: number): string {
    if (area < 500) return "under_500";
    if (area < 1000) return "500_1000";
    if (area < 1500) return "1000_1500";
    if (area < 2000) return "1500_2000";
    return "over_2000";
  }
}

export const analytics = new Analytics();
