import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";
import { createTranslator } from "@/i18n/get-messages";
import { resolveLocale } from "@/i18n/resolve-locale";

export default async function NotFound() {
  const locale = await resolveLocale();
  const t = createTranslator(locale);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-5 py-10 text-center">
      <p className="text-primary text-sm font-medium">404</p>
      <h1 className="text-xl font-semibold">{t("common.notFoundTitle")}</h1>
      <p className="text-muted-foreground text-sm">
        {t("common.notFoundDescription")}
      </p>
      <Link href="/" className={buttonClasses()}>
        {t("common.backToHome")}
      </Link>
    </main>
  );
}
