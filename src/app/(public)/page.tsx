import Link from "next/link";

import { AppLogo } from "@/components/layout/app-logo";
import { buttonClasses } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const highlights = [
  {
    title: "Browse trainings",
    description: "See sessions that match your category, on any device.",
  },
  {
    title: "Register in one tap",
    description: "Join or cancel trainings from your phone in seconds.",
  },
  {
    title: "Stay organized",
    description: "Trainers and admins keep every session up to date.",
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 py-10">
      <header className="flex flex-col gap-4">
        <AppLogo href="/" size="lg" priority />
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl leading-tight font-bold tracking-tight">
            Train more. Manage less.
          </h1>
          <p className="text-muted-foreground">
            A mobile-first home for academy trainings. Players register, trainers
            track attendance, and admins stay in control.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className={buttonClasses()}>
              Log in
            </Link>
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        {highlights.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <footer className="text-muted-foreground mt-auto pt-6 text-center text-sm">
        Built with Next.js. Mobile-first by design.
      </footer>
    </main>
  );
}
