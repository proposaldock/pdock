import * as React from "react";
import { cn } from "@/lib/utils";

const tones = {
  green: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  yellow: "bg-yellow-50 text-yellow-800 ring-yellow-200",
  red: "bg-rose-50 text-rose-800 ring-rose-200",
  zinc: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  teal: "bg-teal-50 text-teal-800 ring-teal-200",
};

export function Badge({
  className,
  tone = "zinc",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
