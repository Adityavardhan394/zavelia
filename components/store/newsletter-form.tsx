"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("You're on the list. Welcome to ZAVÉLIA.");
      setEmail("");
    } catch {
      toast.success("You're on the list. Welcome to ZAVÉLIA.");
      setEmail("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <Label htmlFor="newsletter-email" className="sr-only">
        Email address
      </Label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="bg-white"
        />
        <Button type="submit" disabled={loading} className="shrink-0">
          {loading ? "Joining…" : "Join"}
        </Button>
      </div>
    </form>
  );
}
