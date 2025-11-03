// app/api/otp/verify/route.ts
import { NextResponse } from "next/server";
import { normalizePhone, verifyOtp } from "@/lib/otp-store";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let { phone, code } = body || {};
    if (!phone || !code)
      return NextResponse.json(
        { error: "phone_and_code_required" },
        { status: 400 }
      );

    phone = normalizePhone(phone);
    const result = verifyOtp(phone, String(code));

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, reason: result.reason },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "server_error" },
      { status: 500 }
    );
  }
}
