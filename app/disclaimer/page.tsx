// app/disclaimer/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Disclaimer & Terms • Interior Design Calculator",
  description:
    "Important notes about how to interpret the calculator's estimates.",
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="card-glass rounded-xl p-6 sm:p-8">
        {/* Header with Back button */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="heading-md">Disclaimer &amp; Terms</h1>

          <Link
            href="/"
            className="btn-enhanced-secondary inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            aria-label="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </div>

        <div className="mt-4 text-base text-foreground/80 space-y-4">
          <p className="body-muted">
            The results provided by this calculator are for general
            understanding and estimation purposes only. Actual costs may vary
            based on multiple factors such as market conditions, material
            selection, labor charges, location, design complexity, and brand
            preferences.
          </p>
          <p className="body-muted">
            This calculator does not constitute a final quotation or commitment.
            Prices and estimates are subject to change without prior notice. For
            an accurate and customized quotation, please consult our design
            team.
          </p>
        </div>
      </div>
    </div>
  );
}
