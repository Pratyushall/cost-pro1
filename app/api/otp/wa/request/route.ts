// app/api/otp/wa/request/route.ts
import { NextResponse } from "next/server";
import { genOtp, storeOtp } from "@/lib/otp";

const GRAPH = "https://graph.facebook.com/v21.0";

function toE164(input: string) {
  let p = (input || "").replace(/[^\d+]/g, "");
  if (p.startsWith("0")) p = p.replace(/^0+/, "");
  if (!p.startsWith("+")) p = `+91${p}`; // default to India if no '+'
  return p;
}

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    const to = toE164(phone || "");
    if (!/^\+?\d{10,15}$/.test(to)) {
      return NextResponse.json(
        { ok: false, error: "bad_phone" },
        { status: 400 }
      );
    }

    const otp = genOtp(6);
    await storeOtp(to, otp);

    // In sandbox/test number: plain text is allowed.
    // For production: switch to a pre-approved Authentication template.
    const res = await fetch(
      `${GRAPH}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: {
            preview_url: false,
            body: `Your verification code is ${otp}. It expires in ${
              parseInt(process.env.OTP_TTL_SEC || "300", 10) / 60
            } minutes.`,
          },
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { ok: false, error: "send_failed", detail },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "server_error", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
