// app/api/otp/request/route.ts
import { NextResponse } from "next/server";
import { genOtp, storeOtp } from "@/lib/otp";

const GRAPH = "https://graph.facebook.com/v21.0";

function toE164(input: string) {
  let p = (input || "").replace(/[^\d+]/g, "");
  if (p.startsWith("0")) p = p.replace(/^0+/, "");
  if (!p.startsWith("+")) p = `+91${p}`;
  return p;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const to = toE164(body?.phone || "");
    if (!/^\+?\d{10,15}$/.test(to)) {
      return NextResponse.json(
        { ok: false, error: "bad_phone" },
        { status: 400 }
      );
    }

    // generate & store 6-digit OTP with TTL/attempt limits
    const otp = genOtp(6);
    await storeOtp(to, otp);

    // send via WhatsApp Cloud API (test number allows plain text)
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
