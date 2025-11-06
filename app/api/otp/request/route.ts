import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const {
  AISENSY_API_URL = "",
  AISENSY_API_KEY = "",
  AISENSY_TEMPLATE_NAME = "",
  AISENSY_CAMPAIGN_NAME = "OTP",
  AISENSY_SOURCE = "website",
  OTP_DIGITS = "6", // you kept 6; fine
  OTP_TTL_MINUTES = "5",
  OTP_RESEND_COOLDOWN_SECONDS = "45",
  NEXT_PUBLIC_OTP_DUMMY = "false",
} = process.env;

// simple in-memory store (swap to Redis in prod)
type Rec = { code: string; exp: number; nextSendAt: number };
const mem: Map<string, Rec> = (global as any).__otpStore ?? new Map();
(global as any).__otpStore = mem;

const toE164India = (raw: string) => {
  const d = (raw || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 10) return `+91${d}`;
  if (d.startsWith("91") && d.length > 10) return `+${d}`;
  return d.startsWith("+") ? d : `+${d}`;
};
const gen = (len: number) =>
  crypto
    .randomInt(0, 10 ** len)
    .toString()
    .padStart(len, "0");

const j = (res: any, status = 200) => NextResponse.json(res, { status });

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const phoneRaw = String(body?.phone ?? "");
    const destination = toE164India(phoneRaw); // e.g. +91970xxxxxxx
    if (!/^\+\d{10,15}$/.test(destination)) {
      return j({ ok: false, error: "bad_phone", detail: destination }, 400);
    }

    // env sanity
    const miss: string[] = [];
    if (!AISENSY_API_URL) miss.push("AISENSY_API_URL");
    if (!AISENSY_API_KEY) miss.push("AISENSY_API_KEY");
    if (!AISENSY_TEMPLATE_NAME) miss.push("AISENSY_TEMPLATE_NAME");
    if (miss.length)
      return j({ ok: false, error: "misconfigured", missing: miss }, 500);

    // cooldown
    const now = Date.now();
    const cooldownMs = parseInt(OTP_RESEND_COOLDOWN_SECONDS, 10) * 1000;
    const prev = mem.get(destination);
    if (prev && now < prev.nextSendAt)
      return j({ ok: false, error: "resend_too_soon" }, 429);

    const len = parseInt(OTP_DIGITS, 10);
    const ttlMin = parseInt(OTP_TTL_MINUTES, 10);
    const code = gen(len);

    // dev bypass
    if (NEXT_PUBLIC_OTP_DUMMY === "true") {
      mem.set(destination, {
        code,
        exp: now + ttlMin * 60_000,
        nextSendAt: now + cooldownMs,
      });
      return j({ ok: true, dev: true, code, expiresInSec: ttlMin * 60 });
    }

    // store first (we'll rollback on failure)
    mem.set(destination, {
      code,
      exp: now + ttlMin * 60_000,
      nextSendAt: now + cooldownMs,
    });

    // --- payload builder (Campaign v2) ---
    const makePayload = (dest: string) => ({
      apiKey: AISENSY_API_KEY,
      campaignName: AISENSY_CAMPAIGN_NAME,
      destination: dest, // primary try
      userName: "Guest",
      source: AISENSY_SOURCE,
      templateParams: [code], // {{1}} -> OTP
      tags: ["otp"],
      attributes: { ttl_minutes: String(ttlMin) },
      templateName: AISENSY_TEMPLATE_NAME, // keep explicit
    });

    // try with +E.164 first
    let r = await fetch(AISENSY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makePayload(destination)),
    });
    let txt = await r.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(txt);
    } catch {}

    // if number-format error, retry with digits-only (91XXXXXXXXXX)
    const looksLikeNumberError =
      !r.ok && /invalid|phone|destination|number/i.test(txt);

    if (!r.ok && looksLikeNumberError) {
      const digitsOnly = destination.replace(/^\+/, "");
      r = await fetch(AISENSY_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(makePayload(digitsOnly)),
      });
      txt = await r.text();
      parsed = null;
      try {
        parsed = JSON.parse(txt);
      } catch {}
    }

    if (!r.ok) {
      mem.delete(destination); // allow immediate retry
      return j(
        {
          ok: false,
          error: "aisensy_failed",
          status: r.status,
          detail: parsed || txt,
        },
        502
      );
    }

    return j({ ok: true, expiresInSec: ttlMin * 60, provider: parsed || txt });
  } catch (e: any) {
    return j(
      { ok: false, error: "server_error", detail: String(e?.message || e) },
      500
    );
  }
}
