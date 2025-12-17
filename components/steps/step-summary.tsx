"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useEstimatorStore } from "@/store/estimator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, RotateCcw, Eye } from "lucide-react";
import { analytics } from "@/lib/analytics";
import {
  computeExactBreakdown,
  type ExactBreakdown,
} from "@/lib/compute-exact-breakdown";
import { generatePDFExact } from "@/lib/pdf-generator";
import { OTPInput } from "@/components/steps/otp-input";
import { ResendTimer } from "@/components/steps/resend-timer";
import { PDFPreviewModal } from "@/components/steps/pdf-preview-modal";

// Config
const DUMMY_MODE =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_OTP_DUMMY === "true";
const DUMMY_OTP = "000000";

// Category weights for masked fallbacks
const CATEGORY_WEIGHTS: Record<string, number> = {
  "Single Line Items": 0.12,
  Bedrooms: 0.33,
  "Living Room": 0.1,
  Kitchen: 0.28,
  "Pooja Room": 0.04,
  "Add-ons": 0.13,
};

// Mask number: keeps first digit + 1-2 tail digits, X in middle
function maskAmount(n: number): string {
  const raw = Math.max(0, Math.round(n)).toString();
  if (raw.length <= 3) return raw.replace(/.(?=..)/g, "x");
  const first = raw[0];
  const tailLen = raw.length >= 7 ? 2 : 1;
  const tail = raw.slice(-tailLen);
  const middleXs = "x".repeat(raw.length - (1 + tailLen));
  return `${first}${middleXs}${tail}`;
}

