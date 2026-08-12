"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json?.error?.message || "Invalid email or password");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#e8d1ba_0%,_#f7efe5_45%,_#efe4d6_100%)]"
      />
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-md space-y-5 rounded-xl border border-[var(--admin-border)] bg-[#fffefb]/95 p-6 shadow-lg md:p-8"
      >
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/zavelia-logo.png"
            alt="ZAVÉLIA"
            width={72}
            height={72}
            className="h-16 w-16 object-contain"
            priority
          />
          <h1 className="admin-brand mt-3 text-3xl tracking-wide text-[var(--color-espresso)]">
            ZAVÉLIA
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[var(--color-espresso)]/50">
            Admin sign in
          </p>
        </div>

        {error ? (
          <p
            className="rounded-md border border-[var(--color-error)]/25 bg-[var(--color-error)]/5 px-3 py-2 text-sm text-[var(--color-error)]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="pr-16"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 text-xs text-[var(--color-rose-gold)]"
              onClick={() => setShow((v) => !v)}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--color-espresso)]/80">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-rose-gold)]"
          />
          Remember session
        </label>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
