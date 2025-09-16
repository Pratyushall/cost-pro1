"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, AlertCircle } from "lucide-react";

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Check against environment variable
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || "admin123";

      if (password === adminKey) {
        onLogin(true);
      } else {
        setError("Invalid password");
        onLogin(false);
      }
    } catch (err) {
      setError("Authentication failed");
      onLogin(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl text-black">Admin Access</CardTitle>
          <CardDescription>
            Enter the admin password to access the CMS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-gray-300"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Authenticating..." : "Access Admin Panel"}
            </Button>
          </form>

          <div className="mt-4 text-xs text-gray-500 text-center">
            Default password: admin123 (set NEXT_PUBLIC_ADMIN_KEY to change)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
