// app/api/otp/send/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { normalizePhone, setOtp, canResend } from "@/lib/otp-store";
import { sendOtpViaAiSensy } from "@/lib/aisensy";

const {
  OTP_DIGITS = "6",
  OTP_TTL_MINUTES = "10",
  OTP_RESEND_COOLDOWN_SECONDS = "45",
} = process.env;

function generateOtp(len: number) {
  const max = 10 ** len - 1;
  const num = crypto.randomInt(0, max);
  return num.toString().padStart(len, "0");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let phone: string = body?.phone;
    if (!phone)
      return NextResponse.json({ error: "phone required" }, { status: 400 });

    phone = normalizePhone(phone);
    if (!/^\d{10,15}$/.test(phone)) {
      return NextResponse.json({ error: "invalid phone" }, { status: 400 });
    }

    if (!canResend(phone)) {
      return NextResponse.json({ error: "resend_too_soon" }, { status: 429 });
    }

    const otp = generateOtp(parseInt(OTP_DIGITS, 10));
    setOtp(
      phone,
      otp,
      parseInt(OTP_TTL_MINUTES, 10),
      parseInt(OTP_RESEND_COOLDOWN_SECONDS, 10)
    );

    await sendOtpViaAiSensy({
      to: phone, // keep as "91XXXXXXXXXX" (no +, no spaces)
      otp,
      ttlMinutes: OTP_TTL_MINUTES,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "server_error" },
      { status: 500 }
    );
  }
}
