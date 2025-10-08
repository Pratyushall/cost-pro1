"use client";

import { useEffect, useMemo, useState } from "react";
import { useEstimatorStore } from "@/store/estimator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, RotateCcw, Loader2 } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { generatePDF, openPDFForPrint } from "@/lib/pdf-generator";
import type { PriceRange } from "@/lib/types";
import { computeExactBreakdown } from "@/lib/calc-exact";

const DUMMY_MODE =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_OTP_DUMMY === "true";
const DUMMY_OTP = "000000";

interface CalculationResult {
  singleLine: PriceRange;
  bedrooms: PriceRange;
  living: PriceRange;
  pooja: PriceRange;
  kitchen: PriceRange;
  addons: PriceRange;
  grandTotal: PriceRange;
}

export function StepSummary() {
  const { basics, single, rooms, addons, setCurrentStep, reset } =
    useEstimatorStore();

  // ---------- OTP gate state ----------
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [otpMsg, setOtpMsg] = useState<string | null>(null);

  // Consents under phone input
  const [consentConnect, setConsentConnect] = useState(false);
  const [consentCall, setConsentCall] = useState(false);

  // Optional prefill
  useEffect(() => {
    // @ts-ignore
    const prefilled =
      (rooms as any)?.contact?.phone || (addons as any)?.contact?.phone || "";
    if (prefilled && !phone) setPhone(prefilled);
  }, [rooms, addons, phone]);

  const phoneE164 = useMemo(() => {
    let p = phone.replace(/[^\d+]/g, "");
    if (p.startsWith("0")) p = p.replace(/^0+/, "");
    if (!p.startsWith("+")) p = `+91${p}`;
    return p;
  }, [phone]);

  // ---- HERE: sendWaOtp (includes dummy mode) ----
  async function sendWaOtp() {
    try {
      setOtpMsg(null);

      // Basic phone validation
      if (!/^\+?\d{10,15}$/.test(phoneE164)) {
        setOtpMsg("Please enter a valid phone number");
        return;
      }

      // Dummy dev bypass
      if (DUMMY_MODE) {
        setOtpSent(true);
        setOtpMsg(`Dev mode: use ${DUMMY_OTP} to continue.`);
        return;
      }

      setOtpSending(true);
      const r = await fetch("/api/otp/wa/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneE164, consentConnect, consentCall }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setOtpMsg("Failed to send OTP. Please try again.");
        setOtpSent(false);
      } else {
        setOtpSent(true);
        setOtpMsg("OTP sent on WhatsApp. It expires in 5 minutes.");
        try {
          (analytics as any)?.otpRequested?.({
            method: "whatsapp",
            phone: phoneE164,
            consentConnect,
            consentCall,
          });
        } catch {}
      }
    } catch {
      setOtpMsg("Something went wrong. Please try again.");
    } finally {
      setOtpSending(false);
    }
  }

  // ---- HERE: verifyWaOtp (includes dummy mode) ----
  async function verifyWaOtp() {
    try {
      setOtpMsg(null);

      // Dummy dev bypass
      if (DUMMY_MODE && otp === DUMMY_OTP) {
        setVerified(true);
        setOtpMsg(null);
        return;
      }

      if (otp.length !== 6) {
        setOtpMsg("Enter the 6-digit code.");
        return;
      }

      setOtpVerifying(true);
      const r = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneE164, otp }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        const reason = j?.error || "invalid";
        setOtpMsg(
          reason === "expired"
            ? "Code expired. Please request a new OTP."
            : reason === "locked"
            ? "Too many attempts. Request a new OTP."
            : "Invalid code. Please try again."
        );
        setVerified(false);
      } else {
        setVerified(true);
        setOtpMsg(null);
        try {
          (analytics as any)?.otpVerified?.({
            method: "whatsapp",
            phone: phoneE164,
            consentConnect,
            consentCall,
          });
        } catch {}
      }
    } catch {
      setOtpMsg("Verification failed. Please try again.");
      setVerified(false);
    } finally {
      setOtpVerifying(false);
    }
  }

  // ---------- Calculation (runs only AFTER verified) ----------
  const [calculation, setCalculation] = useState<CalculationResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  useEffect(() => {
    if (!verified) return;

    const calculateEstimate = async () => {
      try {
        setLoading(true);
        setCalcError(null);

        const state = {
          basics,
          single,
          rooms,
          addons,
          totals: { low: 0, high: 0, byCategory: {} },
        };

        const resp = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state),
        });
        if (!resp.ok) throw new Error("Failed to calculate estimate");
        const result = await resp.json();

        if (result.success) {
          setCalculation(result.ranges);
          analytics.estimateGenerated(basics, result.ranges.grandTotal);
        } else {
          throw new Error(result.error || "Calculation failed");
        }
      } catch (err) {
        console.error("Calculation error:", err);
        setCalcError("Failed to calculate estimate. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    calculateEstimate();
  }, [verified, basics, single, rooms, addons]);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const handleDownloadPDF = async () => {
    if (!calculation) return;
    try {
      const state = {
        basics,
        single,
        rooms,
        addons,
        totals: { low: 0, high: 0, byCategory: {} },
      };
      const exact = computeExactBreakdown(state as any);
      const blob = await generatePDF({ state: state as any, calculation });
      openPDFForPrint(blob);
      analytics.pdfDownloaded(basics, {
        grandTotal: exact.grandTotal,
        lines: exact.lines.length,
      });
    } catch (err) {
      console.error("PDF generation error:", err);
    }
  };

  const handleStartOver = () => {
    reset();
    setCurrentStep(0);
  };

  // ----------- OTP Gate FIRST -----------
  if (!verified) {
    const phoneValid = /^\+?\d{10,15}$/.test(phoneE164);

    return (
      <div className="max-w-xl mx-auto">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl text-black">
              Verify to view your estimate
            </CardTitle>
            <p className="text-sm text-gray-600">
              Enter your phone number to receive a one-time code on WhatsApp.
              After verification, your estimate summary will be displayed.
            </p>
          </CardHeader>
          <CardContent>
            <label className="block text-sm text-gray-700 mb-1">
              Phone number
            </label>
            <div className="flex gap-2">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-black outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={sendWaOtp}
                disabled={otpSending || !phoneValid}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {otpSending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {otpSent ? "Resend OTP" : "Send OTP"}
              </Button>
            </div>

            {/* Consents right under phone field */}
            <div className="mt-4 space-y-2">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={consentConnect}
                  onChange={(e) => setConsentConnect(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  I’d like to receive a free plan and be connected with a vetted
                  interior design company.
                  <span className="block text-xs text-gray-500">
                    We may contact you on WhatsApp/phone. You can opt out
                    anytime.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={consentCall}
                  onChange={(e) => setConsentCall(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  It’s okay to call me about my project (otherwise contact me on
                  WhatsApp only).
                </span>
              </label>

              {DUMMY_MODE && (
                <div className="text-xs text-gray-500">
                  Dev mode: enter <b>{DUMMY_OTP}</b> as OTP or{" "}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => {
                      setOtpSent(true);
                      setOtp(DUMMY_OTP);
                      setOtpMsg(
                        `Dev mode: prefilled ${DUMMY_OTP}. Click Verify to continue.`
                      );
                    }}
                  >
                    skip & prefill
                  </button>
                  .
                </div>
              )}
            </div>

            {otpSent && (
              <div className="mt-4">
                <label className="block text-sm text-gray-700 mb-1">
                  Enter 6-digit code
                </label>
                <div className="flex gap-2">
                  <input
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="••••••"
                    className="w-40 rounded-md border border-gray-300 px-3 py-2 text-black tracking-widest text-center outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    onClick={verifyWaOtp}
                    disabled={otpVerifying || otp.length !== 6}
                    className="bg-black hover:bg-black/90 text-white"
                  >
                    {otpVerifying ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Verify
                  </Button>
                </div>
              </div>
            )}

            {otpMsg && <p className="mt-3 text-sm text-gray-700">{otpMsg}</p>}

            <div className="mt-8 flex justify-center">
              <Button
                variant="ghost"
                onClick={handleStartOver}
                className="text-black"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ----------- AFTER verify -----------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Calculating your estimate...</p>
        </div>
      </div>
    );
  }

  if (calcError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{calcError}</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-primary hover:bg-primary/90"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!calculation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No calculation data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl text-black">
          Cost Estimate Summary
        </CardTitle>
        <p className="text-gray-600">
          Here's your approximate cost estimate for a {basics.bhk.toUpperCase()}{" "}
          {basics.pkg} package
        </p>
      </CardHeader>

      <div className="space-y-4">
        {/* Project Details */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black">
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Carpet Area:</span>
                <p className="font-medium text-black">
                  {basics.carpetAreaSqft} sq ft
                </p>
              </div>
              <div>
                <span className="text-gray-500">Configuration:</span>
                <p className="font-medium text-black">
                  {basics.bhk.toUpperCase()}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Package:</span>
                <p className="font-medium text-black">{basics.pkg}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black">Cost Breakdown</CardTitle>
            <p className="text-sm text-gray-600">
              All amounts are approximate ranges
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  key: "singleLine",
                  label: "Single Line Items",
                  range: calculation.singleLine,
                },
                {
                  key: "bedrooms",
                  label: "Bedrooms",
                  range: calculation.bedrooms,
                },
                {
                  key: "living",
                  label: "Living Room",
                  range: calculation.living,
                },
                {
                  key: "kitchen",
                  label: "Kitchen",
                  range: calculation.kitchen,
                },
                { key: "pooja", label: "Pooja Room", range: calculation.pooja },
                { key: "addons", label: "Add-ons", range: calculation.addons },
              ].map(({ key, label, range }) => (
                <div
                  key={key}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-black font-medium">{label}</span>
                  <span className="text-black font-medium">
                    {range.low === 0 && range.high === 0
                      ? "Not included"
                      : `≈ ${formatPrice(range.low)} - ${formatPrice(
                          range.high
                        )}`}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 mt-4">
                <span className="text-xl font-bold text-black">
                  Grand Total
                </span>
                <span className="text-xl font-bold text-primary">
                  ≈ {formatPrice(calculation.grandTotal.low)} -{" "}
                  {formatPrice(calculation.grandTotal.high)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(4)}
            className="border-gray-300 text-black hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <div className="flex flex-1 gap-2">
            <Button
              onClick={handleDownloadPDF}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Restart centered at very bottom */}
        <div className="pt-6 flex justify-center">
          <Button
            variant="ghost"
            onClick={handleStartOver}
            className="text-black"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart
          </Button>
        </div>
      </div>
    </div>
  );
}
