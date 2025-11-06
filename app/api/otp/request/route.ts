import { NextResponse } from "next/server";
import crypto from "crypto";
import { genOtp, storeOtp } from "@/lib/otp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const {
  AISENSY_API_URL = "",
  AISENSY_API_KEY = "",
  AISENSY_TEMPLATE_NAME = "",
  AISENSY_CAMPAIGN_NAME = "OTP",
  AISENSY_SOURCE = "website",
  OTP_DIGITS = "6",
  OTP_TTL_MINUTES = "5",
  OTP_RESEND_COOLDOWN_SECONDS = "45",
  NEXT_PUBLIC_OTP_DUMMY = "false",
} = process.env;

// --- resend cooldown (in-memory; use Redis for multi-instance) ---
type CoolRec = { nextSendAt: number };
const cooldown: Map<string, CoolRec> =
  (global as any).__otpCooldown ?? new Map();
(global as any).__otpCooldown = cooldown;

const toE164India = (raw: string) => {
  const d = (raw || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 10) return `+91${d}`;
  if (d.startsWith("91") && d.length > 10) return `+${d}`;
  return d.startsWith("+") ? d : `+${d}`;
};
const json = (res: any, status = 200) => NextResponse.json(res, { status });

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const phoneRaw = String(body?.phone ?? "");
    const destination = toE164India(phoneRaw); // store/send using E.164 with +

    if (!/^\+\d{10,15}$/.test(destination)) {
      return json({ ok: false, error: "bad_phone", detail: destination }, 400);
    }

    // env sanity for provider
    const miss: string[] = [];
    if (!AISENSY_API_URL) miss.push("AISENSY_API_URL");
    if (!AISENSY_API_KEY) miss.push("AISENSY_API_KEY");
    if (!AISENSY_TEMPLATE_NAME) miss.push("AISENSY_TEMPLATE_NAME");
    if (miss.length && NEXT_PUBLIC_OTP_DUMMY !== "true") {
      return json({ ok: false, error: "misconfigured", missing: miss }, 500);
    }

    // resend cooldown
    const now = Date.now();
    const cooldownMs = parseInt(OTP_RESEND_COOLDOWN_SECONDS, 10) * 1000;
    const prev = cooldown.get(destination);
    if (prev && now < prev.nextSendAt) {
      return json({ ok: false, error: "resend_too_soon" }, 429);
    }

    // generate & persist OTP (KV or in-memory via lib/otp)
    const len = parseInt(OTP_DIGITS, 10) || 6;
    const ttlMin = parseInt(OTP_TTL_MINUTES, 10) || 5;
    const code = genOtp(len);
    await storeOtp(destination, code);

    // dev bypass (don’t hit provider)
    if (NEXT_PUBLIC_OTP_DUMMY === "true") {
      cooldown.set(destination, { nextSendAt: now + cooldownMs });
      return json({ ok: true, dev: true, code, expiresInSec: ttlMin * 60 });
    }

    // --- AiSensy Campaign v2 payload ---
    const payload = {
      apiKey: AISENSY_API_KEY,
      campaignName: AISENSY_CAMPAIGN_NAME,
      destination, // E.164 with '+'
      userName: "Guest",
      source: AISENSY_SOURCE,
      templateParams: [code], // {{1}} -> OTP in your template
      tags: ["otp"],
      attributes: { ttl_minutes: String(ttlMin) },
      templateName: AISENSY_TEMPLATE_NAME,
    };

    // try with '+', optionally retry digits-only if tenant complains
    const send = async (dest: string) => {
      const r = await fetch(AISENSY_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, destination: dest }),
      });
      const txt = await r.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(txt);
      } catch {
        /* ignore */
      }
      return { r, txt, parsed };
    };

    let { r, txt, parsed } = await send(destination);
    if (!r.ok && /invalid|phone|destination|number/i.test(txt)) {
      const digitsOnly = destination.replace(/^\+/, "");
      ({ r, txt, parsed } = await send(digitsOnly));
    }

    if (!r.ok) {
      // don’t block user from retrying → no cooldown set on provider failure
      return json(
        {
          ok: false,
          error: "aisensy_failed",
          status: r.status,
          detail: parsed || txt,
        },
        502
      );
    }

    // success → set cooldown and return
    cooldown.set(destination, { nextSendAt: now + cooldownMs });
    return json({
      ok: true,
      expiresInSec: ttlMin * 60,
      provider: parsed || txt,
    });
  } catch (e: any) {
    return json(
      { ok: false, error: "server_error", detail: String(e?.message || e) },
      500
    );
  }
}
