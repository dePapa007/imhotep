import { TrainerSessionCard } from "@/components/trainer/trainer-session-card";
import { EmptyState } from "@/components/ui/empty-state";
import { createTranslator } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";
import { groupSessionsByDay } from "@/lib/date-groups";
import type { ScheduleFilter, TrainerSessionItem } from "@/server/trainer/queries";

export function TrainerSessionsList({
  sessions,
  filter,
  locale,
}: {
  sessions: TrainerSessionItem[];
  filter: ScheduleFilter;
  locale: Locale;
}) {
  const t = createTranslator(locale);

  if (sessions.length === 0) {
    const emptyKey = {
      upcoming: {
        title: "trainer.noUpcomingTitle",
        description: "trainer.noUpcomingDesc",
      },
      past: {
        title: "trainer.noPastTitle",
        description: "trainer.noPastDesc",
      },
      cancelled: {
        title: "trainer.noCancelledTitle",
        description: "trainer.noCancelledDesc",
      },
    }[filter];
    return (
      <EmptyState
        title={t(emptyKey.title)}
        description={t(emptyKey.description)}
      />
    );
  }

  if (filter === "upcoming") {
    const groups = groupSessionsByDay(sessions, locale);
    return (
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <section key={group.dateKey}>
            <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              {group.label}
            </h2>
            <div className="flex flex-col gap-3">
              {group.sessions.map((session) => (
                <TrainerSessionCard
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

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => (
        <TrainerSessionCard
          key={session.id}
          session={session}
          locale={locale}
        />
      ))}
    </div>
  );
}
