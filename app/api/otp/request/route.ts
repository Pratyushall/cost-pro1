// app/api/otp/request/route.ts
import { NextResponse } from "next/server";
import { genCode, makePayload, signToken, type OtpChannel } from "@/lib/otp";

export async function POST(req: Request) {
  try {
    const { channel, to } = (await req.json()) as {
      channel: OtpChannel;
      to: string;
    };
    if (!channel || !to)
      return NextResponse.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      );

    const code = genCode();
    const payload = makePayload(channel, to, code);
    const token = signToken(payload);

    if (channel === "email") {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      const FROM = process.env.OTP_FROM_EMAIL;
      if (!RESEND_API_KEY || !FROM)
        return NextResponse.json(
          { ok: false, error: "Email not configured" },
          { status: 500 }
        );

      // simple mail via Resend REST
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM,
          to,
          subject: "Your verification code",
          html: `<p>Your OTP is <strong>${code}</strong>. It expires in 5 minutes.</p>`,
        }),
      });
    } else if (channel === "sms") {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const auth = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_FROM_NUMBER;
      if (!sid || !auth || !from)
        return NextResponse.json(
          { ok: false, error: "SMS not configured" },
          { status: 500 }
        );

      const body = new URLSearchParams({
        To: to,
        From: from,
        Body: `Your OTP is ${code}. It expires in 5 minutes.`,
      });

      await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization:
              "Basic " + Buffer.from(`${sid}:${auth}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        }
      );
    } else {
      return NextResponse.json(
        { ok: false, error: "Unsupported channel" },
        { status: 400 }
      );
    }

    // you can add minimal anti-spam by refusing reissue for 30s via a short token field (iat) on client-side UI
    return NextResponse.json({ ok: true, token });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
