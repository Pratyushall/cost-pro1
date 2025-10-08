export const ICP_STATE_KEY = "ICP_STATE_V1"; // your persisted estimator state
export const ICP_LAST_ACTIVE_KEY = "ICP_LAST_ACTIVE_V1";
export const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes (tune as needed)

export function setLastActive() {
  try {
    localStorage.setItem(ICP_LAST_ACTIVE_KEY, Date.now().toString());
  } catch {}
}

export function isExpired(now = Date.now()): boolean {
  try {
    const ts = parseInt(localStorage.getItem(ICP_LAST_ACTIVE_KEY) || "0", 10);
    if (!ts) return false;
    return now - ts > TIMEOUT_MS;
  } catch {
    return false;
  }
}

export function clearEstimatorState() {
  try {
    localStorage.removeItem(ICP_STATE_KEY);
    localStorage.removeItem(ICP_LAST_ACTIVE_KEY);
  } catch {}
}
