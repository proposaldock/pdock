"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const selectedPlan = searchParams.get("plan");
  const billingIntent =
    selectedPlan === "pro" || selectedPlan === "team" ? selectedPlan : null;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          plan: billingIntent,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Authentication failed.");
      }

      router.push(
        billingIntent && mode === "register"
          ? `/app/settings?plan=${billingIntent}`
          : "/app",
      );
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      {mode === "register" && billingIntent ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <div className="flex items-center gap-2">
            <Badge tone="green">{billingIntent.toUpperCase()}</Badge>
            <span className="font-medium">We will open the matching checkout after signup.</span>
          </div>
        </div>
      ) : null}
      {mode === "register" ? (
        <label className="grid gap-2 text-sm font-semibold">
          Full name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
            placeholder="Your name"
            required
          />
        </label>
      ) : null}
      <label className="grid gap-2 text-sm font-semibold">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
          placeholder="you@company.com"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
          placeholder="At least 8 characters"
          required
        />
      </label>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={isLoading}>
        {isLoading
          ? mode === "login"
            ? "Signing in..."
            : "Creating account..."
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </Button>
    </form>
  );
}
