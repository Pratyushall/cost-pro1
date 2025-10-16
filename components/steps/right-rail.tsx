"use client";

import { Card } from "@/components/ui/card";
import { Info, Sparkles, Clock } from "lucide-react";

export default function RightRail() {
  return (
    <div className="space-y-4">
      {/* Quick Tips Card */}
      <Card className="card-glass p-4 text-white">
        <div className="flex items-start gap-3">
          <Sparkles className="size-5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Quick Tips</h3>
            <ul className="text-xs space-y-1.5 body-muted">
              <li>• Use presets for faster input</li>
              <li>• All fields are optional</li>
              <li>• Estimates update in real-time</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Session Info Card */}
      <Card className="card-glass p-4 text-white">
        <div className="flex items-start gap-3">
          <Clock className="size-5 text-secondary shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Session Active</h3>
            <p className="text-xs body-muted">
              Your progress is automatically saved. Session expires after 30
              minutes of inactivity.
            </p>
          </div>
        </div>
      </Card>

      {/* Help Card */}
      <Card className="card-glass p-4 text-white">
        <div className="flex items-start gap-3">
          <Info className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Need Help?</h3>
            <p className="text-xs body-muted">
              Contact our team for personalized assistance with your interior
              design project.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
