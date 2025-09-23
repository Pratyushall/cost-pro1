"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Channel = "email" | "sms";

function isSessionValid(s?: string | null) {
  if (!s) return false;
  try {
    const [b, sig] = s.split(".");
    if (!b || !sig) return false;
    const data = JSON.parse(atob(b.replace(/-/g, "+").replace(/_/g, "/")));
    return data?.exp && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function OtpGate({
  onVerified,
}: {
  onVerified: (session: string) => void;
}) {
  const [channel, setChannel] = useState<Channel>("email");
  const [to, setTo] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"enter" | "code" | "done">("enter");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const s = localStorage.getItem("otpSession");
    if (isSessionValid(s)) {
      onVerified(s!);
      setStep("done");
    }
  }, [onVerified]);

  async function requestOtp() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, to }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Failed to send OTP");
      setToken(j.token);
      setStep("code");
    } catch (e: any) {
      setErr(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!token) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, to, code }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Incorrect code");
      localStorage.setItem("otpSession", j.session);
      setStep("done");
      onVerified(j.session);
    } catch (e: any) {
      setErr(e.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") return null;

  return (
    <Card className="border border-yellow-300 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-black">
          Verify to view your estimate
        </CardTitle>
        <p className="text-sm text-gray-700">
          We’ll send a one-time code to verify it’s you.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <button
            className={`px-2 py-1 rounded border ${
              channel === "email"
                ? "bg-yellow-400 text-black border-yellow-400"
                : "border-yellow-400 text-yellow-700"
            }`}
            onClick={() => setChannel("email")}
            type="button"
          >
            Email
          </button>
          <button
            className={`px-2 py-1 rounded border ${
              channel === "sms"
                ? "bg-yellow-400 text-black border-yellow-400"
                : "border-yellow-400 text-yellow-700"
            }`}
            onClick={() => setChannel("sms")}
            type="button"
          >
            SMS
          </button>
        </div>

        {step === "enter" && (
          <div className="flex gap-2">
            <Input
              placeholder={
                channel === "email" ? "you@example.com" : "+91XXXXXXXXXX"
              }
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <Button onClick={requestOtp} disabled={loading || !to}>
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        )}

        {step === "code" && (
          <div className="flex gap-2">
            <Input
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button onClick={verifyOtp} disabled={loading || code.length !== 6}>
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        )}

        {err && <p className="text-red-600 text-sm">{err}</p>}
      </CardContent>
    </Card>
  );
}
