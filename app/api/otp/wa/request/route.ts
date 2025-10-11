// app/api/otp/wa/request/route.ts
import { NextResponse } from "next/server";
import { genOtp, storeOtp } from "@/lib/otp";

// Convert digits to E.164 (+91 default)
function toE164(input: string) {
  const digits = String(input || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  // strip leading zeros
  const trimmed = digits.replace(/^0+/, "");
  // if already starts with 91 and length > 10, assume it's full Indian E.164
  if (trimmed.startsWith("91") && trimmed.length > 10) return `+${trimmed}`;
  // default to India
  return `+91${trimmed}`;
}

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(req: Request) {
  try {
    const { phone } = await req.json().catch(() => ({ phone: "" }));
    const to = toE164(phone);

    // E.164 sanity check
    if (!/^\+\d{10,15}$/.test(to)) {
      return json({ ok: false, error: "bad_phone" }, 400);
    }

    // ---- env checks ----
    const SEND_URL = process.env.AISENSY_SEND_URL;
    const API_KEY = process.env.AISENSY_API_KEY;
    const TEMPLATE = process.env.AISENSY_TEMPLATE_NAME;
    const LANG = process.env.AISENSY_TEMPLATE_LANG || "en";

    if (!SEND_URL || !API_KEY || !TEMPLATE) {
      return json(
        {
          ok: false,
          error: "misconfigured",
          detail:
            "Missing AISENSY_SEND_URL / AISENSY_API_KEY / AISENSY_TEMPLATE_NAME",
        },
        500
      );
    }

    // ---- generate & persist OTP with your existing logic ----
    const ttlSec = parseInt(process.env.OTP_TTL_SEC || "300", 10);
    const otp = genOtp(6);
    await storeOtp(to, otp);

    // ---- send via AiSensy (template) ----
    // NOTE: Match keys to what your AiSensy API page shows.
    // Common shape:
    const payload = {
      template_name: TEMPLATE, // e.g. "otp_auth"
      language_code: LANG, // e.g. "en" or "en_US"
      phone_number: to, // some accounts use "to" instead
      // If your template uses {{1}} in the BODY, pass the OTP as the first parameter
      parameters: [
        { type: "text", text: otp }, // or { name: "code", value: otp } if named variables
      ],
      broadcast_name: "OTP", // optional label
    };

    const aiRes = await fetch(SEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text().catch(() => "");
      return json({ ok: false, error: "send_failed", detail }, 502);
    }

    // Optionally inspect response JSON for message id
    // const resJson = await aiRes.json().catch(() => ({}));

    return json({ ok: true, expiresInSec: ttlSec });
  } catch (e: any) {
    return json(
      { ok: false, error: "server_error", detail: String(e?.message || e) },
      500
    );
  }
}
