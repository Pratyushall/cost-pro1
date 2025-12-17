// lib/otp.ts
import crypto from "crypto";

const OTP_TTL_SEC = parseInt(process.env.OTP_TTL_SEC || "300", 10);
const OTP_ATTEMPT_LIMIT = parseInt(process.env.OTP_ATTEMPT_LIMIT || "5", 10);

type RecordValue = { hash: string; attempts: number; expiresAt: number };

// In-memory fallback for dev
const mem = new Map<string, RecordValue>();
const kvConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

let kv: any = null;
if (kvConfigured) {
  kv = require("@vercel/kv").kv; // lazy require so dev works without env
}

const sha256 = (s: string) =>
  crypto.createHash("sha256").update(s).digest("hex");
const nowSec = () => Math.floor(Date.now() / 1000);
const key = (id: string) => `otp:${sha256(id.toLowerCase())}`;

export function genOtp(len = 6) {
  const max = 10 ** len;
  return crypto.randomInt(0, max).toString().padStart(len, "0");
}

export async function storeOtp(identity: string, otp: string) {
  const k = key(identity);
  const value: RecordValue = {
    hash: sha256(otp),
    attempts: 0,
    expiresAt: nowSec() + OTP_TTL_SEC,
  };
  if (kvConfigured) await kv.set(k, value, { ex: OTP_TTL_SEC });
  else {
    mem.set(k, value);
    setTimeout(() => mem.delete(k), OTP_TTL_SEC * 1000);
  }
}

export async function verifyOtp(identity: string, otp: string) {
  const k = key(identity);
  const get = async () =>
    kvConfigured
      ? ((await kv.get(k)) as RecordValue | null)
      : mem.get(k) ?? null;
  const set = async (v: RecordValue) =>
    kvConfigured ? kv.set(k, v, { ex: v.expiresAt - nowSec() }) : mem.set(k, v);
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
    remaining: OTP_ATTEMPT_LIMIT - rec.attempts,
  };
}
