import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/app");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7f9] px-6 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your ProposalDock account</CardTitle>
          <p className="text-sm text-zinc-600">
            Start your private beta workspace with your own account.
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
