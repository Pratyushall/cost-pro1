// lib/otp.ts
import crypto from "crypto";

// Support both minutes and seconds envs; prefer minutes if set.
const TTL_MIN = process.env.OTP_TTL_MINUTES
  ? parseInt(process.env.OTP_TTL_MINUTES, 10)
  : null;
const TTL_SEC_ENV = process.env.OTP_TTL_SEC
  ? parseInt(process.env.OTP_TTL_SEC, 10)
  : null;

const OTP_TTL_SEC = TTL_MIN != null ? TTL_MIN * 60 : TTL_SEC_ENV ?? 300;
const OTP_ATTEMPT_LIMIT = parseInt(process.env.OTP_ATTEMPT_LIMIT || "5", 10);

// In-memory fallback for dev
type RecordValue = { hash: string; attempts: number; expiresAt: number };
const mem = new Map<string, RecordValue>();

// KV (optional)
const kvConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

let kv: any = null;
if (kvConfigured) {
  // lazy import so local dev works without the package/envs
  kv = require("@vercel/kv").kv;
}

const sha256 = (s: string) =>
  crypto.createHash("sha256").update(s).digest("hex");
const nowSec = () => Math.floor(Date.now() / 1000);

// Use E.164 (including "+") as the identity; we hash it for the key.
const key = (identityE164: string) => `otp:${sha256(identityE164)}`;

export function genOtp(len = 6) {
  // cryptographically strong (vs Math.random)
  const max = 10 ** len;
  return crypto.randomInt(0, max).toString().padStart(len, "0");
}

export async function storeOtp(identityE164: string, otp: string) {
  const k = key(identityE164);
  const value: RecordValue = {
    hash: sha256(otp),
    attempts: 0,
    expiresAt: nowSec() + OTP_TTL_SEC,
  };
  if (kvConfigured) {
    await kv.set(k, value, { ex: OTP_TTL_SEC });
  } else {
    mem.set(k, value);
    setTimeout(() => mem.delete(k), OTP_TTL_SEC * 1000);
  }
}

export async function verifyOtp(identityE164: string, otp: string) {
  const k = key(identityE164);

  const get = async (): Promise<RecordValue | null> =>
    kvConfigured
      ? ((await kv.get(k)) as RecordValue | null)
      : mem.get(k) ?? null;

  const set = async (v: RecordValue) =>
    kvConfigured
      ? kv.set(k, v, { ex: Math.max(v.expiresAt - nowSec(), 1) })
      : mem.set(k, v);

  const del = async () => (kvConfigured ? kv.del(k) : mem.delete(k));

  let rec = await get();
  if (!rec) return { ok: false as const, reason: "expired" as const };

  if (rec.expiresAt < nowSec()) {
    await del();
    return { ok: false as const, reason: "expired" as const };
  }

  if (rec.attempts >= OTP_ATTEMPT_LIMIT) {
    await del();
    return { ok: false as const, reason: "locked" as const };
  }

  const ok = rec.hash === sha256(otp);
  if (ok) {
    await del();
    return { ok: true as const };
  }

  rec.attempts += 1;
  await set(rec);
  return {
    ok: false as const,
    reason: "invalid" as const,
    remaining: Math.max(OTP_ATTEMPT_LIMIT - rec.attempts, 0),
  };
}
