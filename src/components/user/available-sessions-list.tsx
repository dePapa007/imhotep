import { UserTrainingCard } from "@/components/user/user-training-card";
import { EmptyState } from "@/components/ui/empty-state";
import { createTranslator } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";
import { groupSessionsByDay } from "@/lib/date-groups";
import type { UserSessionItem } from "@/server/registrations/queries";

export function AvailableSessionsList({
  sessions,
  locale,
}: {
  sessions: UserSessionItem[];
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const groups = groupSessionsByDay(sessions, locale);

  if (groups.length === 0) {
    return (
      <EmptyState
        title={t("user.noTrainingsAvailableTitle")}
        description={t("user.noTrainingsAvailableDesc")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.dateKey}>
          <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
            {group.label}
          </h2>
          <div className="flex flex-col gap-3">
            {group.sessions.map((session) => (
              <UserTrainingCard
                key={session.id}
                session={session}
                locale={locale}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
