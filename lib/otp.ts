// src/lib/otp.ts
import crypto from "crypto";

const SECRET = process.env.OTP_SIGNING_SECRET || "dev-secret";
const TTL_SECONDS = 5 * 60; // 5 minutes

export type OtpChannel = "email" | "sms";

export type OtpPayload = {
  ch: OtpChannel; // channel
  to: string; // email or phone
  exp: number; // expires at (unix seconds)
  c: string; // sha256(code + to + exp) hex
  iat: number; // issued at
  v: 1; // version
};

export function genCode() {
  return ("" + Math.floor(100000 + Math.random() * 900000)).slice(-6);
}

function sha256hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function hmac(payload: string) {
  return crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");
}

export function signToken(p: OtpPayload) {
  const body = Buffer.from(JSON.stringify(p)).toString("base64url");
  const sig = hmac(body);
  return `${body}.${sig}`;
}

export function verifyToken(token: string): OtpPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (hmac(body) !== sig) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString()
    ) as OtpPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function makePayload(
  ch: OtpChannel,
  to: string,
  code: string
): OtpPayload {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + TTL_SECONDS;
  return {
    ch,
    to,
    exp,
    iat,
    v: 1,
    c: sha256hex(`${code}:${to}:${exp}`),
  };
}

export function matchesCode(p: OtpPayload, to: string, code: string) {
  // guard channel target & recalc code hash
  if (p.to !== to) return false;
  const h = sha256hex(`${code}:${to}:${p.exp}`);
  return h === p.c;
}
