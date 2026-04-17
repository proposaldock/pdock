"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PublicLeadFormProps = {
  intent: "waitlist" | "contact_sales";
  plan: "free" | "pro" | "team" | null;
};

const teamSizeOptions = ["1-5", "6-15", "16-50", "51+"] as const;

export function PublicLeadForm({ intent, plan }: PublicLeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const content = useMemo(() => {
    if (intent === "contact_sales") {
      return {
        badge: "Contact sales",
        title: "Tell us how your proposal team works today.",
        body:
          "We will use this to shape the right rollout conversation and path for your team.",
        button: "Send request",
        success:
          "Thanks. Your request is in, and ProposalDock has saved it locally for follow-up.",
      };
    }

    return {
      badge: "Mailing list",
      title: "Get ProposalDock product updates.",
      body:
        "Leave your details and we will send occasional updates as the workflow improves.",
      button: "Join mailing list",
      success:
        "You are on the mailing list. ProposalDock has saved your interest for future updates.",
    };
  }, [intent]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/public-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: intent,
          name,
          email,
          company,
          teamSize,
          plan,
          source: "marketing_site",
          message,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to submit right now.");
      }

      setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to submit right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="green">{content.badge}</Badge>
          {plan ? <Badge tone="teal">{plan.toUpperCase()}</Badge> : null}
        </div>
        <p className="mt-4 text-base font-semibold text-emerald-950">{content.success}</p>
        <p className="mt-2 text-sm leading-6 text-emerald-900">
          You can still create an account now if you want to explore the product directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="teal">{content.badge}</Badge>
        {plan ? <Badge tone="zinc">{plan.toUpperCase()}</Badge> : null}
      </div>

      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-950">{content.title}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">{content.body}</p>
      </div>

      <label className="grid gap-2 text-sm font-semibold">
        Name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
          placeholder="Your name"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold">
        Work email
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
        Company
        <input
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          className="h-11 rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-500"
          placeholder="Company name"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold">
        Team size
        <select
          value={teamSize}
          onChange={(event) => setTeamSize(event.target.value)}
          className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">Select team size</option>
          {teamSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-semibold">
        What are you trying to improve
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          className="rounded-lg border border-zinc-300 px-3 py-3 text-sm outline-none focus:border-emerald-500"
          placeholder="Current process, proposal volume, team setup, or what you want ProposalDock to help with."
        />
      </label>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : content.button}
      </Button>
    </form>
  );
}
