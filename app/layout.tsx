// app/layout.tsx
import type React from "react";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";

import SessionGuard from "@/components/SessionGuard";
import RightRail from "@/components/RightRail";

export const metadata: Metadata = {
  title: "Interior Design Calculator",
  description:
    "Quick, transparent interior design cost estimates—for kitchens, bedrooms, living rooms and more.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  manifest: "/site.webmanifest",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const timeoutMin = Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MIN ?? 30);
  const timeoutMs = timeoutMin * 60 * 1000;

  return (
    <html lang="en" className="h-full">
      <body
        className={`h-full antialiased font-sans ${GeistSans.variable} ${GeistMono.variable} min-h-screen overflow-y-auto bg-app`}
      >
        {/* runs before any React/rehydration */}
        <Script id="icp-prehydrate-cleanup" strategy="beforeInteractive">
          {`
  (function(){
    try {
      var LA='ICP_LAST_ACTIVE';
      var NOW=Date.now();
      var t = Number(localStorage.getItem(LA) || 0);
      var TIMEOUT=${timeoutMs};
      if (!t || NOW - t > TIMEOUT) {
        localStorage.removeItem('ICP_STATE');
        localStorage.removeItem('interior-estimator-storage');
        localStorage.removeItem(LA);
      }
    } catch(e) {}
  })();
`}
        </Script>

        <SessionGuard estimatorRoot="/estimator">
          <Suspense fallback={null}>
            {/* global page heading (top of every page) */}
            <header className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-6">
              <div className="flex justify-center">
                {/* Desktop / tablet header */}
                <div className="hidden sm:block">
                  <div className="card-glass rounded-xl px-5 py-4 w-full sm:w-auto">
                    <h1 className="heading-md text-center">
                      Interior Budget Calculator
                    </h1>
                  </div>
                </div>

                {/* Mobile header */}
                <div className="sm:hidden w-full">
                  <div className="card-glass rounded-xl px-4 py-3">
                    <h1 className="text-lg font-semibold text-center text-foreground">
                      Interior Budget Calculator
                    </h1>
                    <p className="mt-1 text-xs text-center text-foreground/70">
                      Quick, transparent interior cost estimates
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* main layout container */}
            <div className="app-safe-area mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 pb-safe">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
                <main className="min-w-0">{children}</main>

                {/* Right rail hidden on small screens */}
                <aside className="hidden lg:block">
                  <div className="sticky top-4">
                    <RightRail />
                  </div>
                </aside>
              </div>
            </div>

            {/* global bottom disclaimer (faded but visible) */}
            <footer className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pb-8 pb-safe">
              {/* Desktop / tablet disclaimer */}
              <div className="hidden sm:block">
                <div className="card-glass rounded-xl px-6 py-5">
                  <h2 className="text-base font-semibold text-foreground/80">
                    Disclaimer
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                    This calculator provides an approximate estimate based on
                    general market trends and standard design assumptions.
                    Actual project costs may differ due to variations in
                    material selection, labor rates, design complexity, and
                    other factors. These figures are indicative and not a final
                    quotation.
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/disclaimer"
                      className="btn-enhanced-secondary px-3 py-2 rounded-lg text-sm inline-block"
                      aria-label="Read full Disclaimer & Terms"
                    >
                      Full Disclaimer &amp; Terms
                    </Link>
                  </div>
                </div>
              </div>

              {/* Mobile disclaimer */}
              <div className="sm:hidden">
                <div className="card-glass rounded-xl px-4 py-4">
                  <h2 className="text-sm font-semibold text-foreground/80">
                    Disclaimer
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-foreground/70">
                    This calculator provides an approximate estimate based on
                    general market trends and standard design assumptions.
                    Actual costs may differ due to materials, labour, and design
                    complexity. These figures are indicative and not a final
                    quotation.
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/disclaimer"
                      className="btn-enhanced-secondary px-3 py-1.5 rounded-lg text-xs inline-block"
                      aria-label="Read full Disclaimer & Terms"
                    >
                      Full Disclaimer &amp; Terms
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
          </Suspense>

          <Analytics />
        </SessionGuard>
      </body>
    </html>
  );
}
