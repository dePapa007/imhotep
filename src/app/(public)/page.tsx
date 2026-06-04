import Link from "next/link";

import { AppLogo } from "@/components/layout/app-logo";
import { buttonClasses } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createTranslator } from "@/i18n/get-messages";
import { resolveLocale } from "@/i18n/resolve-locale";

export default async function LandingPage() {
  const locale = await resolveLocale();
  const t = createTranslator(locale);

  const highlights = [
    {
      title: t("landing.highlightBrowseTitle"),
      description: t("landing.highlightBrowseDesc"),
    },
    {
      title: t("landing.highlightRegisterTitle"),
      description: t("landing.highlightRegisterDesc"),
    },
    {
      title: t("landing.highlightOrganizedTitle"),
      description: t("landing.highlightOrganizedDesc"),
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 py-10">
      <header className="flex flex-col gap-4">
        <AppLogo href="/" size="lg" priority />
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl leading-tight font-bold tracking-tight">
            {t("landing.tagline")}
          </h1>
          <p className="text-muted-foreground">{t("landing.intro")}</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className={buttonClasses()}>
              {t("auth.loginTitle")}
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
        {t("landing.footer")}
      </footer>
    </main>
  );
}
