import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createTranslator } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";
import type {
  CategoryActivityRow,
  TrainerWorkloadRow,
  TrainingRegistrationReportRow,
  UserParticipationRow,
} from "@/server/reports/queries";

const localeToBcp47: Record<Locale, string> = {
  nl: "nl-NL",
  fr: "fr-FR",
  en: "en-GB",
};

export function ReportsOverview({
  trainings,
  categories,
  trainers,
  participation,
  locale,
}: {
  trainings: TrainingRegistrationReportRow[];
  categories: CategoryActivityRow[];
  trainers: TrainerWorkloadRow[];
  participation: UserParticipationRow[];
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const dateFormat = new Intl.DateTimeFormat(localeToBcp47[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  function fillPercent(registered: number, capacity: number | null): string | null {
    if (!capacity || capacity <= 0) return null;
    return t("admin.percentFull", {
      percent: Math.round((registered / capacity) * 100),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <ReportSection
        title={t("admin.reportRegistrationsPerTraining")}
        empty={trainings.length === 0}
        emptyMessage={t("admin.noDataInPeriod")}
      >
        {trainings.slice(0, 15).map((row) => {
          const fill = fillPercent(row.registered, row.capacity);
          return (
            <Card key={row.id}>
              <CardContent className="flex flex-col gap-1 p-4">
                <p className="font-medium">{row.title}</p>
                <p className="text-muted-foreground text-xs">
                  {dateFormat.format(row.startsAt)} · {row.categoryName}
                </p>
                <p className="text-muted-foreground text-xs">
                  {row.capacity
                    ? t("admin.registeredOf", {
                        count: row.registered,
                        capacity: row.capacity,
                      })
                    : t("admin.registered", { count: row.registered })}
                  {fill ? ` · ${fill}` : ""}
                </p>
                {row.present + row.absent > 0 ? (
                  <p className="text-muted-foreground text-xs">
                    {t("admin.attendanceBreakdown", {
                      present: row.present,
                      absent: row.absent,
                    })}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
        {trainings.length > 15 ? (
          <p className="text-muted-foreground text-xs">
            {t("admin.showingTrainings", { total: trainings.length })}
          </p>
        ) : null}
      </ReportSection>

      <ReportSection
        title={t("admin.reportCategoryActivity")}
        empty={categories.length === 0}
        emptyMessage={t("admin.noDataInPeriod")}
      >
        {categories.map((row) => (
          <Card key={row.categoryId}>
            <CardContent className="flex items-center justify-between gap-2 p-4">
              <p className="font-medium">{row.categoryName}</p>
              <div className="flex gap-1.5">
                <Badge variant="primary">
                  {row.sessionCount === 1
                    ? t("admin.sessionCount", { count: row.sessionCount })
                    : t("admin.sessionsCountPlural", {
                        count: row.sessionCount,
                      })}
                </Badge>
                <Badge variant="muted">
                  {t("admin.regsCount", { count: row.registrationCount })}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </ReportSection>

      <ReportSection
        title={t("admin.reportTrainerWorkload")}
        empty={trainers.length === 0}
        emptyMessage={t("admin.noDataInPeriod")}
      >
        {trainers.map((row) => (
          <Card key={row.trainerId}>
            <CardContent className="flex items-center justify-between gap-2 p-4">
              <p className="font-medium">{row.trainerName}</p>
              <Badge variant="primary">
                {row.sessionCount === 1
                  ? t("admin.sessionCount", { count: row.sessionCount })
                  : t("admin.sessionsCountPlural", { count: row.sessionCount })}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </ReportSection>

      <ReportSection
        title={t("admin.reportMemberParticipation")}
        empty={participation.length === 0}
        emptyMessage={t("admin.noDataInPeriod")}
      >
        {participation.slice(0, 20).map((row) => (
          <Card key={row.userId}>
            <CardContent className="flex flex-col gap-1 p-4">
              <p className="font-medium">{row.userName}</p>
              <p className="text-muted-foreground text-xs">{row.email}</p>
              <p className="text-muted-foreground text-xs">
                {row.registrations === 1
                  ? t("admin.registrationCount", { count: row.registrations })
                  : t("admin.registrationsCount", {
                      count: row.registrations,
                    })}
                {row.attendanceRate !== null
                  ? t("admin.attendancePercent", {
                      percent: row.attendanceRate,
                    })
                  : ""}
              </p>
            </CardContent>
          </Card>
        ))}
        {participation.length > 20 ? (
          <p className="text-muted-foreground text-xs">
            {t("admin.showingMembers", { total: participation.length })}
          </p>
        ) : null}
      </ReportSection>
    </div>
  );
}

function ReportSection({
  title,
  empty,
  emptyMessage,
  children,
}: {
  title: string;
  empty: boolean;
  emptyMessage: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold">{title}</h2>
      {empty ? (
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      ) : (
        <div className="flex flex-col gap-2">{children}</div>
      )}
    </section>
  );
}
