"use client";

import { useEffect, useMemo } from "react";

import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { createTranslator } from "@/i18n/get-messages";
import { defaultLocale, isLocale, type Locale } from "@/i18n/locales";

function usePageLocale(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  const lang = document.documentElement.lang;
  return isLocale(lang) ? lang : defaultLocale;
}

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const locale = usePageLocale();
  const t = useMemo(() => createTranslator(locale), [locale]);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-md flex-1">
      <ErrorState
        title={t("common.errorTitle")}
        description={t("common.errorUnexpected")}
        action={
          <Button
            onClick={() => unstable_retry()}
            className="w-full sm:w-auto"
          >
            {t("common.tryAgain")}
          </Button>
        }
      />
    </main>
  );
}
