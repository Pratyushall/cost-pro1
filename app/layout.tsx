// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import Script from "next/script"; // ⬅️ add this
import "./globals.css";

import SessionGuard from "@/components/SessionGuard";
import RightRail from "@/components/RightRail";

export const metadata: Metadata = {
  /* ...unchanged... */
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // keep this number in sync with your lib/estimator-session TIMEOUT
  const timeoutMin = Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MIN ?? 30);
  const timeoutMs = timeoutMin * 60 * 1000;

  return (
    <html lang="en">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} min-h-screen overflow-y-auto`}
      >
        {/* ⬇️ runs before any React/rehydration */}
        <Script id="icp-prehydrate-cleanup" strategy="beforeInteractive">
          {`
  (function(){
    try {
      var LA='ICP_LAST_ACTIVE';
      var NOW=Date.now();
      var t = Number(localStorage.getItem(LA) || 0);
      var TIMEOUT=${
        Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MIN ?? 30) * 60 * 1000
      };
      if (!t || NOW - t > TIMEOUT) {
        // new key
        localStorage.removeItem('ICP_STATE');
        // old key (from older build)
        localStorage.removeItem('interior-estimator-storage');
        localStorage.removeItem(LA);
      }
    } catch(e) {}
  })();
`}
        </Script>

        <SessionGuard estimatorRoot="/estimator">
          <Suspense fallback={null}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
                <main className="min-w-0">{children}</main>
                <aside className="hidden lg:block">
                  <div className="sticky top-4">
                    <RightRail />
                  </div>
                </aside>
              </div>
            </div>
          </Suspense>
          <Analytics />
        </SessionGuard>
      </body>
    </html>
  );
}
