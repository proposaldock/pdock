import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const planCopy = {
  free: {
    title: "Create your free ProposalDock account",
    description: "Start with one workspace and test the proposal workflow. No card needed.",
  },
  pro: {
    title: "Create your Pro account",
    description: "Create your account first, then we will open the Pro checkout flow.",
  },
  team: {
    title: "Create your Team account",
    description: "Create your account first, then we will open the Team checkout flow.",
  },
} as const;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/app");
  }

  const resolved = await searchParams;
  const selectedPlan =
    resolved.plan === "pro" || resolved.plan === "team" ? resolved.plan : "free";
  const copy = planCopy[selectedPlan];

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7f9] px-6 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <p className="text-sm text-zinc-600">
            {copy.description}
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <AuthForm mode="register" />
          <p className="text-sm text-zinc-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-emerald-700">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
