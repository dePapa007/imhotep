"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/i18n/locale-provider";
import { login, type LoginState } from "@/server/auth/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label={t("auth.email")}
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        error={state.fieldErrors?.email?.[0]}
      />
      <Input
        label={t("auth.password")}
        name="password"
        type="password"
        placeholder="********"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password?.[0]}
      />
      {state.errorKey ? (
        <p className="text-destructive text-sm" role="alert">
          {t(`auth.${state.errorKey}`)}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("auth.loggingIn") : t("auth.loginTitle")}
      </Button>
    </form>
  );
}
