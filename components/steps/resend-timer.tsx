"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ResendTimerProps {
  onResend: () => void;
  cooldownSeconds: number;
  disabled?: boolean;
}

export function ResendTimer({
  onResend,
  cooldownSeconds,
  disabled = false,
}: ResendTimerProps) {
  const [timeLeft, setTimeLeft] = useState(cooldownSeconds);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResend = () => {
    onResend();
    setTimeLeft(cooldownSeconds);
    setCanResend(false);
  };

  return (
    <div className="text-center">
      {canResend ? (
        <Button
          variant="ghost"
          onClick={handleResend}
          disabled={disabled}
          className="text-primary hover:text-primary/80"
        >
          Resend OTP
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">
          Resend OTP in {timeLeft}s
        </p>
      )}
    </div>
  );
}
