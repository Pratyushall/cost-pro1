"use client";

import type React from "react";

import { useEffect } from "react";
import { useEstimatorStore } from "@/store/estimator";

interface SessionGuardProps {
  children: React.ReactNode;
  estimatorRoot?: string;
}

export default function SessionGuard({
  children,
  estimatorRoot = "/",
}: SessionGuardProps) {
  const { basics } = useEstimatorStore();

  useEffect(() => {
    const LAST_ACTIVE_KEY = "ICP_LAST_ACTIVE";
    const TIMEOUT_MS =
      Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MIN ?? 30) * 60 * 1000;

    // Update last active timestamp on user interaction
    const updateLastActive = () => {
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    };

    // Check session timeout
    const checkTimeout = () => {
      const lastActive = Number(localStorage.getItem(LAST_ACTIVE_KEY) || 0);
      const now = Date.now();

      if (lastActive && now - lastActive > TIMEOUT_MS) {
        // Session expired - clear state
        localStorage.removeItem("ICP_STATE");
        localStorage.removeItem("interior-estimator-storage");
        localStorage.removeItem(LAST_ACTIVE_KEY);

        // Optionally reload or redirect
        if (basics.bhk) {
          window.location.reload();
        }
      }
    };

    // Set initial timestamp
    updateLastActive();

    // Listen for user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, updateLastActive);
    });

    // Check timeout periodically
    const interval = setInterval(checkTimeout, 60000); // Check every minute

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateLastActive);
      });
      clearInterval(interval);
    };
  }, [basics.bhk]);

  return <>{children}</>;
}
