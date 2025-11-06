import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ----- ENV (must match Vercel exactly) -----
const {
  AISENSY_API_URL = "",
  AISENSY_API_KEY = "",
  AISENSY_TEMPLATE_NAME = "",
  AISENSY_CAMPAIGN_NAME = "OTP",
  AISENSY_SOURCE = "website",
  OTP_DIGITS = "6",
  OTP_TTL_MINUTES = "5",
  OTP_RESEND_COOLDOWN_SECONDS = "45",
} = process.env;

// Simple in-memory store -> swap with Redis in prod
type Rec = { code: string; exp: number; nextSendAt: number };
const mem = (global as any).__otpStore ?? new Map<string, Rec>();
(global as any).__otpStore = mem;

function toE164India(raw: string) {
  const d = (raw || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 10) return `+91${d}`;
  if (d.startsWith("91") && d.length > 10) return `+${d}`;
  return d.startsWith("+") ? d : `+${d}`;
}

function generateOtp(len: number) {
  const max = 10 ** len - 1;
  const num = crypto.randomInt(0, max);
  return num.toString().padStart(len, "0");
}

function json(res: any, status = 200) {
  return NextResponse.json(res, { status });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const phoneInput = String(body?.phone ?? "");
    const destination = toE164India(phoneInput);

    if (!/^\+\d{10,15}$/.test(destination)) {
      return json({ ok: false, error: "bad_phone" }, 400);
    }

    // Env sanity
    if (!AISENSY_API_URL || !AISENSY_API_KEY || !AISENSY_TEMPLATE_NAME) {
      return json(
        {
          ok: false,
          error: "misconfigured",
          detail:
            "Missing AISENSY_API_URL / AISENSY_API_KEY / AISENSY_TEMPLATE_NAME",
        },
        500
      );
    }

    const now = Date.now();
    const prev: Rec | undefined = mem.get(destination);
    const cooldownMs = parseInt(OTP_RESEND_COOLDOWN_SECONDS, 10) * 1000;
    if (prev && prev.nextSendAt && now < prev.nextSendAt) {
      return json({ ok: false, error: "resend_too_soon" }, 429);
    }

    const digits = parseInt(OTP_DIGITS, 10);
    const ttlMin = parseInt(OTP_TTL_MINUTES, 10);
    const code = generateOtp(digits);

    // Persist (replace with Redis in prod)
    mem.set(destination, {
      code,
      exp: now + ttlMin * 60_000,
      nextSendAt: now + cooldownMs,
    });

    // AiSensy Campaign v2 payload
    const payload = {
      apiKey: AISENSY_API_KEY,
      campaignName: AISENSY_CAMPAIGN_NAME,
      destination, // E.164 with +
      userName: "Guest",
      source: AISENSY_SOURCE,
      templateParams: [code], // Your template has {{1}} = OTP
      tags: ["otp"],
      attributes: {
        ttl_minutes: String(ttlMin), // optional, just for your records
      },
      // If AiSensy needs the exact template: add it as `templateName`
      templateName: AISENSY_TEMPLATE_NAME,
    };

    const r = await fetch(AISENSY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const txt = await r.text();
    if (!r.ok) {
      // rollback to allow retry immediately if delivery failed
      mem.delete(destination);
      return json({ ok: false, error: "aisensy_failed", detail: txt }, 502);
    }

    return json({ ok: true, expiresInSec: ttlMin * 60 });
  } catch (e: any) {
    return json(
      { ok: false, error: "server_error", detail: String(e?.message || e) },
      500
    );
  }
}
