// app/api/otp/wa/request/route.ts
import { NextResponse } from "next/server";

// Optional (good defaults for API routes)
export const runtime = "nodejs"; // or "edge" if you prefer
export const dynamic = "force-dynamic"; // don't cache
export const revalidate = 0;

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
    const { phone, name, email, consentConnect, consentCall } = body || {};

    const destination = toE164India(String(phone || ""));
    if (!/^\+\d{10,15}$/.test(destination)) {
      return NextResponse.json(
        { ok: false, error: "bad_phone", detail: destination },
        { status: 400 }
      );
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));

    // simple in-memory store (swap with Redis in prod)
    // @ts-ignore
    global.__otp ||= new Map<string, { code: string; exp: number }>();
    // @ts-ignore
    global.__otp.set(destination, { code, exp: Date.now() + 5 * 60_000 });

    if (process.env.NEXT_PUBLIC_OTP_DUMMY === "true") {
      console.log(`[OTP][DEV] skipped send. OTP=${code} → ${destination}`);
      return NextResponse.json({ ok: true, dev: true, code });
    }

    const payload = {
      apiKey: process.env.AISENSY_API_KEY,
      campaignName: process.env.AISENSY_CAMPAIGN_NAME, // e.g. "Interior Otp"
      destination,
      userName: name || "Guest",
      source: process.env.AISENSY_SOURCE || "website",
      templateParams: [code], // add more if your template has additional {{}} params
      tags: ["otp"],
      attributes: {
        email: email || "",
        consent_connect: String(!!consentConnect),
        consent_call: String(!!consentCall),
      },
    };

    const r = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const txt = await r.text();
    if (!r.ok) {
      console.error("[AiSensy] Send failed:", r.status, txt);
      return NextResponse.json(
        { ok: false, error: "aisensy_failed", detail: txt },
        { status: 502 }
      );
    }

    console.log("[AiSensy] Send OK:", txt.slice(0, 200));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("OTP request server error:", e);
    return NextResponse.json(
      { ok: false, error: "server_error", detail: e?.message },
      { status: 500 }
    );
  }
}
