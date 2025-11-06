import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const toE164India = (raw: string) => {
  const d = (raw || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 10) return `+91${d}`;
  if (d.startsWith("91") && d.length > 10) return `+${d}`;
  return d.startsWith("+") ? d : `+${d}`;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let { phone, code } = body || {};
    if (!phone || !code) {
      return NextResponse.json(
        { error: "phone_and_code_required" },
        { status: 400 }
      );
    }

    const key = toE164India(String(phone));
    if (!/^\+\d{10,15}$/.test(key)) {
      return NextResponse.json(
        { ok: false, reason: "bad_phone" },
        { status: 400 }
      );
    }

    const res = await verifyOtp(key, String(code));

    if (!res.ok) {
      // Map reasons to consistent client messages/status
      if (res.reason === "expired") {
        return NextResponse.json(
          { ok: false, reason: "expired" },
          { status: 400 }
        );
      }
      if (res.reason === "locked") {
        return NextResponse.json(
          { ok: false, reason: "locked" },
          { status: 429 }
        );
      }
      // "invalid" (with remaining attempts)
      return NextResponse.json(
        { ok: false, reason: "mismatch", remaining: (res as any).remaining },
        { status: 400 }
      );
    }

    // If you issue a real session/JWT, return it here
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
