import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Rec = { code: string; exp: number; nextSendAt: number };
const mem: Map<string, Rec> = (global as any).__otpStore ?? new Map();

function toE164India(raw: string) {
  const d = (raw || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 10) return `+91${d}`;
  if (d.startsWith("91") && d.length > 10) return `+${d}`;
  return d.startsWith("+") ? d : `+${d}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let { phone, code } = body || {};
    if (!phone || !code)
      return NextResponse.json(
        { error: "phone_and_code_required" },
        { status: 400 }
      );

    const key = toE164India(String(phone));
    const rec = mem.get(key);
    if (!rec)
      return NextResponse.json(
        { ok: false, reason: "not_found" },
        { status: 400 }
      );
    if (Date.now() > rec.exp)
      return NextResponse.json(
        { ok: false, reason: "expired" },
        { status: 400 }
      );

    if (String(code) !== rec.code)
      return NextResponse.json(
        { ok: false, reason: "mismatch" },
        { status: 400 }
      );

    // success → consume
    mem.delete(key);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "server_error" },
      { status: 500 }
    );
  }
}
