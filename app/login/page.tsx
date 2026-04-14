import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/app");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7f9] px-6 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to ProposalDock</CardTitle>
          <p className="text-sm text-zinc-600">
            Continue to your private proposal workspace.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <AuthForm mode="login" />
          <p className="text-sm text-zinc-600">
            Need an account?{" "}
            <Link href="/register" className="font-semibold text-emerald-700">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
