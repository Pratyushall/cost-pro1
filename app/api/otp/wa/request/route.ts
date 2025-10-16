// pages/api/otp/wa/request.ts
import type { NextApiRequest, NextApiResponse } from "next";

function toE164India(raw: string) {
  const d = (raw || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 10) return `+91${d}`;
  if (d.startsWith("91") && d.length > 10) return `+${d}`;
  return `+${d}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") return res.status(405).json({ ok: false });

    const { phone, name, email, consentConnect, consentCall } = req.body || {};
    const destination = toE164India(String(phone || ""));
    if (!/^\+\d{10,15}$/.test(destination)) {
      return res.status(400).json({ ok: false, error: "bad_phone" });
    }

    // 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // store the OTP server-side (replace with your store)
    // example quick memory store:
    (global as any).__otp ||= new Map<string, { code: string; exp: number }>();
    (global as any).__otp.set(destination, {
      code,
      exp: Date.now() + 5 * 60_000,
    });

    const body = {
      apiKey: process.env.AISENSY_API_KEY,
      campaignName: process.env.AISENSY_CAMPAIGN_NAME, // "Interior Otp"
      destination,
      userName: name || "Guest",
      source: process.env.AISENSY_SOURCE || "website",
      templateParams: [code],
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
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error("AiSensy error:", r.status, txt);
      return res.status(502).json({ ok: false, error: "aisensy_failed" });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
