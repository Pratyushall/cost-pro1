"use client";

import { useEffect } from "react";
import {
  clearEstimatorState,
  isExpired,
  setLastActive,
} from "@/lib/estimator-session";

/**
 * Props avoid function handlers (strings/bools only), so we can use this under a Server layout.
 * - estimatorRoot: if current path starts with this and session expired, redirect here; else reload.
 */
type Props = {
  estimatorRoot?: string; // e.g., "/estimator" (default)
  children: React.ReactNode;
};

export default function SessionGuard({
  estimatorRoot = "/estimator",
  children,
}: Props) {
  useEffect(() => {
    const handleExpired = () => {
      try {
        clearEstimatorState();
      } catch {}
      // Redirect logic kept here so no function needs to be passed from parent
      const p = window.location.pathname;
      if (p.startsWith(estimatorRoot)) {
        window.location.href = estimatorRoot; // or `${estimatorRoot}/start` if that's your entry
      } else {
        window.location.reload();
      }
    };

    // Initial check
    try {
      if (isExpired()) {
        handleExpired();
        return; // no need to attach listeners if we already expired
      }
      setLastActive();
    } catch {}

    // Touch on interactions
    const touch = () => {
      try {
        setLastActive();
      } catch {}
    };
    const events = ["click", "keydown", "pointerdown", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));

    // Periodic idle check
    const checkExpiry = () => {
      try {
        if (isExpired()) handleExpired();
      } catch {}
    };
    const intervalId = window.setInterval(checkExpiry, 60_000);

    // Re-check when tab becomes visible
    const onVisibility = () => {
      if (document.visibilityState === "visible") checkExpiry();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Multi-tab sync (if another tab clears state)
    const onStorage = (ev: StorageEvent) => {
      if (!ev.key) return;
      if (ev.key.includes("ICP_LAST_ACTIVE") || ev.key.includes("ICP_STATE")) {
        checkExpiry();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      events.forEach((e) => window.removeEventListener(e, touch));
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
    };
  }, [estimatorRoot]);

  return <>{children}</>;
}
