import { NextResponse } from "next/server";
import { genOtp, storeOtp } from "@/lib/otp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ---------------- env ---------------- */
const {
  AISENSY_API_URL = "https://backend.aisensy.com/campaign/t1/api/v2",
  AISENSY_API_KEY = "",
  AISENSY_TEMPLATE_NAME = "otp_message_new",
  AISENSY_CAMPAIGN_NAME = "otp_message_new",
  AISENSY_SOURCE = "Calculator",
  OTP_DIGITS = "6",
  OTP_TTL_MINUTES = "5",
  OTP_RESEND_COOLDOWN_SECONDS = "45",
  NEXT_PUBLIC_OTP_DUMMY = "false",
} = process.env;

/* ---------------- cooldown (in-memory) ---------------- */
type CoolRec = { nextSendAt: number };
const cooldown: Map<string, CoolRec> =
  (global as any).__otpCooldown ?? new Map();
(global as any).__otpCooldown = cooldown;

/* ---------------- utils ---------------- */
const toE164India = (raw: string) => {
  const d = (raw || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 10) return `+91${d}`;
  if (d.startsWith("91") && d.length > 10) return `+${d}`;
  return d.startsWith("+") ? d : `+${d}`;
};

const json = (res: any, status = 200) => NextResponse.json(res, { status });

/* ---------------- handler ---------------- */
export async function POST(req: Request) {
  try {
    console.log("🔥 OTP REQUEST HIT");

    const body = await req.json().catch(() => ({}));
    const phoneRaw = String(body?.phone ?? "");
    const destination = toE164India(phoneRaw);

    if (!/^\+\d{10,15}$/.test(destination)) {
      return json({ ok: false, error: "bad_phone" }, 400);
    }

    /* ---- env sanity ---- */
    const missing: string[] = [];
    if (!AISENSY_API_URL) missing.push("AISENSY_API_URL");
    if (!AISENSY_API_KEY) missing.push("AISENSY_API_KEY");
    if (!AISENSY_TEMPLATE_NAME) missing.push("AISENSY_TEMPLATE_NAME");

    if (missing.length && NEXT_PUBLIC_OTP_DUMMY !== "true") {
      console.error("❌ ENV MISSING", missing);
      return json({ ok: false, error: "misconfigured", missing }, 500);
    }

    console.log("ENV CHECK", {
      hasKey: !!AISENSY_API_KEY,
      template: AISENSY_TEMPLATE_NAME,
      campaign: AISENSY_CAMPAIGN_NAME,
      dummy: NEXT_PUBLIC_OTP_DUMMY,
    });

    /* ---- resend cooldown ---- */
    const now = Date.now();
    const cooldownMs = parseInt(OTP_RESEND_COOLDOWN_SECONDS, 10) * 1000;

    const prev = cooldown.get(destination);
    if (prev && now < prev.nextSendAt) {
      return json({ ok: false, error: "resend_too_soon" }, 429);
    }

    /* ---- generate + store OTP ---- */
    const len = parseInt(OTP_DIGITS, 10) || 6;
    const ttlMin = parseInt(OTP_TTL_MINUTES, 10) || 5;

    const code = genOtp(len);
    await storeOtp(destination, code);

    /* ---- dummy mode ---- */
    if (NEXT_PUBLIC_OTP_DUMMY === "true") {
      cooldown.set(destination, { nextSendAt: now + cooldownMs });
      return json({
        ok: true,
        dev: true,
        code,
        expiresInSec: ttlMin * 60,
      });
    }

    /* ---- AiSensy payload (THIS IS CRITICAL) ---- */
    const payload = {
      apiKey: AISENSY_API_KEY, // ✅ MUST be in body
      campaignName: AISENSY_CAMPAIGN_NAME,
      destination,
      userName: "Guest",
      source: AISENSY_SOURCE,
      templateName: AISENSY_TEMPLATE_NAME,
      templateParams: [code], // ✅ ARRAY PARAM {{1}}
    };

    /* ---- send helper ---- */
    const send = async (dest: string) => {
      const res = await fetch(AISENSY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ❌ NO Authorization header
        },
        body: JSON.stringify({
          ...payload,
          destination: dest,
        }),
      });

      const text = await res.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
      } catch {}

      console.log("AISENSY RESPONSE", {
        status: res.status,
        body: text,
      });

      return { res, parsed };
    };

    /* ---- primary send ---- */
    let { res, parsed } = await send(destination);

    /* ---- retry without + (AiSensy quirk) ---- */
    if (!res.ok) {
      const digitsOnly = destination.replace(/^\+/, "");
      ({ res, parsed } = await send(digitsOnly));
    }

    if (!res.ok) {
      return json(
        {
          ok: false,
          error: "aisensy_failed",
          status: res.status,
          detail: parsed,
        },
        502
      );
    }

    /* ---- success ---- */
    cooldown.set(destination, { nextSendAt: now + cooldownMs });

    return json({
      ok: true,
      expiresInSec: ttlMin * 60,
      provider: parsed,
    });
  } catch (e: any) {
    console.error("OTP SERVER ERROR", e);
    return json({ ok: false, error: "server_error", detail: e?.message }, 500);
  }
}
