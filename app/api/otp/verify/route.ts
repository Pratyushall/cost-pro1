import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type OtpRow = { code: string; exp: number };

function toE164India(raw: string) {
  const d = (raw || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 10) return `+91${d}`;
  if (d.startsWith("91") && d.length > 10) return `+${d}`;
  return d.startsWith("+") ? d : `+${d}`;
}

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    const destination = toE164India(String(phone || ""));
    if (!/^\+\d{10,15}$/.test(destination) || !/^\d{6}$/.test(String(otp))) {
      return NextResponse.json(
        { ok: false, error: "bad_input" },
        { status: 400 }
      );
    }

    // Safely read/write a global Map without TS complaints
    const g = globalThis as unknown as { __otp?: Map<string, OtpRow> };
    if (!g.__otp) g.__otp = new Map<string, OtpRow>();
    const map = g.__otp;

    const row = map.get(destination);
    if (!row)
      return NextResponse.json(
        { ok: false, error: "missing" },
        { status: 400 }
      );
    if (Date.now() > row.exp)
      return NextResponse.json(
        { ok: false, error: "expired" },
        { status: 400 }
      );
    if (row.code !== String(otp))
      return NextResponse.json(
        { ok: false, error: "invalid" },
        { status: 400 }
      );

    map.delete(destination);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "server_error", detail: e?.message },
      { status: 500 }
    );
  }
}
