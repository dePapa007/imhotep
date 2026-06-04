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
import { createTranslator } from "@/i18n/get-messages";
import { LocaleProvider } from "@/i18n/locale-provider";
import { resolveLocale } from "@/i18n/resolve-locale";

import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const t = createTranslator(locale);
  return { title: t("auth.loginTitle") };
}

export default async function LoginPage() {
  const locale = await resolveLocale();
  const t = createTranslator(locale);

  return (
    <LocaleProvider locale={locale}>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-5 py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <AppLogo href="/" size="md" priority />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {t("auth.welcomeBack")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("auth.loginSubtitle")}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("auth.loginTitle")}</CardTitle>
            <CardDescription>{t("auth.enterCredentials")}</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <p className="text-muted-foreground text-center text-sm">
          <Link href="/" className="text-primary font-medium hover:underline">
            {t("common.backToHome")}
          </Link>
        </p>
      </main>
    </LocaleProvider>
  );
}
