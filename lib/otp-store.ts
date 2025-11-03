// lib/otp-store.ts
type Entry = { otp: string; expiresAt: number; resendAfter: number };
const store = new Map<string, Entry>(); // key = normalized phone (e.g., "91XXXXXXXXXX")

export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d]/g, "").replace(/^0+/, "").replace(/^\+/, "");
}

export function setOtp(
  phone: string,
  otp: string,
  ttlMinutes: number,
  resendCooldownSec: number
) {
  const now = Date.now();
  const expiresAt = now + ttlMinutes * 60_000;
  const resendAfter = now + resendCooldownSec * 1000;
  store.set(phone, { otp, expiresAt, resendAfter });
}

export function canResend(phone: string) {
  const e = store.get(phone);
  if (!e) return true;
  return Date.now() >= e.resendAfter;
}

export function verifyOtp(phone: string, code: string) {
  const e = store.get(phone);
  if (!e) return { ok: false, reason: "not_found" };
  if (Date.now() > e.expiresAt) return { ok: false, reason: "expired" };
  if (e.otp !== code) return { ok: false, reason: "mismatch" };
  store.delete(phone);
  return { ok: true };
}
