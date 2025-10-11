// app/api/otp/request/route.ts
import { NextResponse } from "next/server";
import { genOtp, storeOtp } from "@/lib/otp";

// Format to E.164; UI sends digits only, we default to +91
function toE164(input: string) {
  let p = (input || "").replace(/[^\d]/g, ""); // digits only
  if (!p) return "";
  if (p.startsWith("0")) p = p.replace(/^0+/, "");
  // default India if no prefix provided
  return p.startsWith("91") && p.length > 10 ? `+${p}` : `+91${p}`;
}

function json(res: any, status = 200) {
  return NextResponse.json(res, { status });
}

export async function POST(req: Request) {
  try {
    // ---------- read & validate input ----------
    const body = await req.json().catch(() => ({} as any));
    const phoneDigits = String(body?.phone ?? "").replace(/[^\d]/g, "");
    const to = toE164(phoneDigits);

    if (!/^\+\d{10,15}$/.test(to)) {
      return json({ ok: false, error: "bad_phone" }, 400);
    }

    // ---------- env checks ----------
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

    // ---------- generate & persist OTP ----------
    const ttlSec = parseInt(process.env.OTP_TTL_SEC || "300", 10);
    const otp = genOtp(6);
    await storeOtp(to, otp); // your Redis/DB logic (with TTL & attempt limits inside)

    // ---------- send via AiSensy Template API ----------
    // IMPORTANT: Match this payload to the exact fields your AiSensy API page shows.
    // Common pattern for template sends (body variable #1 = OTP):
    const payload = {
      // the names below are the most common; adjust if your API page shows different keys
      template_name: TEMPLATE, // e.g., "otp_auth"
      language_code: LANG, // e.g., "en" or "en_US"
      // some accounts expect "phone_number", others "to" — AiSensy shows this on the API page
      phone_number: to, // if your docs say "to", change to: to: to,
      // parameters can be named or positional. If your template is positional, use components:
      parameters: [
        // If your template uses a single body variable {{1}}, this works:
        { type: "text", text: otp },
        // If AiSensy shows NAMED variables, use: { name: "code", value: otp }
      ],
      // Optional label in their UI:
      broadcast_name: "OTP",
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
      // (Optional) rollback stored OTP on hard failure:
      // await deleteOtp(to);
      return json({ ok: false, error: "send_failed", detail }, 502);
    }

    // optional: inspect response JSON for id/status
    // const respJson = await aiRes.json().catch(() => ({}));

    return json({ ok: true, expiresInSec: ttlSec });
  } catch (e: any) {
    return json(
      { ok: false, error: "server_error", detail: String(e?.message || e) },
      500
    );
  }
}
