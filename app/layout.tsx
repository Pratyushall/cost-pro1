// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";

import SessionGuard from "@/components/SessionGuard";
import RightRail from "@/components/RightRail";

export const metadata: Metadata = {
  title: "Interior Cost Estimator",
  description: "Get accurate cost estimates for your interior design projects",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* Force scroll + full-height shell */}
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} min-h-screen overflow-y-auto`}
      >
        <SessionGuard estimatorRoot="/estimator">
          <Suspense fallback={null}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              <div
                className="
                  grid gap-6
                  lg:grid-cols-[minmax(0,1fr)_300px]
                  xl:grid-cols-[minmax(0,1fr)_320px]
                "
              >
                <main className="min-w-0">{children}</main>

                {/* Sticky ad rail; won’t block scrolling */}
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
