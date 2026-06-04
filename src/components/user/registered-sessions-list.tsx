import Link from "next/link";

import { UserTrainingCard } from "@/components/user/user-training-card";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createTranslator } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";
import type { UserSessionItem } from "@/server/registrations/queries";

export function RegisteredSessionsList({
  sessions,
  locale,
}: {
  sessions: UserSessionItem[];
  locale: Locale;
}) {
  const t = createTranslator(locale);

  if (sessions.length === 0) {
    return (
      <EmptyState
        title={t("user.noRegistrationsListTitle")}
        description={t("user.noRegistrationsListDesc")}
        action={
          <Link href="/user/browse" className={buttonClasses()}>
            {t("user.browseTrainings")}
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => (
        <UserTrainingCard key={session.id} session={session} locale={locale} />
      ))}
      <Link
        href="/user/browse"
        className="text-primary text-center text-sm font-medium"
      >
        {t("user.browseMore")}
      </Link>
    </div>
  );
}
