// app/api/otp/verify/route.ts
import { NextResponse } from "next/server";
import { verifyToken, matchesCode } from "@/lib/otp";
import crypto from "crypto";

const SESSION_TTL = 60 * 60; // 1 hour

export async function POST(req: Request) {
  try {
    const { token, to, code } = await req.json();
    if (!token || !to || !code)
      return NextResponse.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      );

    const payload = verifyToken(token);
    if (!payload)
      return NextResponse.json(
        { ok: false, error: "OTP expired or invalid" },
        { status: 400 }
      );
    if (!matchesCode(payload, to, code))
      return NextResponse.json(
        { ok: false, error: "Incorrect code" },
        { status: 400 }
      );

    // create a lightweight, signed session proof (stateless)
    const now = Math.floor(Date.now() / 1000);
    const sess = { to, exp: now + SESSION_TTL, v: 1 };
    const body = Buffer.from(JSON.stringify(sess)).toString("base64url");
    const sig = crypto
      .createHmac("sha256", process.env.OTP_SIGNING_SECRET || "dev-secret")
      .update(body)
      .digest("base64url");
    const session = `${body}.${sig}`;

    return NextResponse.json({ ok: true, session, exp: sess.exp });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
