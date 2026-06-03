import type { Metadata } from "next";
import Link from "next/link";

import { AppLogo } from "@/components/layout/app-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-5 py-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <AppLogo href="/" size="md" priority />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground text-sm">
            Log in to view your trainings.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>
            Enter your email and password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-center text-sm">
        <Link href="/" className="text-primary font-medium hover:underline">
          Back to home
        </Link>
      </p>
    </main>
  );
}
