"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useTranslations } from "@/i18n/locale-provider";
import { LOCALES, localeLabels, type Locale } from "@/i18n/locales";
import { logout } from "@/server/auth/actions";
import {
  updatePreferredLocale,
  type ProfileActionResult,
} from "@/server/profile/actions";
export function ProfileSettings({
  name,
  email,
  roleLabel,
  currentLocale,
}: {
  name: string;
  email: string;
  roleLabel: string;
  currentLocale: Locale;
}) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(
    updatePreferredLocale,
    {} as ProfileActionResult,
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">{t("profile.accountInfo")}</h2>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-muted-foreground text-sm">{email}</p>
        <p className="text-muted-foreground text-sm">{roleLabel}</p>
      </section>

      <form action={formAction} className="flex flex-col gap-4">
        <Select
          name="locale"
          label={t("profile.language")}
          defaultValue={currentLocale}
          options={LOCALES.map((loc) => ({
            value: loc,
            label: localeLabels[loc],
          }))}
        />
        <p className="text-muted-foreground text-xs">{t("profile.languageHelp")}</p>
        {state.error ? (
          <p className="text-destructive text-sm" role="alert">
            {t("profile.saveFailed")}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-primary text-sm" role="status">
            {t("profile.saved")}
          </p>
        ) : null}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t("common.loading") : t("common.save")}
        </Button>
      </form>

      <form action={logout}>
        <Button type="submit" variant="outline" className="w-full">
          {t("profile.logout")}
        </Button>
      </form>
    </div>
  );
}