function formatMaskedINR(n: number): string {
  return `₹${maskAmount(n)}`;
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Normalize phone: accept +91, spaces, dashes, keep only digits
function normalizePhone(input: string): string {
  return input.replace(/\D/g, "").replace(/^91/, "");
}

export function StepSummary() {
  const { basics, singleLine, rooms, addons, setCurrentStep, resetStore } =
    useEstimatorStore();
  const startTimeRef = useRef(Date.now());

  const provisionalBreakdown = useMemo(() => {
    const state = { basics, singleLine, rooms, addons };
    return computeExactBreakdown(state);
  }, [basics, singleLine, rooms, addons]);

  // OTP state
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [otpMsg, setOtpMsg] = useState<string | null>(null);
  const [consentConnect, setConsentConnect] = useState(false);
  const [consentCall, setConsentCall] = useState(false);

  // Calculation state
  const [finalBreakdown, setFinalBreakdown] = useState<ExactBreakdown | null>(
    null
  );
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // PDF preview state
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const phoneDigits = useMemo(() => normalizePhone(phone), [phone]);
  const phoneValid = /^\d{10,15}$/.test(phoneDigits);

  useEffect(() => {
    analytics.otpStarted(phoneDigits || "unknown");
  }, []);

  async function sendOtp() {
    try {
      setOtpMsg(null);

      if (!phoneValid) {
        setOtpMsg("Please enter a valid phone number (10-15 digits).");
        return;
      }

      analytics.otpSendClicked(phoneDigits, "whatsapp");

      if (DUMMY_MODE) {
        setOtpSent(true);
        setOtpMsg(`Dev mode: use ${DUMMY_OTP} to continue.`);
        analytics.otpSentOk(phoneDigits, "whatsapp");
        return;
      }

      setOtpSending(true);
      const r = await fetch("/api/otp/wa/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneDigits,
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          consentConnect,
          consentCall,
        }),
      });
      const j = await r.json();

      if (!r.ok || !j.ok) {
        const reason = j?.error || "unknown";
        setOtpMsg("Failed to send OTP. Please try again.");
        analytics.otpSentFail(phoneDigits, "whatsapp", reason);
      } else {
        setOtpSent(true);
        setOtpMsg("OTP sent on WhatsApp. It expires in 5 minutes.");
        analytics.otpSentOk(phoneDigits, "whatsapp");
      }
    } catch (err) {
      setOtpMsg("Something went wrong. Please try again.");
      analytics.otpSentFail(phoneDigits, "whatsapp", "exception");
    } finally {
      setOtpSending(false);
    }
  }

  function handleResend() {
    analytics.otpResend(phoneDigits, "whatsapp");
    sendOtp();
  }

  function handleChangeNumber() {
    analytics.otpChangeNumber();
    setOtpSent(false);
    setOtp("");
    setOtpMsg(null);
  }

  async function verifyOtp() {
    try {
      setOtpMsg(null);
      analytics.otpVerifyClicked(phoneDigits);

      if (DUMMY_MODE && otp === DUMMY_OTP) {
        setVerified(true);
        const payload = {
          bhk: basics.bhk,
          pkg: basics.pkg,
          sqft: basics.carpetAreaSqft,
          sqftSource: basics.areaSource,
        };
        analytics.otpVerifiedOk(phoneDigits, payload);
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
        body: JSON.stringify({ phone: phoneDigits, otp }),
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
        analytics.otpVerifiedFail(phoneDigits, reason);
      } else {
        setVerified(true);
        const payload = {
          bhk: basics.bhk,
          pkg: basics.pkg,
          sqft: basics.carpetAreaSqft,
          sqftSource: basics.areaSource,
        };
        analytics.otpVerifiedOk(phoneDigits, payload);
      }
    } catch (err) {
      setOtpMsg("Verification failed. Please try again.");
      analytics.otpVerifiedFail(phoneDigits, "exception");
    } finally {
      setOtpVerifying(false);
    }
  }

  useEffect(() => {
    if (!verified) return;

    const calculateFinal = async () => {
      try {
        setCalculating(true);
        setCalcError(null);

        const state = { basics, singleLine, rooms, addons };

        const resp = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state),
        });

        if (!resp.ok) throw new Error("API calculation failed");

        const result = await resp.json();
        if (!result.success)
          throw new Error(result.error || "Calculation failed");

        // Use API result
        setFinalBreakdown(result.breakdown);
        setUsingFallback(false);

        const timeElapsed = Date.now() - startTimeRef.current;
        analytics.estimateViewed({
          bhk: basics.bhk || "2bhk",
          pkg: basics.pkg || "Premium",
          sqft: basics.carpetAreaSqft,
          sqftSource: basics.areaSource,
          grandTotal: result.breakdown.grandTotal,
          timeElapsedMs: timeElapsed,
        });
      } catch (err) {
        console.error("Calculation error:", err);
        setFinalBreakdown(provisionalBreakdown);
        setUsingFallback(true);
        analytics.calcApiFallback("api_error", {
          bhk: basics.bhk || "2bhk",
          pkg: basics.pkg || "Premium",
          sqft: basics.carpetAreaSqft,
        });
      } finally {
        setCalculating(false);
      }
    };

    calculateFinal();
  }, [verified, basics, singleLine, rooms, addons, provisionalBreakdown]);

  async function handleViewPDF() {
    try {
      const state = { basics, singleLine, rooms, addons };
      const breakdown = finalBreakdown || provisionalBreakdown;
      const blob = await generatePDFExact({ state, exact: breakdown });
      setPdfBlob(blob);
      setPdfPreviewOpen(true);

      analytics.pdfPreviewOpened({
        bhk: basics.bhk || "2bhk",
        pkg: basics.pkg || "Premium",
        sqft: basics.carpetAreaSqft,
        grandTotal: breakdown.grandTotal,
      });
    } catch (err) {
      console.error("PDF generation error:", err);
    }
  }

  const handleStartOver = () => {
    resetStore();
    setCurrentStep(1);
  };

  if (!verified) {
    const breakdown = provisionalBreakdown;
    const categories = Object.keys(breakdown.totalsByCategory).filter(
      (key) => typeof key === "string"
    ) as Array<keyof typeof breakdown.totalsByCategory>;

    return (
      <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-0 space-y-4 sm:space-y-6">
        <Card className="elegant-card">
          <CardHeader className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-xl sm:text-2xl text-foreground font-bold">
                Your Estimate
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-accent/20 backdrop-blur-md text-accent border border-accent/40 text-xs sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 self-start sm:self-auto"
              >
                Verify to unlock full breakdown
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Here's your approximate cost for a{" "}
              {(basics.bhk || "2bhk").toUpperCase()} {basics.pkg || "Premium"}{" "}
              package
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="space-y-3 sm:space-y-4">
              {categories.map((cat) => {
                const total = breakdown.totalsByCategory[cat];
                const isZero = total === 0;
                const fallback = Math.round(
                  breakdown.grandTotal * CATEGORY_WEIGHTS[String(cat)]
                );
                const display = isZero
                  ? formatMaskedINR(fallback)
                  : formatMaskedINR(total);

                return (
                  <div
                    key={String(cat)}
                    className="flex justify-between items-center py-2 sm:py-3 border-b border-white/20 last:border-b-0"
                  >
                    <span className="text-foreground font-semibold text-sm sm:text-lg">
                      {String(cat)}
                    </span>
                    <span className="text-foreground font-semibold text-sm sm:text-lg">
                      {display}
                    </span>
                  </div>
                );
              })}

              <div className="flex justify-between items-center py-3 sm:py-4 border-t-2 border-white/30 mt-4 sm:mt-6">
                <span className="text-lg sm:text-2xl font-bold text-foreground">
                  Grand Total
                </span>
                <span className="text-lg sm:text-2xl font-bold text-primary">
                  {formatMaskedINR(breakdown.grandTotal)}
                </span>
              </div>
            </div>

            {Object.values(breakdown.totalsByCategory).some((v) => v === 0) && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
                Categories with no selection show estimated fallback values.
                Verify to see exact breakdown.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="elegant-card">
          <CardHeader className="p-4 sm:p-6 md:p-8">
            <CardTitle className="text-xl sm:text-2xl text-foreground font-bold">
              {otpSent
                ? "Enter verification code"
                : "Verify to unlock full details"}
            </CardTitle>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              {otpSent
                ? "We sent a 6-digit code to your WhatsApp"
                : "Enter your phone number to receive a verification code"}
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-8">
            {!otpSent ? (
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm sm:text-base text-foreground font-bold mb-2 pl-2 sm:pl-4">
                    Phone number <span className="text-destructive">*</span>
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919876543210"
                    inputMode="numeric"
                    autoFocus
                    className="calculator-input w-full h-12 sm:h-14 rounded-lg text-base sm:text-lg pl-3 sm:pl-4"
                    aria-label="Phone number"
                    aria-required="true"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base text-foreground font-bold mb-2 pl-2 sm:pl-4">
                    Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="calculator-input w-full h-12 sm:h-14 rounded-lg text-base sm:text-lg pl-3 sm:pl-4"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base text-foreground font-bold mb-2 pl-2 sm:pl-4">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="calculator-input w-full h-12 sm:h-14 rounded-lg text-base sm:text-lg pl-3 sm:pl-4"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-2 sm:gap-3">
                    <input
                      type="checkbox"
                      checked={consentConnect}
                      onChange={(e) => setConsentConnect(e.target.checked)}
                      className="mt-1 h-4 w-4 sm:h-5 sm:w-5 rounded border-border"
                    />
                    <span className="text-sm sm:text-base text-muted-foreground">
                      I'd like to receive a free plan and be connected with a
                      vetted interior design company.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 sm:gap-3">
                    <input
                      type="checkbox"
                      checked={consentCall}
                      onChange={(e) => setConsentCall(e.target.checked)}
                      className="mt-1 h-4 w-4 sm:h-5 sm:w-5 rounded border-border"
                    />
                    <span className="text-sm sm:text-base text-muted-foreground">
                      It's okay to call me about my project.
                    </span>
                  </label>
                </div>

                <Button
                  onClick={sendOtp}
                  disabled={otpSending || !phoneValid}
                  className="btn-enhanced-primary w-full h-12 sm:h-14 rounded-lg text-base sm:text-lg font-semibold"
                >
                  {otpSending && (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  )}
                  Send OTP
                </Button>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-sm sm:text-base text-muted-foreground">
                    Sent to {phone}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleChangeNumber}
                    className="text-xs sm:text-sm text-primary hover:text-primary/80 self-start sm:self-auto"
                  >
                    Change number
                  </Button>
                </div>

                <div className="flex flex-col items-center gap-4 sm:gap-5">
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    length={6}
                    disabled={otpVerifying}
                    autoFocus
                  />

                  <Button
                    onClick={verifyOtp}
                    disabled={otpVerifying || otp.length !== 6}
                    className="btn-enhanced-primary w-full h-12 sm:h-14 rounded-lg text-base sm:text-lg font-semibold"
                  >
                    {otpVerifying && (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    )}
                    Verify
                  </Button>

                  <ResendTimer
                    onResend={handleResend}
                    cooldownSeconds={60}
                    disabled={otpSending}
                  />
                </div>
              </div>
            )}

            {otpMsg && (
              <div
                className="mt-4 text-sm sm:text-base text-foreground p-3 sm:p-4 bg-white/60 backdrop-blur-md rounded-lg border border-white/40 shadow-sm"
                role="status"
                aria-live="polite"
              >
                {otpMsg}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={handleStartOver}
            className="text-muted-foreground hover:text-foreground text-sm sm:text-base"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Restart
          </Button>
        </div>
      </div>
    );
  }

  if (calculating) {
    return (
      <div
        className="flex items-center justify-center py-12 px-4"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-base sm:text-lg">
            Calculating your final estimate...
          </p>
        </div>
      </div>
    );
  }

  const breakdown = finalBreakdown || provisionalBreakdown;
  const categories = Object.keys(breakdown.totalsByCategory).filter(
    (key) => typeof key === "string"
  ) as Array<keyof typeof breakdown.totalsByCategory>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0 space-y-4 sm:space-y-6">
      <div className="section-header rounded-xl px-4 py-5 sm:px-6 sm:py-6 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground">
            Cost Estimate Summary
          </h2>
          {usingFallback && (
            <Badge
              variant="secondary"
              className="bg-primary-foreground/20 backdrop-blur-md text-primary-foreground border border-primary-foreground/40 text-xs sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 self-start sm:self-auto"
            >
              Using offline calculator
            </Badge>
          )}
        </div>
        <p className="text-primary-foreground/90 mt-2 sm:mt-3 text-sm sm:text-lg">
          Here's your cost estimate for a {(basics.bhk || "2bhk").toUpperCase()}{" "}
          {basics.pkg || "Premium"} package
        </p>
      </div>

      <Card className="elegant-card">
        <CardHeader className="p-4 sm:p-6 md:p-8">
          <CardTitle className="text-xl sm:text-2xl text-foreground font-bold">
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-sm sm:text-base">
            <div>
              <span className="text-muted-foreground">Carpet Area:</span>
              <p className="font-bold text-foreground text-base sm:text-lg">
                {basics.carpetAreaSqft} sq ft
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Configuration:</span>
              <p className="font-bold text-foreground text-base sm:text-lg">
                {(basics.bhk || "2bhk").toUpperCase()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Package:</span>
              <p className="font-bold text-foreground text-base sm:text-lg">
                {basics.pkg || "Premium"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="elegant-card">
        <CardHeader className="p-4 sm:p-6 md:p-8">
          <CardTitle className="text-xl sm:text-2xl text-foreground font-bold">
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="space-y-3 sm:space-y-4">
            {categories.map((cat) => {
              const total = breakdown.totalsByCategory[cat];
              const display = formatPrice(total);

              return (
                <div
                  key={String(cat)}
                  className="flex justify-between items-center py-2 sm:py-3 border-b border-white/20 last:border-b-0"
                >
                  <span className="text-foreground font-semibold text-sm sm:text-lg">
                    {String(cat)}
                  </span>
                  <span className="text-foreground font-semibold text-sm sm:text-lg">
                    {display}
                  </span>
                </div>
              );
            })}

            <div className="flex justify-between items-center py-3 sm:py-4 border-t-2 border-white/30 mt-4 sm:mt-6">
              <span className="text-lg sm:text-2xl font-bold text-foreground">
                Grand Total
              </span>
              <span className="text-lg sm:text-2xl font-bold text-primary">
                {formatPrice(breakdown.grandTotal)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6">
        {/* Left: Back button */}
        <Button
          variant="outline"
          onClick={() => setCurrentStep(4)}
          className="bg-white/50 backdrop-blur-md border-white/40 text-foreground hover:bg-white/70 h-12 sm:h-14 px-6 sm:px-8 rounded-lg text-sm sm:text-base font-semibold shadow-md order-2 sm:order-1"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back
        </Button>

        {/* Center: Reset button */}
        <Button
          variant="outline"
          onClick={handleStartOver}
          className="bg-white/50 backdrop-blur-md border-white/40 text-foreground hover:bg-white/70 h-12 sm:h-14 px-6 sm:px-8 rounded-lg text-sm sm:text-base font-semibold shadow-md order-3 sm:order-2"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Reset
        </Button>

        {/* Right: View PDF button */}
        <Button
          onClick={handleViewPDF}
          className="btn-enhanced-primary h-12 sm:h-14 px-6 sm:px-8 rounded-lg text-base sm:text-lg font-semibold order-1 sm:order-3"
        >
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          View PDF
        </Button>
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        open={pdfPreviewOpen}
        onClose={() => setPdfPreviewOpen(false)}
        pdfBlob={pdfBlob}
        metadata={{
          bhk: basics.bhk || "2bhk",
          pkg: basics.pkg || "Premium",
          sqft: basics.carpetAreaSqft,
          grandTotal: breakdown.grandTotal,
        }}
      />
    </div>
  );
}
