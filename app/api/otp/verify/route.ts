// app/api/otp/verify/route.ts
import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";

function toE164(input: string) {
  let p = (input || "").replace(/[^\d+]/g, "");
  if (p.startsWith("0")) p = p.replace(/^0+/, "");
  if (!p.startsWith("+")) p = `+91${p}`;
  return p;
}

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    const id = toE164(phone || "");
    if (!/^\+?\d{10,15}$/.test(id)) {
      return NextResponse.json(
        { ok: false, error: "bad_phone" },
        { status: 400 }
      );
    }
    if (!/^\d{6}$/.test(otp || "")) {
      return NextResponse.json(
        { ok: false, error: "bad_otp" },
        { status: 400 }
      );
    }

    const result = await verifyOtp(id, otp);
    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.reason,
          remaining: (result as any).remaining ?? 0,
        },
        { status: 400 }
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
