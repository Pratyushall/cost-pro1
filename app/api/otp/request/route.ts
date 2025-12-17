import { NextResponse } from "next/server";
import { genOtp, storeOtp } from "@/lib/otp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ---------------- env (NO DEFAULTS) ---------------- */
const {
  AISENSY_API_URL,
  AISENSY_API_KEY,
  AISENSY_TEMPLATE_NAME,
  AISENSY_CAMPAIGN_NAME,
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

    if (
      !AISENSY_API_URL ||
      !AISENSY_API_KEY ||
      !AISENSY_TEMPLATE_NAME ||
      !AISENSY_CAMPAIGN_NAME
    ) {
      console.error("❌ ENV MISSING", {
        AISENSY_API_URL,
        AISENSY_API_KEY: !!AISENSY_API_KEY,
        AISENSY_TEMPLATE_NAME,
        AISENSY_CAMPAIGN_NAME,
      });

      return json({ ok: false, error: "env_missing" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const phoneRaw = String(body?.phone ?? "");
    const destination = toE164India(phoneRaw);

    if (!/^\+\d{10,15}$/.test(destination)) {
      return json({ ok: false, error: "bad_phone" }, 400);
    }

    /* ---- resend cooldown ---- */
    const now = Date.now();
    const cooldownMs = parseInt(OTP_RESEND_COOLDOWN_SECONDS, 10) * 1000;

    const prev = cooldown.get(destination);
    if (prev && now < prev.nextSendAt) {
      return json({ ok: false, error: "resend_too_soon" }, 429);
    }

    /* ---- generate + store OTP ---- */
    const code = genOtp(parseInt(OTP_DIGITS, 10));
    await storeOtp(destination, code);

    if (NEXT_PUBLIC_OTP_DUMMY === "true") {
      return json({ ok: true, dev: true, code });
    }

    /* ---- payload ---- */
    const payload = {
      apiKey: AISENSY_API_KEY,
      campaignName: AISENSY_CAMPAIGN_NAME,
      destination,
      userName: "Guest",
      source: AISENSY_SOURCE,
      templateName: AISENSY_TEMPLATE_NAME,
      templateParams: [code],
    };

    console.log("AISENSY PAYLOAD DEBUG", {
      campaignName: AISENSY_CAMPAIGN_NAME,
      templateName: AISENSY_TEMPLATE_NAME,
    });

    const res = await fetch(AISENSY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {}

    console.log("AISENSY RESPONSE", res.status, text);

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

    cooldown.set(destination, { nextSendAt: now + cooldownMs });

    return json({ ok: true });
  } catch (e: any) {
    console.error("OTP SERVER ERROR", e);
    return json({ ok: false, error: "server_error", detail: e.message }, 500);
  }
}
